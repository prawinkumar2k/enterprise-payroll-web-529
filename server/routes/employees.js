import express from 'express';
import {
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getTrashedEmployees,
    restoreEmployee
} from '../controllers/employeeController.js';

const router = express.Router();

router.get('/', getEmployees);
router.get('/trash', getTrashedEmployees);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);
router.post('/:id/restore', restoreEmployee);

export default router;
