/**
 * Migration 003 — Add Critical Performance Indexes
 *
 * Adds missing indexes on heavily-queried columns.
 * Safe to run multiple times (checks existence before creating).
 *
 * Run: node server/migrations/003_add_indexes.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const INDEXES = [
    // emppay — most queried table (salary reports, dashboard)
    { table: 'emppay', name: 'idx_emppay_monthyear', sql: 'ALTER TABLE `emppay` ADD INDEX `idx_emppay_monthyear` (`MONTHYEAR`)' },
    { table: 'emppay', name: 'idx_emppay_empno', sql: 'ALTER TABLE `emppay` ADD INDEX `idx_emppay_empno` (`EMPNO`)' },
    { table: 'emppay', name: 'idx_emppay_empno_month', sql: 'ALTER TABLE `emppay` ADD INDEX `idx_emppay_empno_month` (`EMPNO`, `MONTHYEAR`)' },
    { table: 'emppay', name: 'idx_emppay_dgroup_month', sql: 'ALTER TABLE `emppay` ADD INDEX `idx_emppay_dgroup_month` (`DGroup`, `MONTHYEAR`)' },
    { table: 'emppay', name: 'idx_emppay_deleted', sql: 'ALTER TABLE `emppay` ADD INDEX `idx_emppay_deleted` (`deleted_at`)' },
    { table: 'emppay', name: 'idx_emppay_synced', sql: 'ALTER TABLE `emppay` ADD INDEX `idx_emppay_synced` (`is_synced`)' },

    // staffattendance — attendance reports & salary joins
    { table: 'staffattendance', name: 'idx_att_empno_adate', sql: 'ALTER TABLE `staffattendance` ADD INDEX `idx_att_empno_adate` (`EMPNO`, `ADATE`)' },
    { table: 'staffattendance', name: 'idx_att_adate', sql: 'ALTER TABLE `staffattendance` ADD INDEX `idx_att_adate` (`ADATE`)' },
    { table: 'staffattendance', name: 'idx_att_empno', sql: 'ALTER TABLE `staffattendance` ADD INDEX `idx_att_empno` (`EMPNO`)' },
    { table: 'staffattendance', name: 'idx_att_category_date', sql: 'ALTER TABLE `staffattendance` ADD INDEX `idx_att_category_date` (`Category`, `ADATE`)' },

    // empdet — employee lookups
    { table: 'empdet', name: 'idx_emp_empno', sql: 'ALTER TABLE `empdet` ADD INDEX `idx_emp_empno` (`EMPNO`)' },
    { table: 'empdet', name: 'idx_emp_checkstatus', sql: 'ALTER TABLE `empdet` ADD INDEX `idx_emp_checkstatus` (`CheckStatus`)' },
    { table: 'empdet', name: 'idx_emp_category', sql: 'ALTER TABLE `empdet` ADD INDEX `idx_emp_category` (`Category`, `CheckStatus`)' },
    { table: 'empdet', name: 'idx_emp_pancard', sql: 'ALTER TABLE `empdet` ADD INDEX `idx_emp_pancard` (`PANCARD`)' },

    // att_monthly_summary — fast dashboard reads
    { table: 'att_monthly_summary', name: 'idx_summary_month', sql: 'ALTER TABLE `att_monthly_summary` ADD INDEX `idx_summary_month` (`summary_month`)' },
    { table: 'att_monthly_summary', name: 'idx_summary_emp_month', sql: 'ALTER TABLE `att_monthly_summary` ADD INDEX `idx_summary_emp_month` (`empno`, `summary_month`)' },

    // userdetails — login lookups
    { table: 'userdetails', name: 'idx_users_userid', sql: 'ALTER TABLE `userdetails` ADD INDEX `idx_users_userid` (`UserID`)' },

    // userlogs — audit table
    { table: 'userlogs', name: 'idx_userlogs_created', sql: 'ALTER TABLE `userlogs` ADD INDEX `idx_userlogs_created` (`CreatedAt`)' },
    { table: 'userlogs', name: 'idx_userlogs_module', sql: 'ALTER TABLE `userlogs` ADD INDEX `idx_userlogs_module` (`Module`, `CreatedAt`)' },
];

async function indexExists(conn, tableName, indexName, dbName) {
    const [rows] = await conn.query(
        `SELECT INDEX_NAME FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
        [dbName, tableName, indexName]
    );
    return rows.length > 0;
}

async function tableExists(conn, tableName, dbName) {
    const [rows] = await conn.query(
        `SELECT TABLE_NAME FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
        [dbName, tableName]
    );
    return rows.length > 0;
}

async function run() {
    const dbName = process.env.DB_NAME || 'billing_db';
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: dbName,
    });

    console.log(`\n🗂️  Migration 003 — Adding Performance Indexes to '${dbName}'`);
    console.log('═'.repeat(60));

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const idx of INDEXES) {
        const tableOk = await tableExists(conn, idx.table, dbName);
        if (!tableOk) {
            console.log(`  ⊘ SKIP  ${idx.name} (table '${idx.table}' not found)`);
            skipped++;
            continue;
        }

        const exists = await indexExists(conn, idx.table, idx.name, dbName);
        if (exists) {
            console.log(`  ✓ EXIST ${idx.name}`);
            skipped++;
            continue;
        }

        const t = Date.now();
        try {
            await conn.query(idx.sql);
            console.log(`  ✚ ADDED ${idx.name} on ${idx.table} (${Date.now() - t}ms)`);
            created++;
        } catch (err) {
            console.error(`  ✗ ERROR ${idx.name}: ${err.message}`);
            errors++;
        }
    }

    console.log('═'.repeat(60));
    console.log(`Summary: ${created} created, ${skipped} already existed, ${errors} errors`);
    await conn.end();
    process.exit(errors > 0 ? 1 : 0);
}

run().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});
