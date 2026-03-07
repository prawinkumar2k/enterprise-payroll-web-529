import express from 'express';
import { verifySuperAdmin } from '../middleware/superAdminMiddleware.js';
import { superAdminLogin, getSuperAdminMe, getDashboardStats } from '../controllers/superAdminController.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import {
    listCompanies, createCompany, updateCompany, toggleCompanyStatus,
    deleteCompany, regenerateLicenseKey, getCompanyUsage
} from '../controllers/companyMgmtController.js';
import { listPlans, createPlan, updatePlan, deletePlan } from '../controllers/plansController.js';

const router = express.Router();

// ── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/login', authLimiter, superAdminLogin);
router.get('/auth/me', verifySuperAdmin, getSuperAdminMe);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard/stats', verifySuperAdmin, getDashboardStats);

// ── Companies ─────────────────────────────────────────────────────────────────
router.get('/companies', verifySuperAdmin, listCompanies);
router.post('/companies', verifySuperAdmin, createCompany);
router.put('/companies/:id', verifySuperAdmin, updateCompany);
router.patch('/companies/:id/toggle', verifySuperAdmin, toggleCompanyStatus);
router.delete('/companies/:id', verifySuperAdmin, deleteCompany);
router.post('/companies/:id/regenerate-key', verifySuperAdmin, regenerateLicenseKey);
router.get('/companies/:id/usage', verifySuperAdmin, getCompanyUsage);

// ── Plans ─────────────────────────────────────────────────────────────────────
router.get('/plans', verifySuperAdmin, listPlans);
router.post('/plans', verifySuperAdmin, createPlan);
router.put('/plans/:id', verifySuperAdmin, updatePlan);
router.delete('/plans/:id', verifySuperAdmin, deletePlan);

export default router;
