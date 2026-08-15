import * as userPreferenceService from '../services/userPreferenceService.js';

export const getPreferences = async (req, res, next) => {
  try {
    const prefs = await userPreferenceService.getPreferences(req.user._id);
    res.status(200).json({
      success: true,
      data: { preferences: prefs }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const prefs = await userPreferenceService.updatePreferences(req.user._id, req.body);
    res.status(200).json({
      success: true,
      data: { preferences: prefs }
    });
  } catch (error) {
    next(error);
  }
};
