import dbManager from '../database/dbManager.js';

/**
 * GET ALL SETTINGS — Returns flattened { setting_key: setting_value }
 * Runtime immune: returns empty settings object on DB error, never 500.
 */
export const getAllSettings = async (req, res) => {
    try {
        const [rows] = await dbManager.query('SELECT setting_key, setting_value FROM app_settings');
        const settings = {};
        if (rows && Array.isArray(rows)) {
            rows.forEach(row => {
                let val = row.setting_value;
                if (val === 'true') val = true;
                if (val === 'false') val = false;
                settings[row.setting_key] = val;
            });
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('[Settings] Error fetching settings:', error.message);
        // Return empty settings — never block app startup with a 500
        res.json({ success: true, data: {} });
    }
};

/**
 * BULK UPDATE SETTINGS — Expects { [key]: value }
 * Uses dualDB transaction for atomic dual-write to MySQL + SQLite.
 */
export const updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        const keys = Object.keys(updates || {});

        if (keys.length === 0) {
            return res.status(400).json({ success: false, message: 'No settings provided' });
        }

        // Use dualDB transaction for atomic dual-database update
        await dbManager.transaction(async (db) => {
            for (const key of keys) {
<<<<<<< HEAD
                const value = String(updates[key]); // Store all as string
                // Use REPLACE INTO for cross-database compatibility (MySQL + SQLite)
                await connection.query(
                    'REPLACE INTO app_settings (setting_key, setting_value) VALUES (?, ?)',
=======
                const value = String(updates[key]);
                await db.execute(
                    `INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)
                     ON CONFLICT(setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = datetime('now','localtime')`,
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
                    [key, value]
                );
            }
        });

        res.json({ success: true, message: 'Global settings updated successfully' });
    } catch (error) {
        console.error('[Settings] Error updating settings:', error.message);
        res.status(400).json({ success: false, message: error.message || 'Failed to update settings' });
    }
};
