import { useEffect, useState } from 'react';

/**
 * Fetches /api/reports/available-months and returns the latest {month, year}
 * to be used as the default filter for all report pages.
 */
export function useLatestMonthYear() {
    const [latest, setLatest] = useState(null);
    const [availableYears, setAvailableYears] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch('/api/reports/available-months', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(r => r.json())
            .then(data => {
                if (data.success && data.latest) {
                    setLatest(data.latest);
                    setAvailableYears(data.years || []);
                }
            })
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, []);

    return { latest, availableYears, loaded };
}
