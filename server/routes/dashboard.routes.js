import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticate, authorize('admin', 'hr_officer'), getDashboardStats);

export default router;
