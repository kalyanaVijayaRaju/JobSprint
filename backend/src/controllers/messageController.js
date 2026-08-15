import * as messageService from '../services/messageService.js';

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await messageService.getConversations(req.user._id);
    res.status(200).json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { partnerId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const result = await messageService.getMessages(
      req.user._id,
      partnerId,
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

export const sendMessage = async (req, res, next) => {
  try {
    const { partnerId } = req.params;
    const { content, applicationId } = req.body;
    const message = await messageService.sendMessage(
      req.user._id,
      partnerId,
      content,
      applicationId
    );
    res.status(201).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const message = await messageService.markAsRead(messageId, req.user._id);
    res.status(200).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await messageService.getUnreadCount(req.user._id);
    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    next(error);
  }
};
