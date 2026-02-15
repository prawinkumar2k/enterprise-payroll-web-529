import dbManager from '../database/dbManager.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * Cloud Sync Service (The SaaS Spine)
 * Manages differential data synchronization between local and cloud.
 */
class CloudSyncService {
    constructor() {
        this.syncRegistry = ['empdet', 'emppay', 'staffattendance', 'audit_logs'];
    }

    /**
     * Get all pending changes since last successful sync
     */
    async getPendingChanges(lastSyncTimestamp, tenantId = 'local') {
        const changes = {};

        for (const table of this.syncRegistry) {
            // Fetch rows updated after last sync
            const [rows] = await dbManager.query(
                `SELECT * FROM ${table} WHERE (updated_at > ? OR created_at > ?) AND tenant_id = ?`,
                [lastSyncTimestamp, lastSyncTimestamp, tenantId]
            );
            if (rows.length > 0) {
                changes[table] = rows;
            }
        }

        return {
            timestamp: new Date().toISOString(),
            tenantId,
            payload: changes,
            count: Object.values(changes).reduce((acc, table) => acc + table.length, 0)
        };
    }

    /**
     * Resolve and apply changes from Cloud (The "Pull" operation)
     * Implements "Last Write Wins" (LWW) but records conflicts in Audit Logs.
     */
    async applyCloudChanges(cloudPayload, tenantId = 'local') {
        const results = { applied: 0, conflicts: 0, errors: [] };
        const connection = await dbManager.getConnection();

        try {
            await connection.beginTransaction();

            for (const [table, rows] of Object.entries(cloudPayload)) {
                for (const row of rows) {
                    // Check if local version is newer (Conflict)
                    const [local] = await connection.query(`SELECT updated_at FROM ${table} WHERE uuid = ?`, [row.uuid]);

                    if (local.length > 0 && new Date(local[0].updated_at) > new Date(row.updated_at)) {
                        results.conflicts++;
                        await logAudit({
                            userId: 'SYNC_ENGINE',
                            username: 'CLOUD_SYNC',
                            actionType: 'SYNC_CONFLICT',
                            module: 'SYNC',
                            description: `Conflict detected for ${table}:${row.uuid}. Local version is newer.`,
                            oldValue: local[0],
                            newValue: row,
                            tenantId
                        });
                        continue; // Keep local version
                    }

                    // Perform Upsert
                    // Note: In a real multi-tenant cloud, we'd use a more dynamic SQL builder or ORM
                    // Here we maintain the raw SQL discipline you prefer.
                    await this._upsertRow(connection, table, row, tenantId);
                    results.applied++;
                }
            }

            await connection.commit();
            return { success: true, ...results };
        } catch (error) {
            await connection.rollback();
            return { success: false, error: error.message };
        } finally {
            connection.release();
        }
    }

    /**
     * Map cloud data to local schema for upsert
     */
    async _upsertRow(db, table, row, tenantId) {
        // Logic to extract keys/values and filter system fields
        const keys = Object.keys(row).filter(k => k !== 'id' && row[k] !== undefined);
        const values = keys.map(k => row[k]);
        const placeholders = keys.map(() => '?').join(', ');
        const updateClause = keys.map(k => `\`${k}\` = ?`).join(', ');

        const sql = `
            INSERT INTO ${table} (${keys.map(k => `\`${k}\``).join(', ')}) 
            VALUES (${placeholders})
            ON CONFLICT(uuid) DO UPDATE SET ${updateClause}
        `;

        // Pass values twice for Insert and Update
        await db.execute(sql, [...values, ...values]);
    }
}

export default new CloudSyncService();
