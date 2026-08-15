import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  mimeType: {
    type: String,
    trim: true
  },
  size: {
    type: Number,
    min: 0
  }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver is required']
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    default: null
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  attachments: {
    type: [attachmentSchema],
    default: []
  },
  readAt: {
    type: Date,
    default: null
  },
  deletedBySender: {
    type: Boolean,
    default: false
  },
  deletedByReceiver: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to check read status
messageSchema.virtual('isRead').get(function () {
  return !!this.readAt;
});

// Compound index for fetching conversation threads sorted by time
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

// Index for listing a user's conversations (latest messages)
messageSchema.index({ receiverId: 1, readAt: 1, createdAt: -1 });

// Index for application-linked messages
messageSchema.index({ applicationId: 1, createdAt: -1 });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message;
