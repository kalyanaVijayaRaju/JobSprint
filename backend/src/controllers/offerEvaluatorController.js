import asyncHandler from '../utils/asyncHandler.js';
import * as offerEvaluatorService from '../services/offerEvaluatorService.js';

export const evaluateOffer = asyncHandler(async (req, res) => {
  const evaluation = await offerEvaluatorService.evaluateOffer(req.user.id, req.body);
  res.status(201).json({ success: true, data: { evaluation } });
});

export const getHistory = asyncHandler(async (req, res) => {
  const evaluations = await offerEvaluatorService.getUserEvaluations(req.user.id);
  res.json({ success: true, data: { evaluations } });
});
