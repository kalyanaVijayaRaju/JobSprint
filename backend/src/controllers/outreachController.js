import asyncHandler from '../utils/asyncHandler.js';
import * as emailTemplateService from '../services/emailTemplateService.js';
import { logActivity } from '../services/activityFeedService.js';

export const sendOutreachEmail = asyncHandler(async (req, res) => {
  const { templateId, candidateEmail, candidateName, jobTitle, companyName, customMessage } = req.body;

  const result = await emailTemplateService.sendRenderedEmail(
    templateId,
    req.user.id,
    candidateEmail,
    { candidateName, jobTitle, companyName, customMessage }
  );

  // Log activity
  await logActivity(
    req.user.id,
    'review-posted', // fallback mapping
    `Sent outreach to ${candidateName || candidateEmail}`,
    `Subject: ${result.subject}`,
    { candidateEmail, jobTitle },
    'private'
  );

  res.json({ success: true, data: result });
});

export const sendBulkOutreach = asyncHandler(async (req, res) => {
  const { templateId, candidates } = req.body; // candidates: [{ email, name, jobTitle }]

  const results = [];
  for (const c of (candidates || [])) {
    try {
      const res = await emailTemplateService.sendRenderedEmail(templateId, req.user.id, c.email, c);
      results.push({ email: c.email, success: true, subject: res.subject });
    } catch (err) {
      results.push({ email: c.email, success: false, error: err.message });
    }
  }

  res.json({ success: true, data: { sentCount: results.filter(r => r.success).length, results } });
});
