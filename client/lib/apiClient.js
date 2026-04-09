/**
 * apiClient.js — Enterprise-Grade API Client
 *
 * Features:
 *  - Auto-attach Bearer token from localStorage
 *  - 401 → auto-redirect to /login
 *  - Request deduplication (prevents duplicate GET requests for same URL)
 *  - Retry with exponential backoff on network errors / 5xx
 *  - pollJob() helper for background job progress tracking
 *  - apiFetch / apiGet / apiPost / apiPut / apiDelete exports (unchanged API)
 */

// ─── Config ───────────────────────────────────────────────────────────────────
const RETRY_ATTEMPTS = 2;          // Retry count for transient errors
const RETRY_BASE_MS = 500;        // Starting backoff: 500ms, 1000ms...
const DEDUP_WINDOW_MS = 300;        // Time window to deduplicate identical GETs

// ─── Inflight GET deduplication ───────────────────────────────────────────────
// If two components request the same URL within DEDUP_WINDOW_MS, they share
// one network request instead of making two.
const inflightGets = new Map();

// ─── Token helpers ────────────────────────────────────────────────────────────
const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        return 'http://127.0.0.1:5005/api';
    }
    return import.meta.env.VITE_API_URL || '/api';
};

const API_BASE_URL = getBaseUrl();

export const getApiUrl = (path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};

const getToken = () => localStorage.getItem('token');

const handleUnauthorized = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const loginPath = window.location.href.includes('#')
        ? (window.location.pathname + '#/login')
        : '/login';
    window.location.href = loginPath;
};

// ─── Core fetch with retry ────────────────────────────────────────────────────
async function _fetchWithRetry(url, options = {}, attemptsLeft = RETRY_ATTEMPTS) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            handleUnauthorized();
            throw new Error('Session expired. Please log in again.');
        }

        // Retry on 5xx server errors (transient)
        if (response.status >= 500 && attemptsLeft > 0) {
            const delay = RETRY_BASE_MS * (RETRY_ATTEMPTS - attemptsLeft + 1);
            console.warn(`[API] ${response.status} on ${url}. Retrying in ${delay}ms...`);
            await _sleep(delay);
            return _fetchWithRetry(url, options, attemptsLeft - 1);
        }

        const data = await response.json().catch(() => ({
            success: false,
            message: 'Invalid server response'
        }));

        if (!response.ok || data.success === false) {
            const err = new Error(data.message || `Request failed: ${response.status}`);
            err.code = data.code;
            err.status = response.status;
            err.data = data;
            // Don't retry 4xx client errors
            throw err;
        }

        return data;

    } catch (err) {
        // Retry on network errors (no response at all)
        if (!err.status && attemptsLeft > 0) {
            const delay = RETRY_BASE_MS * (RETRY_ATTEMPTS - attemptsLeft + 1);
            console.warn(`[API] Network error on ${url}. Retrying in ${delay}ms...`);
            await _sleep(delay);
            return _fetchWithRetry(url, options, attemptsLeft - 1);
        }
        throw err;
    }
}

function _sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Core fetch — all other methods call this.
 */
export const apiFetch = (url, options = {}) => {
    return _fetchWithRetry(url, options);
};

/**
 * GET with deduplication — multiple calls to the same URL within
 * DEDUP_WINDOW_MS share a single in-flight request.
 */
export const apiGet = (url) => {
    const existing = inflightGets.get(url);
    if (existing) return existing;

    const promise = _fetchWithRetry(url).finally(() => {
        // Clean up after a short window so next call can re-fetch
        setTimeout(() => inflightGets.delete(url), DEDUP_WINDOW_MS);
    });

    inflightGets.set(url, promise);
    return promise;
};

export const apiPost = (url, body) => apiFetch(url, { method: 'POST', body: JSON.stringify(body) });
export const apiPut = (url, body) => apiFetch(url, { method: 'PUT', body: JSON.stringify(body) });
export const apiDelete = (url) => apiFetch(url, { method: 'DELETE' });
export const apiPatch = (url, body) => apiFetch(url, { method: 'PATCH', body: JSON.stringify(body) });

/**
 * Auth header helper for multipart/form-data (file uploads).
 */
export const getAuthHeader = () => {
    const t = getToken();
    return t ? { 'Authorization': `Bearer ${t}` } : {};
};

// ─── Background Job Poller ────────────────────────────────────────────────────

/**
 * Poll a background job until it finishes (done or failed).
 *
 * @param {string}   jobId        returned from POST /api/salary/generate
 * @param {string}   statusUrl    URL to poll, e.g. '/api/salary/jobs/:id'
 * @param {object}   options
 * @param {number}   options.intervalMs   Polling interval (default: 1000ms)
 * @param {number}   options.timeoutMs    Max wait time  (default: 300000 = 5 min)
 * @param {Function} options.onProgress   (progress: 0-100, message: string) => void
 * @returns {Promise<object>} Resolved with job.result on success
 *
 * @example
 * const { jobId } = await apiPost('/api/salary/generate', { monthYear });
 * const result = await pollJob(jobId, `/api/salary/jobs/${jobId}`, {
 *   onProgress: (pct, msg) => setProgress({ pct, msg })
 * });
 */
export async function pollJob(jobId, statusUrl, options = {}) {
    const {
        intervalMs = 1000,
        timeoutMs = 300_000,
        onProgress = null,
    } = options;

    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        const { job } = await apiGet(statusUrl);

        if (onProgress) {
            onProgress(job.progress || 0, job.message || '');
        }

        if (job.status === 'done') {
            return job.result;
        }
        if (job.status === 'failed') {
            const err = new Error(job.error || 'Background job failed');
            err.jobId = jobId;
            throw err;
        }

        // Still running — wait, then poll again
        await _sleep(intervalMs);
    }

    throw new Error(`Job ${jobId} timed out after ${timeoutMs / 1000}s`);
}

export default apiFetch;
