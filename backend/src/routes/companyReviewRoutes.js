import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as companyReviewController from '../controllers/companyReviewController.js';

const router = Router({ mergeParams: true });

// Public endpoints
router.get('/', companyReviewController.listReviews);
router.get('/stats', companyReviewController.getReviewStats);

// Protected endpoints
router.post('/', protect, companyReviewController.createReview);
router.post('/:id/helpful', protect, companyReviewController.toggleHelpful);

export default router;
