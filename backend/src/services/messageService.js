import Message from '../models/Message.js';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';

/**
 * Get all conversations for a user with last message preview.
 */
export const getConversations = async (userId) => {
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { senderId: userId, deletedBySender: false },
          { receiverId: userId, deletedByReceiver: false }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $addFields: {
        partnerId: {
          $cond: {
            if: { $eq: ['$senderId', userId] },
            then: '$receiverId',
            else: '$senderId'
          }
        }
      }
    },
    {
      $group: {
        _id: '$partnerId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$readAt', null] }] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'partner'
      }
    },
    { $unwind: '$partner' },
    {
      $lookup: {
        from: 'candidateprofiles',
        localField: '_id',
        foreignField: 'userId',
        as: 'candidateProfile'
      }
    },
    {
      $lookup: {
        from: 'recruiterprofiles',
        localField: '_id',
        foreignField: 'userId',
        as: 'recruiterProfile'
      }
    },
    {
      $project: {
        partnerId: '$_id',
        partnerEmail: '$partner.email',
        partnerRole: '$partner.role',
        partnerName: {
          $cond: {
            if: { $gt: [{ $size: '$candidateProfile' }, 0] },
            then: {
              $concat: [
                { $arrayElemAt: ['$candidateProfile.firstName', 0] },
                ' ',
                { $arrayElemAt: ['$candidateProfile.lastName', 0] }
              ]
            },
            else: { $arrayElemAt: ['$recruiterProfile.jobTitle', 0] }
          }
        },
        lastMessage: {
          content: '$lastMessage.content',
          createdAt: '$lastMessage.createdAt',
          senderId: '$lastMessage.senderId',
          readAt: '$lastMessage.readAt'
        },
        unreadCount: 1
      }
    },
    { $sort: { 'lastMessage.createdAt': -1 } }
  ]);

  return conversations;
};

/**
 * Get paginated message thread between two users.
 */
export const getMessages = async (userId, partnerId, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;

  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: partnerId, deletedBySender: false },
      { senderId: partnerId, receiverId: userId, deletedByReceiver: false }
    ]
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Message.countDocuments({
    $or: [
      { senderId: userId, receiverId: partnerId, deletedBySender: false },
      { senderId: partnerId, receiverId: userId, deletedByReceiver: false }
    ]
  });

  // Mark received messages as read
  await Message.updateMany(
    { senderId: partnerId, receiverId: userId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  return {
    messages: messages.reverse(),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Send a message from one user to another.
 */
export const sendMessage = async (senderId, receiverId, content, applicationId = null) => {
  // Validate receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new ApiError(404, 'Recipient user not found');
  }

  // Prevent messaging self
  if (senderId.toString() === receiverId.toString()) {
    throw new ApiError(400, 'Cannot send a message to yourself');
  }

  const message = await Message.create({
    senderId,
    receiverId,
    content,
    applicationId
  });

  return message;
};

/**
 * Mark a specific message as read.
 */
export const markAsRead = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  if (message.receiverId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only mark your own received messages as read');
  }

  message.readAt = new Date();
  await message.save();
  return message;
};

/**
 * Get total unread message count for a user.
 */
export const getUnreadCount = async (userId) => {
  const count = await Message.countDocuments({
    receiverId: userId,
    readAt: null,
    deletedByReceiver: false
  });
  return count;
};
