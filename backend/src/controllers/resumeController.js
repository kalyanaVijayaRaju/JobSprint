import asyncHandler from '../utils/asyncHandler.js';
import * as resumeService from '../services/resumeService.js';

export const listResumes = asyncHandler(async (req, res) => {
  const resumes = await resumeService.listResumes(req.user.id);
  res.json({ success: true, data: { resumes } });
});

export const getResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getResume(req.params.id, req.user.id);
  res.json({ success: true, data: { resume } });
});

export const createResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.createResume(req.user.id, req.body);
  res.status(201).json({ success: true, data: { resume } });
});

export const updateResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.updateResume(req.params.id, req.user.id, req.body);
  res.json({ success: true, data: { resume } });
});

export const deleteResume = asyncHandler(async (req, res) => {
  await resumeService.deleteResume(req.params.id, req.user.id);
  res.json({ success: true, data: { message: 'Resume deleted' } });
});

export const previewResume = asyncHandler(async (req, res) => {
  const html = await resumeService.generateResumeHTML(req.params.id, req.user.id);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

export const downloadResumePDF = asyncHandler(async (req, res) => {
  // Send HTML for client-side PDF generation (window.print / html2pdf.js)
  const html = await resumeService.generateResumeHTML(req.params.id, req.user.id);
  res.json({ success: true, data: { html } });
});
