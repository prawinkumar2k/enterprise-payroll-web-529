import { createHash, randomUUID } from 'crypto';
import dbManager from '../database/dbManager.js';

/**
 * Enterprise Audit Logger with Tamper Detection
 * Implements SHA256 Hash Chaining for data integrity.
 */
export const logAudit = async ({
    userId, username, actionType, module, description,
    oldValue = null, newValue = null, ip = '0.0.0.0', deviceId = 'SERVER',
    connection = null, tenantId = 'local'
}) => {
    const id = randomUUID();
    const oldValStr = oldValue ? JSON.stringify(oldValue) : null;
    const newValStr = newValue ? JSON.stringify(newValue) : null;

    try {
        const db = connection || dbManager;
        const [lastLog] = await db.query('SELECT hash FROM audit_logs ORDER BY created_at DESC LIMIT 1');
        const prevHash = lastLog && lastLog.length > 0 ? lastLog[0].hash : 'GENESIS_BLOCK';

        // Hash chain includes tenantId for multi-tenant integrity
        const logContent = `${prevHash}|${tenantId}|${userId}|${actionType}|${module}|${description}|${oldValStr}|${newValStr}|${ip}`;
        const hash = createHash('sha256').update(logContent).digest('hex');

        await db.execute(`
            INSERT INTO audit_logs (
                id, user_id, username, action_type, module, description, 
                old_value, new_value, ip_address, device_id, prev_hash, hash, tenant_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, userId, username, actionType, module, description, oldValStr, newValStr, ip, deviceId, prevHash, hash, tenantId]);

    } catch (error) {
        console.error('[AuditLogger] Critical Error:', error);
    }
};

/**
 * Verify complete audit chain integrity
 */
export const verifyAuditIntegrity = async () => {
    try {
        const [rows] = await dbManager.query('SELECT * FROM audit_logs ORDER BY created_at ASC');
        let expectedPrevHash = 'GENESIS_BLOCK';

        for (const log of rows) {
            if (log.prev_hash !== expectedPrevHash) {
                return { success: false, brokenAt: log.id, reason: 'CHAIN_LINK_MISMATCH' };
            }

            const logContent = `${log.prev_hash}|${log.tenant_id || 'local'}|${log.user_id}|${log.action_type}|${log.module}|${log.description}|${log.old_value}|${log.new_value}|${log.ip_address}`;
            const calculatedHash = createHash('sha256').update(logContent).digest('hex');

            if (calculatedHash !== log.hash) {
                return { success: false, brokenAt: log.id, reason: 'HASH_MISMATCH' };
            }

            expectedPrevHash = log.hash;
        }

        return { success: true, count: rows.length };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
