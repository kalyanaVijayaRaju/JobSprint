import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recruiter ID is required']
  },
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Template name cannot exceed 100 characters']
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  body: {
    type: String,
    required: [true, 'Email body is required'],
    trim: true,
    maxlength: [10000, 'Email body cannot exceed 10000 characters']
  },
  variables: {
    type: [String],
    default: ['candidateName', 'jobTitle', 'companyName', 'interviewDate', 'recruiterName']
  },
  category: {
    type: String,
    enum: ['interview-invite', 'rejection', 'offer', 'follow-up', 'custom'],
    default: 'custom'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index: recruiter's templates listed by category
emailTemplateSchema.index({ recruiterId: 1, category: 1, createdAt: -1 });

// Ensure unique template names per recruiter
emailTemplateSchema.index({ recruiterId: 1, name: 1 }, { unique: true });

const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', emailTemplateSchema);
export default EmailTemplate;
