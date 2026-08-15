import CandidateProfile from '../models/CandidateProfile.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import AssessmentResult from '../models/AssessmentResult.js';

/**
 * Search candidates with advanced filters for recruiter talent pool.
 */
export const searchCandidates = async (filters = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const matchStage = {};

  // Skills filter (match any of the provided skills)
  if (filters.skills && filters.skills.length > 0) {
    matchStage.skills = { $in: filters.skills.map((s) => new RegExp(s, 'i')) };
  }

  // Location filter (search across experience locations)
  if (filters.location) {
    matchStage['experience.location'] = new RegExp(filters.location, 'i');
  }

  // Education filter
  if (filters.degree) {
    matchStage['education.degree'] = new RegExp(filters.degree, 'i');
  }

  if (filters.fieldOfStudy) {
    matchStage['education.fieldOfStudy'] = new RegExp(filters.fieldOfStudy, 'i');
  }

  // Name search
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    matchStage.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { summary: searchRegex }
    ];
  }

  // Minimum experience (calculated from experience entries)
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    // Only include active and verified users
    {
      $match: {
        'user.isActive': true
      }
    },
    // Count applications
    {
      $lookup: {
        from: 'applications',
        localField: 'userId',
        foreignField: 'candidateId',
        as: 'applications'
      }
    },
    // Get earned badges
    {
      $lookup: {
        from: 'assessmentresults',
        let: { uid: '$userId' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$userId', '$$uid'] }, { $eq: ['$passed', true] }] } } },
          {
            $lookup: {
              from: 'skillassessments',
              localField: 'assessmentId',
              foreignField: '_id',
              as: 'assessment'
            }
          },
          { $unwind: '$assessment' },
          { $project: { skill: '$assessment.skill', icon: '$assessment.icon', score: 1 } }
        ],
        as: 'badges'
      }
    },
    // Calculate experience years
    {
      $addFields: {
        totalExperienceMonths: {
          $sum: {
            $map: {
              input: { $ifNull: ['$experience', []] },
              as: 'exp',
              in: {
                $divide: [
                  {
                    $subtract: [
                      { $ifNull: ['$$exp.endDate', new Date()] },
                      '$$exp.startDate'
                    ]
                  },
                  2592000000 // ~30 days in ms
                ]
              }
            }
          }
        }
      }
    },
    {
      $addFields: {
        experienceYears: { $round: [{ $divide: ['$totalExperienceMonths', 12] }, 1] }
      }
    }
  ];

  // Min experience years filter
  if (filters.minExperience) {
    pipeline.push({
      $match: { experienceYears: { $gte: parseFloat(filters.minExperience) } }
    });
  }

  // Compute skill match score if skills are provided
  if (filters.skills && filters.skills.length > 0) {
    pipeline.push({
      $addFields: {
        skillMatchCount: {
          $size: {
            $filter: {
              input: { $ifNull: ['$skills', []] },
              as: 'skill',
              cond: {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: filters.skills,
                        as: 'fs',
                        cond: { $regexMatch: { input: '$$skill', regex: { $concat: ['(?i)', '$$fs'] } } }
                      }
                    }
                  },
                  0
                ]
              }
            }
          }
        },
        skillMatchScore: {
          $round: [
            {
              $multiply: [
                {
                  $divide: [
                    {
                      $size: {
                        $setIntersection: [
                          { $map: { input: { $ifNull: ['$skills', []] }, as: 's', in: { $toLower: '$$s' } } },
                          filters.skills.map((s) => s.toLowerCase())
                        ]
                      }
                    },
                    filters.skills.length
                  ]
                },
                100
              ]
            },
            0
          ]
        }
      }
    });
    pipeline.push({ $sort: { skillMatchScore: -1, experienceYears: -1 } });
  } else {
    pipeline.push({ $sort: { experienceYears: -1, createdAt: -1 } });
  }

  // Project final shape
  pipeline.push({
    $project: {
      userId: 1,
      firstName: 1,
      lastName: 1,
      summary: 1,
      skills: 1,
      experience: 1,
      education: 1,
      portfolioLinks: 1,
      experienceYears: 1,
      skillMatchScore: { $ifNull: ['$skillMatchScore', 0] },
      badgesCount: { $size: { $ifNull: ['$badges', []] } },
      badges: { $slice: [{ $ifNull: ['$badges', []] }, 5] },
      applicationCount: { $size: { $ifNull: ['$applications', []] } },
      userEmail: '$user.email',
      createdAt: 1
    }
  });

  // Count total before pagination
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await CandidateProfile.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Paginate
  pipeline.push({ $skip: skip }, { $limit: limit });

  const candidates = await CandidateProfile.aggregate(pipeline);

  return {
    candidates,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
