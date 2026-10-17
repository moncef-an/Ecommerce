/**
 * Application environment configuration
 * All frontend variables must be prefixed with VITE_ to be exposed to Vite client code.
 * In development, we use relative '/api/v1' so Vite's proxy forwards requests
 * to http://localhost:3030 without triggering browser CORS restrictions.
 */
export const APP_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  appName: 'NovaStore',
  tagline: 'Modern Goods for Elevated Living',
} as const;
