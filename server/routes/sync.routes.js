
import express from 'express';
import { pushSync, pullSync, getSyncStatus, updateSyncStatus, getSyncLogs, resetSyncStatus } from '../controllers/sync.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All authenticated users can read sync status
router.use(authenticate);
router.get('/status', getSyncStatus);
router.get('/logs', getSyncLogs);

// Only admins can trigger or modify sync operations
router.post('/push', authorize('admin'), pushSync);
router.get('/pull', authorize('admin'), pullSync);
router.post('/status', authorize('admin'), updateSyncStatus);
router.post('/reset', authorize('admin'), resetSyncStatus);

export default router;
