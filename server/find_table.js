import pool from './db.js';

async function findTable() {
    try {
        const [dbs] = await pool.query("SHOW DATABASES");
        console.log("Databases:", dbs.map(d => d.Database));

        for (const db of dbs) {
            const dbName = db.Database;
            try {
                const [tables] = await pool.query(`SHOW TABLES FROM \`${dbName}\``);
                const tableList = tables.map(t => Object.values(t)[0]);
                if (tableList.includes('organization_settings')) {
                    console.log(`FOUND organization_settings in ${dbName}`);
                }
            } catch (e) { }
        }
        process.exit(0);
    } catch (error) {
        console.error("Failed:", error);
        process.exit(1);
    }
}

findTable();
