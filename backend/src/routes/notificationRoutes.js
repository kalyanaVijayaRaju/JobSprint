import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  clearReadNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/mark-all-read', markAllAsRead);
router.delete('/read', clearReadNotifications);
router.delete('/:id', deleteNotification);

export default router;
