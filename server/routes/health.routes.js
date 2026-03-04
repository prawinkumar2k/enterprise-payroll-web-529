import express from 'express';
import dbManager from '../database/dbManager.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

/**
 * Liveness Probe — Is the server process alive?
 */
router.get('/live', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * Readiness Probe — Is the system ready to serve traffic?
 * Uses async dbManager.query() — works for both MySQL and SQLite.
 */
router.get('/ready', async (req, res) => {
    const checks = {
        database: 'PENDING',
        disk: 'PENDING',
        memory: 'PENDING',
        migrations: 'PENDING'
    };

    // 1. Database connectivity
    try {
        await dbManager.query('SELECT 1');
        checks.database = 'CONNECTED';
    } catch {
        checks.database = 'CONNECTION_ERROR';
    }

    // 2. Schema migrations
    try {
        const [rows] = await dbManager.query('SELECT MAX(version_id) as v FROM schema_versions');
        checks.migrations = `VERSION_${rows?.[0]?.v || 0}`;
    } catch {
        checks.migrations = 'MISSING_VERSION_TABLE';
    }

    // 3. Disk writability
    try {
        const testFile = path.join(process.env.DATA_PATH || process.cwd(), '.health_write_test');
        fs.writeFileSync(testFile, 'ok');
        fs.unlinkSync(testFile);
        checks.disk = 'WRITABLE';
    } catch {
        checks.disk = 'READ_ONLY_OR_FULL';
    }

    // 4. Memory pressure
    const memMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    checks.memory = memMB > 512 ? 'HIGH_PRESSURE' : 'STABLE';
    checks.memory_mb = memMB;

    const dbState = dbManager.getState?.() || {};
    const isReady = checks.database === 'CONNECTED';

    res.status(isReady ? 200 : 503).json({
        status: isReady ? 'READY' : 'NOT_READY',
        checks,
        dbMode: dbState.mysqlAvailable && dbState.sqliteAvailable
            ? 'DUAL'
            : dbState.mysqlAvailable ? 'MYSQL_ONLY' : 'SQLITE_ONLY',
        system: {
            platform: process.platform,
            node: process.version,
            env: process.env.NODE_ENV,
            uptime: Math.round(process.uptime())
        }
    });
});

export default router;
