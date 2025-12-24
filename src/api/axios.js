// src/api/axios.js
import axios from "axios";
import env from "../config/env";

// Global axios configuration to prevent 417 errors
// Remove Expect header from all axios instances globally
if (axios.defaults.headers.common) {
  delete axios.defaults.headers.common['Expect'];
  delete axios.defaults.headers.common['expect'];
}
if (axios.defaults.headers.post) {
  delete axios.defaults.headers.post['Expect'];
  delete axios.defaults.headers.post['expect'];
}
if (axios.defaults.headers.put) {
  delete axios.defaults.headers.put['Expect'];
  delete axios.defaults.headers.put['expect'];
}


const api = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
  // Transform request to forcefully remove Expect header before sending
  transformRequest: [
    function (data, headers) {
      // Remove Expect header at transformation level (before interceptors)
      if (headers) {
        delete headers['Expect'];
        delete headers['expect'];

        // Safely delete from common headers if it exists
        if (headers.common) {
          delete headers.common['Expect'];
          delete headers.common['expect'];
        }
      }

      // Return data as JSON string if it's an object
      if (data && typeof data === 'object') {
        return JSON.stringify(data);
      }
      return data;
    }
  ],
});

// Public (no token needed)
const PUBLIC_ROUTES = [
  "auth.login",
  "auth.signup",
  "auth.send_otp",
  "auth.send_password_email",
  "localmoves.api.auth.login",
  "localmoves.api.auth.signup",
  "localmoves.api.auth.send_otp",
  "localmoves.api.auth.send_password_email",
  "localmoves.api.company.create_company",
];

// Remove Expect header from all requests (fixes 417 error)
// This interceptor runs after transformRequest
api.interceptors.request.use(
  (config) => {
    // Remove from all possible header locations
    delete config.headers['Expect'];
    delete config.headers['expect'];
    delete config.headers.common?.['Expect'];
    delete config.headers.common?.['expect'];
    delete config.headers.post?.['Expect'];
    delete config.headers.post?.['expect'];
    delete config.headers.put?.['Expect'];
    delete config.headers.put?.['expect'];

    // Ensure Content-Type is set for JSON
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // Remove leading slash if exists
    const cleanUrl = url.startsWith("/") ? url.substring(1) : url;

    // Skip auth for login/signup
    if (PUBLIC_ROUTES.some(route => cleanUrl.includes(route))) {
      return config;
    }

    // Always attach token for ANY /api/method/ request
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
