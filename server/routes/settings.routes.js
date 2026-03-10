import express from 'express';
import { getAllSettings, updateSettings } from '../controllers/settings.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

<<<<<<< HEAD
// All settings routes require auth so tenant context is established
// and settings are read from/written to the correct company DB.
router.use(authenticate);
=======
// Public endpoint for basic settings (org info, feature flags, etc.)
// This allows the login page and feature routes to access settings without auth
router.get('/global', getAllSettings);

// Protected endpoints (Authenticated users can update settings in Desktop Mode)
router.use(authenticate);
// router.use(authorize('admin')); // Temporarily disabled for Desktop Mode compatibility
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee

router.get('/global', getAllSettings);
router.put('/global', updateSettings);

export default router;
