import mongoose from 'mongoose';

const companyFollowerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company reference is required']
  }
}, {
  timestamps: true
});

// A user can only follow a company once
companyFollowerSchema.index({ userId: 1, companyId: 1 }, { unique: true });

// Efficient lookup: all followers of a given company
companyFollowerSchema.index({ companyId: 1 });

const CompanyFollower = mongoose.models.CompanyFollower || mongoose.model('CompanyFollower', companyFollowerSchema);
export default CompanyFollower;
