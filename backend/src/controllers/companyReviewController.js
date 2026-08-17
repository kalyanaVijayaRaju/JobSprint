import asyncHandler from '../utils/asyncHandler.js';
import * as companyReviewService from '../services/companyReviewService.js';

export const listReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await companyReviewService.listReviews(
    req.params.companyId,
    page,
    limit,
    req.query.sortBy
  );
  res.json({ success: true, data: result });
});

export const getReviewStats = asyncHandler(async (req, res) => {
  const stats = await companyReviewService.getReviewStats(req.params.companyId);
  res.json({ success: true, data: { stats } });
});

export const createReview = asyncHandler(async (req, res) => {
  const review = await companyReviewService.createReview(
    req.user.id,
    req.params.companyId,
    req.body
  );
  res.status(201).json({ success: true, data: { review } });
});

export const toggleHelpful = asyncHandler(async (req, res) => {
  const result = await companyReviewService.toggleHelpful(req.params.id, req.user.id);
  res.json({ success: true, data: result });
});
