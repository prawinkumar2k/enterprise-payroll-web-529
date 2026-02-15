import pool from './db.js';

async function seedAttendanceSettings() {
    console.log("Seeding Attendance Settings...");

    const settings = [
        ['attendance_status_codes', 'Present,Absent,CL,ML,OD,L,WO,H', 'attendance'],
        ['working_days_per_month', '30', 'attendance'],
        ['week_off_days', 'Sunday', 'attendance'],
        ['lop_enabled', 'true', 'attendance'],
        ['lock_attendance_after_payroll', 'true', 'attendance']
    ];

    try {
        for (const [key, val, cat] of settings) {
            await pool.query(
                `INSERT INTO app_settings (setting_key, setting_value, category) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), category = VALUES(category)`,
                [key, val, cat]
            );
            console.log(`✓ Set ${key}`);
        }
        console.log("Attendance settings seeded successfully.");
    } catch (error) {
        console.error("Error seeding settings:", error);
    } finally {
        process.exit();
    }
}

seedAttendanceSettings();
