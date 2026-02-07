/**
 * API Configuration
 * Supports environment-based base URL for different deployment targets.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getApiUrl = (path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};

export default API_BASE_URL;
