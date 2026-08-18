import Application from '../models/Application.js';
import Job from '../models/Job.js';
import ApiError from '../utils/apiError.js';

const KANBAN_COLUMNS = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

/**
 * Get applications grouped by status for kanban board.
 */
export const getBoard = async (userId, role) => {
  let query = {};

  if (role === 'recruiter') {
    const recruiterJobs = await Job.find({ recruiterId: userId }).select('_id').lean();
    query.jobId = { $in: recruiterJobs.map(j => j._id) };
  } else if (role === 'candidate') {
    query.candidateId = userId;
  }

  const applications = await Application.find(query)
    .populate('jobId', 'title company location salary jobType')
    .populate('candidateId', 'email')
    .sort({ updatedAt: -1 })
    .lean();

  const columns = {};
  KANBAN_COLUMNS.forEach(col => {
    columns[col] = {
      id: col,
      title: col.charAt(0).toUpperCase() + col.slice(1),
      items: []
    };
  });

  applications.forEach(app => {
    const status = KANBAN_COLUMNS.includes(app.status) ? app.status : 'applied';
    columns[status].items.push(app);
  });

  return { columns, totalCount: applications.length };
};

/**
 * Move an application to a new status column.
 */
export const moveCard = async (applicationId, newStatus, userId, role) => {
  if (!KANBAN_COLUMNS.includes(newStatus)) {
    throw new ApiError(400, `Invalid status: ${newStatus}. Allowed: ${KANBAN_COLUMNS.join(', ')}`);
  }

  const app = await Application.findById(applicationId);
  if (!app) throw new ApiError(404, 'Application not found');

  // Authorization
  if (role === 'recruiter') {
    const job = await Job.findById(app.jobId).lean();
    if (!job || job.recruiterId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Not authorized to modify this application');
    }
  } else if (role === 'candidate') {
    if (app.candidateId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Not authorized to modify this application');
    }
  }

  const oldStatus = app.status;
  app.status = newStatus;
  await app.save();

  return { application: app, oldStatus, newStatus };
};
