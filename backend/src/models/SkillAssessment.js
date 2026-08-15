import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [2000, 'Question text cannot exceed 2000 characters']
  },
  options: {
    type: [{
      label: { type: String, required: true, trim: true },
      value: { type: String, required: true, trim: true }
    }],
    validate: {
      validator: (arr) => arr.length >= 2 && arr.length <= 6,
      message: 'Each question must have between 2 and 6 options'
    }
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer value is required'],
    trim: true
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters']
  },
  points: {
    type: Number,
    default: 1,
    min: [1, 'Points must be at least 1']
  }
}, { _id: true });

const skillAssessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  skill: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  difficulty: {
    type: String,
    enum: {
      values: ['beginner', 'intermediate', 'advanced'],
      message: '{VALUE} is not a valid difficulty level'
    },
    required: [true, 'Difficulty level is required']
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: (arr) => arr.length >= 3,
      message: 'Assessment must have at least 3 questions'
    }
  },
  timeLimitMinutes: {
    type: Number,
    required: [true, 'Time limit is required'],
    min: [1, 'Time limit must be at least 1 minute'],
    max: [180, 'Time limit cannot exceed 180 minutes']
  },
  passingScore: {
    type: Number,
    required: [true, 'Passing score percentage is required'],
    min: [1, 'Passing score must be at least 1%'],
    max: [100, 'Passing score cannot exceed 100%']
  },
  icon: {
    type: String,
    trim: true,
    default: '📝'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalAttempts: {
    type: Number,
    default: 0,
    min: 0
  },
  avgScore: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: total possible points
skillAssessmentSchema.virtual('totalPoints').get(function () {
  return (this.questions || []).reduce((sum, q) => sum + (q.points || 1), 0);
});

// Virtual: question count
skillAssessmentSchema.virtual('questionCount').get(function () {
  return (this.questions || []).length;
});

// Indexes
skillAssessmentSchema.index({ skill: 1, difficulty: 1 });
skillAssessmentSchema.index({ isActive: 1, createdAt: -1 });

const SkillAssessment = mongoose.models.SkillAssessment || mongoose.model('SkillAssessment', skillAssessmentSchema);
export default SkillAssessment;
