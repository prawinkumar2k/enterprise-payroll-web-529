/**
 * ============================================
 * PRODUCTION-GRADE LAYERED RATE LIMITING
 * ============================================
 */
import rateLimit from 'express-rate-limit';
import logger from '../logger/index.js';

const isDev = process.env.NODE_ENV === 'development';

const rateLimitHandler = (req, res, limiterType) => {
    logger.warn({
        type: 'RATE_LIMIT_TRIGGERED',
        limiterType,
        ip: req.ip || req.socket?.remoteAddress,
        route: req.path,
        method: req.method
    });
};

const passThrough = (_req, _res, next) => next();

/**
 * 🔐 AUTH LIMITER (Strict)
 */
export const authLimiter = isDev ? passThrough : rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,  // Stricter for Production
    standardHeaders: true,
    message: { success: false, message: 'Too many attempts. Locked for 1 minute.' },
    handler: (req, res) => {
        rateLimitHandler(req, res, 'AUTH');
        res.status(429).json({ success: false, message: 'Too many attempts. Locked for 1 minute.' });
    }
});

/**
 * 🧬 BIOMETRIC LIMITER (Very Strict)
 * Prevents pattern-matching spam and brute-force on templates.
 */
export const biometricLimiter = isDev ? passThrough : rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 15, // Max 15 attempts every 5 minutes
    standardHeaders: true,
    handler: (req, res) => {
        rateLimitHandler(req, res, 'BIOMETRIC');
        res.status(429).json({ success: false, message: 'Biometric rate limit reached. Wait 5 minutes.' });
    }
});

/**
 * 🔄 SYNC & HEAVY LIMITER
 */
export const syncLimiter = isDev ? passThrough : rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    handler: (req, res) => {
        rateLimitHandler(req, res, 'SYNC');
        res.status(429).json({ success: false, message: 'Too many heavy operations.' });
    }
});

/**
 * 📖 READ LIMITER (Dynamic)
 */
export const readLimiter = isDev ? passThrough : rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    handler: (req, res) => {
        rateLimitHandler(req, res, 'READ');
        res.status(429).json({ success: false, message: 'Too many requests.' });
    }
});
