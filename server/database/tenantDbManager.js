/**
 * Tenant DB Manager
 * ─────────────────
 * Each company gets its own MySQL database: payroll_<COMPANY_CODE>
 * Uses Node.js AsyncLocalStorage so ALL dbManager calls within a request
 * automatically route to the correct company DB — zero controller changes needed.
 */
import mysql from 'mysql2/promise';
import { AsyncLocalStorage } from 'async_hooks';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// Per-request tenant storage
const tenantStorage = new AsyncLocalStorage();

// Pool cache: companyCode -> mysql Pool
const tenantPools = new Map();

/** Derives DB name from company code */
export function getDbName(companyCode) {
    return `payroll_${companyCode.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
}

/** Get (or create) a pool for the given company code */
export function getTenantPool(companyCode) {
    const code = companyCode || tenantStorage.getStore();
    if (!code) return null;

    if (!tenantPools.has(code)) {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: getDbName(code),
            timezone: 'Z',
            waitForConnections: true,
            connectionLimit: 5,
            queueLimit: 0,
        });
        tenantPools.set(code, pool);
    }
    return tenantPools.get(code);
}

/** Get a raw admin connection (no database selected) for provisioning */
export async function getAdminConnection() {
    return mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true,
    });
}

/** Run fn with company code set in AsyncLocalStorage */
export function runWithTenant(companyCode, fn) {
    return tenantStorage.run(companyCode, fn);
}

/** Get the company code currently in context (for this request) */
export function getCurrentTenant() {
    return tenantStorage.getStore();
}

/** Remove a cached pool (e.g. after deleting a company) */
export function evictTenantPool(companyCode) {
    if (tenantPools.has(companyCode)) {
        tenantPools.get(companyCode).end().catch(() => {});
        tenantPools.delete(companyCode);
    }
}

export default { getDbName, getTenantPool, getAdminConnection, runWithTenant, getCurrentTenant, evictTenantPool };
