import asyncHandler from '../utils/asyncHandler.js';
import * as activityFeedService from '../services/activityFeedService.js';

export const getPublicFeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const result = await activityFeedService.getPublicFeed(page, limit, req.query.type);
  res.json({ success: true, data: result });
});

export const getUserTimeline = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const result = await activityFeedService.getUserTimeline(req.user.id, page, limit);
  res.json({ success: true, data: result });
});

export const getUserActivityStats = asyncHandler(async (req, res) => {
  const stats = await activityFeedService.getUserActivityStats(req.user.id);
  res.json({ success: true, data: { stats } });
});
