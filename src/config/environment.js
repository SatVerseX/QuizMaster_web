// Environment configuration compatible with Vite and Node
const getEnvironment = () => {
  // Prefer Vite's variables when available
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.MODE || (import.meta.env.PROD ? 'production' : 'development');
    }
  } catch (_) {}

  // Browser hint (optional meta tag or injected value)
  if (typeof window !== 'undefined') {
    if (window.__ENV__) return window.__ENV__;
    const metaEnv = document.querySelector('meta[name="environment"]');
    if (metaEnv) return metaEnv.getAttribute('content');
  }

  // Node fallback (only when process is defined)
  try {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
      return process.env.NODE_ENV;
    }
  } catch (_) {}
  return 'development';
};

const env = getEnvironment();
const isDevelopment = env === 'development';
const isProduction = env === 'production';
const isStaging = env === 'staging';

export const config = {
  environment: env,
  isDevelopment,
  isProduction,
  isStaging,
  
  // Feature flags
  features: {
    debugLogging: isDevelopment,
    showSourceMaps: isDevelopment,
    enableHotReload: isDevelopment,
  },
  
  // API endpoints
  api: {
    baseUrl: isProduction 
      ? 'https://quiz-master-go.vercel.app/' 
      : 'http://localhost:5000',
  },
  
  // Firebase config (you can override these per environment)
  firebase: {
    // Your Firebase config here
  }
};

export default config; 