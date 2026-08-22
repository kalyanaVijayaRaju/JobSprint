import mongoose from 'mongoose';

const mentorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    index: true
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  skills: [{
    type: String,
    index: true
  }],
  topics: [{
    type: String,
    enum: ['resume-review', 'mock-interview', 'career-strategy', 'salary-negotiation', 'system-design', 'leadership'],
    default: 'career-strategy'
  }],
  hourlyRate: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 12
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

mentorProfileSchema.index({ skills: 1, isAvailable: 1 });

const MentorProfile = mongoose.model('MentorProfile', mentorProfileSchema);
export default MentorProfile;
