import Resume from '../models/Resume.js';
import CandidateProfile from '../models/CandidateProfile.js';
import ApiError from '../utils/apiError.js';

/**
 * Compare candidate resume/skills against a job description.
 */
export const analyzeJobMatch = async (userId, { jobDescription, targetRole }) => {
  if (!jobDescription || jobDescription.trim().length < 20) {
    throw new ApiError(400, 'Please provide a valid job description (at least 20 characters)');
  }

  // Fetch candidate profile and latest resume
  const profile = await CandidateProfile.findOne({ userId }).lean();
  const latestResume = await Resume.findOne({ userId }).sort({ updatedAt: -1 }).lean();

  const userSkills = new Set([
    ...(profile?.skills || []).map(s => s.toLowerCase()),
    ...(latestResume?.skills || []).map(s => s.toLowerCase())
  ]);

  // Extract keywords from job description (common tech/business keywords)
  const commonKeywords = [
    'react', 'node', 'nodejs', 'javascript', 'typescript', 'express', 'mongodb', 'sql', 'postgresql',
    'docker', 'kubernetes', 'aws', 'cloud', 'ci/cd', 'git', 'rest api', 'graphql', 'python', 'java',
    'system design', 'microservices', 'agile', 'scrum', 'testing', 'jest', 'cypress', 'redux',
    'html', 'css', 'tailwind', 'bootstrap', 'communication', 'leadership', 'problem solving', 'teamwork',
    'product management', 'analytics', 'figma', 'ui/ux', 'devops', 'next.js', 'redis'
  ];

  const jdLower = jobDescription.toLowerCase();
  const extractedKeywords = commonKeywords.filter(kw => jdLower.includes(kw));

  // Default fallback keywords if none detected
  const targetKeywords = extractedKeywords.length > 0 ? extractedKeywords : ['javascript', 'react', 'git', 'communication'];

  const matchedKeywords = targetKeywords.filter(kw => userSkills.has(kw) || jdLower.includes(kw) && [...userSkills].some(s => kw.includes(s) || s.includes(kw)));
  const missingKeywords = targetKeywords.filter(kw => !matchedKeywords.includes(kw));

  const matchPercentage = Math.min(100, Math.round((matchedKeywords.length / targetKeywords.length) * 100));

  // ATS formatting score
  let atsScore = 85;
  const atsFixes = [];

  if (!latestResume) {
    atsScore -= 30;
    atsFixes.push('Upload a digital resume or create one in the Resume Builder to improve ATS parsing.');
  }
  if (!profile?.summary || profile.summary.length < 50) {
    atsScore -= 15;
    atsFixes.push('Add a comprehensive professional summary (at least 50 words) targeting your desired role.');
  }
  if (missingKeywords.length > 0) {
    atsFixes.push(`Incorporate high-priority missing keywords: ${missingKeywords.slice(0, 5).join(', ')}.`);
  }
  if ((profile?.experience || []).length === 0) {
    atsScore -= 15;
    atsFixes.push('Quantify key achievements with metrics (e.g. "Improved performance by 30%") in experience items.');
  }

  return {
    targetRole: targetRole || 'Software Engineer',
    matchPercentage,
    atsScore: Math.max(20, atsScore),
    matchedKeywords: matchedKeywords.map(k => k.toUpperCase()),
    missingKeywords: missingKeywords.map(k => k.toUpperCase()),
    totalTargetKeywords: targetKeywords.length,
    recommendations: atsFixes,
    analyzedAt: new Date()
  };
};

/**
 * Score candidate resume completeness and impact metrics.
 */
export const scoreResume = async (userId) => {
  const profile = await CandidateProfile.findOne({ userId }).lean();
  const resume = await Resume.findOne({ userId }).sort({ updatedAt: -1 }).lean();

  let score = 50;
  const breakdown = [];

  if (profile?.firstName && profile?.lastName) { score += 10; breakdown.push({ category: 'Personal Info', points: 10, max: 10 }); }
  else { breakdown.push({ category: 'Personal Info', points: 0, max: 10 }); }

  if ((profile?.skills || []).length >= 5) { score += 15; breakdown.push({ category: 'Skills Portfolio', points: 15, max: 15 }); }
  else { breakdown.push({ category: 'Skills Portfolio', points: 5, max: 15 }); }

  if ((profile?.experience || []).length >= 1) { score += 15; breakdown.push({ category: 'Work Experience', points: 15, max: 15 }); }
  else { breakdown.push({ category: 'Work Experience', points: 0, max: 15 }); }

  if (resume) { score += 10; breakdown.push({ category: 'Digital Resume Document', points: 10, max: 10 }); }
  else { breakdown.push({ category: 'Digital Resume Document', points: 0, max: 10 }); }

  return {
    overallScore: Math.min(100, score),
    grade: score >= 85 ? 'A+' : score >= 70 ? 'B' : 'C',
    breakdown,
    scoredAt: new Date()
  };
};
