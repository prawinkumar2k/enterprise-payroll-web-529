import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        const token = localStorage.getItem('token');
        // Only fetch if authenticated — settings API requires token for tenant routing
        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            const response = await fetch('/api/settings/global', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                setIsLoading(false);
                return;
            }
            const data = await response.json();
            if (data.success) {
                setSettings(data.data);
                applyStyles(data.data);
            }
        } catch {
            console.error('Critical: Failed to load global settings');
        } finally {
            setIsLoading(false);
        }
    }, []);

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
                setSettings(prev => ({ ...prev, ...updates }));
                applyStyles({ ...settings, ...updates });
                toast.success('Settings applied globally!');
                return true;
            }
            return false;
        } catch {
            toast.error('Failed to sync settings');
            return false;
        }
    };

    // Fetch on mount (handles page-refresh while already logged in)
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Re-fetch when token changes (covers post-login in same tab via custom event,
    // or another tab via the native 'storage' event)
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'token' && e.newValue) fetchSettings();
        };
        window.addEventListener('storage', onStorage);
        window.addEventListener('settings:reload', fetchSettings);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('settings:reload', fetchSettings);
        };
    }, [fetchSettings]);

    // Helper for feature toggles
    const isEnabled = (key) => settings[key] === true || settings[key] === 'true';

    return (
        <SettingsContext.Provider value={{ settings, updateGlobalSettings, isLoading, isEnabled, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => useContext(SettingsContext);
