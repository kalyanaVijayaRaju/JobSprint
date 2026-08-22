import asyncHandler from '../utils/asyncHandler.js';
import * as talentRadarService from '../services/talentRadarService.js';

export const searchTalentRadar = asyncHandler(async (req, res) => {
  const skills = typeof req.body.requiredSkills === 'string'
    ? req.body.requiredSkills.split(',')
    : (req.body.requiredSkills || []);

  const result = await talentRadarService.searchTalentRadar({
    requiredSkills: skills,
    minExperience: req.body.minExperience || 0
  });

  res.json({ success: true, data: result });
});
