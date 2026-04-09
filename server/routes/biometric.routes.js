
import express from 'express';
import * as bc from '../controllers/biometricController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Biometric Endpoints
 * Phase 6: Operational Biometrics System
 */

// Global login — No auth required since identity is derived from sample
router.post('/login', bc.biometricLogin);

// Registration & Verification — Requires active session
router.post('/register', authenticate, bc.registerBiometric);
router.post('/verify', authenticate, bc.verifyBiometric);
router.post('/sync', authenticate, bc.batchSyncBiometric);

export default router;
