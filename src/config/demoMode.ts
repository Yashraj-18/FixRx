/**
 * Demo Mode Configuration for FixRx Mobile
 * Centralized demo mode control to prevent API calls during demo
 */

// Check if demo mode is enabled
// NOTE: Only enable if explicitly set in .env, NOT automatically in __DEV__
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

// Demo mode logging
export const logDemoMode = (action: string, details?: string) => {
  if (DEMO_MODE) {
    console.log(`🎭 DEMO MODE: ${action}${details ? ` - ${details}` : ''}`);
  }
};

// Demo response helper
export const createDemoResponse = <T>(data?: T, message?: string) => ({
  success: true,
  data,
  message: message || 'Demo mode response',
});

// Demo error response helper  
export const createDemoError = (message?: string) => ({
  success: false,
  error: message || 'Demo mode - feature not available',
  message: message || 'Demo mode active',
});

// Check if API calls should be bypassed
export const shouldBypassAPI = () => {
  return DEMO_MODE;
};

export default {
  DEMO_MODE,
  logDemoMode,
  createDemoResponse,
  createDemoError,
  shouldBypassAPI,
};
