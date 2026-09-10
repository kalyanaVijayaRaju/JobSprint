import mongoose from 'mongoose';

const codeSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  problemTitle: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'typescript'],
    default: 'javascript'
  },
  code: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Passed', 'Failed', 'Syntax Error'],
    default: 'Passed'
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  executionTimeMs: {
    type: Number,
    default: 12
  },
  score: {
    type: Number,
    default: 100
  }
}, { timestamps: true });

export default mongoose.model('CodeSubmission', codeSubmissionSchema);
