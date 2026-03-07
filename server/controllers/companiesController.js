import dbManager from '../database/dbManager.js';
import { getTenantPool } from '../database/tenantDbManager.js';

/**
 * GET /api/companies
 * Returns all active companies for the login dropdown.
 * Public endpoint – no authentication required.
 */
export const getCompanies = async (req, res) => {
    try {
        const [rows] = await dbManager.query(
            'SELECT id, company_code, company_name FROM companies WHERE is_active = 1 ORDER BY company_name ASC',
            []
        );
        res.json({ success: true, companies: rows || [] });
    } catch (error) {
        console.error('[Companies] Fetch error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to load companies', code: 'COMPANIES_FETCH_ERROR' });
    }
};

/**
 * GET /api/companies/:id/branding
 * Returns public branding (org_name, org_logo_url) for the login page header.
 * Public endpoint – no authentication required.
 */
export const getCompanyBranding = async (req, res) => {
    try {
        const { id } = req.params;
        // Resolve company_code from billing_db
        const [rows] = await dbManager.mysql.query(
            'SELECT company_code, company_name FROM companies WHERE id = ? AND is_active = 1 LIMIT 1',
            [id]
        );
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        const { company_code, company_name } = rows[0];

        // Fetch branding from tenant settings
        let org_name = company_name;
        let org_logo_url = null;
        try {
            const tenantPool = getTenantPool(company_code);
            const [settings] = await tenantPool.query(
                "SELECT setting_key, setting_value FROM app_settings WHERE setting_key IN ('org_name','org_logo_url')"
            );
            for (const row of settings) {
                if (row.setting_key === 'org_name' && row.setting_value) org_name = row.setting_value;
                if (row.setting_key === 'org_logo_url') org_logo_url = row.setting_value || null;
            }
        } catch (_) {
            // Tenant DB not reachable — fall back to billing_db company_name
        }

        res.json({ success: true, branding: { org_name, org_logo_url } });
    } catch (error) {
        console.error('[Companies] Branding fetch error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to load branding' });
    }
};
