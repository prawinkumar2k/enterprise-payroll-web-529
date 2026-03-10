import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'billing_db',
    timezone: 'Z',               // Force UTC for consistent sync timestamps
    waitForConnections: true,
    connectionLimit: 100,         // High-load: 100 concurrent connections for lakhs of users
    queueLimit: 200,              // Queue up to 200 requests before rejecting
    maxIdle: 25,                  // Keep 25 idle connections warm
    idleTimeout: 60000,           // Release idle connections after 60s
    connectTimeout: 15000,        // 15s connection timeout
    enableKeepAlive: true,        // Prevent connection drops on idle
    keepAliveInitialDelay: 10000, // Start keepalive after 10s idle
    multipleStatements: false,    // Security: prevent SQL injection via multiple statements
});

export default pool;
