import mongoose from 'mongoose';

const videoPitchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  durationSeconds: {
    type: Number,
    default: 60
  },
  transcript: {
    type: String,
    default: ''
  },
  targetJobTitle: {
    type: String,
    default: 'General Full Stack Developer'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  tags: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('VideoPitch', videoPitchSchema);
