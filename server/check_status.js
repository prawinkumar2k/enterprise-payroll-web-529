import pool from './db.js';

async function check() {
    try {
        const [rows] = await pool.query("SELECT DISTINCT CheckStatus FROM empdet");
        console.log("CheckStatus values:", rows.map(r => r.CheckStatus));
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}
check();
