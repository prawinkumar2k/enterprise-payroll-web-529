import express from 'express';
import {
    getAll,
    getSummary,
    getCategories,
    create,
    update,
    remove,
} from '../controllers/incomeExpense.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication; admins and HR officers can manage entries
router.use(authenticate);
router.use(authorize('admin', 'hr_officer'));

router.get('/summary',    getSummary);
router.get('/categories', getCategories);
router.get('/',           getAll);
router.post('/',          create);
router.put('/:id',        update);
router.delete('/:id',     remove);

export default router;
