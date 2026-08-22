import OfferEvaluation from '../models/OfferEvaluation.js';
import SalaryInsight from '../models/SalaryInsight.js';
import ApiError from '../utils/apiError.js';

/**
 * Evaluate job offer compensation package vs market benchmarking.
 */
export const evaluateOffer = async (userId, data) => {
  const {
    jobTitle,
    companyName,
    location = 'Bangalore',
    baseSalary,
    bonus = 0,
    equityValue = 0,
    benefitsValue = 0,
    experienceLevel = 'mid'
  } = data;

  if (!jobTitle || !baseSalary) {
    throw new ApiError(400, 'Job title and base salary are required');
  }

  const baseNum = Number(baseSalary);
  const bonusNum = Number(bonus);
  const equityNum = Number(equityValue);
  const benefitsNum = Number(benefitsValue);
  const totalComp = baseNum + bonusNum + equityNum + benefitsNum;

  // Search market salary benchmarks
  const benchmark = await SalaryInsight.findOne({
    normalizedTitle: new RegExp(jobTitle.toLowerCase().trim(), 'i'),
    experienceLevel
  }).lean();

  const marketMedian = benchmark?.medianSalary || 1800000;
  const marketMin = benchmark?.minSalary || 1200000;
  const marketMax = benchmark?.maxSalary || 3000000;

  // Percentile & rating computation
  let rating = 'fair';
  let percentile = 50;

  if (totalComp >= marketMax * 1.1) {
    rating = 'exceptional';
    percentile = 90;
  } else if (totalComp >= marketMedian * 1.05) {
    rating = 'competitive';
    percentile = 75;
  } else if (totalComp >= marketMin) {
    rating = 'fair';
    percentile = 50;
  } else {
    rating = 'below-market';
    percentile = 25;
  }

  const strengths = [];
  const improvementAreas = [];

  if (baseNum >= marketMedian) strengths.push('Strong base salary exceeding regional median.');
  else improvementAreas.push('Base salary is below local market median for this experience level.');

  if (bonusNum > 0) strengths.push(`Performance bonus adds ₹${bonusNum.toLocaleString('en-IN')} annual incentive.`);
  if (equityNum > 0) strengths.push(`Equity/stock grant worth ₹${equityNum.toLocaleString('en-IN')} provides long-term upside.`);
  else improvementAreas.push('No stock options or equity component included in current offer.');

  // Generate automated counter-offer email letter
  const counterSalaryTarget = Math.round(totalComp * 1.15);
  const counterLetterText = `Dear ${companyName} Recruiting Team,

Thank you very much for extending the offer for the ${jobTitle} position. I am thrilled about the opportunity to contribute to the team and build high-impact solutions together.

After reviewing the total compensation structure of ₹${totalComp.toLocaleString('en-IN')} (Base: ₹${baseNum.toLocaleString('en-IN')}), and comparing it against market benchmarks for ${location}, I would like to request a slight adjustment to align closer with my experience and regional industry standards.

Based on current market data for ${jobTitle} roles, I am looking for a total target compensation of ₹${counterSalaryTarget.toLocaleString('en-IN')}. Would you be open to adjusting the base salary to ₹${Math.round(baseNum * 1.12).toLocaleString('en-IN')} or offering a joining bonus to bridge this gap?

I am extremely enthusiastic about joining ${companyName} and am confident we can reach a mutually beneficial agreement.

Best regards,
Candidate`;

  return OfferEvaluation.create({
    userId,
    jobTitle,
    companyName,
    location,
    baseSalary: baseNum,
    bonus: bonusNum,
    equityValue: equityNum,
    benefitsValue: benefitsNum,
    totalCompensation: totalComp,
    currency: 'INR',
    marketMedian,
    percentile,
    scoreRating: rating,
    strengths,
    improvementAreas,
    counterLetterText
  });
};

/**
 * Get user's saved offer evaluations.
 */
export const getUserEvaluations = async (userId) => {
  return OfferEvaluation.find({ userId }).sort({ createdAt: -1 }).lean();
};
