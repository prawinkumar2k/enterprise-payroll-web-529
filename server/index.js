import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import payrollRoutes from './routes/payroll.js';
import userRoutes from './routes/users.js';
import logRoutes from './routes/log.routes.js';
import salaryRoutes from './routes/salary.routes.js';
import reportRoutes from './routes/report.routes.js';
import { logMiddleware } from './middleware/log.middleware.js';
import { requestLogger, errorHandler, notFound } from './middleware/commonMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Log all requests
app.use(logMiddleware); // Enterprise Audit Logger

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes); // Payroll Reporting Module
app.use('/api/employees', employeeRoutes);
app.use('/api/payroll', payrollRoutes); // Deprecated/Old
app.use('/api/salary', salaryRoutes); // New Salary Processing Module
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);

// Health Check
app.get('/api/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        res.json({
            success: true,
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            success: false,
            status: 'error',
            database: 'disconnected',
            error: error.message
        });
    }
});

// 404 handler - must be after all routes
app.use(notFound);

// Error handling middleware - must be last
app.use(errorHandler);

app.listen(PORT, HOST, () => {
    console.log(`✓ Server running on http://${HOST}:${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ Database: ${process.env.DB_NAME}`);
});

