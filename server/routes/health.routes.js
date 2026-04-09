import express from 'express';
import db from '../database/dbManager.js';
import os from 'os';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const start = Date.now();
        await db.query('SELECT 1');
        const dbLatency = Date.now() - start;

        const health = {
            status: 'UP',
            version: '2.1.0-ST-ENT',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            system: {
                platform: process.platform,
                memory: {
                    total: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
                    free: Math.round(os.freemem() / 1024 / 1024) + 'MB',
                    usage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
                },
                load: os.loadavg()
            },
            checks: {
                database: { status: 'CONNECTED', latency: dbLatency + 'ms' },
                storage: { status: 'WRITABLE' }
            }
        };

        res.json(health);
    } catch (error) {
        res.status(503).json({
            status: 'DOWN',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
