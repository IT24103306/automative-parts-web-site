import axios from 'axios';
import { useAdminAuth } from '../hooks/useAdminAuth';

/**
 * Robustly resolve API base URL:
 * - If VITE_API_URL is configured (with or without /api, with or without trailing slash),
 *   normalizes it to end with /api.
 * - In production, if VITE_API_URL is not set on the host, defaults to the deployed Render backend URL.
 * - In development, falls back to '/api' which routes through Vite's dev server proxy to localhost:5000.
 */
const resolveApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  // Fallback for production hosting if environment variable was omitted
  if (import.meta.env.PROD) {
    return 'https://automative-parts-web-site.onrender.com/api';
  }

  // Local development fallback using Vite proxy
  return '/api';
};

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to add the auth token
apiClient.interceptors.request.use((config) => {
  const token = useAdminAuth.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Response interceptor to handle errors and 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Detailed error logging to avoid silent failures
    const method = (error.config?.method || 'GET').toUpperCase();
    const url = error.config?.url || '';
    const status = error.response?.status;
    const detail = error.response?.data?.error || error.message;

    console.error(`[API Client Error] ${method} ${url} - Status: ${status || 'NETWORK_OR_CORS_FAILURE'}:`, detail);

    if (error.response?.status === 401) {
      // A 401 from the login endpoint means the credentials may be incorrect.
      // Do not redirect/reload the login page before Login.tsx can show its error.
      const requestUrl = String(error.config?.url || '');
      const isLoginRequest = /(^|\/)admin\/login(?:\?|$)/.test(requestUrl);

      if (!isLoginRequest) {
        useAdminAuth.getState().logout();
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
