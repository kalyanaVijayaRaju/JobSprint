import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'awards', 'languages', 'custom'],
    required: true
  },
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
  items: [{
    title: { type: String },
    subtitle: { type: String },
    location: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String },
    bullets: [{ type: String }],
    tags: [{ type: String }],
    url: { type: String },
    level: { type: String } // for skills: beginner/intermediate/advanced/expert
  }],
  content: { type: String } // for summary or custom free-text sections
});

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    default: 'My Resume',
    maxlength: 100
  },
  template: {
    type: String,
    enum: ['modern', 'classic', 'minimal', 'creative'],
    default: 'modern'
  },
  personalInfo: {
    fullName: { type: String },
    email: { type: String },
    phone: { type: String },
    location: { type: String },
    website: { type: String },
    linkedin: { type: String },
    github: { type: String },
    headline: { type: String, maxlength: 200 }
  },
  sections: [sectionSchema],
  colorScheme: {
    primary: { type: String, default: '#6366f1' },
    secondary: { type: String, default: '#1e293b' },
    accent: { type: String, default: '#10b981' }
  },
  fontFamily: {
    type: String,
    default: 'Inter',
    enum: ['Inter', 'Roboto', 'Merriweather', 'Lato', 'Open Sans', 'Playfair Display']
  },
  isDefault: { type: Boolean, default: false },
  lastExportedAt: { type: Date }
}, {
  timestamps: true
});

// Ensure only one default resume per user
resumeSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id }, isDefault: true },
      { $set: { isDefault: false } }
    );
  }
  next();
});

resumeSchema.index({ userId: 1, createdAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
