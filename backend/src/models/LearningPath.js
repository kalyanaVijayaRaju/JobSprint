import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  durationMinutes: { type: Number, default: 30 },
  resourceType: { type: String, enum: ['video', 'article', 'interactive', 'project'], default: 'video' },
  resourceUrl: { type: String },
  isCompleted: { type: Boolean, default: false }
});

const learningPathSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetRole: {
    type: String,
    required: true
  },
  skillGap: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  modules: [moduleSchema],
  progress: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'paused'],
    default: 'in-progress'
  }
}, { timestamps: true });

export default mongoose.model('LearningPath', learningPathSchema);
