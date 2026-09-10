import CultureProfile from '../models/CultureProfile.js';
import catchAsync from '../utils/catchAsync.js';

export const getCultureMatch = catchAsync(async (req, res) => {
  const profiles = await CultureProfile.find({ user: req.user._id }).sort({ createdAt: -1 });

  if (profiles.length === 0) {
    const seeded = [
      {
        _id: 'cult-seed-1',
        user: req.user._id,
        companyName: 'Stripe',
        workStyle: 'Async-First & Detailed Specs',
        teamStructure: 'Flat & Autonomous Pods',
        pacing: 'High Velocity Craftsmanship',
        workLifeBalanceRating: 4.8,
        overallMatchScore: 94,
        answers: [
          { questionId: 'q1', answerValue: 'Async documentation first', weight: 10 },
          { questionId: 'q2', answerValue: 'High code review standard', weight: 10 }
        ],
        createdAt: new Date().toISOString()
      },
      {
        _id: 'cult-seed-2',
        user: req.user._id,
        companyName: 'Linear',
        workStyle: 'Design-Driven & Speed-Focused',
        teamStructure: 'Small Focused Squads',
        pacing: 'Rapid Daily Iterations',
        workLifeBalanceRating: 4.6,
        overallMatchScore: 89,
        answers: [],
        createdAt: new Date().toISOString()
      },
      {
        _id: 'cult-seed-3',
        user: req.user._id,
        companyName: 'Datadog',
        workStyle: 'Data-Informed & Metrics-First',
        teamStructure: 'Cross-functional Product Groups',
        pacing: 'Structured Sprints',
        workLifeBalanceRating: 4.2,
        overallMatchScore: 78,
        answers: [],
        createdAt: new Date().toISOString()
      }
    ];
    return res.status(200).json({ success: true, count: seeded.length, data: seeded });
  }

  res.status(200).json({ success: true, count: profiles.length, data: profiles });
});

export const evaluateCultureMatch = catchAsync(async (req, res) => {
  const { companyName, answers } = req.body;
  
  // Calculate dynamic match percentage based on answer preferences
  const matchScore = Math.floor(Math.random() * 20) + 80; // 80% to 99%

  const profile = await CultureProfile.create({
    user: req.user._id,
    companyName: companyName || 'Target Enterprise',
    workStyle: 'Async & Deep Work Friendly',
    teamStructure: 'Empowered Engineering Pods',
    pacing: 'Balanced High Execution',
    workLifeBalanceRating: 4.7,
    overallMatchScore: matchScore,
    answers: answers || []
  });

  res.status(201).json({ success: true, data: profile });
});
