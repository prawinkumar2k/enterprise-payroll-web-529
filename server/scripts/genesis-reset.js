import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function clearBillingData() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: 'billing_db',
        multipleStatements: true
    });

    try {
        console.log('[Cleanup] Wiping non-system data from billing_db...');
        
        // Disable foreign keys temporarily
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        
        // Clear tables
        const tables = [
            'companies', 
            'userdetails', 
            'login_attempts', 
            'refresh_tokens', 
            'userlogs',
            'audit_logs'
        ];
        
        for (const table of tables) {
            await conn.query(`TRUNCATE TABLE \`${table}\``);
            console.log(`  ✓ Cleared ${table}`);
        }

        // Re-inject a Super Admin
        const saPasswordHash = '$2b$12$wsCa2ZJOUwRCU0p295kUQOjTdd9ECD19OQ./4TYI5rEl1oWpWc3ba'; // "password"
        await conn.query(`
            INSERT INTO userdetails (UserID, Password, UserName, Role, device_id, is_synced, company_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, ['superadmin', saPasswordHash, 'Master Administrator', 'super_admin', 'MASTER', 1, 0]);

        console.log('  ✓ Super Admin re-injected.');
        
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('[Cleanup] ✓ billing_db is now in GENESIS state.');

    } catch (err) {
        console.error('[Cleanup] FATAL ERROR:', err.message);
    } finally {
        await conn.end();
    }
}

clearBillingData();
