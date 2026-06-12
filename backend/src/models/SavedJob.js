import mongoose from 'mongoose';

const savedJobSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Candidate reference is required']
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job reference is required']
  }
}, {
  timestamps: true
});

// Enforce unique saved jobs per candidate
savedJobSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

// Static check method
savedJobSchema.statics.isJobSaved = async function(candidateId, jobId) {
  const result = await this.findOne({ candidateId, jobId });
  return !!result;
};

const SavedJob = mongoose.models.SavedJob || mongoose.model('SavedJob', savedJobSchema);
export default SavedJob;
