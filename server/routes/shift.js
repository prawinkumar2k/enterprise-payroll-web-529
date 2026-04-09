import express from 'express';
import {
    getShifts,
    assignShift,
    getRoster
} from '../controllers/shift.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.get('/definitions', getShifts);
router.get('/roster', getRoster);
router.post('/assign', authorize('admin', 'hr_officer'), assignShift);

export default router;
