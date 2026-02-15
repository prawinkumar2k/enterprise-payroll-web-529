import pool from './db.js';

async function list() {
    try {
        const [tables] = await pool.query("SHOW TABLES");
        const list = tables.map(t => Object.values(t)[0]);
        console.log(JSON.stringify(list, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
list();
