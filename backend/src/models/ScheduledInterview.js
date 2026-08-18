import mongoose from 'mongoose';

const scheduledInterviewSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    index: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    index: true
  },
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: Number,
    default: 60,
    min: 15,
    max: 480
  },
  type: {
    type: String,
    enum: ['in-person', 'video', 'phone'],
    default: 'video'
  },
  meetingLink: { type: String },
  location: { type: String },
  notes: { type: String, maxlength: 2000 },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no-show'],
    default: 'scheduled',
    index: true
  },
  feedback: { type: String, maxlength: 2000 },
  rating: { type: Number, min: 1, max: 5 }
}, {
  timestamps: true
});

scheduledInterviewSchema.index({ candidateId: 1, scheduledAt: 1 });
scheduledInterviewSchema.index({ recruiterId: 1, scheduledAt: 1 });
scheduledInterviewSchema.index({ scheduledAt: 1, status: 1 });

const ScheduledInterview = mongoose.model('ScheduledInterview', scheduledInterviewSchema);
export default ScheduledInterview;
