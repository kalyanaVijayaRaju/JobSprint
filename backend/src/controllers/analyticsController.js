import asyncHandler from '../utils/asyncHandler.js';
import * as analyticsService from '../services/analyticsService.js';

/**
 * @route   GET /api/v1/analytics/platform
 * @access  Authenticated (Admin)
 * @desc    Platform-wide metrics — user counts, job stats, application pipeline,
 *          sign-up trends, top skills, top hiring companies.
 */
export const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getPlatformAnalytics();

  res.status(200).json({
    success: true,
    data: { analytics }
  });
});

/**
 * @route   GET /api/v1/analytics/recruiter
 * @access  Authenticated (Recruiter)
 * @desc    Per-recruiter analytics — owned jobs, pipeline health, conversion rates,
 *          recent applications.
 */
export const getRecruiterAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getRecruiterAnalytics(req.user.id);

  res.status(200).json({
    success: true,
    data: { analytics }
  });
});

/**
 * @route   GET /api/v1/analytics/candidate
 * @access  Authenticated (Candidate)
 * @desc    Candidate-specific analytics — application success rates, profile
 *          completeness, skill-based job recommendations, skills market demand.
 */
export const getCandidateAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getCandidateAnalytics(req.user.id);

  res.status(200).json({
    success: true,
    data: { analytics }
  });
});

/**
 * @route   GET /api/v1/analytics/trends
 * @access  Authenticated (Admin)
 * @desc    Time-series trend data for sign-ups, job posts, and applications.
 *          Query params: period (daily|weekly), days (default 30)
 */
export const getTrends = asyncHandler(async (req, res) => {
  const period = req.query.period || 'daily';
  const days = parseInt(req.query.days, 10) || 30;

  const trends = await analyticsService.getTrendData({ period, days });

  res.status(200).json({
    success: true,
    data: { trends }
  });
});
