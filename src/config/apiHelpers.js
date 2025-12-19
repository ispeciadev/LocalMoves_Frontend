// src/config/apiHelpers.js
// Helper functions for API calls using environment variables

import env from './env';

/**
 * Build full API URL from endpoint
 * @param {string} endpoint - API endpoint (e.g., 'localmoves.api.auth.login')
 * @returns {string} Full API URL
 */
export const buildApiUrl = (endpoint) => {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    // If endpoint already includes 'api/method/', use as is
    if (cleanEndpoint.includes('api/method/')) {
        return `${env.API_BASE_URL.replace('/api/method/', '')}/${cleanEndpoint}`;
    }

    // Otherwise, append to base URL
    return `${env.API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Get base URL without '/api/method/' suffix
 * Useful for endpoints that need the base domain only
 * @returns {string} Base URL
 */
export const getBaseUrl = () => {
    return env.API_BASE_URL.replace('/api/method/', '');
};

export default {
    buildApiUrl,
    getBaseUrl,
};
