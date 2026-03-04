import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getFinanceDashboard } from '../controllers/expense.controller.js';

const router = express.Router();
router.use(authenticate);

router.get('/dashboard', getFinanceDashboard);

export default router;
