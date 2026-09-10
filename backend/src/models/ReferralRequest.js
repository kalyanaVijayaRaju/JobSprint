import mongoose from 'mongoose';

const referralRequestSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: true
  },
  targetRole: {
    type: String,
    required: true
  },
  referrerName: {
    type: String,
    required: true
  },
  referrerEmail: {
    type: String
  },
  endorsementNote: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'submitted', 'hired', 'declined'],
    default: 'pending'
  },
  referralBonus: {
    type: String,
    default: '$1,500'
  },
  referralCode: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('ReferralRequest', referralRequestSchema);
