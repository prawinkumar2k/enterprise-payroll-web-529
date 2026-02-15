
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enterprise Schema Migration Engine (Refactored for async sqlite3 compatibility)
 * Ensures database schema is up-to-date across versions.
 */
class MigrationEngine {
    constructor(db) {
        this.db = db;
        this.migrationsPath = path.join(__dirname, '../migrations');
        if (!fs.existsSync(this.migrationsPath)) {
            fs.mkdirSync(this.migrationsPath, { recursive: true });
        }
    }

    /**
     * Start the migration process
     */
    async migrate() {
        console.log('[Migration] Checking schema version...');

        try {
            // 1. Ensure schema_versions table exists
            await this.db.exec(`
                CREATE TABLE IF NOT EXISTS schema_versions (
                    version_id INTEGER PRIMARY KEY,
                    version_name TEXT,
                    applied_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 2. Get current version
            const row = await this.db.prepare('SELECT MAX(version_id) as current FROM schema_versions').get();
            const currentVersion = (row && row.current) || 0;

            // 3. Collect and sort migrations
            const files = fs.readdirSync(this.migrationsPath)
                .filter(f => f.endsWith('.sql'))
                .sort();

            let appliedCount = 0;
            for (const file of files) {
                const versionId = parseInt(file.split('_')[0]);
                if (versionId > currentVersion) {
                    console.log(`[Migration] Applying version ${versionId}: ${file}`);
                    const sql = fs.readFileSync(path.join(this.migrationsPath, file), 'utf8');

                    // Wrap in transaction
                    try {
                        await this.db.transaction(async () => {
                            // Split SQL into individual statements to handle potential "column already exists" errors
                            const statements = sql.split(';').filter(s => s.trim() !== '');
                            for (let statement of statements) {
                                try {
                                    await this.db.exec(statement);
                                } catch (stmtError) {
                                    if (stmtError.message.includes('duplicate column name')) {
                                        console.log(`[Migration] Column already exists in ${file}, skipping statement.`);
                                    } else {
                                        throw stmtError;
                                    }
                                }
                            }

                            await this.db.prepare('INSERT OR REPLACE INTO schema_versions (version_id, version_name) VALUES (?, ?)')
                                .run([versionId, file]);
                        });
                        appliedCount++;
                    } catch (err) {
                        console.error(`[Migration] Failed version ${versionId}:`, err.message);
                        throw err;
                    }
                }
            }

            if (appliedCount > 0) {
                console.log(`✓ [Migration] Successfully applied ${appliedCount} schema updates.`);
            } else {
                console.log('✓ [Migration] Schema is up to date.');
            }
        } catch (error) {
            console.error('[Migration] Failed:', error);
            throw error;
        }
    }
}

export default MigrationEngine;
