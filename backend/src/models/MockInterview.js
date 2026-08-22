import mongoose from 'mongoose';

const mockInterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobRole: {
    type: String,
    required: true,
    index: true
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead'],
    default: 'mid'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questions: [{
    questionText: { type: String, required: true },
    category: { type: String, enum: ['technical', 'behavioral', 'system-design', 'situational'], default: 'technical' },
    userAnswer: { type: String, default: '' },
    feedback: { type: String, default: '' },
    score: { type: Number, min: 0, max: 100, default: 0 },
    idealAnswer: { type: String, default: '' },
    keyTakeaways: [{ type: String }]
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress',
    index: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

mockInterviewSchema.index({ userId: 1, createdAt: -1 });

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);
export default MockInterview;
