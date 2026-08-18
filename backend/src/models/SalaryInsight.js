import mongoose from 'mongoose';

const salaryInsightSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
    index: true
  },
  normalizedTitle: {
    type: String,
    index: true
  },
  location: {
    type: String,
    required: true,
    index: true
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    required: true,
    index: true
  },
  minSalary: { type: Number, required: true },
  maxSalary: { type: Number, required: true },
  medianSalary: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  industry: { type: String, default: 'Technology' },
  source: {
    type: String,
    enum: ['seed', 'user-report', 'aggregated'],
    default: 'seed'
  },
  reportCount: { type: Number, default: 1 },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isAnonymous: { type: Boolean, default: true }
}, {
  timestamps: true
});

salaryInsightSchema.index({ jobTitle: 1, location: 1, experienceLevel: 1 });
salaryInsightSchema.index({ normalizedTitle: 1, experienceLevel: 1 });

salaryInsightSchema.pre('save', function (next) {
  this.normalizedTitle = this.jobTitle.toLowerCase().trim();
  next();
});

const SalaryInsight = mongoose.model('SalaryInsight', salaryInsightSchema);
export default SalaryInsight;
