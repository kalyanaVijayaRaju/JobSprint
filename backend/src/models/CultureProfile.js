import mongoose from 'mongoose';

const cultureProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: true
  },
  workStyle: { type: String, default: 'Async-First' },
  teamStructure: { type: String, default: 'Flat & Autonomous' },
  pacing: { type: String, default: 'High Velocity / Agile' },
  workLifeBalanceRating: { type: Number, default: 4.5 },
  overallMatchScore: { type: Number, default: 92 },
  answers: [{
    questionId: String,
    answerValue: String,
    weight: Number
  }]
}, { timestamps: true });

export default mongoose.model('CultureProfile', cultureProfileSchema);
