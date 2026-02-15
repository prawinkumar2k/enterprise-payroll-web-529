import express from 'express';
import {
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getTrashedEmployees,
    restoreEmployee
} from '../controllers/employeeController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and restricted to admin/HR
router.use(authenticate);
router.use(authorize('admin', 'hr_officer'));

router.get('/', getEmployees);
router.get('/trash', getTrashedEmployees);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);
router.post('/:id/restore', restoreEmployee);

export default router;
