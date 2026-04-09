import express from 'express';
import {
    generateSalary,
    getSalary,
    exportSalaryExcel,
    updateSalaryRow,
    applyBonus,
    reverseSalary,
    emailPayslip,
    mySalaryHistory,
    bulkEmailPayslips,
    getSalaryAnalytics
} from '../controllers/salary.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { jobStatusHandler } from '../services/jobQueue.service.js';

const router = express.Router();

// Publicly auth'd for ANY valid user role (like employee)
router.use(authenticate);
router.get('/my-history', mySalaryHistory);

// Higher level administrative paths
router.use(authorize('admin', 'hr_officer'));

router.post('/generate', generateSalary);
router.get('/', getSalary);
router.get('/export', exportSalaryExcel);  // Excel download
router.put('/:id', updateSalaryRow);
router.post('/bonus', applyBonus);
router.post('/reverse', reverseSalary);
router.post('/email-payslip', emailPayslip);
router.post('/bulk-email', bulkEmailPayslips);
router.get('/analytics', getSalaryAnalytics);



// Job status polling (for background generate)
router.get('/jobs/:jobId', jobStatusHandler);

export default router;

