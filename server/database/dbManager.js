
import mysqlPool from '../db.js';
import sqliteManager from './sqliteManager.js';
import modeManager, { MODES } from './modeManager.js';

/**
 * DB Manager
 * Unified interface for MySQL (Online) and SQLite (Offline)
 */
class DBManager {
    constructor() {
        this.mysql = mysqlPool;
        this.sqlite = sqliteManager;
        this.activeTransactions = 0;
    }

    async init() {
        console.log('[DBManager] Initializing Local Persistence Engine...');
        try {
            await this.sqlite.initSchema();
            console.log('✓ Local Persistence Ready.');
        } catch (error) {
            console.error('[DBManager] SQLITE Init Failed:', error.message);
            // Non-fatal, system will just fail in OFFLINE mode
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

        try {
            return await this.mysql.query(sql, params);
        } catch (error) {
            if (this._isConnectionError(error)) {
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

        try {
            const [result] = await this.mysql.execute(sql, params);
            return result;
        } catch (error) {
            if (this._isConnectionError(error)) {
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

        const connection = mode === MODES.OFFLINE
            ? await this.sqlite.getConnection()
            : await this.mysql.getConnection();

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
