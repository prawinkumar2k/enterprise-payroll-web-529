import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * Enterprise Diagnostics Service
 * Bundles system logs, database, and metadata into a secure ZIP package for beta troubleshooting.
 */
export const createDiagnosticPackage = async (userDataPath) => {
    try {
        const zip = new AdmZip();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const desktopPath = path.join(os.homedir(), 'Desktop');
        const zipFileName = `enterprise-diagnostics-${timestamp}.zip`;
        const zipPath = path.join(desktopPath, zipFileName);

        // 1. App Metadata
        const metadata = {
            version: '1.0.0-rc1',
            status: 'BETA',
            os: {
                platform: os.platform(),
                release: os.release(),
                arch: os.arch(),
                cpus: os.cpus().length,
                totalMemory: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))}GB`,
                freeMemory: `${Math.round(os.freemem() / (1024 * 1024 * 1024))}GB`
            },
            timestamp: new Date().toISOString()
        };
        zip.addFile('system-info.json', Buffer.from(JSON.stringify(metadata, null, 2), 'utf8'));

        // 2. Database (Snapshot)
        const dbPath = path.join(userDataPath, 'billing_db.sqlite');
        if (fs.existsSync(dbPath)) {
            // We append a date to the file in the zip
            zip.addLocalFile(dbPath, '', 'billing_db.sqlite');
        }

        // 3. Logs
        const logs = [
            'crash-report.log',
            'server-crash.log',
            'beta-feedback.log',
            'beta-metrics.json',
            'app.log', // General application logs if any
            'sync.log'
        ];

        logs.forEach(logName => {
            const logPath = path.join(userDataPath, logName);
            if (fs.existsSync(logPath)) {
                zip.addLocalFile(logPath);
            }
        });

        // 4. Persistence
        zip.writeZip(zipPath);

        return {
            success: true,
            filePath: zipPath,
            fileName: zipFileName
        };
    } catch (error) {
        console.error('[Diagnostics] Failed to create package:', error);
        throw error;
    }
};

/**
 * Data Integrity Check
 * Validates schema presence against MySQL (online mode) or SQLite (offline mode).
 */
export const verifyDataIntegrity = async (db) => {
    try {
        const criticalTables = ['userdetails', 'payroll_runs', 'empdet'];

        if (!db) {
            // MySQL / online mode — check via information_schema
            const { default: dbManager } = await import('../database/dbManager.js');
            for (const table of criticalTables) {
                const [rows] = await dbManager.query(
                    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
                    [table]
                );
                if (!rows || rows.length === 0) {
                    return { valid: false, reason: `Missing Critical Table: ${table}` };
                }
            }
            return { valid: true };
        }

        // SQLite offline mode — PRAGMA integrity check
        const integrity = db.prepare('PRAGMA integrity_check').get();
        if (integrity.integrity_check !== 'ok') {
            return { valid: false, reason: `SQLite Integrity Failure: ${integrity.integrity_check}` };
        }

        for (const table of criticalTables) {
            const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
            if (!result) {
                return { valid: false, reason: `Missing Critical Table: ${table}` };
            }
        }

        return { valid: true };
    } catch (error) {
        return { valid: false, reason: error.message };
    }
};
