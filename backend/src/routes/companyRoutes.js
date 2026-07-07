import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../validations/authValidation.js';
import { createCompanySchema, updateCompanySchema } from '../validations/companyValidation.js';
import {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany
} from '../controllers/companyController.js';

const router = express.Router();

// Public routes — anyone can browse and view companies
router.get('/', getCompanies);
router.get('/:id', getCompany);

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
