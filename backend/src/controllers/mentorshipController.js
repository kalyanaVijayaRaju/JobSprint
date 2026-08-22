import asyncHandler from '../utils/asyncHandler.js';
import * as mentorshipService from '../services/mentorshipService.js';

export const getMentors = asyncHandler(async (req, res) => {
  const mentors = await mentorshipService.getMentors(req.query);
  res.json({ success: true, data: { mentors } });
});

export const bookSession = asyncHandler(async (req, res) => {
  const booking = await mentorshipService.bookSession(req.user.id, req.body);
  res.status(201).json({ success: true, data: { booking } });
});

export const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await mentorshipService.getMySessions(req.user.id);
  res.json({ success: true, data: { sessions } });
});

export const seedMentors = asyncHandler(async (req, res) => {
  const result = await mentorshipService.seedMentors();
  res.json({ success: true, data: result });
});
