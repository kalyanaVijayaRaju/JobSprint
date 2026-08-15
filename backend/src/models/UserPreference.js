import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  emailNotifications: {
    jobAlerts: { type: Boolean, default: true },
    applicationUpdates: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false }
  },
  pushNotifications: {
    enabled: { type: Boolean, default: true },
    interviewReminders: { type: Boolean, default: true },
    newMessages: { type: Boolean, default: true },
    statusChanges: { type: Boolean, default: true }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'recruiters-only'],
      default: 'public'
    },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    allowMessagesFrom: {
      type: String,
      enum: ['everyone', 'recruiters-only', 'nobody'],
      default: 'everyone'
    }
  },
  language: {
    type: String,
    default: 'en',
    trim: true
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const UserPreference = mongoose.models.UserPreference || mongoose.model('UserPreference', userPreferenceSchema);
export default UserPreference;
