/**
 * Request Logging Middleware
 * Logs all incoming requests for debugging and audit purposes
 */
export const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
};

/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */
export const errorHandler = (err, req, res, next) => {
    const isDev = process.env.NODE_ENV === 'development';

    // Log error internally
    if (isDev) {
        console.error('[ErrorHandler] Error Trace:', err);
    }

    let statusCode = err.statusCode || 500;
    let response = {
        success: false,
        message: 'Internal System Error',
        code: 'INTERNAL_ERROR'
    };

    // Database Specific Errors (MySQL/SQLite) - Sanitize
    if (err.code === 'ER_DUP_ENTRY' || err.code === 'SQLITE_CONSTRAINT') {
        statusCode = 409;
        response.message = 'A record with this unique identifier already exists.';
        response.code = 'DUPLICATE_ENTRY';
    } else if (err.message.includes('System is currently syncing')) {
        statusCode = 423;
        response.message = 'System is temporarily locked for maintenance (Sync in progress).';
        response.code = 'SYNC_LOCKED';
    } else if (err.code === 'ER_LOCK_WAIT_TIMEOUT' || err.code === 'ER_LOCK_DEADLOCK') {
        statusCode = 503;
        response.message = 'Resource busy. Please try again.';
        response.code = 'DATABASE_BUSY';
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        response.message = err.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid session';
        response.code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
    } else if (statusCode !== 500) {
        // For known client errors (400, 404, etc)
        response.message = err.message;
        response.code = err.code || 'BAD_REQUEST';
    }

    // Add dev details if needed
    if (isDev) {
        response.details = err.message;
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

/**
 * Not Found Middleware
 * Handles 404 errors for undefined routes
 */
export const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
};
