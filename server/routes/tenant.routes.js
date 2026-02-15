import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import dbManager from '../database/dbManager.js';
import { logAudit } from '../utils/auditLogger.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * Tenant Onboarding & Cloud Linking
 * Links a local installation to a SaaS Tenant.
 */

// 1. Get Current Tenant Link Status
router.get('/status', authenticate, async (req, res) => {
    try {
        const [rows] = await dbManager.query("SELECT setting_value FROM app_settings WHERE setting_key = 'cloud_tenant_id'");
        const [linkDate] = await dbManager.query("SELECT setting_value FROM app_settings WHERE setting_key = 'cloud_link_date'");

        res.json({
            success: true,
            isLinked: rows.length > 0,
            tenantId: rows.length > 0 ? rows[0].setting_value : 'local',
            linkDate: linkDate.length > 0 ? linkDate[0].setting_value : null,
            machineId: crypto.createHash('sha256').update(process.env.COMPUTERNAME || 'LOCAL_PC').digest('hex').substring(0, 12)
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// 2. Link to Cloud Tenant (Onboarding)
router.post('/link', authenticate, authorize('admin'), async (req, res) => {
    const { tenantId, activationToken } = req.body;

    if (!tenantId || !activationToken) {
        return res.status(400).json({ success: false, message: 'Tenant ID and Activation Token required' });
    }

    try {
        // --- SIMULATED CLOUD VALIDATION ---
        // In production, this would call the SaaS Auth API to verify the token
        const isValidToken = activationToken.startsWith('SAAS_');

        if (!isValidToken) {
            return res.status(401).json({ success: false, message: 'Invalid SaaS Activation Token' });
        }

        // Apply Tenant ID to local system
        await dbManager.execute(`
            INSERT INTO app_settings (setting_key, setting_value, category) 
            VALUES ('cloud_tenant_id', ?, 'CLOUD')
            ON CONFLICT(setting_key) DO UPDATE SET setting_value = ?
        `, [tenantId, tenantId]);

        await dbManager.execute(`
            INSERT INTO app_settings (setting_key, setting_value, category) 
            VALUES ('cloud_link_date', ?, 'CLOUD')
            ON CONFLICT(setting_key) DO UPDATE SET setting_value = ?
        `, [new Date().toISOString(), new Date().toISOString()]);

        await logAudit({
            userId: req.user.username,
            username: req.user.name || req.user.username,
            actionType: 'CLOUD_LINKED',
            module: 'TENANT',
            description: `System linked to Cloud Tenant: ${tenantId}`,
            tenantId: 'local'
        });

        res.json({ success: true, message: `System successfully linked to ${tenantId}` });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

export default router;
