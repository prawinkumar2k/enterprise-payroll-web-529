
import express from 'express';
import { pushSync, pullSync, getSyncStatus, updateSyncStatus, getSyncLogs, resetSyncStatus } from '../controllers/sync.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only Admins can trigger sync operations
router.use(authenticate);
router.use(authorize('admin'));

router.post('/push', pushSync);
router.get('/pull', pullSync);
router.get('/status', getSyncStatus);
router.post('/status', updateSyncStatus);
router.get('/logs', getSyncLogs);
router.post('/reset', resetSyncStatus);

export default router;
