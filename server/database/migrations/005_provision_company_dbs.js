/**
 * Migration: Provision per-company databases for existing companies.
 * Run once: node server/database/migrations/005_provision_company_dbs.js
 *
 * What this does:
 * 1. Adds company_code column to billing_db.refresh_tokens (for tenant context on renewal)
 * 2. Provisions payroll_DEFAULT database
 * 3. Migrates all existing billing_db payroll tables → payroll_DEFAULT
 * 4. Provisions databases for any other companies in billing_db
 */
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import db from '../../db.js';
import { provisionCompanyDb, companyDbExists } from '../provisionCompanyDb.js';
import { getTenantPool, getDbName } from '../tenantDbManager.js';

// Only migrate legacy billing_db data into the DEFAULT company (id=1).
// All other companies are new tenants that start with empty databases.
const DEFAULT_COMPANY_CODE = 'DEFAULT';

// Tables to migrate INTO payroll_DEFAULT from billing_db.
// 'userdetails' is special: filtered by company_id=1.
// All other tables have no company_id, so all rows belong to Default Company.
const TABLES_TO_MIGRATE = [
    'userdetails', 'empdet', 'emppay', 'staffattendance', 'staffattreport',
    'payroll_runs', 'payroll_line_items', 'payroll_reversals', 'audit_logs',
    'app_settings', 'organization_settings', 'system_settings',
    'userlogs', 'logdetails', 'billded', 'daarrear', 'repabstract', 'temppay',
    'activate', 'sync_batches', 'sync_logs', 'schema_versions',
    'login_attempts', 'refresh_tokens'
];

async function run() {
    console.log('=== Migration 005: Provision Per-Company Databases ===\n');

    // ─── Step 1: Add company_code column to billing_db.refresh_tokens ───────────
    console.log('[1/4] Adding company_code column to refresh_tokens...');
    try {
        await db.execute(`ALTER TABLE refresh_tokens ADD COLUMN company_code VARCHAR(50) DEFAULT 'DEFAULT' AFTER expires_at`);
        console.log('      ✓ Added company_code column.');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME' || e.errno === 1060) {
            console.log('      ✓ company_code column already exists.');
        } else {
            throw e;
        }
    }

    // ─── Step 2: Get all companies ───────────────────────────────────────────────
    const [companies] = await db.query('SELECT id, company_code, company_name FROM companies ORDER BY id');
    console.log(`\n[2/4] Found ${companies.length} companies: ${companies.map(c => c.company_code).join(', ')}`);

    for (const company of companies) {
        const code = company.company_code.toUpperCase();
        const dbName = getDbName(code);

        // ─── Step 3: Provision DB if not exists ─────────────────────────────────
        const exists = await companyDbExists(code);
        if (exists) {
            console.log(`\n      [${code}] Database ${dbName} already exists — skipping creation.`);
        } else {
            console.log(`\n      [${code}] Provisioning ${dbName}...`);
            await provisionCompanyDb(code, company.id);
        }

        // ─── Step 4: Migrate data ONLY for DEFAULT company ──────────────────────
        // New companies (non-DEFAULT) start with empty databases — no data to migrate
        if (code !== DEFAULT_COMPANY_CODE) {
            console.log(`      [${code}] New company — starting with empty database (no migration needed).`);
            console.log(`      [${code}] ✓ Done.`);
            continue;
        }

        console.log(`      [${code}] Migrating legacy data from billing_db...`);
        const tenantPool = getTenantPool(code);

        for (const table of TABLES_TO_MIGRATE) {
            try {
                // Check if source table exists in billing_db
                const [[{ cnt }]] = await db.query(
                    `SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
                    [table]
                );
                if (!cnt) { continue; }

                // Count rows in source
                const [[srcRow]] = await db.query(`SELECT COUNT(*) as c FROM \`${table}\``);
                if (!srcRow.c) { continue; }

                // Check if target table is empty (avoid re-migrating)
                let destCount = 0;
                try {
                    const [[destRow]] = await tenantPool.query(`SELECT COUNT(*) as c FROM \`${table}\``);
                    destCount = destRow.c;
                } catch (e) { continue; } // table may not exist yet

                if (destCount > 0) {
                    console.log(`        [skip] ${table} (already has ${destCount} rows in ${dbName})`);
                    continue;
                }

                // Copy data (for userdetails filter by company_id)
                let [rows] = table === 'userdetails'
                    ? await db.query(`SELECT * FROM \`${table}\` WHERE company_id = ?`, [company.id])
                    : await db.query(`SELECT * FROM \`${table}\``);

                if (!rows.length) continue;

                // Build INSERT ... SELECT style transfer
                const cols = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
                const placeholders = Object.keys(rows[0]).map(() => '?').join(', ');
                let inserted = 0;
                for (const row of rows) {
                    try {
                        await tenantPool.execute(
                            `INSERT IGNORE INTO \`${table}\` (${cols}) VALUES (${placeholders})`,
                            Object.values(row)
                        );
                        inserted++;
                    } catch (err) {
                        // Skip duplicate rows silently
                    }
                }
                console.log(`        ✓ ${table}: migrated ${inserted}/${rows.length} rows → ${dbName}`);
            } catch (e) {
                console.warn(`        ⚠ ${table}: ${e.message}`);
            }
        }

        console.log(`      [${code}] ✓ Done.`);
    }

    console.log('\n=== Migration 005 Complete ===');
    process.exit(0);
}

run().catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
});
