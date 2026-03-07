import express from 'express';
import { getAllSettings, updateSettings } from '../controllers/settings.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All settings routes require auth so tenant context is established
// and settings are read from/written to the correct company DB.
router.use(authenticate);

router.get('/global', getAllSettings);
router.put('/global', updateSettings);

export default router;
