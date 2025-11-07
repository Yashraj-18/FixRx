/**
 * Demo Configuration
 * Control whether to use backend or local-only mode
 */

export const DEMO_CONFIG = {
  // Set to false for demo mode (no backend calls)
  // Set to true for production mode (full backend integration)
  USE_BACKEND_UPDATES: true,
  
  // Set to true to skip authentication and use mock data
  SKIP_AUTH: false,
  
  // Set to true to use mock data instead of API calls
  USE_MOCK_DATA: false,
};

/**
 * Helper function to check if we should call backend
 */
export const shouldCallBackend = () => DEMO_CONFIG.USE_BACKEND_UPDATES;

/**
 * Helper function to check if we should use mock data
 */
export const shouldUseMockData = () => DEMO_CONFIG.USE_MOCK_DATA;
