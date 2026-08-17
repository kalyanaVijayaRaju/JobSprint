import asyncHandler from '../utils/asyncHandler.js';
import * as interviewPrepService from '../services/interviewPrepService.js';

export const listQuestions = asyncHandler(async (req, res) => {
  const questions = await interviewPrepService.listQuestions(req.query);
  res.json({ success: true, data: { questions } });
});

export const getQuestion = asyncHandler(async (req, res) => {
  const question = await interviewPrepService.getQuestion(req.params.id);
  res.json({ success: true, data: { question } });
});

export const savePractice = asyncHandler(async (req, res) => {
  const session = await interviewPrepService.savePractice(req.user.id, {
    questionId: req.params.id,
    ...req.body
  });
  res.json({ success: true, data: { session } });
});

export const getPracticeHistory = asyncHandler(async (req, res) => {
  const history = await interviewPrepService.getPracticeHistory(req.user.id);
  res.json({ success: true, data: { history } });
});

export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await interviewPrepService.getFavorites(req.user.id);
  res.json({ success: true, data: { favorites } });
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  const session = await interviewPrepService.toggleFavorite(req.user.id, req.params.id);
  res.json({ success: true, data: { session } });
});

export const getPracticeStats = asyncHandler(async (req, res) => {
  const stats = await interviewPrepService.getPracticeStats(req.user.id);
  res.json({ success: true, data: { stats } });
});

export const seedQuestions = asyncHandler(async (req, res) => {
  const result = await interviewPrepService.seedQuestions();
  res.json({ success: true, data: result });
});
