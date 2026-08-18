import mongoose from 'mongoose';

const endorsementSchema = new mongoose.Schema({
  endorserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  endorseeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  skill: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    maxlength: 500
  },
  relationship: {
    type: String,
    enum: ['colleague', 'manager', 'recruiter', 'mentor', 'client', 'other'],
    default: 'colleague'
  }
}, {
  timestamps: true
});

// One endorsement per endorser per endorsee per skill
endorsementSchema.index({ endorserId: 1, endorseeId: 1, skill: 1 }, { unique: true });
endorsementSchema.index({ endorseeId: 1, skill: 1 });
endorsementSchema.index({ endorseeId: 1, createdAt: -1 });

const Endorsement = mongoose.model('Endorsement', endorsementSchema);
export default Endorsement;
