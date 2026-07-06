import asyncHandler from '../utils/asyncHandler.js';
import * as notificationService from '../services/notificationService.js';
import { notificationQuerySchema } from '../validations/notificationValidation.js';
import ApiError from '../utils/apiError.js';

/**
 * @route   GET /api/v1/notifications
 * @access  Authenticated
 */
export const getUserNotifications = asyncHandler(async (req, res) => {
  const queryResult = notificationQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    const error = new ApiError(400, 'Invalid query parameters', true);
    error.details = queryResult.error.issues.map((issue) => issue.message);
    throw error;
  }

  const result = await notificationService.getUserNotifications(req.user.id, queryResult.data);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Authenticated
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: { notification }
  });
});

/**
 * @route   PATCH /api/v1/notifications/mark-all-read
 * @access  Authenticated
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

/**
 * @route   GET /api/v1/notifications/unread-count
 * @access  Authenticated
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    data: { count }
  });
});

/**
 * @route   DELETE /api/v1/notifications/read
 * @access  Authenticated
 */
export const clearReadNotifications = asyncHandler(async (req, res) => {
  const deletedCount = await notificationService.clearReadNotifications(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Read notifications cleared',
    data: { deletedCount }
  });
});

/**
 * @route   DELETE /api/v1/notifications/:id
 * @access  Authenticated (Owner only)
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Notification deleted'
  });
});
