import CompanyReview from '../models/CompanyReview.js';
import ApiError from '../utils/apiError.js';
import mongoose from 'mongoose';

/**
 * List reviews for a company with pagination.
 */
export const listReviews = async (companyId, page = 1, limit = 10, sortBy = 'recent') => {
  const skip = (page - 1) * limit;
  const sortMap = {
    recent: { createdAt: -1 },
    highest: { rating: -1, createdAt: -1 },
    lowest: { rating: 1, createdAt: -1 },
    helpful: { helpfulCount: -1, createdAt: -1 }
  };

  const pipeline = [
    { $match: { companyId: new mongoose.Types.ObjectId(companyId), isApproved: true } },
    { $addFields: { helpfulCount: { $size: { $ifNull: ['$helpfulVotes', []] } } } },
    { $sort: sortMap[sortBy] || sortMap.recent },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
        pipeline: [{ $project: { email: 1, role: 1 } }]
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        rating: 1, title: 1, pros: 1, cons: 1, advice: 1,
        employmentStatus: 1, jobTitle: 1, department: 1,
        ratings: 1, isAnonymous: 1, helpfulCount: 1, createdAt: 1,
        userEmail: {
          $cond: [{ $eq: ['$isAnonymous', true] }, null, '$user.email']
        }
      }
    }
  ];

  const reviews = await CompanyReview.aggregate(pipeline);
  const total = await CompanyReview.countDocuments({
    companyId: new mongoose.Types.ObjectId(companyId),
    isApproved: true
  });

  return {
    reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
};

/**
 * Get aggregate review stats for a company.
 */
export const getReviewStats = async (companyId) => {
  const stats = await CompanyReview.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId), isApproved: true } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        avgWorkLifeBalance: { $avg: '$ratings.workLifeBalance' },
        avgCompensation: { $avg: '$ratings.compensation' },
        avgCulture: { $avg: '$ratings.culture' },
        avgManagement: { $avg: '$ratings.management' },
        avgGrowthOpportunities: { $avg: '$ratings.growthOpportunities' }
      }
    }
  ]);

  if (!stats.length) {
    return {
      avgRating: 0, totalReviews: 0,
      categories: { workLifeBalance: 0, compensation: 0, culture: 0, management: 0, growthOpportunities: 0 }
    };
  }

  const s = stats[0];

  // Rating distribution
  const distribution = await CompanyReview.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId), isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);

  const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  distribution.forEach(d => { ratingDist[d._id] = d.count; });

  return {
    avgRating: Math.round(s.avgRating * 10) / 10,
    totalReviews: s.totalReviews,
    categories: {
      workLifeBalance: Math.round((s.avgWorkLifeBalance || 0) * 10) / 10,
      compensation: Math.round((s.avgCompensation || 0) * 10) / 10,
      culture: Math.round((s.avgCulture || 0) * 10) / 10,
      management: Math.round((s.avgManagement || 0) * 10) / 10,
      growthOpportunities: Math.round((s.avgGrowthOpportunities || 0) * 10) / 10
    },
    distribution: ratingDist
  };
};

/**
 * Submit a review (one per user per company).
 */
export const createReview = async (userId, companyId, data) => {
  const existing = await CompanyReview.findOne({ userId, companyId });
  if (existing) throw new ApiError(409, 'You have already reviewed this company');

  return CompanyReview.create({
    companyId,
    userId,
    rating: data.rating,
    title: data.title,
    pros: data.pros,
    cons: data.cons,
    advice: data.advice,
    employmentStatus: data.employmentStatus,
    jobTitle: data.jobTitle,
    department: data.department,
    ratings: data.ratings || {},
    isAnonymous: data.isAnonymous || false
  });
};

/**
 * Toggle helpful vote on a review.
 */
export const toggleHelpful = async (reviewId, userId) => {
  const review = await CompanyReview.findById(reviewId);
  if (!review) throw new ApiError(404, 'Review not found');

  const idx = review.helpfulVotes.indexOf(userId);
  if (idx > -1) {
    review.helpfulVotes.splice(idx, 1);
  } else {
    review.helpfulVotes.push(userId);
  }
  await review.save();
  return { helpful: idx === -1, count: review.helpfulVotes.length };
};
