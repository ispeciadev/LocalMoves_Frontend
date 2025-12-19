// src/api/axios.js
import axios from "axios";
import env from "../config/env";

const api = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Public (no token needed)
const PUBLIC_ROUTES = [
  "auth.login",
  "auth.signup",
];

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
