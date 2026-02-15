import express from 'express';
import {
    generateSalary,
    getSalary,
    updateSalaryRow,
    applyBonus
} from '../controllers/salary.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and restricted to Payroll Admins
router.use(authenticate);
router.use(authorize('admin', 'hr_officer'));

router.post('/generate', generateSalary);
router.get('/', getSalary);
router.put('/:id', updateSalaryRow);
router.post('/bonus', applyBonus);

export default router;
