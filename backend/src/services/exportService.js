import Application from '../models/Application.js';
import Job from '../models/Job.js';

/**
 * Export applications as CSV string.
 */
export const exportApplicationsCSV = async (userId, role, filters = {}) => {
  let query = {};

  if (role === 'candidate') {
    query.candidateId = userId;
  } else if (role === 'recruiter') {
    // Get recruiter's job IDs first
    const recruiterJobs = await Job.find({ recruiterId: userId }).select('_id').lean();
    const jobIds = recruiterJobs.map(j => j._id);
    query.jobId = { $in: jobIds };
  }

  if (filters.status) query.status = filters.status;

  const applications = await Application.find(query)
    .populate('jobId', 'title company location')
    .populate('candidateId', 'email')
    .sort({ createdAt: -1 })
    .lean();

  const headers = ['Application ID', 'Job Title', 'Company', 'Location', 'Status', 'Applied Date', 'Candidate Email'];
  const rows = applications.map(app => [
    app._id.toString(),
    app.jobId?.title || 'N/A',
    app.jobId?.company || 'N/A',
    app.jobId?.location || 'N/A',
    app.status || 'N/A',
    app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : 'N/A',
    app.candidateId?.email || 'N/A'
  ]);

  const csvRows = [headers.join(','), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))];
  return csvRows.join('\n');
};

/**
 * Export analytics data as CSV.
 */
export const exportAnalyticsCSV = async (userId, role) => {
  let pipeline;

  if (role === 'candidate') {
    pipeline = [
      { $match: { candidateId: (await import('mongoose')).default.Types.ObjectId.createFromHexString(userId.toString()) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];
  } else {
    const recruiterJobs = await Job.find({ recruiterId: userId }).select('_id').lean();
    const jobIds = recruiterJobs.map(j => j._id);

    pipeline = [
      { $match: { jobId: { $in: jobIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];
  }

  const stats = await Application.aggregate(pipeline);

  const headers = ['Status', 'Count'];
  const rows = stats.map(s => [s._id, s.count]);

  const csvRows = [headers.join(','), ...rows.map(r => r.join(','))];
  return csvRows.join('\n');
};

/**
 * Generate a hiring summary report as structured data (for PDF rendering on frontend).
 */
export const getHiringSummary = async (userId) => {
  const recruiterJobs = await Job.find({ recruiterId: userId }).select('_id title').lean();
  const jobIds = recruiterJobs.map(j => j._id);

  const [statusBreakdown, timeToHire, topJobs] = await Promise.all([
    Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Application.aggregate([
      { $match: { jobId: { $in: jobIds }, status: 'hired' } },
      {
        $project: {
          daysToHire: {
            $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60 * 24]
          }
        }
      },
      { $group: { _id: null, avgDays: { $avg: '$daysToHire' } } }
    ]),
    Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', totalApps: { $sum: 1 } } },
      { $sort: { totalApps: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      { $project: { title: '$job.title', totalApps: 1 } }
    ])
  ]);

  return {
    totalJobs: recruiterJobs.length,
    statusBreakdown: Object.fromEntries(statusBreakdown.map(s => [s._id, s.count])),
    avgTimeToHire: timeToHire[0]?.avgDays ? Math.round(timeToHire[0].avgDays) : null,
    topJobs
  };
};
