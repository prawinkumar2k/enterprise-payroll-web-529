import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings/global', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setSettings(data.data);
                // Apply Global Print Variables
                applyStyles(data.data);
            }
        } catch (error) {
            console.error("Critical: Failed to load global settings");
        } finally {
            setIsLoading(false);
        }
    };

    const applyStyles = (s) => {
        if (!s) return;
        const root = document.documentElement;
        root.style.setProperty('--print-font-family', s.print_font_family || 'Times New Roman');
        root.style.setProperty('--print-font-size', s.print_font_size || '10pt');
        root.style.setProperty('--print-table-font-size', s.print_table_font_size || '9pt');
    };

    const updateGlobalSettings = async (updates) => {
        try {
            const response = await fetch('/api/settings/global', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updates)
            });
            const data = await response.json();
            if (data.success) {
                // Instantly update global state for "Live Reflection"
                setSettings(prev => ({ ...prev, ...updates }));
                applyStyles({ ...settings, ...updates });
                toast.success("Settings applied globally!");
                return true;
            }
            return false;
        } catch (error) {
            toast.error("Failed to sync settings");
            return false;
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // Helper for feature toggles
    const isEnabled = (key) => settings[key] === true || settings[key] === 'true';

    return (
        <SettingsContext.Provider value={{ settings, updateGlobalSettings, isLoading, isEnabled, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
