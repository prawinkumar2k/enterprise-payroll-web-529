import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
    listIncome, createIncome, updateIncome, deleteIncome,
    getIncomeSummary, getIncomeCategories,
} from '../controllers/income.controller.js';

const router = express.Router();
router.use(authenticate);

router.get('/categories', getIncomeCategories);
router.get('/summary/:monthyear', getIncomeSummary);
router.get('/', listIncome);
router.post('/', createIncome);
router.put('/:id', updateIncome);
router.delete('/:id', authorize('admin', 'Admin', 'HR', 'hr'), deleteIncome);

export default router;
