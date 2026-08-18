import CandidateProfile from '../models/CandidateProfile.js';
import AssessmentResult from '../models/AssessmentResult.js';
import Application from '../models/Application.js';
import ApiError from '../utils/apiError.js';

/**
 * Compare multiple candidates side-by-side.
 */
export const compareCandidates = async (candidateIds) => {
  if (!candidateIds || candidateIds.length < 2 || candidateIds.length > 4) {
    throw new ApiError(400, 'Please select 2-4 candidates to compare');
  }

  const Endorsement = (await import('../models/Endorsement.js')).default;
  const User = (await import('../models/User.js')).default;

  const candidates = await Promise.all(candidateIds.map(async (id) => {
    const [user, profile, assessments, endorsements, applications] = await Promise.all([
      User.findById(id).select('email role createdAt').lean(),
      CandidateProfile.findOne({ userId: id }).lean(),
      AssessmentResult.find({ userId: id })
        .populate('assessmentId', 'title skill difficulty')
        .lean(),
      Endorsement.aggregate([
        { $match: { endorseeId: (await import('mongoose')).default.Types.ObjectId.createFromHexString(id.toString()) } },
        { $group: { _id: '$skill', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Application.countDocuments({ candidateId: id })
    ]);

    if (!user) return null;

    const assessmentScores = assessments.map(a => ({
      title: a.assessmentId?.title || 'Unknown',
      skill: a.assessmentId?.skill || 'Unknown',
      score: a.score,
      passed: a.passed,
      difficulty: a.assessmentId?.difficulty
    }));

    const endorsedSkills = endorsements.map(e => ({
      skill: e._id,
      endorsementCount: e.count
    }));

    return {
      id,
      email: user.email,
      joinedAt: user.createdAt,
      profile: {
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        location: profile?.location || '',
        headline: profile?.headline || '',
        skills: profile?.skills || [],
        experience: profile?.experience || [],
        education: profile?.education || [],
        yearsOfExperience: profile?.yearsOfExperience || 0
      },
      assessments: assessmentScores,
      averageScore: assessmentScores.length
        ? Math.round(assessmentScores.reduce((s, a) => s + a.score, 0) / assessmentScores.length)
        : 0,
      passedAssessments: assessmentScores.filter(a => a.passed).length,
      endorsedSkills,
      totalEndorsements: endorsedSkills.reduce((s, e) => s + e.endorsementCount, 0),
      totalApplications: applications
    };
  }));

  // Find common and unique skills
  const validCandidates = candidates.filter(Boolean);
  const allSkillSets = validCandidates.map(c => new Set(c.profile.skills.map(s => s.toLowerCase())));
  const commonSkills = [...(allSkillSets[0] || [])].filter(skill =>
    allSkillSets.every(set => set.has(skill))
  );

  return {
    candidates: validCandidates,
    commonSkills,
    comparedAt: new Date()
  };
};
