import dbManager from '../database/dbManager.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logAction } from '../middleware/log.middleware.js';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || '5f4dcc3b5aa765d61d8327deb882cf99';
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id || user.ID, username: user.UserID, role: user.Role || 'employee' },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

/**
 * Helper to generate and store refresh token
 */
const generateRefreshToken = async (userId, deviceId = null) => {
    const token = randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await dbManager.execute(
        'INSERT INTO refresh_tokens (token, user_id, device_id, expires_at) VALUES (?, ?, ?, ?)',
        [token, userId, deviceId, expiresAt]
    );

    return token;
};

/**
 * Login Controller
 */
export const login = async (req, res) => {
    const { userId, password, device_id } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';

    if (!userId || !password) {
        return res.status(400).json({ success: false, message: 'User ID and password are required', code: 'AUTH_MISSING_CREDENTIALS' });
    }

    try {
        console.log(`[Auth] Attempting login for user: ${userId}`);
        const [rows] = await dbManager.query(
            'SELECT * FROM userdetails WHERE UserID = ?',
            [userId]
        );

        const user = rows ? rows[0] : null;

        if (!user) {
            console.warn(`[Auth] User not found: ${userId}`);
            await dbManager.execute('INSERT INTO login_attempts (user_id, ip_address, status) VALUES (?, ?, ?)', [userId, ip, 'FAILURE']);
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
                // Auto-migrate to bcrypt
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                await dbManager.query('UPDATE userdetails SET Password = ? WHERE UserID = ?', [hashedPassword, userId]);
            }
        }

        console.log(`[Auth] Password match: ${isMatch}`);

        if (!isMatch) {
            await dbManager.execute('INSERT INTO login_attempts (user_id, ip_address, status) VALUES (?, ?, ?)', [user.UserID, ip, 'FAILURE']);
            return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'AUTH_INVALID_CREDENTIALS' });
        }

        // Generate Tokens
        console.log('[Auth] Generating tokens...');
        const accessToken = generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user.id, device_id);

        // Success Log
        await dbManager.execute('INSERT INTO login_attempts (user_id, ip_address, status) VALUES (?, ?, ?)', [user.UserID, ip, 'SUCCESS']);
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
                role: user.Role
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
        const rows = await dbManager.query(
            'SELECT * FROM refresh_tokens WHERE token = ? AND revoked_at IS NULL',
            [token]
        );

        const existingToken = rows[0];

        // Token Replay/Abuse detection
        if (!existingToken || new Date() > new Date(existingToken.expires_at)) {
            // If token in cookie is revoked or expired but somehow still present
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token', code: 'AUTH_INVALID_REFRESH_TOKEN' });
        }

        const [userRows] = await dbManager.query('SELECT * FROM userdetails WHERE id = ?', [existingToken.user_id]);
        const user = userRows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'User no longer exists', code: 'AUTH_USER_NOT_FOUND' });
        }

        // Rotate Token
        const newRefreshToken = randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

        await dbManager.execute(
            'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP, replaced_by_token = ? WHERE id = ?',
            [newRefreshToken, existingToken.id]
        );

        await dbManager.execute(
            'INSERT INTO refresh_tokens (token, user_id, device_id, expires_at) VALUES (?, ?, ?, ?)',
            [newRefreshToken, user.id, existingToken.device_id, expiresAt]
        );

        const newAccessToken = generateAccessToken(user);

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
