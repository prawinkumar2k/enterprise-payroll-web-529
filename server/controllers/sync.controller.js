import syncService from '../services/sync.service.js';
import modeManager from '../database/modeManager.js';
import dbManager from '../database/dbManager.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * Cloud Sync Controller (Phase 2.5 - Hardened)
 * Manages SaaS-compliant data exchange with idempotency.
 */

const getTenantId = async () => {
    const [rows] = await dbManager.query("SELECT setting_value FROM app_settings WHERE setting_key = 'cloud_tenant_id'");
    return rows.length > 0 ? rows[0].setting_value : 'local';
};

export const pushSync = async (req, res) => {
    try {
        const tenantId = await getTenantId();
        const [lastSyncRow] = await dbManager.query("SELECT setting_value FROM app_settings WHERE setting_key = 'last_successful_sync'");
        const lastSyncTime = lastSyncRow && lastSyncRow.length > 0 ? lastSyncRow[0].setting_value : '1970-01-01';

        const bundle = await syncService.getPushBundle(lastSyncTime, tenantId);
        const { batchId } = bundle.metadata;

        // --- SIMULATED CLOUD UPLOAD ---
        // In a real SaaS setup, we'd send 'bundle' to the Cloud API here.
        console.log(`[Sync] Pushing Batch ${batchId} for Tenant: ${tenantId}`);

        // Update local sync state using the Batch-ID
        const uuidsByTable = {};
        for (const [table, rows] of Object.entries(bundle.data)) {
            uuidsByTable[table] = rows.map(r => r.uuid);
        }
        await syncService.markAsSynced(batchId, uuidsByTable, tenantId);

        await logAudit({
            userId: req.user.username,
            username: req.user.name || req.user.username,
            actionType: 'SYNC_PUSH_SUCCESS',
            module: 'SYNC',
            description: `Successfully pushed Batch ${batchId} (${bundle.metadata.recordCount} records)`,
            tenantId
        });

        res.json({
            success: true,
            batchId,
            recordsSynced: bundle.metadata.recordCount,
            tenantId
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

export const pullSync = async (req, res) => {
    try {
        const tenantId = await getTenantId();

        // --- SIMULATED CLOUD FETCH ---
        // Mocking an incoming cloud bundle for demonstration
        const mockBundle = {
            metadata: {
                batchId: `CLOUD_PULL_${Date.now()}`,
                tenantId,
                timestamp: new Date().toISOString(),
                recordCount: 0
            },
            data: {} // In reality, this would be fetched from the Cloud API
        };

        const results = await syncService.applyIncomingBundle(mockBundle, tenantId);

        // Update last sync timestamp only on success
        if (results.success && !results.skipped) {
            const now = new Date().toISOString();
            await dbManager.execute(`
                INSERT INTO app_settings (setting_key, setting_value, category) 
                VALUES ('last_successful_sync', ?, 'SYNC')
                ON CONFLICT(setting_key) DO UPDATE SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
            `, [now, now]);
        }

        res.json({
            success: true,
            batchId: results.batchId || mockBundle.metadata.batchId,
            applied: results.applied || 0,
            conflicts: results.conflicts || 0,
            tenantId
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

export const getSyncStatus = async (req, res) => {
    try {
        const tenantId = await getTenantId();
        const [row] = await dbManager.query("SELECT setting_value FROM app_settings WHERE setting_key = 'last_successful_sync'");

        // Fetch last 5 sync batches for visibility
        const [batches] = await dbManager.query("SELECT * FROM sync_batches ORDER BY started_at DESC LIMIT 5");

        res.json({
            success: true,
            lastSyncTime: (row && row.length > 0) ? row[0].setting_value : null,
            tenantId,
            mode: modeManager.getMode(),
            recentBatches: batches
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

export const resetSyncStatus = (req, res) => {
    modeManager.resetSyncMode();
    res.json({ success: true, message: "Sync mode reset." });
};

export const getSyncLogs = async (req, res) => {
    try {
        const logs = await dbManager.query("SELECT * FROM audit_logs WHERE module = 'SYNC' ORDER BY created_at DESC LIMIT 50");
        res.json(logs);
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

export const updateSyncStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (status === 'RESET') {
            modeManager.resetSyncMode();
        }
        res.json({ success: true, message: "Sync status updated." });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
