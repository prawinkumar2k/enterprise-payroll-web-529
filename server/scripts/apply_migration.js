
import pool from '../db.js';
import { randomUUID } from 'crypto';

const tables = [
    'empdet',
    'emppay',
    'staffattendance',
    'userdetails',
    'system_settings',
    'app_settings',
    'organization_settings',
    'payroll_runs',
    'payroll_line_items'
];

async function applyMigration() {
    console.log('Starting Phase 1 Migration...');

    try {
        // 1. Create audit_logs and sync_logs
        await pool.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id CHAR(36) PRIMARY KEY,
                user_id VARCHAR(100),
                username VARCHAR(100),
                action_type VARCHAR(50),
                module VARCHAR(50),
                description TEXT,
                old_value JSON,
                new_value JSON,
                ip_address VARCHAR(50),
                device_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS sync_logs (
                id CHAR(36) PRIMARY KEY,
                table_name VARCHAR(100),
                record_uuid CHAR(36),
                action VARCHAR(20),
                status VARCHAR(20) DEFAULT 'PENDING',
                error_message TEXT,
                retry_count INT DEFAULT 0,
                device_id VARCHAR(100),
                synced_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✓ Created audit_logs and sync_logs tables');

        // 2. Enhance existing tables
        for (const table of tables) {
            console.log(`Checking table: ${table}`);

            // Get existing columns
            const [columns] = await pool.query(`SHOW COLUMNS FROM \`${table}\``);
            const colNames = columns.map(c => c.Field.toLowerCase());

            // 1. Ensure id exists (as an auto-increment int if it's new)
            if (!colNames.includes('id')) {
                console.log(`  - Adding column: id to ${table}`);
                // First check if it has any primary key
                const [keys] = await pool.query(`SHOW KEYS FROM \`${table}\` WHERE Key_name = 'PRIMARY'`);
                if (keys.length === 0) {
                    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST`);
                } else {
                    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN id INT NOT NULL AUTO_INCREMENT UNIQUE FIRST`);
                }
                // Refresh columns
                const [refreshCols] = await pool.query(`SHOW COLUMNS FROM \`${table}\``);
                colNames.splice(0, colNames.length, ...refreshCols.map(c => c.Field.toLowerCase()));
            }

            const columnsToAdd = [
                { name: 'uuid', type: 'CHAR(36)', extra: 'AFTER id' },
                { name: 'is_synced', type: 'BOOLEAN DEFAULT FALSE' },
                { name: 'sync_version', type: 'INT DEFAULT 1' },
                { name: 'device_id', type: 'VARCHAR(100)' },
                { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
                { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
                { name: 'deleted_at', type: 'TIMESTAMP NULL' }
            ];

            for (const col of columnsToAdd) {
                if (!colNames.includes(col.name.toLowerCase())) {
                    console.log(`  - Adding column: ${col.name} to ${table}`);
                    let query = `ALTER TABLE \`${table}\` ADD COLUMN \`${col.name}\` ${col.type}`;
                    if (col.extra) query += ` ${col.extra}`;
                    await pool.query(query);
                }
            }

            // Populate UUIDs for existing rows if NULL
            if (colNames.includes('uuid') || columnsToAdd.some(c => c.name === 'uuid')) {
                const [rows] = await pool.query(`SELECT id FROM \`${table}\` WHERE uuid IS NULL OR uuid = ''`);
                if (rows.length > 0) {
                    console.log(`  - Generating UUIDs for ${rows.length} rows in ${table}`);
                    // Since we are in Node, we can use crypto.randomUUID()
                    for (const row of rows) {
                        await pool.query(`UPDATE \`${table}\` SET uuid = ? WHERE id = ?`, [randomUUID(), row.id]);
                    }
                }
            }
        }

        console.log('Phase 1 Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

applyMigration();
