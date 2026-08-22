import mongoose from 'mongoose';

const offerEvaluationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobTitle: {
    type: String,
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  baseSalary: {
    type: Number,
    required: true
  },
  bonus: {
    type: Number,
    default: 0
  },
  equityValue: {
    type: Number,
    default: 0
  },
  benefitsValue: {
    type: Number,
    default: 0
  },
  totalCompensation: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  marketMedian: {
    type: Number,
    default: 0
  },
  percentile: {
    type: Number,
    default: 50
  },
  scoreRating: {
    type: String,
    enum: ['below-market', 'fair', 'competitive', 'exceptional'],
    default: 'fair'
  },
  strengths: [{ type: String }],
  improvementAreas: [{ type: String }],
  counterLetterText: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

offerEvaluationSchema.index({ userId: 1, createdAt: -1 });

const OfferEvaluation = mongoose.model('OfferEvaluation', offerEvaluationSchema);
export default OfferEvaluation;
