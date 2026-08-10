import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../validations/authValidation.js';
import { createCompanySchema, updateCompanySchema } from '../validations/companyValidation.js';
import {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  getCompanyDetail,
  getCompanyJobs,
  followCompany,
  unfollowCompany
} from '../controllers/companyController.js';

const router = express.Router();

/**
 * Optional auth middleware — populates req.user if a valid token is present
 * but does NOT reject unauthenticated requests.  Used for the company detail
 * endpoint to conditionally include follow status.
 */
const optionalProtect = async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      protect(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch {
    // Unauthenticated — that's fine, proceed without req.user
  }
  next();
};

// Public routes — anyone can browse and view companies
router.get('/', getCompanies);
router.get('/:id', getCompany);
router.get('/:id/detail', optionalProtect, getCompanyDetail);
router.get('/:id/jobs', getCompanyJobs);

// Protected routes — follow/unfollow
router.post('/:id/follow', protect, followCompany);
router.delete('/:id/follow', protect, unfollowCompany);

// Protected routes — only authenticated recruiters can manage companies
router.post(
  '/',
  protect,
  authorizeRoles('recruiter', 'admin'),
  validate(createCompanySchema),
  createCompany
);

router.put(
  '/:id',
  protect,
  authorizeRoles('recruiter', 'admin'),
  validate(updateCompanySchema),
  updateCompany
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('recruiter', 'admin'),
  deleteCompany
);

export default router;
