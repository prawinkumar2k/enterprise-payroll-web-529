import express from 'express';
import { getPayBillDetail, logPrintAction } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/pay-bill', getPayBillDetail);

router.post('/log-print', logPrintAction);

export default router;
