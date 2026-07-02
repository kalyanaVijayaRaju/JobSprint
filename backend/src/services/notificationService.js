import Notification from '../models/Notification.js';
import ApiError from '../utils/apiError.js';

/**
 * Create a new notification for a user.
 *
 * @param {string} userId   - Recipient user ID
 * @param {string} title    - Notification title
 * @param {string} message  - Notification body message
 * @param {string} type     - Notification type ('application_status', 'new_job', 'profile_view', 'system')
 * @returns {Object} The created notification document
 */
export const createNotification = async (userId, title, message, type) => {
  return await Notification.create({
    userId,
    title,
    message,
    type,
    isRead: false
  });
};

/**
 * List a user's notifications with pagination and optional isRead filtering.
 *
 * @param {string} userId - Recipient user ID
 * @param {Object} query  - Validated query parameters
 * @returns {{ notifications: Array, pagination: Object }}
 */
export const getUserNotifications = async (userId, query) => {
  const { page, limit, isRead, sortBy, sortOrder } = query;

  const filter = { userId };
  if (isRead !== undefined) {
    filter.isRead = isRead;
  }

  const skip = (page - 1) * limit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter)
  ]);

  return {
    notifications,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNotifications: total,
      limit
    }
  };
};

/**
 * Mark a single notification as read, ensuring it belongs to the authenticated user.
 *
 * @param {string} notificationId - Notification ID
 * @param {string} userId         - Authenticated user's ID
 * @returns {Object} The updated notification document
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  return notification;
};

/**
 * Mark all notifications as read for a user.
 *
 * @param {string} userId - Recipient user ID
 */
export const markAllAsRead = async (userId) => {
  await Notification.markAllAsRead(userId);
};

/**
 * Get count of unread notifications for a user.
 *
 * @param {string} userId - Recipient user ID
 * @returns {number} The count of unread notifications
 */
export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ userId, isRead: false });
};
