import express from 'express';
import fs from 'fs';
import path from 'path';
import { authenticate } from '../middleware/authMiddleware.js';
import metricsService from '../services/metrics.service.js';
import backupService from '../services/backup.service.js';
import { createDiagnosticPackage } from '../services/diagnostics.service.js';
import { verifyAuditIntegrity } from '../utils/auditLogger.js';

import licenseService from '../services/license.service.js';

const router = express.Router();

// --- VERSION & STATUS ---
router.get('/status', async (req, res) => {
    const license = await licenseService.verifyLicense();
    res.json({
        success: true,
        version: '1.0.0',
        license: license.success ? `${license.type} Edition` : 'Trial Mode',
        status: 'ACTIVE',
        safeMode: process.env.SAFE_MODE === 'true',
        mode: process.env.IS_DESKTOP === 'true' ? 'DESKTOP_ISOLATED' : 'CLOUD'
    });
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
        res.status(500).json({ success: false, message: 'License check failed' });
    }
});

// --- METRICS ---
router.get('/metrics', authenticate, async (req, res) => {
    try {
        const report = metricsService.calculateReadinessScore();
        res.json({ success: true, ...report });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve metrics' });
    }
});

// --- DIAGNOSTICS ---
router.get('/diagnostics/export', authenticate, async (req, res) => {
    try {
        const userDataPath = process.env.DATA_PATH || process.cwd();
        const result = await createDiagnosticPackage(userDataPath);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Diagnostic export failed', error: error.message });
    }
});

// --- AUDIT INTEGRITY ---
router.get('/audit/verify', authenticate, async (req, res) => {
    try {
        const report = await verifyAuditIntegrity();
        res.json({ success: true, ...report });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Integrity check failed' });
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
        res.status(500).json({ success: false, message: 'Activation failed' });
    }
});

// --- BACKUP & RESTORE ---
router.post('/backup/manual', authenticate, async (req, res) => {
    try {
        const result = await backupService.performBackup();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Backup failed' });
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
        res.status(500).json({ success: false, message: 'Failed to list backups' });
    }
});

export default router;
