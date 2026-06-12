import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Job position is required'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (this.current) return true;
        return value && value >= this.startDate;
      },
      message: 'End date must be after the start date'
    }
  },
  current: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Experience description cannot exceed 1000 characters']
  }
});

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (this.current) return true;
        return value && value >= this.startDate;
      },
      message: 'End date must be after the start date'
    }
  },
  current: {
    type: Boolean,
    default: false
  }
});

const portfolioLinksSchema = new mongoose.Schema({
  github: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/, 'Please provide a valid GitHub profile URL']
  },
  linkedin: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/, 'Please provide a valid LinkedIn profile URL']
  },
  website: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?(www\.)?([a-zA-Z0-9]+(-?[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/, 'Please provide a valid URL']
  }
}, { _id: false });

const candidateProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID reference is required'],
    unique: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid E.164 phone number']
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [2000, 'Summary cannot exceed 2000 characters']
  },
  skills: {
    type: [String],
    default: []
  },
  experience: [experienceSchema],
  education: [educationSchema],
  portfolioLinks: {
    type: portfolioLinksSchema,
    default: () => ({})
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Full name virtual property
candidateProfileSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Instance method to add a skill (avoiding duplicates)
candidateProfileSchema.methods.addSkill = function(skill) {
  const formattedSkill = skill.trim();
  if (!this.skills.includes(formattedSkill)) {
    this.skills.push(formattedSkill);
  }
  return this.save();
};

// Indexes
candidateProfileSchema.index({ userId: 1 });
candidateProfileSchema.index({ skills: 1 }); // Multikey index for candidate skill searches

const CandidateProfile = mongoose.models.CandidateProfile || mongoose.model('CandidateProfile', candidateProfileSchema);
export default CandidateProfile;
