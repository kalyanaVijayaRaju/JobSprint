import asyncHandler from '../utils/asyncHandler.js';
import * as salaryInsightService from '../services/salaryInsightService.js';

export const getSalaryData = asyncHandler(async (req, res) => {
  const result = await salaryInsightService.getSalaryData(req.query);
  res.json({ success: true, data: result });
});

export const submitReport = asyncHandler(async (req, res) => {
  const report = await salaryInsightService.submitReport(req.user.id, req.body);
  res.status(201).json({ success: true, data: { report } });
});

export const getSalaryTrends = asyncHandler(async (req, res) => {
  const trends = await salaryInsightService.getSalaryTrends(req.params.jobTitle);
  res.json({ success: true, data: { trends } });
});

export const seedSalaryData = asyncHandler(async (req, res) => {
  const result = await salaryInsightService.seedSalaryData();
  res.json({ success: true, data: result });
});
