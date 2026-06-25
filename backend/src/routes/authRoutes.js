import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

export default router;
