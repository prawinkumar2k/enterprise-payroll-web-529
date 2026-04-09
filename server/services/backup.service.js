import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
const execute = util.promisify(exec);

/**
 * Enterprise MySQL Backup Service (Single-Tenant)
 */
class BackupService {
    constructor() {
        this.backupDir = path.join(process.cwd(), 'backups');
        this.retentionCount = 30; // Keep 30 days of backups

        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async performBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `payroll_backup_${timestamp}.sql`;
        const destPath = path.join(this.backupDir, filename);

        const host = process.env.DB_HOST || 'localhost';
        const user = process.env.DB_USER || 'root';
        const password = process.env.DB_PASSWORD || '';
        const database = process.env.DB_NAME || 'payroll_system';

        try {
            // Use mysqldump for consistent backups
            const cmd = `mysqldump -h ${host} -u ${user} -p${password} ${database} > "${destPath}"`;
            await execute(cmd);
            
            this.rotateBackups();
            console.log(`[BackupService] MySQL snapshot created: ${filename}`);
            return { success: true, path: destPath };
        } catch (error) {
            console.error('[BackupService] MySQL backup failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    rotateBackups() {
        try {
            const files = fs.readdirSync(this.backupDir)
                .filter(f => f.startsWith('payroll_backup_'))
                .map(f => ({ name: f, time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time);

            if (files.length > this.retentionCount) {
                const toDelete = files.slice(this.retentionCount);
                toDelete.forEach(f => fs.unlinkSync(path.join(this.backupDir, f.name)));
            }
        } catch (e) { }
    }
}

export default new BackupService();
