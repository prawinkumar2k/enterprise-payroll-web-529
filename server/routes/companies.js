import express from 'express';
import { getCompanies, getCompanyBranding } from '../controllers/companiesController.js';

const router = express.Router();

/**
 * @route  GET /api/companies
 * @desc   List all active companies (used for login dropdown)
 * @access Public
 */
router.get('/', getCompanies);

/**
 * @route  GET /api/companies/:id/branding
 * @desc   Returns org_name + org_logo_url for login page header
 * @access Public
 */
router.get('/:id/branding', getCompanyBranding);

export default router;
