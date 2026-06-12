import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [150, 'Job title cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [10000, 'Description cannot exceed 10000 characters']
  },
  requirements: {
    type: [String],
    default: []
  },
  skillsRequired: {
    type: [String],
    default: [],
    required: [true, 'At least one skill requirement is required']
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company reference is required']
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recruiter user reference is required']
  },
  locationType: {
    type: String,
    enum: {
      values: ['remote', 'onsite', 'hybrid'],
      message: '{VALUE} is not a valid location type'
    },
    required: [true, 'Location type is required']
  },
  location: {
    type: String,
    required: [true, 'Location description is required'],
    trim: true
  },
  salaryRange: {
    min: {
      type: Number,
      min: [0, 'Salary cannot be negative']
    },
    max: {
      type: Number,
      validate: {
        validator: function(value) {
          if (!this.salaryRange.min) return true;
          return value >= this.salaryRange.min;
        },
        message: 'Maximum salary must be greater than or equal to minimum salary'
      }
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
      length: [3, 'Currency must be a 3-character ISO code']
    }
  },
  jobType: {
    type: String,
    enum: {
      values: ['full-time', 'part-time', 'contract', 'internship'],
      message: '{VALUE} is not a valid job type'
    },
    required: [true, 'Job type is required']
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate to fetch applications for this job
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'jobId',
  justOne: false
});

// Instance method to close a job posting
jobSchema.methods.closeJob = function() {
  this.status = 'closed';
  return this.save();
};

// Static method to find only active and non-expired job listings
jobSchema.statics.findActiveJobs = function() {
  return this.find({
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
};

// Indexing
jobSchema.index({ status: 1, createdAt: -1 }); // Compound index for active job lists feeds
jobSchema.index({ companyId: 1, status: 1 });  // Compound index for company active listings
jobSchema.index({ skillsRequired: 1 });        // Multikey index for skill matches
// Text index for search functionality
jobSchema.index({ title: 'text', description: 'text' }, { weights: { title: 5, description: 1 } });

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
export default Job;
