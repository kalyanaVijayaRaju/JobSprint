import ActivityFeed from '../models/ActivityFeed.js';

/**
 * Log a new activity event.
 */
export const logActivity = async (userId, type, title, description, metadata = {}, visibility = 'public') => {
  return ActivityFeed.create({ userId, type, title, description, metadata, visibility });
};

/**
 * Get public activity feed with pagination.
 */
export const getPublicFeed = async (page = 1, limit = 20, type) => {
  const query = { visibility: 'public' };
  if (type) query.type = type;

  const skip = (page - 1) * limit;
  const [activities, total] = await Promise.all([
    ActivityFeed.find(query)
      .populate('userId', 'email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityFeed.countDocuments(query)
  ]);

  return {
    activities,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
};

/**
 * Get a user's own activity timeline.
 */
export const getUserTimeline = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [activities, total] = await Promise.all([
    ActivityFeed.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityFeed.countDocuments({ userId })
  ]);

  return {
    activities,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
};

/**
 * Get activity stats for a user.
 */
export const getUserActivityStats = async (userId) => {
  const stats = await ActivityFeed.aggregate([
    { $match: { userId: (await import('mongoose')).default.Types.ObjectId.createFromHexString(userId.toString()) } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return Object.fromEntries(stats.map(s => [s._id, s.count]));
};
