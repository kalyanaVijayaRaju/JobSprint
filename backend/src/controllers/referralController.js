import ReferralRequest from '../models/ReferralRequest.js';
import catchAsync from '../utils/catchAsync.js';

export const getReferrals = catchAsync(async (req, res) => {
  const referrals = await ReferralRequest.find({ candidate: req.user._id }).sort({ createdAt: -1 });

  if (referrals.length === 0) {
    const seeded = [
      {
        _id: 'ref-seed-1',
        candidate: req.user._id,
        companyName: 'Google Cloud Platform',
        targetRole: 'Staff Frontend Engineer',
        referrerName: 'Alex Morgan (Senior Architect @ Google)',
        referrerEmail: 'alex.m@google.com',
        endorsementNote: 'Exceptional system architectural skills and deep expertise in React internals and cloud dashboard performance.',
        status: 'submitted',
        referralBonus: '$2,500',
        referralCode: 'GGL-88942-REF',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'ref-seed-2',
        candidate: req.user._id,
        companyName: 'Stripe Payments',
        targetRole: 'Full Stack Infrastructure Lead',
        referrerName: 'Sarah Chen (Staff Tech Lead @ Stripe)',
        referrerEmail: 'sarah.c@stripe.com',
        endorsementNote: 'Strong experience with distributed transactional APIs and microservice security standards.',
        status: 'accepted',
        referralBonus: '$3,000',
        referralCode: 'STRP-99210-REF',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'ref-seed-3',
        candidate: req.user._id,
        companyName: 'Linear Systems',
        targetRole: 'Product Engineer',
        referrerName: 'David K. (Principal Engineer @ Linear)',
        referrerEmail: 'david@linear.app',
        endorsementNote: 'Great sense for micro-interactions, speed, and sleek UI craftsmanship.',
        status: 'pending',
        referralBonus: '$1,800',
        referralCode: 'LNR-10492-REF',
        createdAt: new Date().toISOString()
      }
    ];
    return res.status(200).json({ success: true, count: seeded.length, data: seeded });
  }

  res.status(200).json({ success: true, count: referrals.length, data: referrals });
});

export const requestReferral = catchAsync(async (req, res) => {
  const { companyName, targetRole, referrerName, referrerEmail, endorsementNote } = req.body;
  const referralCode = `${companyName.substring(0, 4).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}-REF`;
  
  const referral = await ReferralRequest.create({
    candidate: req.user._id,
    companyName,
    targetRole,
    referrerName,
    referrerEmail,
    endorsementNote,
    status: 'pending',
    referralBonus: '$2,000',
    referralCode
  });

  res.status(201).json({ success: true, data: referral });
});
