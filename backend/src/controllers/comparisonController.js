import asyncHandler from '../utils/asyncHandler.js';
import * as comparisonService from '../services/comparisonService.js';

export const compareCandidates = asyncHandler(async (req, res) => {
  const result = await comparisonService.compareCandidates(req.body.candidateIds);
  res.json({ success: true, data: result });
});
