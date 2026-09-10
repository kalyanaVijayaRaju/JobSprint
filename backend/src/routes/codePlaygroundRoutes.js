import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as codePlaygroundController from '../controllers/codePlaygroundController.js';

const router = Router();
router.use(protect);

router.get('/', codePlaygroundController.getCodeSubmissions);
router.post('/run', codePlaygroundController.runCodeSnippet);

export default router;
