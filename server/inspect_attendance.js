import pool from './db.js';

async function inspectAttendance() {
    try {
        const [saColumns] = await pool.query("DESCRIBE staffattendance");
        console.log("STAFFATTENDANCE_SCHEMA:", JSON.stringify(saColumns, null, 2));

        const [sarColumns] = await pool.query("DESCRIBE staffattreport");
        console.log("STAFFATTREPORT_SCHEMA:", JSON.stringify(sarColumns, null, 2));

        const [saSample] = await pool.query("SELECT * FROM staffattendance LIMIT 2");
        console.log("STAFFATTENDANCE_SAMPLE:", JSON.stringify(saSample, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

inspectAttendance();
