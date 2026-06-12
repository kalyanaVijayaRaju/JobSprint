import mongoose from 'mongoose';

const recruiterProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID reference is required'],
    unique: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company ID reference is required']
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid E.164 phone number']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
recruiterProfileSchema.index({ userId: 1 });
recruiterProfileSchema.index({ companyId: 1 });

const RecruiterProfile = mongoose.models.RecruiterProfile || mongoose.model('RecruiterProfile', recruiterProfileSchema);
export default RecruiterProfile;
