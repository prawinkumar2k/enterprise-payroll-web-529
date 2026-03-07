import dbManager from '../database/dbManager.js';
import mysqlPool from '../db.js';
import { randomBytes, randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { provisionCompanyDb } from '../database/provisionCompanyDb.js';
import { getTenantPool } from '../database/tenantDbManager.js';

const generateLicenseKey = (companyCode) => {
    const rand = randomBytes(4).toString('hex').toUpperCase();
    const year = new Date().getFullYear();
    return `${(companyCode || 'COMP').substring(0, 6).toUpperCase()}-${year}-${rand}`;
};

/**
 * GET /api/superadmin/companies
 */
export const listCompanies = async (req, res) => {
    try {
        const [rows] = await dbManager.query(
            `SELECT c.id, c.company_code, c.company_name, c.license_key, c.status,
                    c.expiry_date, c.created_at, p.plan_name,
                    COALESCE(u.total_users,0) AS total_users,
                    COALESCE(u.total_records,0) AS total_records,
                    COALESCE(u.storage_used_mb,0) AS storage_used_mb
             FROM companies c
             LEFT JOIN plans p ON c.plan_id = p.id
             LEFT JOIN usage_stats u ON u.company_id = c.id
             ORDER BY c.created_at DESC`, []
        );
        res.json({ success: true, companies: rows });
    } catch (error) {
        console.error('[CompanyMgmt] List error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch companies.' });
    }
};

/**
 * POST /api/superadmin/companies
 */
export const createCompany = async (req, res) => {
    const { company_code, company_name, plan_id = 1, expiry_days = 365,
            admin_user_id, admin_username, admin_password,
            org_name, org_address, org_phone, org_email } = req.body;
    if (!company_code || !company_name) {
        return res.status(400).json({ success: false, message: 'company_code and company_name are required.' });
    }
    if (!admin_user_id || !admin_username || !admin_password) {
        return res.status(400).json({ success: false, message: 'Admin User ID, User Name and Password are required.' });
    }
    const license_key = generateLicenseKey(company_code);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(expiry_days));
    const expiry_date = expiryDate.toISOString().split('T')[0];

    try {
        // 1. Create company record in billing_db
        const result = await dbManager.execute(
            `INSERT INTO companies (company_code, company_name, license_key, plan_id, status, expiry_date)
             VALUES (?, ?, ?, ?, 'active', ?)`,
            [company_code.toUpperCase(), company_name, license_key, plan_id, expiry_date]
        );
        const companyId = result.insertId;

        // 2. Seed usage_stats row in billing_db
        await dbManager.execute('INSERT IGNORE INTO usage_stats (company_id) VALUES (?)', [companyId]);

        // 3. Provision the company's own database: payroll_<CODE>
        await provisionCompanyDb(company_code.toUpperCase(), companyId, {
            org_name:    org_name    || company_name,
            org_address: org_address || '',
            org_phone:   org_phone   || '',
            org_email:   org_email   || '',
        });

        // 4. Create admin user directly in the company's own database
        const hashedPassword = await bcrypt.hash(admin_password, 10);
        const uid = randomUUID();
        const tenantPool = getTenantPool(company_code.toUpperCase());
        await tenantPool.execute(
            `INSERT INTO userdetails (UserID, uuid, Password, UserName, Role, company_id, device_id)
             VALUES (?, ?, ?, ?, 'admin', ?, 'MASTER')`,
            [admin_user_id, uid, hashedPassword, admin_username, companyId]
        );

        // 5. Sync usage count
        await dbManager.execute('UPDATE usage_stats SET total_users=1 WHERE company_id=?', [companyId]);

        res.status(201).json({
            success: true,
            message: `Company "${company_name}" created with its own database.`,
            company: { id: companyId, company_code: company_code.toUpperCase(), company_name, license_key, plan_id, expiry_date },
            admin: { user_id: admin_user_id, username: admin_username }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Company code or User ID already exists.' });
        }
        console.error('[CompanyMgmt] Create error:', error);
        res.status(500).json({ success: false, message: 'Failed to create company.' });
    }
};

/**
 * PUT /api/superadmin/companies/:id
 */
export const updateCompany = async (req, res) => {
    const { id } = req.params;
    const { company_name, plan_id, status, expiry_date } = req.body;
    try {
        await dbManager.execute(
            `UPDATE companies SET company_name=COALESCE(?,company_name),
             plan_id=COALESCE(?,plan_id), status=COALESCE(?,status),
             expiry_date=COALESCE(?,expiry_date) WHERE id=?`,
            [company_name || null, plan_id || null, status || null, expiry_date || null, id]
        );
        res.json({ success: true, message: 'Company updated.' });
    } catch (error) {
        console.error('[CompanyMgmt] Update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update company.' });
    }
};

/**
 * PATCH /api/superadmin/companies/:id/toggle
 * Toggle active <-> inactive
 */
export const toggleCompanyStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await dbManager.query('SELECT status FROM companies WHERE id=?', [id]);
        const company = rows?.[0];
        if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
        const newStatus = company.status === 'active' ? 'inactive' : 'active';
        await dbManager.execute('UPDATE companies SET status=? WHERE id=?', [newStatus, id]);
        res.json({ success: true, message: `Company ${newStatus}.`, status: newStatus });
    } catch (error) {
        console.error('[CompanyMgmt] Toggle error:', error);
        res.status(500).json({ success: false, message: 'Failed to toggle company status.' });
    }
};

/**
 * DELETE /api/superadmin/companies/:id
 */
export const deleteCompany = async (req, res) => {
    const { id } = req.params;
    try {
        await dbManager.execute('DELETE FROM companies WHERE id=?', [id]);
        res.json({ success: true, message: 'Company deleted.' });
    } catch (error) {
        console.error('[CompanyMgmt] Delete error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete company.' });
    }
};

/**
 * POST /api/superadmin/companies/:id/regenerate-key
 */
export const regenerateLicenseKey = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await dbManager.query('SELECT company_code FROM companies WHERE id=?', [id]);
        const company = rows?.[0];
        if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
        const license_key = generateLicenseKey(company.company_code);
        await dbManager.execute('UPDATE companies SET license_key=? WHERE id=?', [license_key, id]);
        res.json({ success: true, license_key });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to regenerate key.' });
    }
};

/**
 * GET /api/superadmin/companies/:id/usage
 */
export const getCompanyUsage = async (req, res) => {
    const { id } = req.params;
    try {
        // Sync live counts
        const [[userCount]] = await dbManager.query('SELECT COUNT(*) as cnt FROM userdetails WHERE company_id=?', [id]);
        await dbManager.execute(
            'UPDATE usage_stats SET total_users=? WHERE company_id=?',
            [userCount.cnt, id]
        );
        const [rows] = await dbManager.query(
            `SELECT u.*, p.max_users, p.max_records, p.max_storage_mb
             FROM usage_stats u
             JOIN companies c ON c.id=u.company_id
             LEFT JOIN plans p ON p.id=c.plan_id
             WHERE u.company_id=?`, [id]
        );
        res.json({ success: true, usage: rows?.[0] || null });
    } catch (error) {
        console.error('[CompanyMgmt] Usage error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch usage.' });
    }
};
