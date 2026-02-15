
import pinoHttp from 'pino-http';
import logger from './index.js';
import { correlationMiddleware } from './correlation.js';

// Setup request logger with strict filters
const httpLogger = pinoHttp({
    logger,
    autoLogging: {
        ignore: (req) => {
            // Ignore noise: assets, health checks, favicon
            if (req.url === '/api/health') return true;
            if (req.url === '/favicon.ico') return true;
            return false;
        }
    },
    customLogLevel: (res, err) => {
        if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
        if (res.statusCode >= 500 || err) return 'error';
        return 'info';
    },
    customSuccessMessage: (req, res) => {
        return `[HTTP] ${req.method} ${req.url} ${res.statusCode} - ${res.responseTime}ms`;
    },
    customErrorMessage: (req, res, err) => {
        return `[HTTP ERROR] ${req.method} ${req.url} FAILED - ${err.message}`;
    },
    // Wrap correlation injection
    genReqId: (req) => req.id || req.correlationId,
});

export { httpLogger, correlationMiddleware };
