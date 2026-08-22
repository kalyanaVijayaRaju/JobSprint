import mongoose from 'mongoose';

const mentorshipBookingSchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  topic: {
    type: String,
    enum: ['resume-review', 'mock-interview', 'career-strategy', 'salary-negotiation', 'system-design', 'leadership'],
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: Number,
    default: 45 // minutes
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  meetingLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'confirmed',
    index: true
  }
}, {
  timestamps: true
});

mentorshipBookingSchema.index({ menteeId: 1, scheduledAt: -1 });
mentorshipBookingSchema.index({ mentorId: 1, scheduledAt: -1 });

const MentorshipBooking = mongoose.model('MentorshipBooking', mentorshipBookingSchema);
export default MentorshipBooking;
