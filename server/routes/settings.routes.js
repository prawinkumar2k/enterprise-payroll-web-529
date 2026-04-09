import express from 'express';
import { getAllSettings, updateSettings } from '../controllers/settings.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public endpoint for basic settings (org info, feature flags, etc.)
// This allows the login page and feature routes to access settings without auth
router.get('/global', getAllSettings);

// Protected endpoints (Authenticated users can update settings)
router.use(authenticate);
router.put('/global', updateSettings);

export default router;

