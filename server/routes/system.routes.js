import express from 'express';
import fs from 'fs';
import path from 'path';
import { authenticate } from '../middleware/authMiddleware.js';
import metricsService from '../services/metrics.service.js';
import backupService from '../services/backup.service.js';
import { createDiagnosticPackage } from '../services/diagnostics.service.js';
import { verifyAuditIntegrity } from '../utils/auditLogger.js';

import licenseService from '../services/license.service.js';
import dualDB from '../database/dualDB.js';
import syncWorker from '../sync/syncWorker.js';

const router = express.Router();

// --- DUAL DB SYNC HEALTH ---
router.get('/sync-status', authenticate, async (req, res) => {
    try {
        const health = await dualDB.getSyncHealth();
        res.json({ success: true, ...health });
    } catch (error) {
        res.json({ success: false, message: 'Sync status check failed' });
    }
});

// --- MANUAL SYNC TRIGGER ---
router.post('/sync-now', authenticate, async (req, res) => {
    try {
        const result = await syncWorker.runNow();
        res.json(result);
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// --- VERSION & STATUS ---
router.get('/status', async (req, res) => {
    try {
        const license = await licenseService.verifyLicense();
        res.json({
            success: true,
            version: '1.0.0',
            license: license.success ? `${license.type} Edition` : 'Trial Mode',
            status: 'ACTIVE',
            safeMode: process.env.SAFE_MODE === 'true',
            mode: process.env.IS_DESKTOP === 'true' ? 'DESKTOP_ISOLATED' : 'CLOUD'
        });
    } catch (error) {
        console.error('[System] Status check error:', error.message);
        res.json({
            success: true,
            version: '1.0.0',
            license: 'Trial Mode',
            status: 'ACTIVE',
            safeMode: process.env.SAFE_MODE === 'true',
            mode: process.env.IS_DESKTOP === 'true' ? 'DESKTOP_ISOLATED' : 'CLOUD'
        });
    }
});

// --- COMMERCIAL LICENSE ---
router.get('/license/status', authenticate, async (req, res) => {
    try {
        const license = await licenseService.verifyLicense();
        const fingerprint = await licenseService.getMachineFingerprint();
        const limits = await licenseService.getProductLimits();

        res.json({
            success: true,
            status: license,
            fingerprint,
            limits
        });
    } catch (error) {
        console.error('[License] status error:', error.message);
        res.json({ success: false, message: 'License check failed' });
    }
});

// --- METRICS ---
router.get('/metrics', authenticate, async (req, res) => {
    try {
        const report = metricsService.calculateReadinessScore();
        res.json({ success: true, ...report });
    } catch (error) {
        console.error('[Metrics] error:', error.message);
        res.json({ success: false, message: 'Failed to retrieve metrics' });
    }
});

// --- DIAGNOSTICS ---
router.get('/diagnostics/export', authenticate, async (req, res) => {
    try {
        const userDataPath = process.env.DATA_PATH || process.cwd();
        const result = await createDiagnosticPackage(userDataPath);
        res.json(result);
    } catch (error) {
        console.error('[Diagnostics] error:', error.message);
        res.json({ success: false, message: 'Diagnostic export failed' });
    }
});

// --- AUDIT INTEGRITY ---
router.get('/audit/verify', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Access Denied: Administrative privileges required' });
        }
        const report = await verifyAuditIntegrity();
        res.json({ success: true, ...report });
    } catch (error) {
        console.error('[Audit] verify error:', error.message);
        res.status(500).json({ success: false, message: 'Integrity check failed' });
    }
});

// Full SHA256 Chain Verification (Enterprise Level)
import { verifyCryptoAuditChain } from '../utils/auditLogger.js';
router.get('/audit/verify-chain', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Access Denied: Compliance audit requires higher clearance' });
        }
        const report = await verifyCryptoAuditChain();
        res.json({ success: true, ...report });
    } catch (error) {
        console.error('[Audit] verify-chain error:', error.message);
        res.status(500).json({ success: false, message: 'Cryptographic chain verification failed' });
    }
});

router.post('/license/activate', authenticate, async (req, res) => {
    const { serialKey } = req.body;
    try {
        const result = await licenseService.activateOnline(serialKey);
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('[License] activate error:', error.message);
        res.status(400).json({ success: false, message: 'Activation failed' });
    }
});

// --- BACKUP & RESTORE ---
router.post('/backup/manual', authenticate, async (req, res) => {
    try {
        const result = await backupService.performBackup();
        res.json(result);
    } catch (error) {
        console.error('[Backup] error:', error.message);
        res.json({ success: false, message: 'Backup failed' });
    }
});

router.get('/backups', authenticate, async (req, res) => {
    try {
        const backupDir = path.join(process.env.DATA_PATH || process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) return res.json([]);
        const files = fs.readdirSync(backupDir)
            .filter(f => f.startsWith('backup-'))
            .map(f => {
                const stats = fs.statSync(path.join(backupDir, f));
                return { name: f, size: stats.size, date: stats.mtime };
            })
            .sort((a, b) => b.date - a.date);
        res.json(files);
    } catch (error) {
        console.error('[Backups] list error:', error.message);
        res.json([]);
    }
});

export default router;
