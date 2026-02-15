import express from 'express';
import {
    getDailyAttendance,
    markDailyAttendance,
    getMonthlyAttendance,
    getAttendanceReports,
    importAttendance
} from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Attendance management is restricted to Admin/HR
router.use(authenticate);
router.use(authorize('admin', 'hr_officer'));

// Daily Attendance
router.get('/daily', getDailyAttendance);
router.post('/daily', markDailyAttendance);

// Monthly Attendance Summary
router.get('/monthly', getMonthlyAttendance);

// Attendance Reports
router.get('/reports', getAttendanceReports);

// Import Attendance
router.post('/import', importAttendance);

export default router;