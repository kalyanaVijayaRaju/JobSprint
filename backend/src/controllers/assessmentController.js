import * as assessmentService from '../services/assessmentService.js';

export const listAssessments = async (req, res, next) => {
  try {
    const { skill, difficulty } = req.query;
    const assessments = await assessmentService.listAssessments({ skill, difficulty });
    res.status(200).json({
      success: true,
      data: { assessments }
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessment = async (req, res, next) => {
  try {
    const assessment = await assessmentService.getAssessment(req.params.id, false);
    res.status(200).json({
      success: true,
      data: { assessment }
    });
  } catch (error) {
    next(error);
  }
};

export const submitAssessment = async (req, res, next) => {
  try {
    const { answers, timeTakenSeconds } = req.body;
    const result = await assessmentService.submitAssessment(
      req.user._id,
      req.params.id,
      answers || [],
      timeTakenSeconds || 0
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getMyResults = async (req, res, next) => {
  try {
    const results = await assessmentService.getUserResults(req.user._id);
    res.status(200).json({
      success: true,
      data: { results }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBadges = async (req, res, next) => {
  try {
    const badges = await assessmentService.getUserBadges(req.user._id);
    res.status(200).json({
      success: true,
      data: { badges }
    });
  } catch (error) {
    next(error);
  }
};

export const seedAssessments = async (req, res, next) => {
  try {
    const result = await assessmentService.seedAssessments();
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
