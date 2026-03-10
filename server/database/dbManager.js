
<<<<<<< HEAD
import mysqlPool from '../db.js';
import sqliteManager from './sqliteManager.js';
import modeManager, { MODES } from './modeManager.js';
import { getTenantPool } from './tenantDbManager.js';

=======
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
/**
 * dbManager — now a thin re-export of dualDB
 *
 * All existing controllers that import dbManager continue to work unchanged.
 * The actual implementation now lives in dualDB.js.
 */
import dualDB from './dualDB.js';

<<<<<<< HEAD
    async init() {
        console.log('[DBManager] Initializing Local Persistence Engine...');
        // Prefer MySQL when available (web/online deployments). Fall back to SQLite for offline/local desktop.
        try {
            // Simple connectivity check
            await this.mysql.query('SELECT 1');
            console.log('✓ MySQL reachable — using MySQL as primary persistence.');
            return;
        } catch (mysqlErr) {
            console.warn('[DBManager] MySQL not reachable at startup, falling back to local SQLite. Error:', mysqlErr.message);
        }

        try {
            await this.sqlite.initSchema();
            console.log('✓ Local Persistence Ready.');
        } catch (error) {
            console.error('[DBManager] SQLITE Init Failed:', error.message);
            // Non-fatal, system will operate in degraded offline mode
        }
    }

    async query(sql, params = [], ignoreLock = false) {
        const mode = modeManager.getMode();

        // Safety: Suspend queries during SYNCING to avoid reading dirty/partial data
        if (mode === MODES.SYNCING && !ignoreLock) {
            throw new Error("System is currently syncing. Queries are temporarily suspended.");
        }

        if (mode === MODES.OFFLINE) {
            return this.sqlite.query(sql, params);
        }

        // Route to company-specific DB if a tenant context is active
        const tenantPool = getTenantPool();
        const pool = tenantPool || this.mysql;

        try {
            return await pool.query(sql, params);
        } catch (error) {
            if (!tenantPool && this._isConnectionError(error)) {
                console.warn("[DBManager] MySQL unreachable, falling back to local database.");
                modeManager.isOnline = false;
                modeManager._updateMode();
                return this.sqlite.query(sql, params);
            }
            throw error;
        }
    }

    async execute(sql, params = [], ignoreLock = false) {
        const mode = modeManager.getMode();

        // Safety: Suspend writes during SYNCING
        if (mode === MODES.SYNCING && !ignoreLock) {
            throw new Error("System is currently syncing. Write operations are temporarily suspended.");
        }

        if (mode === MODES.OFFLINE) {
            return this.sqlite.execute(sql, params);
        }

        // Route to company-specific DB if a tenant context is active
        const tenantPool = getTenantPool();
        const pool = tenantPool || this.mysql;

        try {
            const [result] = await pool.execute(sql, params);
            return result;
        } catch (error) {
            if (!tenantPool && this._isConnectionError(error)) {
                modeManager.isOnline = false;
                modeManager._updateMode();
                return this.sqlite.execute(sql, params);
            }
            throw error;
        }
    }

    async getConnection(ignoreLock = false) {
        const mode = modeManager.getMode();
        if (mode === MODES.SYNCING && !ignoreLock) {
            throw new Error("System is currently syncing. Database writes are locked.");
        }

        const tenantPool = getTenantPool();
        const connection = mode === MODES.OFFLINE
            ? await this.sqlite.getConnection()
            : await (tenantPool || this.mysql).getConnection();

        // Track active transactions to prevent sync collisions
        this.activeTransactions++;

        const originalRelease = connection.release.bind(connection);
        connection.release = () => {
            this.activeTransactions--;
            originalRelease();
        };

        return connection;
    }

    hasActiveTransactions() {
        return this.activeTransactions > 0;
    }

    _isConnectionError(error) {
        const connectionErrors = [
            'ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ETIMEDOUT',
            'ECONNRESET', 'ENOTFOUND', 'ER_ACCESS_DENIED_ERROR'
        ];
        return connectionErrors.includes(error.code) || error.errno === 1045;
    }

    getRawInstance() {
        return this.sqlite.getRawInstance();
    }
}

const dbManager = new DBManager();
export default dbManager;
=======
export default dualDB;
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
