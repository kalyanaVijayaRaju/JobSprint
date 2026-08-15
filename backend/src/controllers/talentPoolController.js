import * as talentPoolService from '../services/talentPoolService.js';

export const searchCandidates = async (req, res, next) => {
  try {
    const {
      skills,
      location,
      degree,
      fieldOfStudy,
      search,
      minExperience,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      skills: skills ? skills.split(',').map((s) => s.trim()) : [],
      location,
      degree,
      fieldOfStudy,
      search,
      minExperience
    };

    const result = await talentPoolService.searchCandidates(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
