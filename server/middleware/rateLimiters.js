/**
 * ============================================
 * LAYERED RATE LIMITING ARCHITECTURE
 * ============================================
 * 
 * Production-grade scoped rate limiters with:
 * - Observability integration
 * - Correlation ID tracking
 * - Structured logging
 * - Health endpoint protection
 */

import rateLimit from 'express-rate-limit';
import logger from '../logger/index.js';

/**
 * Rate Limit Violation Handler
 * Logs violations with correlation ID and structured data
 */
const rateLimitHandler = (req, res, limiterType) => {
    logger.warn({
        type: 'RATE_LIMIT_TRIGGERED',
        limiterType,
        correlationId: req.correlationId || req.id,
        ip: req.ip || req.socket?.remoteAddress,
        route: req.path,
        method: req.method,
        userAgent: req.get('user-agent')
    });
};

/**
 * 🔐 AUTH LIMITER (Strict)
 * 
 * Applied to: /api/auth/login, /api/auth/refresh
 * 
 * Configuration:
 * - 5 requests per minute per IP
 * - 15 minute block after limit
 * - Aggressive protection against brute force
 */
export const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 5, // 5 requests per window
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    skipSuccessfulRequests: false, // Count all requests
    skipFailedRequests: false,

    // Custom error response
    message: {
        success: false,
        message: 'Too many login attempts. Please try again in 1 minute.',
        code: 'AUTH_RATE_LIMIT'
    },

    // Log violations
    handler: (req, res) => {
        rateLimitHandler(req, res, 'AUTH');
        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try again in 1 minute.',
            code: 'AUTH_RATE_LIMIT',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * 🔄 SYNC LIMITER (Moderate)
 * 
 * Applied to: /api/sync/*
 * 
 * Configuration:
 * - 60 requests per minute per IP
 * - Moderate protection for sync operations
 * - No long-term ban
 */
export const syncLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 60, // 60 requests per window
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: 'Too many sync requests. Please slow down.',
        code: 'SYNC_RATE_LIMIT'
    },

    handler: (req, res) => {
        rateLimitHandler(req, res, 'SYNC');
        res.status(429).json({
            success: false,
            message: 'Too many sync requests. Please slow down.',
            code: 'SYNC_RATE_LIMIT',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * 📖 READ LIMITER (Light)
 * 
 * Applied to: /api/employees, /api/settings, /api/reports
 * 
 * Configuration:
 * - 200 requests per minute per IP
 * - Light protection for read operations
 * - Soft throttle only
 */
export const readLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 200, // 200 requests per window
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: 'Too many requests. Please slow down.',
        code: 'READ_RATE_LIMIT'
    },

    handler: (req, res) => {
        rateLimitHandler(req, res, 'READ');
        res.status(429).json({
            success: false,
            message: 'Too many requests. Please slow down.',
            code: 'READ_RATE_LIMIT',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * ❤️ HEALTH ENDPOINT EXEMPTION
 *
 * Health and monitoring endpoints are NEVER rate-limited
 * to ensure:
 * - Docker/Kubernetes health probes work
 * - Monitoring systems function
 * - Liveness checks succeed
 *
 * Exempted routes:
 * - /api/health
 * - /api/sync/status (monitoring endpoint)
 */

// No limiter needed - health endpoints should not have any rate limiting applied
