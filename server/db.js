import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'enterprise_payroll',
    timezone: 'Z',               // Force UTC for consistent sync timestamps
    waitForConnections: true,
    connectionLimit: 25,          // 10 → 25: handle concurrent dashboard + sync + API calls
    queueLimit: 50,               // Queue up to 50 requests before rejecting
    idleTimeout: 60000,           // Release idle connections after 60s
    connectTimeout: 10000,        // Fail fast if MySQL is unreachable (10s)
    enableKeepAlive: true,        // Prevent connection drops on idle
    keepAliveInitialDelay: 30000, // Start keepalive after 30s idle
});

export default pool;
