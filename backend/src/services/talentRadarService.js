import CandidateProfile from '../models/CandidateProfile.js';
import AssessmentResult from '../models/AssessmentResult.js';
import Endorsement from '../models/Endorsement.js';
import User from '../models/User.js';

/**
 * Search candidates using multi-skill weighting radar matrix.
 */
export const searchTalentRadar = async ({ requiredSkills = [], minExperience = 0 }) => {
  const normalizedSkills = requiredSkills.map(s => s.toLowerCase().trim()).filter(Boolean);

  // Fetch candidate profiles with users
  const candidates = await CandidateProfile.find({
    yearsOfExperience: { $gte: Number(minExperience) }
  })
    .populate('userId', 'email role createdAt')
    .lean();

  const results = await Promise.all(candidates.map(async (c) => {
    if (!c.userId) return null;

    const candidateSkills = (c.skills || []).map(s => s.toLowerCase());

    // Calculate skill match breakdown
    const skillScores = normalizedSkills.map(reqSkill => {
      const hasExact = candidateSkills.includes(reqSkill);
      const hasPartial = candidateSkills.some(s => s.includes(reqSkill) || reqSkill.includes(s));
      const score = hasExact ? 100 : hasPartial ? 65 : 15;
      return { skill: reqSkill, score };
    });

    const overallSkillMatch = skillScores.length > 0
      ? Math.round(skillScores.reduce((sum, item) => sum + item.score, 0) / skillScores.length)
      : 70;

    // Fetch assessment scores & endorsements
    const [assessments, endorsementsCount] = await Promise.all([
      AssessmentResult.find({ userId: c.userId._id }).lean(),
      Endorsement.countDocuments({ endorseeId: c.userId._id })
    ]);

    const avgAssessment = assessments.length > 0
      ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)
      : 60;

    // Build 5-axis Radar Matrix (0 to 100)
    const radarMatrix = {
      technicalSkills: overallSkillMatch,
      assessmentScore: avgAssessment,
      experienceScore: Math.min(100, (c.yearsOfExperience || 1) * 20),
      endorsementsScore: Math.min(100, endorsementsCount * 25 + 20),
      profileCompleteness: (c.summary ? 30 : 0) + ((c.experience || []).length > 0 ? 35 : 0) + ((c.education || []).length > 0 ? 35 : 0)
    };

    const overallFitScore = Math.round(
      radarMatrix.technicalSkills * 0.35 +
      radarMatrix.assessmentScore * 0.25 +
      radarMatrix.experienceScore * 0.20 +
      radarMatrix.endorsementsScore * 0.10 +
      radarMatrix.profileCompleteness * 0.10
    );

    return {
      candidateId: c.userId._id,
      email: c.userId.email,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.userId.email.split('@')[0],
      location: c.location || 'Remote',
      yearsOfExperience: c.yearsOfExperience || 0,
      skills: c.skills || [],
      skillScores,
      radarMatrix,
      overallFitScore,
      totalEndorsements: endorsementsCount,
      passedAssessmentsCount: assessments.filter(a => a.passed).length
    };
  }));

  const validResults = results.filter(Boolean).sort((a, b) => b.overallFitScore - a.overallFitScore);

  return {
    results: validResults,
    totalCandidates: validResults.length,
    searchedAt: new Date()
  };
};
