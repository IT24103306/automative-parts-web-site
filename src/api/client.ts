import axios from 'axios';
import { useAdminAuth } from '../hooks/useAdminAuth';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
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

// Response interceptor to handle 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
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
