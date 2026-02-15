import express from 'express';
import { generateSalary, getSalary, updateSalaryRow, applyBonus, reverseSalary } from '../controllers/salary.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/salary
 * @desc    Get salary for a specific month
 * @access  Private
 */
router.get('/', authenticate, getSalary);

/**
 * @route   POST /api/salary/generate
 * @desc    Generate salary for a specific month
 * @access  Private
 */
router.post('/generate', authenticate, generateSalary);

/**
 * @route   PUT /api/salary/:id
 * @desc    Update a salary record
 * @access  Private
 */
router.put('/:id', authenticate, updateSalaryRow);

/**
 * @route   POST /api/salary/bonus
 * @desc    Apply bonus to all employees for a month
 * @access  Private
 */
router.post('/bonus', authenticate, applyBonus);

/**
 * @route   POST /api/salary/reverse
 * @desc    Reverse salary for a specific month
 * @access  Private (Admin only checked in controller)
 */
router.post('/reverse', authenticate, reverseSalary);

export default router;
