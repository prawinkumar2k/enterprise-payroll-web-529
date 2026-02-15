import dbManager from '../database/dbManager.js';

/**
 * GET ALL SETTINGS
 * Returns a flattened object: { setting_key: setting_value }
 */
export const getAllSettings = async (req, res) => {
    try {
        const [rows] = await dbManager.query('SELECT setting_key, setting_value FROM app_settings');
        const settings = {};
        if (rows && Array.isArray(rows)) {
            rows.forEach(row => {
                // Automatically parse booleans and numbers where possible
                let val = row.setting_value;
                if (val === 'true') val = true;
                if (val === 'false') val = false;
                settings[row.setting_key] = val;
            });
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching global settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * BULK UPDATE SETTINGS
 * Expects an object: { [key]: value }
 */
export const updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        const keys = Object.keys(updates);

        if (keys.length === 0) {
            return res.status(400).json({ success: false, message: 'No settings provided' });
        }

        // Execute as a transaction for safety
        const connection = await dbManager.getConnection();
        await connection.beginTransaction();

        try {
            for (const key of keys) {
                const value = String(updates[key]); // Store all as string
                // Use INSERT OR REPLACE for SQLite compatibility and robustness
                await connection.query(
                    'INSERT OR REPLACE INTO app_settings (setting_key, setting_value) VALUES (?, ?)',
                    [key, value]
                );
            }
            await connection.commit();
            res.json({ success: true, message: 'Global settings updated successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error updating global settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
