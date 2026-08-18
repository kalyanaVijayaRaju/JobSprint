import ScheduledInterview from '../models/ScheduledInterview.js';
import ApiError from '../utils/apiError.js';
import mongoose from 'mongoose';

/**
 * Schedule a new interview.
 */
export const scheduleInterview = async (recruiterId, data) => {
  return ScheduledInterview.create({
    applicationId: data.applicationId,
    candidateId: data.candidateId,
    recruiterId,
    jobId: data.jobId,
    scheduledAt: new Date(data.scheduledAt),
    duration: data.duration || 60,
    type: data.type || 'video',
    meetingLink: data.meetingLink,
    location: data.location,
    notes: data.notes
  });
};

/**
 * Get upcoming interviews for a user.
 */
export const getUpcoming = async (userId, role) => {
  const query = {
    scheduledAt: { $gte: new Date() },
    status: { $in: ['scheduled', 'rescheduled'] }
  };

  if (role === 'recruiter') {
    query.recruiterId = userId;
  } else {
    query.candidateId = userId;
  }

  return ScheduledInterview.find(query)
    .populate('jobId', 'title company location')
    .populate('candidateId', 'email')
    .populate('recruiterId', 'email')
    .sort({ scheduledAt: 1 })
    .lean();
};

/**
 * Get monthly calendar data.
 */
export const getCalendarView = async (userId, role, month, year) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const query = {
    scheduledAt: { $gte: startOfMonth, $lte: endOfMonth }
  };

  if (role === 'recruiter') {
    query.recruiterId = new mongoose.Types.ObjectId(userId);
  } else {
    query.candidateId = new mongoose.Types.ObjectId(userId);
  }

  const interviews = await ScheduledInterview.find(query)
    .populate('jobId', 'title company')
    .populate('candidateId', 'email')
    .populate('recruiterId', 'email')
    .sort({ scheduledAt: 1 })
    .lean();

  // Group by date
  const calendar = {};
  interviews.forEach(iv => {
    const dateKey = new Date(iv.scheduledAt).toISOString().split('T')[0];
    if (!calendar[dateKey]) calendar[dateKey] = [];
    calendar[dateKey].push(iv);
  });

  return { calendar, totalInterviews: interviews.length, month, year };
};

/**
 * Update an interview.
 */
export const updateInterview = async (interviewId, recruiterId, data) => {
  const interview = await ScheduledInterview.findOne({ _id: interviewId, recruiterId });
  if (!interview) throw new ApiError(404, 'Interview not found');

  const allowed = ['scheduledAt', 'duration', 'type', 'meetingLink', 'location', 'notes', 'status', 'feedback', 'rating'];
  allowed.forEach(field => {
    if (data[field] !== undefined) interview[field] = data[field];
  });

  if (data.scheduledAt && data.scheduledAt !== interview.scheduledAt?.toISOString()) {
    interview.status = 'rescheduled';
  }

  await interview.save();
  return interview;
};

/**
 * Cancel an interview.
 */
export const cancelInterview = async (interviewId, userId) => {
  const interview = await ScheduledInterview.findById(interviewId);
  if (!interview) throw new ApiError(404, 'Interview not found');

  if (interview.recruiterId.toString() !== userId.toString() &&
      interview.candidateId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to cancel this interview');
  }

  interview.status = 'cancelled';
  await interview.save();
  return interview;
};
