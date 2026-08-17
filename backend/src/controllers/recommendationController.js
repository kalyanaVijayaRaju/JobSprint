import asyncHandler from '../utils/asyncHandler.js';
import { getRecommendations } from '../services/jobService.js';

export const getRecommendedJobs = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const jobs = await getRecommendations(req.user.id, limit);
  res.json({ success: true, data: { jobs } });
});
