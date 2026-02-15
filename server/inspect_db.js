import pool from './db.js';
import fs from 'fs';

async function inspect() {
    try {
        let output = "";
        const tables = ['emppay', 'empdet', 'userlogs'];
        for (const table of tables) {
            output += `--- ${table} ---\n`;
            const [cols] = await pool.query(`DESCRIBE \`${table}\``);
            cols.forEach(c => {
                output += `${c.Field} (${c.Type})\n`;
            });
            output += "\n";
        }
        fs.writeFileSync('schema_dump.txt', output);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
inspect();
