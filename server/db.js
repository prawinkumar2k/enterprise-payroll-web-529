import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

// ── Enterprise Pool Configuration ──
const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'payroll_system',
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 200,
    enableKeepAlive: true,
    charset: 'utf8mb4'
};

/**
 * Enterprise Production Pool (Auto-Splitting Write/Read)
 * Supports horizontal scale-out for data-heavy payroll systems.
 */
const pool = mysql.createPool(poolConfig);

// ── Read Replica Pool (Optional Cloud Scale-out) ──
const readPool = process.env.DB_READ_HOST 
    ? mysql.createPool({ ...poolConfig, host: process.env.DB_READ_HOST, connectionLimit: 200 })
    : pool; // Fallback to main pool if no replica

/**
 * Enterprise Query Proxy
 * Automatically routes SELECT queries to Read Replicas (if enabled).
 */
const queryProxy = {
    async query(sql, params = []) {
        const isRead = sql.trim().toUpperCase().startsWith('SELECT');
        const activePool = isRead ? readPool : pool;
        
        try {
            const [rows] = await activePool.query(sql, params);
            return [rows, []];
        } catch (err) {
            logger.error({ message: 'DB Proxy Error', sql: sql.slice(0, 50), error: err.message, module: 'DB_PROXY' });
            throw err;
        }
    },
    async execute(sql, params = []) {
        // ALWAYS use Main Pool for writes
        try {
            const [rows] = await pool.execute(sql, params);
            return [rows, []];
        } catch (err) {
            logger.error({ message: 'DB Execution Error', sql: sql.slice(0, 50), error: err.message, module: 'DB_EXEC' });
            throw err;
        }
    },
    async getConnection() {
        return pool.getConnection(); // Master connection for transactions
    }
};

export default queryProxy;
