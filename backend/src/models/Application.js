import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['applied', 'screening', 'interviewing', 'offered', 'rejected', 'withdrawn'],
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const recruiterNoteSchema = new mongoose.Schema({
  note: {
    type: String,
    required: [true, 'Note text cannot be empty'],
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const interviewSchema = new mongoose.Schema({
  scheduledAt: {
    type: Date,
    required: [true, 'Interview time is required']
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: [15, 'Interview duration must be at least 15 minutes'],
    max: [480, 'Interview duration cannot exceed 480 minutes']
  },
  meetingType: {
    type: String,
    enum: ['video', 'phone', 'onsite'],
    required: true
  },
  location: {
    type: String,
    trim: true,
    maxlength: [300, 'Interview location cannot exceed 300 characters']
  },
  meetingUrl: {
    type: String,
    trim: true,
    maxlength: [2000, 'Meeting URL cannot exceed 2000 characters']
  },
  timezone: {
    type: String,
    required: true,
    trim: true,
    maxlength: [80, 'Timezone cannot exceed 80 characters']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [2000, 'Interview instructions cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job reference is required']
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Candidate user reference is required']
  },
  resumeUrl: {
    type: String,
    required: [true, 'A resume snapshot is required to apply']
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [5000, 'Cover letter cannot exceed 5000 characters']
  },
  status: {
    type: String,
    enum: ['applied', 'screening', 'interviewing', 'offered', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  statusTimeline: [statusHistorySchema],
  recruiterNotes: [recruiterNoteSchema],
  interviews: [interviewSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Enforce single application per job per candidate
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

// Core querying indexes
applicationSchema.index({ candidateId: 1, createdAt: -1 }); // Candidate application history
applicationSchema.index({ jobId: 1, status: 1 });           // Recruiter ATS dashboard pipeline

// Pre-save middleware to automatically log status changes in the timeline
applicationSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    // Note: The updatedBy property should be passed in controller logic, default to candidate if new, otherwise we update it in service/controller
    const updater = this._updatedBy || this.candidateId;

    this.statusTimeline.push({
      status: this.status,
      updatedBy: updater,
      updatedAt: new Date()
    });
  }
  next();
});

// Instance helper to update status along with updater ID
applicationSchema.methods.updateStatus = function (newStatus, updaterId) {
  this.status = newStatus;
  this._updatedBy = updaterId;
  return this.save();
};

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
export default Application;
