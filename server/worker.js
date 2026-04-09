import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Environment Setup ──
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import dbManager from './database/dbManager.js';
import jobQueue from './services/jobQueue.service.js';
import logger from './utils/logger.js';

// ── Handlers Registration ──
import { generateSalary } from './controllers/salary.controller.js';
// (Note: In production, wrap controllers into worker-safe services)
jobQueue.registerHandler('GENERATE_PAYROLL', generateSalary);
jobQueue.registerHandler('BULK_EMAIL_PAYSLIPS', async (payload, progress) => {
    // Simulated Bulk Email Logic
    for(let i=0; i<payload.count; i++) {
        await new Promise(r => setTimeout(r, 100)); // 100ms per email
        await progress(Math.round((i/payload.count) * 100));
    }
    return { sent: payload.count };
});

/**
 * Enterprise Worker Process
 * Separates heavy computation from the API server for cloud horizontal scaling.
 */
async function bootstrapWorker() {
    try {
        logger.info({ message: 'Initializing Worker Process Database...', module: 'WORKER_BOOT' });
        await dbManager.init();
        
        // Start infinite workers loop
        await jobQueue.startWorker();
        
    } catch (err) {
        logger.error({ message: 'Critical Worker Failure', error: err.stack, module: 'WORKER_BOOT' });
        process.exit(1);
    }
}

bootstrapWorker();
