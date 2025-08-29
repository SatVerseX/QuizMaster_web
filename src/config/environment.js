// Environment configuration
const getEnvironment = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check for environment in window object (set by build process)
    if (window.__ENV__) {
      return window.__ENV__;
    }
    
    // Check for environment in meta tag
    const metaEnv = document.querySelector('meta[name="environment"]');
    if (metaEnv) {
      return metaEnv.getAttribute('content');
    }
  }
  
  // Fallback to NODE_ENV
  return process.env.NODE_ENV || 'development';
};

const isDevelopment = getEnvironment() === 'development';
const isProduction = getEnvironment() === 'production';
const isStaging = getEnvironment() === 'staging';

export const config = {
  environment: getEnvironment(),
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
      ? 'https://your-production-api.com' 
      : 'http://localhost:5000',
  },
  
  // Firebase config (you can override these per environment)
  firebase: {
    // Your Firebase config here
  }
};

export default config; 