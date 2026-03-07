/**
 * Migration: Add income_expense table + feature flags to all existing tenant DBs.
 * Run once: node server/migrations/migrate_income_expense.js
 */
import dbManager from '../database/dbManager.js';
import { getAdminConnection } from '../database/tenantDbManager.js';
import mysqlPool from '../db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS \`income_expense\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`type\` enum('income','expense') NOT NULL,
  \`category\` varchar(100) NOT NULL,
  \`description\` varchar(500) DEFAULT NULL,
  \`amount\` decimal(15,2) NOT NULL DEFAULT '0.00',
  \`transaction_date\` date NOT NULL,
  \`month_year\` varchar(7) NOT NULL COMMENT 'MM-YYYY',
  \`reference_no\` varchar(100) DEFAULT NULL,
  \`remarks\` text,
  \`created_by\` varchar(100) DEFAULT NULL,
  \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_ie_type\` (\`type\`),
  KEY \`idx_ie_month_year\` (\`month_year\`),
  KEY \`idx_ie_transaction_date\` (\`transaction_date\`),
  KEY \`idx_ie_category\` (\`category\`),
  KEY \`idx_ie_deleted\` (\`deleted_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
`;

const FEATURE_FLAGS = [
    ['enable_income',  'true', 'features'],
    ['enable_expense', 'true', 'features'],
];

async function migrateDb(conn, dbName) {
    await conn.query(`USE \`${dbName}\``);
    await conn.query(CREATE_TABLE_SQL);
    for (const [key, val, cat] of FEATURE_FLAGS) {
        await conn.query(
            `INSERT IGNORE INTO app_settings (setting_key, setting_value, category) VALUES (?, ?, ?)`,
            [key, val, cat]
        );
    }
    console.log(`  ✓ ${dbName} migrated`);
}

async function run() {
    // Discover all payroll_* databases
    const conn = await getAdminConnection();
    try {
        const [rows] = await conn.query(
            `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME LIKE 'payroll_%'`
        );
        console.log(`Found ${rows.length} tenant databases.`);
        for (const { SCHEMA_NAME } of rows) {
            await migrateDb(conn, SCHEMA_NAME);
        }
        console.log('\nMigration complete.');
    } finally {
        await conn.end();
    }
    process.exit(0);
}

run().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
