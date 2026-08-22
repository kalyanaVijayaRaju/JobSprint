import asyncHandler from '../utils/asyncHandler.js';
import * as aiAnalyzerService from '../services/aiAnalyzerService.js';

export const analyzeMatch = asyncHandler(async (req, res) => {
  const analysis = await aiAnalyzerService.analyzeJobMatch(req.user.id, req.body);
  res.json({ success: true, data: { analysis } });
});

export const scoreResume = asyncHandler(async (req, res) => {
  const result = await aiAnalyzerService.scoreResume(req.user.id);
  res.json({ success: true, data: { result } });
});
