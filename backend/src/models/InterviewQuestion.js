import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['behavioral', 'technical', 'system-design', 'coding', 'hr', 'situational'],
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    index: true
  },
  question: {
    type: String,
    required: true,
    maxlength: 500
  },
  sampleAnswer: {
    type: String,
    maxlength: 3000
  },
  tips: [{ type: String }],
  skill: {
    type: String,
    index: true
  },
  companyType: {
    type: String,
    enum: ['startup', 'mid-size', 'enterprise', 'faang', 'any'],
    default: 'any'
  },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// User practice tracking
const practiceSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewQuestion',
    required: true
  },
  confidence: {
    type: String,
    enum: ['not-confident', 'somewhat', 'confident', 'very-confident'],
    default: 'somewhat'
  },
  notes: { type: String, maxlength: 1000 },
  isFavorite: { type: Boolean, default: false },
  practicedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

practiceSessionSchema.index({ userId: 1, questionId: 1 });
practiceSessionSchema.index({ userId: 1, practicedAt: -1 });

interviewQuestionSchema.index({ category: 1, difficulty: 1 });
interviewQuestionSchema.index({ skill: 1, category: 1 });

export const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);
export const PracticeSession = mongoose.model('PracticeSession', practiceSessionSchema);
