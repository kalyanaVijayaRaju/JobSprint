import asyncHandler from '../utils/asyncHandler.js';
import * as scheduledInterviewService from '../services/scheduledInterviewService.js';

export const listInterviews = asyncHandler(async (req, res) => {
  const interviews = await scheduledInterviewService.getUpcoming(req.user.id, req.user.role);
  res.json({ success: true, data: { interviews } });
});

export const scheduleInterview = asyncHandler(async (req, res) => {
  const interview = await scheduledInterviewService.scheduleInterview(req.user.id, req.body);
  res.status(201).json({ success: true, data: { interview } });
});

export const updateInterview = asyncHandler(async (req, res) => {
  const interview = await scheduledInterviewService.updateInterview(req.params.id, req.user.id, req.body);
  res.json({ success: true, data: { interview } });
});

export const cancelInterview = asyncHandler(async (req, res) => {
  const interview = await scheduledInterviewService.cancelInterview(req.params.id, req.user.id);
  res.json({ success: true, data: { interview } });
});

export const getCalendarView = asyncHandler(async (req, res) => {
  const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const data = await scheduledInterviewService.getCalendarView(req.user.id, req.user.role, month, year);
  res.json({ success: true, data });
});
