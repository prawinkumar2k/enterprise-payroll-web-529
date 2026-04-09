import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function injectTestCompany() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: 'billing_db'
    });

    try {
        console.log('[Test] Injecting AlphaCorp (ALPHA)...');
        
        const raw = `COMP-1-PLAN-1-EXP-null`; // No expiry
        const SA_SECRET = process.env.JWT_SECRET || '5f4dcc3b5aa765d61d8327deb882cf99';
        const signature = (await import('crypto')).createHash('sha256').update(raw + SA_SECRET).digest('hex').substring(0, 12).toUpperCase();
        const license = `${raw}-${signature}`;

        await conn.query(`
            INSERT INTO companies (id, company_name, company_code, status, plan_id, license_key)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [1, 'AlphaCorp', 'ALPHA', 'active', 1, license]);

        console.log('  ✓ ALPHA injected with valid license signature.');

    } catch (err) {
        console.error('[Test] FAIL:', err.message);
    } finally {
        await conn.end();
    }
}

injectTestCompany();
