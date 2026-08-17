import mongoose from 'mongoose';

const companyReviewSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 150
  },
  pros: {
    type: String,
    required: true,
    maxlength: 2000
  },
  cons: {
    type: String,
    required: true,
    maxlength: 2000
  },
  advice: {
    type: String,
    maxlength: 1000
  },
  employmentStatus: {
    type: String,
    enum: ['current', 'former'],
    required: true
  },
  jobTitle: {
    type: String,
    maxlength: 100
  },
  department: {
    type: String,
    maxlength: 100
  },
  ratings: {
    workLifeBalance: { type: Number, min: 1, max: 5 },
    compensation: { type: Number, min: 1, max: 5 },
    culture: { type: Number, min: 1, max: 5 },
    management: { type: Number, min: 1, max: 5 },
    growthOpportunities: { type: Number, min: 1, max: 5 }
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  helpfulVotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// One review per user per company
companyReviewSchema.index({ companyId: 1, userId: 1 }, { unique: true });
companyReviewSchema.index({ companyId: 1, createdAt: -1 });
companyReviewSchema.index({ companyId: 1, rating: -1 });

const CompanyReview = mongoose.model('CompanyReview', companyReviewSchema);
export default CompanyReview;
