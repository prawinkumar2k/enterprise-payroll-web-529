import express from 'express';
import { login, getCurrentUser, logout, refreshToken, fixAdmin } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/refresh
 * @desc    Get new access token using refresh token in cookie
 * @access  Public (Token required in cookie)
 */
router.post('/refresh', refreshToken);
router.get('/fix-admin', fixAdmin);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (logs activity)
 * @access  Private
 */
router.post('/logout', authenticate, logout);

export default router;
