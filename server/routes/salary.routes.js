import express from 'express';
import {
    generateSalary,
    getSalary,
    updateSalaryRow,
    applyBonus
} from '../controllers/salary.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.post('/generate', generateSalary);
router.get('/', getSalary);
router.put('/:id', updateSalaryRow);
router.post('/bonus', applyBonus);

export default router;
