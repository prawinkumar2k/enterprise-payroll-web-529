
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function fixIndices() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const tables = ['empdet', 'emppay', 'staffattendance', 'sync_logs', 'audit_logs'];

    for (const table of tables) {
        console.log(`Checking indices for ${table}...`);
        const [indices] = await conn.query(`SHOW INDEX FROM \`${table}\``);
        const hasUuidIndex = indices.some(idx => idx.Column_name === 'uuid' || idx.Column_name === 'record_uuid' || idx.Column_name === 'id');

        // Ensure UUID is indexed and unique where appropriate
        if (['empdet', 'emppay', 'staffattendance'].includes(table)) {
            const hasUniqueUuid = indices.some(idx => idx.Column_name === 'uuid' && idx.Non_unique === 0);
            if (!hasUniqueUuid) {
                console.log(`Adding UNIQUE index to ${table}(uuid)...`);
                try {
                    await conn.query(`ALTER TABLE \`${table}\` ADD UNIQUE INDEX idx_unique_uuid (uuid)`);
                } catch (e) {
                    console.warn(`Could not add unique index to ${table}: ${e.message}`);
                }
            }
        }

        // Ensure updated_at is indexed for Pull performance
        const hasUpdatedAtIdx = indices.some(idx => idx.Column_name === 'updated_at');
        if (!hasUpdatedAtIdx && !['sync_logs', 'audit_logs'].includes(table)) {
            console.log(`Adding index to ${table}(updated_at)...`);
            await conn.query(`ALTER TABLE \`${table}\` ADD INDEX idx_updated_at (updated_at)`);
        }
    }

    console.log('Index optimization complete.');
    await conn.end();
}

fixIndices().catch(console.error);
