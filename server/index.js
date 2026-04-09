import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filenameEarly = fileURLToPath(import.meta.url);
const __dirnameEarly = path.dirname(__filenameEarly);
dotenv.config({ path: path.join(__dirnameEarly, '.env'), override: true });

import { validateEnv } from './utils/envValidator.js';
validateEnv();

import { httpLogger, correlationMiddleware } from './logger/httpLogger.js';
import dbManager from './database/dbManager.js';
import { errorHandler, notFound } from './middleware/commonMiddleware.js';
import { authLimiter, readLimiter } from './middleware/rateLimiters.js';
import summaryService from './services/summary.service.js';

import authRoutes from './routes/auth.js';
import adminEmployeesRoutes from './routes/admin.employees.js';
import userRoutes from './routes/users.js';
import logRoutes from './routes/log.routes.js';
import salaryRoutes from './routes/salary.routes.js';
import reportRoutes from './routes/report.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import attendanceRoutes from './routes/attendance.js';
import incomeExpenseRoutes from './routes/incomeExpense.routes.js';
import healthRoutes from './routes/health.routes.js';
import incomeRoutes from './routes/income.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import financeRoutes from './routes/finance.routes.js';
import salaryRevisionRoutes from './routes/salary_revision.routes.js';
import selfServiceRoutes from './routes/self.employees.js';
import biometricRoutes from './routes/biometric.routes.js';
import leaveRoutes from './routes/leave.js';
import shiftRoutes from './routes/shift.js';
import syncRoutes from './routes/sync.routes.js';
import systemRoutes from './routes/system.routes.js';
import { verifyAuditIntegrity } from './utils/auditLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5005;
const HOST = process.env.HOST || '127.0.0.1';

app.set('trust proxy', 1);
app.use(correlationMiddleware);
app.use(helmet());
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/employee', selfServiceRoutes);
app.use('/api/employees', readLimiter, adminEmployeesRoutes);
app.use('/api/settings', readLimiter, settingsRoutes);
app.use('/api/reports', readLimiter, reportRoutes);
app.use('/api/dashboard', readLimiter, dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/income-expense', incomeExpenseRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/shift', shiftRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/income', readLimiter, incomeRoutes);
app.use('/api/expense', readLimiter, expenseRoutes);
app.use('/api/finance', readLimiter, financeRoutes);
app.use('/api/salary-revisions', readLimiter, salaryRevisionRoutes);
app.use('/api/biometric', biometricRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/beta', systemRoutes);

const frontendPath = path.resolve(__dirname, '../client/dist');
const indexPath = path.join(frontendPath, 'index.html');

if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ success: false, message: 'API not found' });
        }
        res.sendFile(indexPath);
    });
}

app.use(notFound);
app.use(errorHandler);

async function startServer() {
    try {
        console.log('[Startup] Initializing Single-Tenant Payroll System...');

        await dbManager.init();
        await summaryService.ensureSummaryTable();

        const auditVerification = await verifyAuditIntegrity();
        console.log(`[Security] Audit chain verified (${auditVerification.count} records).`);

        const server = app.listen(PORT, HOST, () => {
            console.log('\n==============================================');
            console.log(`[Single-Tenant] Server listening on ${HOST}:${PORT}`);
            console.log('==============================================\n');
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`[Startup Error] Port ${PORT} is already in use on ${HOST}.`);
            } else {
                console.error('[Startup Error]', err);
            }
            process.exit(1);
        });
    } catch (err) {
        console.error('[Startup Error]', err);
        process.exit(1);
    }
}

startServer();
