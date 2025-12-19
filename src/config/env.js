// src/config/env.js
// Centralized environment configuration with validation

/**
 * Environment configuration object
 * All environment variables are accessed through import.meta.env in Vite
 */
const env = {
    // API Configuration
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/method/',

    // PayPal Configuration
    PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
    PAYPAL_CURRENCY: import.meta.env.VITE_PAYPAL_CURRENCY || 'USD',
    INR_TO_USD_RATE: Number(import.meta.env.VITE_INR_TO_USD_RATE) || 85,

    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
    CLOUDINARY_FOLDER: import.meta.env.VITE_CLOUDINARY_FOLDER || 'localmoves',

    // Application Environment
    APP_ENV: import.meta.env.VITE_APP_ENV || 'development',

    // Computed values
    get IS_PRODUCTION() {
        return this.APP_ENV === 'production';
    },

    get IS_DEVELOPMENT() {
        return this.APP_ENV === 'development';
    },

    get CLOUDINARY_UPLOAD_URL() {
        return `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/auto/upload`;
    }
};

/**
 * Validate required environment variables
 * Call this during app initialization
 */
export const validateEnv = () => {
    const errors = [];

    if (!env.API_BASE_URL) {
        errors.push('VITE_API_BASE_URL is required');
    }

    if (!env.PAYPAL_CLIENT_ID && env.IS_PRODUCTION) {
        errors.push('VITE_PAYPAL_CLIENT_ID is required in production');
    }

    if (!env.CLOUDINARY_CLOUD_NAME) {
        errors.push('VITE_CLOUDINARY_CLOUD_NAME is required');
    }

    if (!env.CLOUDINARY_UPLOAD_PRESET) {
        errors.push('VITE_CLOUDINARY_UPLOAD_PRESET is required');
    }

    if (errors.length > 0) {
        console.error('Environment validation errors:', errors);
        if (env.IS_PRODUCTION) {
            throw new Error(`Missing required environment variables: ${errors.join(', ')}`);
        } else {
            console.warn('⚠️ Missing environment variables (development mode):', errors);
        }
    }

    return errors.length === 0;
};

/**
 * Log environment configuration (safe for debugging)
 * Masks sensitive values in production
 */
export const logEnvConfig = () => {
    const safeConfig = {
        API_BASE_URL: env.API_BASE_URL,
        PAYPAL_CLIENT_ID: env.PAYPAL_CLIENT_ID ? `${env.PAYPAL_CLIENT_ID.substring(0, 10)}...` : 'NOT SET',
        CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME,
        APP_ENV: env.APP_ENV,
        IS_PRODUCTION: env.IS_PRODUCTION,
        IS_DEVELOPMENT: env.IS_DEVELOPMENT,
    };

    console.log('🔧 Environment Configuration:', safeConfig);
};

export default env;
