import Endorsement from '../models/Endorsement.js';
import ApiError from '../utils/apiError.js';
import mongoose from 'mongoose';

/**
 * Endorse a user's skill.
 */
export const endorseSkill = async (endorserId, endorseeId, skill, data = {}) => {
  if (endorserId.toString() === endorseeId.toString()) {
    throw new ApiError(400, 'You cannot endorse yourself');
  }

  try {
    return await Endorsement.create({
      endorserId,
      endorseeId,
      skill: skill.trim(),
      message: data.message || '',
      relationship: data.relationship || 'colleague'
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, 'You have already endorsed this skill for this user');
    }
    throw err;
  }
};

/**
 * Get all endorsements for a user.
 */
export const getEndorsements = async (userId) => {
  return Endorsement.find({ endorseeId: userId })
    .populate('endorserId', 'email')
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Get top endorsed skills for a user (aggregated with counts).
 */
export const getTopEndorsedSkills = async (userId) => {
  const pipeline = [
    { $match: { endorseeId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$skill',
        count: { $sum: 1 },
        endorsers: {
          $push: {
            endorserId: '$endorserId',
            relationship: '$relationship',
            message: '$message'
          }
        }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ];

  const skills = await Endorsement.aggregate(pipeline);

  // Populate endorser emails
  const User = (await import('../models/User.js')).default;
  for (const skill of skills) {
    for (const endorser of skill.endorsers) {
      const user = await User.findById(endorser.endorserId).select('email').lean();
      endorser.email = user?.email || 'Anonymous';
    }
  }

  return skills.map(s => ({
    skill: s._id,
    count: s.count,
    endorsers: s.endorsers.slice(0, 5) // Show top 5 endorsers
  }));
};

/**
 * Retract an endorsement.
 */
export const retractEndorsement = async (endorsementId, endorserId) => {
  const endorsement = await Endorsement.findOneAndDelete({
    _id: endorsementId,
    endorserId
  });
  if (!endorsement) throw new ApiError(404, 'Endorsement not found or not yours to retract');
  return endorsement;
};
