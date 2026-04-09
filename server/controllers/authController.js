import db from '../database/dbManager.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logAudit } from '../utils/auditLogger.js';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || '5f4dcc3b5aa765d61d8327deb882cf99';
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINS = 30;

const loginSchema = z.object({
    userId: z.string().min(1, 'UserID is required'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
});

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id || user.UserID, username: user.UserID, role: (user.role || user.Role || 'employee').toUpperCase() },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

const generateRefreshToken = async (userId) => {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    await db.execute('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)', [token, userId, expiresAt]);
    return token;
};

export const login = async (req, res) => {
    try {
        const validated = loginSchema.parse(req.body);
        const { userId, password } = validated;

        const [rows] = await db.query('SELECT * FROM users WHERE UserID = ? AND deleted_at IS NULL', [userId]);
        const user = rows ? rows[0] : null;

        if (!user) {
            await logAudit({ username: userId, actionType: 'LOGIN_FAILURE', module: 'AUTH', description: 'User not found.', ip: req.ip });
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 0. Verify Role against Login Mode (Admin vs Staff)
        const userRole = (user.role || user.Role || 'employee').toLowerCase();
        const loginMode = req.body.loginMode; // 'company' (Admin/HR) or 'employee' (Staff)
        
        if (loginMode === 'employee' && userRole !== 'employee') {
             return res.status(403).json({ success: false, message: 'Unauthorized: Admin cannot use Staff access console.' });
        }
        if (loginMode === 'company' && userRole === 'employee') {
             return res.status(403).json({ success: false, message: 'Unauthorized: Staff cannot use Enterprise Management console.' });
        }

        // 1. Check for Account Lockout
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            await logAudit({ userId: user.id, username: user.UserID, actionType: 'LOGIN_LOCKED', module: 'AUTH', description: 'Attempt on locked account.', ip: req.ip });
            return res.status(403).json({ success: false, message: `Account locked. Try again after ${new Date(user.locked_until).toLocaleTimeString()}` });
        }

        const isMatch = await bcrypt.compare(password, user.Password);

        if (!isMatch) {
            // Incremental failed attempts and potential lock
            const attempts = (user.failed_attempts || 0) + 1;
            let lockedUntil = null;
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                lockedUntil = new Date();
                lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCKOUT_DURATION_MINS);
            }

            await db.execute('UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?', [attempts, lockedUntil, user.id]);

            await logAudit({ userId: user.id, username: user.UserID, actionType: 'LOGIN_FAILURE', module: 'AUTH', description: `Invalid attempt. #${attempts}${lockedUntil ? ' - ACCOUNT LOCKED' : ''}`, ip: req.ip });
            return res.status(401).json({ success: false, message: lockedUntil ? 'Too many failures. Account locked.' : 'Invalid credentials' });
        }

        // Reset lockout on successful login
        await db.execute('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);

        const accessToken = generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user.id);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        });

        await logAudit({ userId: user.id, username: user.UserID, actionType: 'LOGIN_SUCCESS', module: 'AUTH', description: 'Standard login complete.', ip: req.ip });
        res.json({ success: true, token: accessToken, user: { username: user.UserID, name: user.UserName, role: user.role || user.Role }, message: 'Logged in successfully' });

    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors });
        res.status(500).json({ success: false, message: error.message });
    }
};

export const refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No session token' });
    try {
        const [rows] = await db.query('SELECT rt.*, u.UserID, u.role, u.UserName FROM refresh_tokens rt JOIN users u ON rt.user_id = u.id WHERE rt.token = ? AND rt.revoked_at IS NULL', [token]);
        const storedToken = rows ? rows[0] : null;
        if (!storedToken || new Date(storedToken.expires_at) < new Date()) {
            return res.status(401).json({ success: false, message: 'Session expired' });
        }
        const accessToken = generateAccessToken({ id: storedToken.user_id, UserID: storedToken.UserID, role: storedToken.role, UserName: storedToken.UserName });
        res.json({ success: true, token: accessToken });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (token) {
        await db.execute('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token = ?', [token]);
        await logAudit({ userId: req.user?.id, username: req.user?.username, actionType: 'LOGOUT', module: 'AUTH', description: 'Logout.', ip: req.ip });
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out' });
};

/**
 * getCurrentUser (Profile)
 */
export const getCurrentUser = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, UserID as username, UserName as name, role, PANCARD as email FROM users WHERE id = ?',
            [req.user.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * updatePassword
 */
export const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const [rows] = await db.query('SELECT Password FROM users WHERE id = ?', [req.user.id]);
        const user = rows[0];

        const isMatch = await bcrypt.compare(currentPassword, user.Password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect current password' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE users SET Password = ? WHERE id = ?', [hashed, req.user.id]);

        await logAudit({
            userId: req.user.id,
            username: req.user.username,
            actionType: 'PASSWORD_CHANGE',
            module: 'AUTH',
            description: 'User updated their password.',
            ip: req.ip
        });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
