import MentorProfile from '../models/MentorProfile.js';
import MentorshipBooking from '../models/MentorshipBooking.js';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';

/**
 * Get mentors with domain, skill, and availability filters.
 */
export const getMentors = async (filters = {}) => {
  const query = { isAvailable: true };

  if (filters.topic) query.topics = filters.topic;
  if (filters.company) query.company = new RegExp(filters.company, 'i');
  if (filters.skill) query.skills = new RegExp(filters.skill, 'i');

  return MentorProfile.find(query)
    .populate('userId', 'email role')
    .sort({ rating: -1, reviewCount: -1 })
    .lean();
};

/**
 * Book a mentorship session.
 */
export const bookSession = async (menteeId, data) => {
  const { mentorUserId, topic, scheduledAt, duration = 45, notes = '' } = data;

  const mentorProfile = await MentorProfile.findOne({ userId: mentorUserId });
  if (!mentorProfile) throw new ApiError(404, 'Mentor profile not found');

  if (menteeId.toString() === mentorUserId.toString()) {
    throw new ApiError(400, 'You cannot book a mentorship session with yourself');
  }

  const meetingLink = `https://meet.jobsprint.io/${Math.random().toString(36).substring(2, 10)}`;

  return MentorshipBooking.create({
    mentorId: mentorUserId,
    menteeId,
    topic,
    scheduledAt: new Date(scheduledAt),
    duration: Number(duration),
    notes,
    meetingLink,
    status: 'confirmed'
  });
};

/**
 * Get user's booked mentorship sessions (as mentee or mentor).
 */
export const getMySessions = async (userId) => {
  return MentorshipBooking.find({
    $or: [{ menteeId: userId }, { mentorId: userId }]
  })
    .populate('mentorId', 'email')
    .populate('menteeId', 'email')
    .sort({ scheduledAt: 1 })
    .lean();
};

/**
 * Seed initial top industry mentor profiles.
 */
export const seedMentors = async () => {
  const count = await MentorProfile.countDocuments();
  if (count > 0) return { seeded: false, message: 'Mentors already seeded' };

  // Find or create sample mentor users
  const mentorsData = [
    { email: 'mentor.tech@jobsprint.com', name: 'Arjun Mehta', title: 'Principal Architect', company: 'Google', skills: ['System Design', 'React', 'Node.js', 'Kubernetes'], topics: ['system-design', 'mock-interview', 'career-strategy'], hourlyRate: 1500 },
    { email: 'mentor.product@jobsprint.com', name: 'Priya Sharma', title: 'VP of Product', company: 'Microsoft', skills: ['Product Strategy', 'UI/UX', 'Metrics', 'Agile'], topics: ['career-strategy', 'resume-review'], hourlyRate: 2000 },
    { email: 'mentor.devops@jobsprint.com', name: 'Rohan Verma', title: 'Senior Staff Engineer', company: 'Amazon AWS', skills: ['AWS', 'Docker', 'CI/CD', 'Python'], topics: ['mock-interview', 'system-design'], hourlyRate: 1800 },
    { email: 'mentor.frontend@jobsprint.com', name: 'Ananya Roy', title: 'Lead Frontend Engineer', company: 'Uber', skills: ['React', 'TypeScript', 'Web Vitals', 'Next.js'], topics: ['resume-review', 'mock-interview'], hourlyRate: 1200 }
  ];

  for (const m of mentorsData) {
    let user = await User.findOne({ email: m.email });
    if (!user) {
      user = await User.create({
        email: m.email,
        password: 'Password@123',
        role: 'recruiter',
        isEmailVerified: true
      });
    }

    await MentorProfile.create({
      userId: user._id,
      name: m.name,
      title: m.title,
      company: m.company,
      bio: `Ex-${m.company} engineering leader with 10+ years building scalable distributed systems and mentoring top talent.`,
      skills: m.skills,
      topics: m.topics,
      hourlyRate: m.hourlyRate,
      rating: 4.9,
      reviewCount: 24,
      isAvailable: true
    });
  }

  return { seeded: true, count: mentorsData.length };
};
