import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient User reference is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message body is required'],
    trim: true
  },
  type: {
    type: String,
    enum: {
      values: ['application_status', 'new_job', 'profile_view', 'system'],
      message: '{VALUE} is not a valid notification type'
    },
    required: [true, 'Notification type is required']
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for high performance reads
notificationSchema.index({ userId: 1, isRead: 1 }); // Optimize unread counts and queries
notificationSchema.index({ createdAt: -1 });         // Sort logs by date

// Static helper to mark all notifications as read for a specific user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
};

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;
