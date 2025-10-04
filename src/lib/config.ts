// API Configuration
export const API_CONFIG = {
  // Development mode - set to true when backend is not available
  DEV_MODE: false,
  
  // API Base URLs
  BASE_URLS: {
    development: 'http://localhost',
    staging: 'http://localhost',
    production: 'http://localhost'
  },
  
  // Current environment
  ENVIRONMENT: 'development' as keyof typeof API_CONFIG.BASE_URLS,
  
  // Get the current base URL
  get baseURL() {
    if (this.DEV_MODE) {
      return '/api'; // Use relative URL for development
    }
    return this.BASE_URLS[this.ENVIRONMENT];
  }
};

// Helper function to check if API is available
export const isApiAvailable = () => {
  return !API_CONFIG.DEV_MODE;
};
