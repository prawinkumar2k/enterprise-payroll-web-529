import fs from 'fs';
import path from 'path';

/**
 * Enterprise Backup Service
 * Manages automated SQLite database rotation and retention.
 */
class BackupService {
    constructor() {
        this.dataPath = process.env.DATA_PATH || process.cwd();
        this.dbPath = path.join(this.dataPath, 'local_payroll.db');
        this.backupDir = path.join(this.dataPath, 'backups');
        this.retentionCount = 7; // Keep last 7 days

        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    /**
     * Perform an automated backup
     */
    async performBackup() {
        try {
            if (!fs.existsSync(this.dbPath)) return { success: false, error: 'DB_NOT_FOUND' };

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const destPath = path.join(this.backupDir, `backup-${timestamp}.sqlite`);

            // Use synchronous copy to ensure file is locked/flushed properly in Node
            fs.copyFileSync(this.dbPath, destPath);

            this.rotateBackups();

            console.log(`[BackupService] Snapshot created: ${destPath}`);
            return { success: true, path: destPath };
        } catch (error) {
            console.error('[BackupService] Backup failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Clean up old backups based on retention policy
     */
    rotateBackups() {
        try {
            const files = fs.readdirSync(this.backupDir)
                .filter(f => f.startsWith('backup-'))
                .map(f => ({ name: f, time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time);

            if (files.length > this.retentionCount) {
                const toDelete = files.slice(this.retentionCount);
                toDelete.forEach(f => fs.unlinkSync(path.join(this.backupDir, f.name)));
            }
        } catch (e) { }
    }

    /**
     * Restore from a specific backup file
     */
    async restoreBackup(backupFileName) {
        const sourcePath = path.join(this.backupDir, backupFileName);
        if (!fs.existsSync(sourcePath)) throw new Error('BACKUP_FILE_NOT_FOUND');

        // Safety: Backup current DB before overwrite
        const safetyPath = this.dbPath + '.bak';
        if (fs.existsSync(this.dbPath)) fs.copyFileSync(this.dbPath, safetyPath);

        try {
            fs.copyFileSync(sourcePath, this.dbPath);
            return { success: true };
        } catch (err) {
            if (fs.existsSync(safetyPath)) fs.copyFileSync(safetyPath, this.dbPath);
            throw err;
        }
    }
}

export default new BackupService();
