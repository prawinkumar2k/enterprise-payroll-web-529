import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logAction } from '../middleware/log.middleware.js';

/**
 * Login Controller
 * Handles user authentication and logs activity
 */
export const login = async (req, res) => {
    const { userId, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';

    if (!userId || !password) {
        return res.status(400).json({
            success: false,
            message: 'User ID and password are required'
        });
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM userdetails WHERE UserID = ?',
            [userId]
        );

        const user = rows[0];

        if (!user) {
            // Log failed login (User not found)
            await logAction({
                userId: userId,
                username: 'Unknown',
                role: 'N/A',
                module: 'AUTH',
                actionType: 'LOGIN_FAILURE',
                description: 'Failed login attempt: User ID not found',
                ip: ip
            });

            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        let isMatch = false;
        if (user.Password && (user.Password.startsWith('$2b$') || user.Password.startsWith('$2a$'))) {
            isMatch = await bcrypt.compare(password, user.Password);
        } else {
            isMatch = (password === user.Password);
        }

        if (!isMatch) {
            // Log failed login (Invalid password)
            await logAction({
                userId: user.UserID,
                username: user.UserName,
                role: user.Role || 'user',
                module: 'AUTH',
                actionType: 'LOGIN_FAILURE',
                description: 'Failed login attempt: Invalid password',
                ip: ip
            });

            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            { id: user.id, username: user.UserID, role: user.Role || 'employee' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: process.env.JWT_EXPIRE || '1d' }
        );

        // Success Log
        await logAction({
            userId: user.UserID,
            username: user.UserName,
            role: user.Role || 'user',
            module: 'AUTH',
            actionType: 'LOGIN',
            description: 'User logged in successfully',
            ip: ip
        });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.UserID,
                name: user.UserName,
                role: user.Role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Logout Controller
 */
export const logout = async (req, res) => {
    try {
        if (req.user) {
            await logAction({
                userId: req.user.username,
                username: req.user.name || req.user.username,
                role: req.user.role,
                module: 'AUTH',
                actionType: 'LOGOUT',
                description: 'User logged out',
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0'
            });
        }
        res.json({ success: true, message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get Current User
 */
export const getCurrentUser = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, UserID, UserName, Role, Department FROM userdetails WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

