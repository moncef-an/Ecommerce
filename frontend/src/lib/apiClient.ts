import axios from 'axios';
import { APP_CONFIG } from './config';

/**
 * Centralized Axios API client instance
 * Uses APP_CONFIG.apiBaseUrl (default '/api/v1') which Vite proxies to http://localhost:3030
 */
export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token automatically if logged in
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('novastore_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry / unauthenticated responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If server returns unauthorized on a protected route, notify or clear stale token
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      if (!isAuthEndpoint) {
        // Token has expired or is invalid
        // Dispatch custom event so AuthContext can clean up gracefully
        window.dispatchEvent(new CustomEvent('novastore:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Standard backend error response shape from Go Fiber
 */
export interface ApiErrorResponse {
  error?: string;
  message?: string;
}

/**
 * Extract human-readable error messages from unknown Axios or standard JS errors
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const serverData = error.response?.data as ApiErrorResponse | undefined;
    if (serverData?.error) {
      return serverData.error;
    }
    if (serverData?.message) {
      return serverData.message;
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check if the server is reachable.';
    }
    if (!error.response) {
      return 'Unable to reach the server. Please check your internet or server connection.';
    }
    return `Server error (${error.response.status}): ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
