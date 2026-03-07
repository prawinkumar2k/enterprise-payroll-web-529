import dbManager from '../database/dbManager.js';
import mysqlPool from '../db.js';
import { getTenantPool } from '../database/tenantDbManager.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logAction } from '../middleware/log.middleware.js';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || '5f4dcc3b5aa765d61d8327deb882cf99';
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const generateAccessToken = (user, companyCode) => {
    return jwt.sign(
        {
            id: user.id || user.ID,
            username: user.UserID,
            role: user.Role || 'employee',
            company_id: user.company_id || 1,
            company_code: companyCode || 'DEFAULT'
        },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

/**
 * Store refresh token in billing_db (with company_code so refresh can re-establish tenant context)
 */
const generateRefreshToken = async (userId, deviceId, companyCode) => {
    const token = randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await mysqlPool.execute(
        'INSERT INTO refresh_tokens (token, user_id, device_id, expires_at, company_code) VALUES (?, ?, ?, ?, ?)',
        [token, userId, deviceId || null, expiresAt, companyCode]
    );

    return token;
};

/**
 * Login Controller
 */
export const login = async (req, res) => {
    const { userId, password, company_id, device_id } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';

    if (!userId || !password) {
        return res.status(400).json({ success: false, message: 'User ID and password are required', code: 'AUTH_MISSING_CREDENTIALS' });
    }
    if (!company_id) {
        return res.status(400).json({ success: false, message: 'Company is required', code: 'AUTH_MISSING_COMPANY' });
    }

    try {
        // 1. Validate company in billing_db and get its code
        const [companyRows] = await mysqlPool.query(
            'SELECT id, company_code, company_name FROM companies WHERE id = ? AND (is_active = 1 OR status = "active")',
            [company_id]
        );
        if (!companyRows || companyRows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid company or company is inactive', code: 'AUTH_INVALID_COMPANY' });
        }
        const company_code = companyRows[0].company_code;
        const company_name = companyRows[0].company_name;

        // 2. Look up user in company's own database
        const tenantPool = getTenantPool(company_code);
        console.log(`[Auth] Attempting login for user: ${userId} in company: ${company_code}`);

        const [rows] = await tenantPool.query(
            'SELECT * FROM userdetails WHERE UserID = ?',
            [userId]
        );
        const user = rows ? rows[0] : null;

        if (!user) {
            console.warn(`[Auth] User not found: ${userId}`);
            await tenantPool.execute('INSERT INTO login_attempts (user_id, ip_address, status) VALUES (?, ?, ?)', [userId, ip, 'FAILURE']);
            return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'AUTH_INVALID_CREDENTIALS' });
        }

        console.log(`[Auth] User found: ${user.UserID}. Checking password...`);

        let isMatch = false;
        if (user.Password && (user.Password.startsWith('$2b$') || user.Password.startsWith('$2a$'))) {
            console.log('[Auth] Using Bcrypt comparison');
            isMatch = await bcrypt.compare(password, user.Password);
        } else {
            console.log('[Auth] Using Plaintext comparison');
            isMatch = (password === user.Password);
            if (isMatch) {
                console.log('[Auth] Plaintext match! Migrating to Bcrypt...');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                await tenantPool.execute('UPDATE userdetails SET Password = ? WHERE UserID = ?', [hashedPassword, userId]);
            }
        }

        console.log(`[Auth] Password match: ${isMatch}`);

        if (!isMatch) {
            await tenantPool.execute('INSERT INTO login_attempts (user_id, ip_address, status) VALUES (?, ?, ?)', [user.UserID, ip, 'FAILURE']);
            return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'AUTH_INVALID_CREDENTIALS' });
        }

        // Generate Tokens
        console.log('[Auth] Generating tokens...');
        const accessToken = generateAccessToken(user, company_code);
        const refreshToken = await generateRefreshToken(user.id, device_id, company_code);

        // Success Log
        await tenantPool.execute('INSERT INTO login_attempts (user_id, ip_address, status) VALUES (?, ?, ?)', [user.UserID, ip, 'SUCCESS']);
        await logAction({
            userId: user.UserID,
            module: 'AUTH',
            actionType: 'LOGIN',
            description: 'User logged in successfully',
            ip: ip
        });

        console.log('[Auth] Login successful. Setting cookie...');

        // Set refresh token in HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            accessToken,
            user: {
                id: user.id || user.ID,
                username: user.UserID,
                name: user.UserName,
                role: user.Role,
                company_id: user.company_id,
                company_code,
                company_name
            }
        });

    } catch (error) {
        console.error('[Auth] Login error:', error);
        console.error('[Auth] Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Internal Server Error', code: 'AUTH_INTERNAL_ERROR', details: error.message });
    }
};

/**
 * Token Refresh Controller (with rotation)
 */
export const refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ success: false, message: 'No refresh token', code: 'AUTH_NO_REFRESH_TOKEN' });
    }

    try {
        // refresh_tokens live in billing_db
        const [rows] = await mysqlPool.query(
            'SELECT * FROM refresh_tokens WHERE token = ? AND revoked_at IS NULL',
            [token]
        );

        const existingToken = rows[0];

        if (!existingToken || new Date() > new Date(existingToken.expires_at)) {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token', code: 'AUTH_INVALID_REFRESH_TOKEN' });
        }

        // Get user from company's own database using company_code stored in the token
        const company_code = existingToken.company_code || 'DEFAULT';
        const tenantPool = getTenantPool(company_code);
        const [userRows] = await tenantPool.query('SELECT * FROM userdetails WHERE id = ?', [existingToken.user_id]);
        const user = userRows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'User no longer exists', code: 'AUTH_USER_NOT_FOUND' });
        }

        // Rotate Token in billing_db
        const newRefreshToken = randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

        await mysqlPool.execute(
            'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP, replaced_by_token = ? WHERE id = ?',
            [newRefreshToken, existingToken.id]
        );

        await mysqlPool.execute(
            'INSERT INTO refresh_tokens (token, user_id, device_id, expires_at, company_code) VALUES (?, ?, ?, ?, ?)',
            [newRefreshToken, user.id, existingToken.device_id, expiresAt, company_code]
        );

        const newAccessToken = generateAccessToken(user, company_code);

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error('[Auth] Refresh error:', error);
        res.status(500).json({ success: false, message: 'Refresh failed', code: 'AUTH_REFRESH_ERROR' });
    }
};

/**
 * Logout Controller
 */
export const logout = async (req, res) => {
    const token = req.cookies.refreshToken;
    try {
        if (token) {
            await dbManager.execute('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token = ?', [token]);
        }

        if (req.user) {
            await logAction({
                userId: req.user.username,
                module: 'AUTH',
                actionType: 'LOGOUT',
                description: 'User logged out',
                ip: req.socket.remoteAddress
            });
        }

        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Logout failed', code: 'AUTH_LOGOUT_ERROR' });
    }
};

/**
 * Get Current User
 */
export const getCurrentUser = async (req, res) => {
    try {
        const rows = await dbManager.query(
            'SELECT id, UserID, UserName, Role, Department FROM userdetails WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found', code: 'AUTH_USER_NOT_FOUND' });
        res.json({ success: true, user: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', code: 'AUTH_USER_FETCH_ERROR' });
    }
};

/**
 * Fix Admin User (Force Reset)
 */
export const fixAdmin = async (req, res) => {
    try {
        console.log('[Auth] Forcing Admin Reset...');
        await dbManager.execute('DELETE FROM userdetails WHERE UserID = ?', ['admin']);
        await dbManager.execute('INSERT INTO userdetails (UserID, Password, UserName, Role) VALUES (?, ?, ?, ?)', ['admin', 'admin123', 'Administrator', 'admin']);
        res.json({ success: true, message: 'Admin reset to default (admin/admin123)' });
    } catch (error) {
        console.error('[Auth] Fix Admin Error:', error);
        res.status(500).json({ success: false, message: 'Failed to reset admin', error: error.message });
    }
};
