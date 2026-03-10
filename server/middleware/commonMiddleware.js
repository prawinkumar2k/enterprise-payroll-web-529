/**
 * Common Middleware — Production Runtime Immunity Layer
 *
 * Provides:
 * 1. requestLogger    — Structured request logging
 * 2. errorHandler     — Centralized, intelligent error transformation (never raw 500)
 * 3. notFound         — 404 handler
 * 4. asyncGuard       — HOF that wraps any async controller for uncaught promise safety
 * 5. immunize         — Apply asyncGuard to all methods of a router (bulk immunity)
 */

/**
 * Request Logging Middleware
 */
export const requestLogger = (req, res, next) => {
    if (req.path.includes('/health/live')) return next(); // skip health pings

    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        const flag = ms > 500 ? ' ⚠️ SLOW' : '';
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.path} → ${res.statusCode} (${ms}ms)${flag}`);
    });
    next();
};


/**
 * asyncGuard — Wraps an async route handler so any unhandled promise
 * rejection is forwarded to Express error handler instead of crashing.
 */
export const asyncGuard = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Error Handler — Converts ALL thrown/unhandled errors into
 * structured JSON responses. Never allows raw 500 stack traces.
 */
export const errorHandler = (err, req, res, next) => {
    const isDev = process.env.NODE_ENV === 'development';

    // Log internally (never expose to client)
    console.error(`[ErrorHandler] ${req.method} ${req.path} —`, err.message || err);

    // ── Determine status code ──
    let statusCode = err.statusCode || err.status || 500;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred. Please try again.';

    // ── Map known errors to user-friendly messages ──
    if (err.code === 'ER_DUP_ENTRY' || err.code === 'SQLITE_CONSTRAINT') {
        statusCode = 409;
        code = 'DUPLICATE_ENTRY';
        message = 'A record with this identifier already exists.';

    } else if (err.message?.includes('System is currently syncing')) {
        statusCode = 423;
        code = 'SYNC_LOCKED';
        message = 'System is temporarily locked (sync in progress). Please retry shortly.';

    } else if (err.code === 'ER_LOCK_WAIT_TIMEOUT' || err.code === 'ER_LOCK_DEADLOCK') {
        statusCode = 503;
        code = 'DATABASE_BUSY';
        message = 'Resource busy. Please try again.';

    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Session expired. Please log in again.';

    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        code = 'INVALID_TOKEN';
        message = 'Invalid session. Please log in again.';

    } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        // Database connection errors — never expose as 500
        statusCode = 200;  // Return 200 with success:false so frontend handles gracefully
        code = 'DB_UNAVAILABLE';
        message = 'Database temporarily unavailable. Operating in degraded mode.';

    } else if (statusCode >= 400 && statusCode < 500) {
        // Client errors — safe to show message
        code = err.code || 'BAD_REQUEST';
        message = err.message || message;

    } else if (statusCode === 500) {
        // Suppress internal error details in production
        code = 'SERVER_ERROR';
        message = isDev ? (err.message || message) : 'Internal server error. Please try again.';
    }

    const response = { success: false, message, code };

    if (isDev && err.stack) {
        response.debug = err.stack.split('\n').slice(0, 4).join(' | ');
    }

    res.status(statusCode).json(response);
};

/**
 * Not Found Handler — 404 for unmatched routes
 */
export const notFound = (req, res, next) => {
    // Only 404 for API routes; let frontend handle non-API 404s
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: `API endpoint ${req.method} ${req.originalUrl} not found`,
            code: 'NOT_FOUND'
        });
    }
    next();
};
