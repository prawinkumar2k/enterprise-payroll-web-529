import express from 'express';
import {
    getLeaveTypes,
    applyLeave,
    processLeave,
    getMyLeaveHistory
} from '../controllers/leave.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ESS (Employee Self Service)
router.use(authenticate);
router.get('/my-history', getMyLeaveHistory);
router.get('/types', getLeaveTypes);
router.post('/apply', applyLeave);

// Administrative
router.post('/process', authorize('admin', 'hr_officer'), processLeave);

export default router;
