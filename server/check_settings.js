import pool from './db.js';

async function checkSettings() {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM app_settings');
        console.log('Total settings records:', rows[0].count);

        const [sample] = await pool.query('SELECT setting_key, setting_value, category FROM app_settings ORDER BY category, setting_key LIMIT 20');
        console.log('Sample settings:');
        sample.forEach(s => console.log(`  ${s.category || 'general'}: ${s.setting_key} = ${s.setting_value}`));

        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

checkSettings();
