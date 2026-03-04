import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
    listExpenses, createExpense, updateExpense, deleteExpense,
    approveExpense, rejectExpense, getExpenseSummary, getExpenseCategories,
    getFinanceDashboard,
} from '../controllers/expense.controller.js';

const router = express.Router();
router.use(authenticate);

router.get('/categories', getExpenseCategories);
router.get('/summary/:monthyear', getExpenseSummary);
router.get('/', listExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', authorize('admin', 'Admin', 'HR', 'hr'), deleteExpense);
router.put('/:id/approve', authorize('admin', 'Admin', 'HR', 'hr'), approveExpense);
router.put('/:id/reject', authorize('admin', 'Admin', 'HR', 'hr'), rejectExpense);

export default router;
