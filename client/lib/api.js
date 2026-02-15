/**
 * API Configuration
 * Supports environment-based base URL for different deployment targets.
 */

const getBaseUrl = () => {
    // If running in Electron via file:// protocol
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        return 'http://127.0.0.1:5005/api';
    }
    // Default to /api for served mode
    return import.meta.env.VITE_API_URL || '/api';
};

const API_BASE_URL = getBaseUrl();

export const getApiUrl = (path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};

export default API_BASE_URL;
