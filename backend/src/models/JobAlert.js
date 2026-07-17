import mongoose from 'mongoose';

const jobAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Candidate user reference is required']
  },
  keyword: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  locationType: {
    type: String,
    enum: {
      values: ['remote', 'onsite', 'hybrid', ''],
      message: '{VALUE} is not a valid location type'
    },
    default: ''
  },
  jobType: {
    type: String,
    enum: {
      values: ['full-time', 'part-time', 'contract', 'internship', ''],
      message: '{VALUE} is not a valid job type'
    },
    default: ''
  },
  minSalary: {
    type: Number,
    min: [0, 'Minimum salary threshold cannot be negative'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for alert checks and candidates lookup
jobAlertSchema.index({ userId: 1 });
jobAlertSchema.index({ isActive: 1 });

const JobAlert = mongoose.models.JobAlert || mongoose.model('JobAlert', jobAlertSchema);
export default JobAlert;
