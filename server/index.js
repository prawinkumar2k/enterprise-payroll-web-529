import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { httpLogger, correlationMiddleware } from './logger/httpLogger.js';
import dbManager from './database/dbManager.js';
import { requestLogger, errorHandler } from './middleware/commonMiddleware.js';
import { authLimiter, syncLimiter, readLimiter } from './middleware/rateLimiters.js';

import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import payrollRoutes from './routes/payroll.js';
import userRoutes from './routes/users.js';
import logRoutes from './routes/log.routes.js';
import salaryRoutes from './routes/salary.routes.js';
import reportRoutes from './routes/report.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import attendanceRoutes from './routes/attendance.js';
import syncRoutes from './routes/sync.routes.js';
import systemRoutes from './routes/system.routes.js';
import healthRoutes from './routes/health.routes.js';
import tenantRoutes from './routes/tenant.routes.js';
import modeManager from './database/modeManager.js';
import { notFound } from './middleware/commonMiddleware.js';
import metricsService from './services/metrics.service.js';
import backupService from './services/backup.service.js';
import { verifyAuditIntegrity } from './utils/auditLogger.js';
import { verifyDataIntegrity } from './services/diagnostics.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '127.0.0.1';

// --- PRODUCTION CRASH LOGGING ---
const serverCrashLog = path.join(process.env.DATA_PATH || process.cwd(), 'server-crash.log');
process.on('uncaughtException', (err) => {
    const report = { timestamp: new Date().toISOString(), type: 'UNCAUGHT_EXCEPTION', error: err.stack || err };
    try { fs.appendFileSync(serverCrashLog, JSON.stringify(report) + '\n'); } catch (e) { }
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    const report = { timestamp: new Date().toISOString(), type: 'UNHANDLED_REJECTION', error: reason.stack || reason };
    try { fs.appendFileSync(serverCrashLog, JSON.stringify(report) + '\n'); } catch (e) { }
});

app.set('trust proxy', 1);
app.use(correlationMiddleware);
app.use(helmet());
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or file://)
        if (!origin || origin === 'null') return callback(null, true);
        const allowed = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
        if (allowed.length === 0 || allowed.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(httpLogger);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// --- HEALTH & SYSTEM ---
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        version: '1.0.0',
        mode: modeManager.getMode(),
        timestamp: new Date().toISOString()
    });
});

// --- ROUTE REGISTRATION ---
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/sync', syncLimiter, syncRoutes);
app.use('/api/employees', readLimiter, employeeRoutes);
app.use('/api/settings', readLimiter, settingsRoutes);
app.use('/api/reports', readLimiter, reportRoutes);
app.use('/api/dashboard', readLimiter, dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/health', healthRoutes); // Registered healthRoutes at /api/health

app.use('/api/tenant', tenantRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/beta', systemRoutes); // Mount system status under beta too for frontend compatibility

// --- FRONTEND STATIC SERVING (Unconditional) ---
// Try env var from Electron main first, else relative path
const frontendPath = process.env.FRONTEND_PATH
    ? path.resolve(process.env.FRONTEND_PATH)
    : path.resolve(__dirname, '../client/dist');
const indexPath = path.join(frontendPath, 'index.html');

console.log('[DEBUG] Frontend Path:', frontendPath);
console.log('[DEBUG] Checking if frontend exists...');

if (fs.existsSync(frontendPath)) {
    console.log('[DEBUG] Frontend found. Serving static files.');

    // Force serve index.html at root
    app.get('/', (req, res) => {
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            console.error('[ERROR] Directory exists but index.html missing!');
            res.status(500).send(`
                <h1>Error: Frontend Index Missing</h1>
                <p>Build directory exists at: <code>${frontendPath}</code></p>
                <p>But <code>index.html</code> was not found.</p>
                <hr>
                <small>Enterprise Payroll System - Server v1.0.0</small>
            `);
        }
    });

    // Serve static assets
    app.use(express.static(frontendPath, {
        maxAge: '1d',
        setHeaders: (res, path) => {
            if (path.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache');
            }
        }
    }));

    // Fallback for SPA
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            next();
        }
    });
} else {
    console.warn('[DEBUG] Frontend build directory NOT found at:', frontendPath);
    app.get('/', (req, res) => {
        res.status(500).send(`
            <h1>Architecture Error: Frontend Not Found</h1>
            <p>The server could not locate the client build directory.</p>
            <p><strong>Searched Path:</strong> <code>${frontendPath}</code></p>
            <p><strong>Method:</strong> <code>process.env.FRONTEND_PATH || relative fallback</code></p>
            <hr>
            <small>If running via Electron, check 'electron/main.js' env setup. If standalone, check 'client/dist'.</small>
        `);
    });
}

app.use(notFound);
app.use(errorHandler);

// --- ENTERPRISE STARTUP ENGINE ---
app.listen(PORT, HOST, async () => {
    try {
        await modeManager.init();
        metricsService.updateSystemMetrics(process.env.SAFE_MODE === 'true');
        await dbManager.init();

        // 1. Data Integrity Check
        const integrity = await verifyDataIntegrity(dbManager.getRawInstance());
        if (!integrity.valid) {
            console.error(`[Integrity] Critical failure: ${integrity.reason}`);
        }

        // 2. Audit Chain Verification
        const auditVerification = await verifyAuditIntegrity();
        if (!auditVerification.success) {
            console.error(`[Security] Audit log tampering detected: ${auditVerification.error} at record ${auditVerification.recordId}`);
        } else {
            console.log(`[Security] Audit chain verified (${auditVerification.count} records).`);
        }

        // 3. Automated Backup (Daily at startup + every 24h)
        await backupService.performBackup();
        setInterval(() => backupService.performBackup(), 86400000);

    } catch (err) {
        console.error('[Startup] Initialization failed:', err);
    }
    console.log(`✓ [Production] Server listening on http://${HOST}:${PORT}`);
});
