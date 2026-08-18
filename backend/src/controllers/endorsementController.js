import asyncHandler from '../utils/asyncHandler.js';
import * as endorsementService from '../services/endorsementService.js';

export const endorseSkill = asyncHandler(async (req, res) => {
  const endorsement = await endorsementService.endorseSkill(
    req.user.id, req.body.endorseeId, req.body.skill, req.body
  );
  res.status(201).json({ success: true, data: { endorsement } });
});

export const getEndorsements = asyncHandler(async (req, res) => {
  const endorsements = await endorsementService.getEndorsements(req.params.userId);
  res.json({ success: true, data: { endorsements } });
});

export const getTopSkills = asyncHandler(async (req, res) => {
  const skills = await endorsementService.getTopEndorsedSkills(req.params.userId);
  res.json({ success: true, data: { skills } });
});

export const retractEndorsement = asyncHandler(async (req, res) => {
  await endorsementService.retractEndorsement(req.params.id, req.user.id);
  res.json({ success: true, data: { message: 'Endorsement retracted' } });
});
