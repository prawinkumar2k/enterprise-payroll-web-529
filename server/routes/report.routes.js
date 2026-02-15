import express from 'express';
import {
    getPayBillDetail,
    getPayBillAbstract,
    getAbstract1,
    getAbstract2,
    getPayCertificate,
    searchEmployeesForReports,
    getBankStatement,
    getStaffReport,
    getStaffMaster,
    logPrintAction
} from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Reports are restricted to Admin/HR
router.use(authenticate);
router.use(authorize('admin', 'hr_officer'));


router.get('/pay-bill', getPayBillDetail);
router.get('/pay-bill-abstract', getPayBillAbstract);
router.get('/abstract-1', getAbstract1);
console.log('✓ Abstract-1 route registered at /api/reports/abstract-1');
router.get('/abstract-2', getAbstract2);
router.get('/pay-certificate', getPayCertificate);
router.get('/search-employees', searchEmployeesForReports);
router.get('/staff-report', getStaffReport);
router.get('/staff-master', getStaffMaster);
router.get('/bank-statement', getBankStatement);

router.post('/log-print', logPrintAction);

// Abstract-1 endpoint added for statutory deductions report
export default router;
