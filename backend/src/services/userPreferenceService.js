import UserPreference from '../models/UserPreference.js';

/**
 * Get user preferences, creating defaults if not found.
 */
export const getPreferences = async (userId) => {
  let prefs = await UserPreference.findOne({ userId }).lean();
  if (!prefs) {
    prefs = await UserPreference.create({ userId });
    prefs = prefs.toObject();
  }
  return prefs;
};

/**
 * Update user preferences (partial update).
 */
export const updatePreferences = async (userId, data) => {
  // Build flat update object for nested fields
  const updateObj = {};

  // Top-level simple fields
  if (data.theme !== undefined) updateObj.theme = data.theme;
  if (data.language !== undefined) updateObj.language = data.language;
  if (data.timezone !== undefined) updateObj.timezone = data.timezone;

  // Nested email notification fields
  if (data.emailNotifications) {
    for (const [key, value] of Object.entries(data.emailNotifications)) {
      updateObj[`emailNotifications.${key}`] = value;
    }
  }

  // Nested push notification fields
  if (data.pushNotifications) {
    for (const [key, value] of Object.entries(data.pushNotifications)) {
      updateObj[`pushNotifications.${key}`] = value;
    }
  }

  // Nested privacy fields
  if (data.privacy) {
    for (const [key, value] of Object.entries(data.privacy)) {
      updateObj[`privacy.${key}`] = value;
    }
  }

  const prefs = await UserPreference.findOneAndUpdate(
    { userId },
    { $set: updateObj },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  return prefs;
};
