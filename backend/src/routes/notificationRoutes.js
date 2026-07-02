import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from '../controllers/notificationController.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);

export default router;
