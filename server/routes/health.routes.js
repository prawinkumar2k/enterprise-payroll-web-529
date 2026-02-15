import express from 'express';
import dbManager from '../database/dbManager.js';
import modeManager from '../database/modeManager.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

const router = express.Router();

/**
 * Liveness Probe - Is the server process alive?
 */
router.get('/live', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * Readiness Probe - Is the system ready to serve traffic?
 */
router.get('/ready', async (req, res) => {
    const checks = {
        database: 'PENDING',
        disk: 'PENDING',
        memory: 'PENDING',
        migrations: 'PENDING'
    };

    try {
        // 1. Database Check
        const dbInstance = dbManager.getRawInstance();
        if (dbInstance) {
            try {
                // Simple query to verify connection/integrity
                dbInstance.prepare('SELECT 1').get();
                checks.database = 'CONNECTED';
            } catch (e) {
                checks.database = 'CONNECTION_ERROR';
            }
        } else {
            checks.database = 'UNINITIALIZED';
        }

        // 2. Disk Check (is DATA_PATH writable?)
        const dataPath = process.env.DATA_PATH || process.cwd();
        try {
            const testFile = path.join(dataPath, '.health_write_test');
            fs.writeFileSync(testFile, 'ok');
            fs.unlinkSync(testFile);
            checks.disk = 'WRITABLE';
        } catch (e) {
            checks.disk = 'READ_ONLY_OR_FULL';
        }

        // 3. Memory Threshold (Warn if > 512MB)
        const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        checks.memory = memUsage > 512 ? 'HIGH_PRESSURE' : 'STABLE';
        checks.memory_mb = Math.round(memUsage);

        // 4. Migration Check
        try {
            const row = dbInstance.prepare('SELECT MAX(version_id) as v FROM schema_versions').get();
            checks.migrations = `VERSION_${row.v || 0}`;
        } catch (e) {
            checks.migrations = 'MISSING_VERSION_TABLE';
        }

        const isReady = checks.database === 'CONNECTED' && checks.disk === 'WRITABLE';

        res.status(isReady ? 200 : 503).json({
            status: isReady ? 'READY' : 'NOT_READY',
            checks,
            system: {
                platform: process.platform,
                node: process.version,
                env: process.env.NODE_ENV
            }
        });

    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            error: error.message
        });
    }
});

export default router;
