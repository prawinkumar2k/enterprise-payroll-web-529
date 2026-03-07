import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbManager from '../database/dbManager.js';

const SA_SECRET = process.env.SA_JWT_SECRET || process.env.JWT_SECRET || '5f4dcc3b5aa765d61d8327deb882cf99';

/**
 * POST /api/superadmin/auth/login
 */
export const superAdminLogin = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    try {
        const [rows] = await dbManager.query('SELECT * FROM super_admins WHERE username = ?', [username]);
        const admin = rows?.[0];
        if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials.', code: 'SA_INVALID_CREDENTIALS' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.', code: 'SA_INVALID_CREDENTIALS' });

        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: 'superadmin' },
            SA_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            token,
            admin: { id: admin.id, username: admin.username }
        });
    } catch (error) {
        console.error('[SuperAdmin] Login error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

/**
 * GET /api/superadmin/auth/me
 */
export const getSuperAdminMe = async (req, res) => {
    res.json({ success: true, admin: req.superAdmin });
};

/**
 * GET /api/superadmin/dashboard/stats
 */
export const getDashboardStats = async (req, res) => {
    try {
        const [[companiesRow]] = await dbManager.query('SELECT COUNT(*) as total FROM companies', []);
        const [[activeRow]] = await dbManager.query("SELECT COUNT(*) as total FROM companies WHERE status='active'", []);
        const [[expiredRow]] = await dbManager.query("SELECT COUNT(*) as total FROM companies WHERE status='expired' OR expiry_date < CURDATE()", []);
        const [[usersRow]] = await dbManager.query('SELECT COUNT(*) as total FROM userdetails', []);
        const [planDist] = await dbManager.query(
            `SELECT p.plan_name, COUNT(c.id) as count
             FROM plans p LEFT JOIN companies c ON c.plan_id=p.id
             GROUP BY p.id, p.plan_name`, []
        );
        const [recentCompanies] = await dbManager.query(
            `SELECT c.id, c.company_name, c.company_code, c.status, c.created_at, p.plan_name
             FROM companies c LEFT JOIN plans p ON c.plan_id=p.id
             ORDER BY c.created_at DESC LIMIT 5`, []
        );

        res.json({
            success: true,
            stats: {
                totalCompanies: companiesRow.total,
                activeCompanies: activeRow.total,
                expiredCompanies: expiredRow.total,
                totalUsers: usersRow.total,
                planDistribution: planDist,
                recentCompanies,
            }
        });
    } catch (error) {
        console.error('[SuperAdmin] Stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to load stats.' });
    }
};
