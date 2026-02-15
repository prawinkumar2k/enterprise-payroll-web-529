import express from 'express';
import { getLogs } from '../controllers/log.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Log routes are read-only and protected
 * Only accessible by authenticated users (authorized as admin or auditor)
 */
router.get('/', authenticate, authorize('admin', 'auditor'), getLogs);

export default router;
