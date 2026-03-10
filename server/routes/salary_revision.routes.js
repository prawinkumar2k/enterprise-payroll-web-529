/**
 * salary_revision.routes.js
 * Routes for salary revision history management
 */
import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
    createRevision,
    approveRevision,
    rejectRevision,
    getRevisionsByEmployee,
    getAllPendingRevisions,
    getBulkRevisionReport,
} from '../controllers/salaryRevision.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all pending revisions (HR / Admin)
router.get('/pending', authorize('admin', 'Admin', 'HR', 'hr'), getAllPendingRevisions);

// Bulk report: all revisions for a dept/year
router.get('/bulk', authorize('admin', 'Admin', 'HR', 'hr'), getBulkRevisionReport);

// Employee revision history
router.get('/:empno', getRevisionsByEmployee);

// Create a revision (HR / Admin)
router.post('/', authorize('admin', 'Admin', 'HR', 'hr'), createRevision);

// Approve / Reject (Admin only)
router.put('/:id/approve', authorize('admin', 'Admin'), approveRevision);
router.put('/:id/reject', authorize('admin', 'Admin'), rejectRevision);

export default router;
