import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  logo: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?(www\.)?([a-zA-Z0-9]+(-?[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/, 'Please provide a valid URL']
  },
  description: {
    type: String,
    required: [true, 'Company description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  industry: {
    type: String,
    required: [true, 'Industry type is required'],
    trim: true
  },
  size: {
    type: String,
    enum: {
      values: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      message: '{VALUE} is not a valid company size option'
    },
    required: [true, 'Company size is required']
  },
  foundedYear: {
    type: Number,
    min: [1800, 'Founded year cannot be before 1800'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  locations: {
    type: [String],
    required: [true, 'At least one location is required']
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate to get jobs published by this company
companySchema.virtual('jobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'companyId',
  justOne: false
});

// Static method to find all verified companies
companySchema.statics.findVerified = function() {
  return this.find({ isVerified: true });
};

// Static method to find company by name
companySchema.statics.findByName = function(name) {
  return this.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
};

// Indexes
// Note: name already has a unique index via `unique: true` on the schema field
companySchema.index({ industry: 1 });
companySchema.index({ isVerified: 1 });

const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
export default Company;
