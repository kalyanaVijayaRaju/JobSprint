import asyncHandler from '../utils/asyncHandler.js';
import * as mockInterviewService from '../services/mockInterviewService.js';

export const startInterview = asyncHandler(async (req, res) => {
  const interview = await mockInterviewService.startInterview(req.user.id, req.body);
  res.status(201).json({ success: true, data: { interview } });
});

export const answerQuestion = asyncHandler(async (req, res) => {
  const interview = await mockInterviewService.answerQuestion(req.user.id, req.params.id, req.body);
  res.json({ success: true, data: { interview } });
});

export const finishInterview = asyncHandler(async (req, res) => {
  const interview = await mockInterviewService.finishInterview(req.user.id, req.params.id);
  res.json({ success: true, data: { interview } });
});

export const getHistory = asyncHandler(async (req, res) => {
  const interviews = await mockInterviewService.getUserInterviews(req.user.id);
  res.json({ success: true, data: { interviews } });
});
