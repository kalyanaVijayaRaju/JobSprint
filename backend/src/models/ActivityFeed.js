import mongoose from 'mongoose';

const activityFeedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'applied',
      'hired',
      'badge-earned',
      'job-posted',
      'profile-updated',
      'company-followed',
      'review-posted',
      'interview-scheduled',
      'offer-received',
      'resume-created',
      'assessment-completed'
    ],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 500
  },
  metadata: {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillAssessment' },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    jobTitle: { type: String },
    companyName: { type: String },
    score: { type: Number },
    badge: { type: String },
    icon: { type: String }
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'connections-only'],
    default: 'public'
  }
}, {
  timestamps: true
});

activityFeedSchema.index({ createdAt: -1 });
activityFeedSchema.index({ userId: 1, createdAt: -1 });
activityFeedSchema.index({ type: 1, createdAt: -1 });

const ActivityFeed = mongoose.model('ActivityFeed', activityFeedSchema);
export default ActivityFeed;
