import asyncHandler from '../utils/asyncHandler.js';
import * as exportService from '../services/exportService.js';

export const exportApplications = asyncHandler(async (req, res) => {
  const csvData = await exportService.exportApplicationsCSV(
    req.user.id,
    req.user.role,
    req.query
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="applications_export.csv"');
  res.send(csvData);
});

export const exportAnalytics = asyncHandler(async (req, res) => {
  const csvData = await exportService.exportAnalyticsCSV(req.user.id, req.user.role);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="analytics_export.csv"');
  res.send(csvData);
});

export const getHiringSummaryReport = asyncHandler(async (req, res) => {
  const report = await exportService.getHiringSummary(req.user.id);
  res.json({ success: true, data: { report } });
});
