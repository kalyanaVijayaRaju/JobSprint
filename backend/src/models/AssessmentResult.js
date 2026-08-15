import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedAnswer: {
    type: String,
    required: true,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  pointsEarned: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const assessmentResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillAssessment',
    required: [true, 'Assessment ID is required']
  },
  answers: {
    type: [answerSchema],
    default: []
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  pointsEarned: {
    type: Number,
    required: true,
    min: 0
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 0
  },
  passed: {
    type: Boolean,
    required: true
  },
  timeTakenSeconds: {
    type: Number,
    min: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Prevent duplicate attempts (one result per user per assessment)
assessmentResultSchema.index({ userId: 1, assessmentId: 1 }, { unique: true });

// Index for leaderboard queries
assessmentResultSchema.index({ assessmentId: 1, score: -1 });

// Index for user badge lookups
assessmentResultSchema.index({ userId: 1, passed: 1 });

const AssessmentResult = mongoose.models.AssessmentResult || mongoose.model('AssessmentResult', assessmentResultSchema);
export default AssessmentResult;
