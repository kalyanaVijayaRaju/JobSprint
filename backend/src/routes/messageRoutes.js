import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import * as messageController from '../controllers/messageController.js';

const router = Router();

// All message routes require authentication
router.use(authenticate);

// GET /api/v1/messages/conversations — list all conversations
router.get('/conversations', messageController.getConversations);

// GET /api/v1/messages/unread-count — total unread messages
router.get('/unread-count', messageController.getUnreadCount);

// GET /api/v1/messages/:partnerId — get message thread with a user
router.get('/:partnerId', messageController.getMessages);

// POST /api/v1/messages/:partnerId — send a message to a user
router.post('/:partnerId', messageController.sendMessage);

// PATCH /api/v1/messages/:messageId/read — mark a message as read
router.patch('/:messageId/read', messageController.markAsRead);

export default router;
