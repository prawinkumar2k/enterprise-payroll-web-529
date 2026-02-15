
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
import fs from 'fs';
const logsDir = process.env.DATA_PATH
    ? path.join(process.env.DATA_PATH, 'logs')
    : (process.env.NODE_ENV === 'production'
        ? '/app/logs'
        : path.join(__dirname, '../../logs'));
if (!fs.existsSync(logsDir)) {
    try {
        fs.mkdirSync(logsDir, { recursive: true });
    } catch (err) {
        console.error('Failed to create logs directory:', err);
    }
}

// Log destinations - standard streams for Docker readiness
const transport = pino.transport({
    targets: [
        {
            level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
            target: 'pino-pretty', // Development friendly
            options: {
                destination: 1, // standard out
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        },
        {
            level: 'info',
            target: 'pino/file', // File log for persistence
            options: {
                destination: path.join(logsDir, 'app.log'),
                mkdir: true,
            },
        },
        {
            level: 'error',
            target: 'pino/file', // Separate error log
            options: {
                destination: path.join(logsDir, 'error.log'),
                mkdir: true,
            },
        },
    ],
});

const logger = pino(
    {
        level: process.env.LOG_LEVEL || 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
            level: (label) => {
                return { level: label.toUpperCase() };
            },
        },
        serializers: {
            req: (req) => {
                if (!req) return {};
                return {
                    method: req.method,
                    url: req.url,
                    query: req.query,
                    remoteAddress: req.socket?.remoteAddress || req.ip,
                    correlationId: req.id // Ensure correlation ID is logged
                };
            },
            res: (res) => {
                if (!res) return {};
                return {
                    statusCode: res.statusCode,
                    responseTime: res.responseTime // Will be added by pino-http
                };
            },
            err: pino.stdSerializers.err, // Proper Error serialization
        },
        redact: {
            paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'req.body.token'],
            censor: '***REDACTED***',
        },
    },
    transport
);

export default logger;
