/**
 * Provision a new MySQL database for a company.
 * Called when a new company is created via Super Admin.
 * Creates: payroll_<COMPANY_CODE> and runs companySchema.sql inside it.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAdminConnection, getDbName } from './tenantDbManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_FILE = path.join(__dirname, 'companySchema.sql');

/**
 * Provision database for a given company code.
 * @param {string} companyCode  e.g. "SF001"
 * @param {number} companyId    numeric id in billing_db.companies
 * @param {object} [orgDetails] optional org settings seeded on creation
 *   { org_name, org_address, org_phone, org_email }
 */
export async function provisionCompanyDb(companyCode, companyId, orgDetails = {}) {
    const dbName = getDbName(companyCode);
    console.log(`[Provision] Creating database: ${dbName}`);

    const conn = await getAdminConnection();
    try {
        // 1. Create database
        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
        console.log(`[Provision] Database ${dbName} ready.`);

        // 2. Select it
        await conn.query(`USE \`${dbName}\``);

        // 3. Run schema — split on semicolons, execute each statement
        const schemaSql = readFileSync(SCHEMA_FILE, 'utf8');
        const statements = schemaSql
            .split(';')
            .map(s => s.trim())
            .filter(s => {
                if (!s.length) return false;
                // Strip comment lines, check if anything substantive remains
                const nonComment = s.split('\n').filter(l => !l.trim().startsWith('--')).join('\n').trim();
                return nonComment.length > 0;
            });

        for (const stmt of statements) {
            try {
                // Strip leading comment lines before executing
                const cleanedStmt = stmt.split('\n')
                    .filter(l => !l.trim().startsWith('--'))
                    .join('\n')
                    .trim();
                if (!cleanedStmt) continue;
                await conn.query(cleanedStmt);
            } catch (err) {
                // Ignore "already exists" errors — schema is idempotent
                if (err.code !== 'ER_TABLE_EXISTS_ERROR' && err.errno !== 1050) {
                    console.warn(`[Provision] Stmt warning (${err.code}): ${stmt.substring(0, 60)}...`);
                }
            }
        }

        // 4. Record schema version
        await conn.query(
            `INSERT IGNORE INTO schema_versions (version_id, version_name) VALUES (1, 'initial_company_schema')`
        );

        // 5. Seed default app_settings for this company
        const defaultSettings = [
            ['org_name',                 orgDetails.org_name    || companyCode, 'organization'],
            ['org_address',              orgDetails.org_address || '',          'organization'],
            ['org_phone',                orgDetails.org_phone   || '',          'organization'],
            ['org_email',                orgDetails.org_email   || '',          'organization'],
            ['org_logo_url',             '',                 'organization'],
            ['title_pay_bill',           'Pay Bill',         'reports'],
            ['title_bank_statement',     'Bank Statement',   'reports'],
            ['title_abstract_1',         'Pay Abstract',     'reports'],
            ['title_abstract_2',         'Pay Abstract II',  'reports'],
            ['title_staff_master',       'Staff Master',     'reports'],
            ['title_pay_certificate',    'Pay Certificate',  'reports'],
            ['enable_attendance',        'true',             'features'],
            ['enable_reports',           'true',             'features'],
            ['enable_salary',            'true',             'features'],
            ['enable_income',            'true',             'features'],
            ['enable_expense',           'true',             'features'],
            ['print_font_family',        'Times New Roman',  'print'],
            ['print_font_size',          '10pt',             'print'],
            ['print_table_font_size',    '9pt',              'print'],
            ['print_show_timestamp',     'true',             'print'],
            ['sig_1_label',              'Prepared By',      'signatures'],
            ['sig_2_label',              'Checked By',       'signatures'],
            ['sig_3_label',              'Approved By',      'signatures'],
            ['sig_4_label',              'Authorized By',    'signatures'],
        ];
        for (const [key, val, cat] of defaultSettings) {
            await conn.query(
                'INSERT IGNORE INTO app_settings (setting_key, setting_value, category) VALUES (?, ?, ?)',
                [key, val, cat]
            );
        }
        console.log(`[Provision] app_settings seeded for ${dbName}.`);

        console.log(`[Provision] ✓ ${dbName} fully provisioned (${statements.length} statements).`);
        return { success: true, dbName };
    } finally {
        await conn.end();
    }
}

/**
 * Check if a company DB already exists.
 */
export async function companyDbExists(companyCode) {
    const dbName = getDbName(companyCode);
    const conn = await getAdminConnection();
    try {
        const [rows] = await conn.query(
            `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
            [dbName]
        );
        return rows.length > 0;
    } finally {
        await conn.end();
    }
}

/**
 * Drop a company database (use with caution — called on company delete).
 */
export async function dropCompanyDb(companyCode) {
    const dbName = getDbName(companyCode);
    const conn = await getAdminConnection();
    try {
        await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
        console.log(`[Provision] Dropped database: ${dbName}`);
    } finally {
        await conn.end();
    }
}
