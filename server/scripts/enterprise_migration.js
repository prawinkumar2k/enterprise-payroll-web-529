import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * ENTERPRISE DATABASE MIGRATION (V2)
 * Upgrades existing tables with cloud-ready metadata columns.
 * Supports: UUIDs, Sync Flags, Device IDs, and Soft Deletes.
 */

const TABLES_TO_UPGRADE = [
    'empdet',
    'emppay',
    'payroll_runs',
    'payroll_line_items',
    'staffattendance',
    'userdetails',
    'app_settings'
];

async function migrate() {
    console.log('🚀 Starting Enterprise Database Migration...');

    for (const table of TABLES_TO_UPGRADE) {
        try {
            console.log(`\n📦 Upgrading table: ${table}`);

            // 1. Add Columns if they don't exist
            const [columns] = await pool.query(`DESCRIBE ${table}`);
            const colNames = columns.map(c => c.Field);

            const migrations = [
                { name: 'uuid', query: `ALTER TABLE ${table} ADD COLUMN uuid CHAR(36) UNIQUE AFTER id` },
                { name: 'device_id', query: `ALTER TABLE ${table} ADD COLUMN device_id VARCHAR(100) DEFAULT 'MASTER'` },
                { name: 'is_synced', query: `ALTER TABLE ${table} ADD COLUMN is_synced BOOLEAN DEFAULT FALSE` },
                { name: 'sync_version', query: `ALTER TABLE ${table} ADD COLUMN sync_version INT DEFAULT 1` },
                { name: 'created_at', query: `ALTER TABLE ${table} ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` },
                { name: 'updated_at', query: `ALTER TABLE ${table} ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` },
                { name: 'deleted_at', query: `ALTER TABLE ${table} ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL` }
            ];

            for (const m of migrations) {
                if (!colNames.includes(m.name)) {
                    console.log(`   + Adding column: ${m.name}`);
                    await pool.query(m.query);
                }
            }

            // 2. Backfill UUIDs for existing rows where uuid is NULL
            const [rows] = await pool.query(`SELECT id FROM ${table} WHERE uuid IS NULL`);
            if (rows.length > 0) {
                console.log(`   ⚙ Backfilling UUIDs for ${rows.length} rows...`);
                for (const row of rows) {
                    await pool.query(`UPDATE ${table} SET uuid = ? WHERE id = ?`, [uuidv4(), row.id]);
                }
            }

            console.log(`✅ Table ${table} is now Enterprise Ready.`);

        } catch (error) {
            console.error(`❌ Error upgrading ${table}:`, error.message);
        }
    }

    console.log('\n✨ Global Migration Complete.');
    process.exit(0);
}

// Note: Requires 'uuid' package. If not present, we can use a fallback generator or install it.
migrate();
