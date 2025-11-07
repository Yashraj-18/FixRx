/**
 * API Configuration for FixRx Mobile
 * Enhanced with better environment handling and error reporting
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API Configuration
const DEFAULT_API_PORT = process.env.EXPO_PUBLIC_API_PORT || '3000';
const DEFAULT_API_PATH = process.env.EXPO_PUBLIC_API_PATH || '/api/v1';
const ANDROID_LOCALHOST = '10.0.2.2'; // Standard Android emulator localhost
const LOCALHOST = '127.0.0.1'; // For iOS simulator and physical devices

// Environment detection
const IS_DEV = __DEV__;
const IS_IOS = Platform.OS === 'ios';
const IS_ANDROID = Platform.OS === 'android';

// Get the local network IP for development
const getLocalIp = (): string => {
  try {
    // 1. Check for explicit override in environment (HIGHEST PRIORITY)
    if (process.env.EXPO_PUBLIC_LOCAL_IP) {
      return process.env.EXPO_PUBLIC_LOCAL_IP;
    }

    // 3. Try to get the IP from Expo's manifest (SECOND PRIORITY)
    const expoConfig = Constants.expoConfig as any;
    const debuggerHost = expoConfig?.hostUri?.split(':')[0] || expoConfig?.debuggerHost?.split(':')[0];
    
    if (debuggerHost && debuggerHost !== '' && debuggerHost !== 'localhost') {
      return debuggerHost;
    }

    // No fallback - environment variable must be set
    console.error('Could not determine local IP. Please set EXPO_PUBLIC_API_BASE_URL in .env file');
    return '';
  } catch (error) {
    console.error('Could not determine local IP', error);
    return '';
  }
};

// Resolve the base URL based on environment
export const resolveBaseUrl = (): string => {
  // 1. Check environment variable first (highest priority)
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (fromEnv && fromEnv.trim().length > 0) {
    const url = fromEnv.replace(/\/?$/, '');
    console.log(`✅ Using API URL from EXPO_PUBLIC_API_BASE_URL: ${url}`);
    return url;
  }

  // 2. Development mode with local server
  if (IS_DEV) {
    const localIp = getLocalIp();
    if (!localIp) {
      console.error('❌ EXPO_PUBLIC_API_BASE_URL not set in .env file');
      console.error('Please configure your .env file with your local IP address');
      return ''; // Will cause clear error
    }
    // ALWAYS use the actual IP, not Android localhost
    return `http://${localIp}:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`;
  }

  // 3. Production URL
  const prodUrl = 'https://api.fixrx.app/api/v1';
  return prodUrl;
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: resolveBaseUrl(),
  TIMEOUT: 30000, // Increased timeout to 30 seconds
  RETRY_ATTEMPTS: 3,
  get HEALTH_CHECK_ENDPOINT() {
    return `${this.BASE_URL.replace(/\/api\/v1$/, '')}/health`;
  }
};

// WebSocket Configuration
export const WS_CONFIG = {
  get BASE_URL() {
    // Use environment variable for WebSocket URL
    const wsUrl = process.env.EXPO_PUBLIC_WS_URL;
    if (wsUrl && wsUrl.trim().length > 0) {
      return wsUrl.replace(/\/?$/, '');
    }
    
    // Fallback: derive from API URL
    return API_CONFIG.BASE_URL.replace(/\/api\/v1$/, '');
  },
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 5,
};

console.log('API Base URL:', API_CONFIG.BASE_URL);
console.log('WebSocket URL:', WS_CONFIG.BASE_URL);
console.log('Health Check Endpoint:', API_CONFIG.HEALTH_CHECK_ENDPOINT);

// API Endpoints
export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',
  
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/users/profile',
    OAUTH: {
      GOOGLE_VERIFY: '/auth/oauth/google/verify',
    },
    MAGIC_LINK: {
      SEND: '/auth/magic-link/send',
      VERIFY: '/auth/magic-link/verify',
      HEALTH: '/auth/magic-link/health',
    },
    OTP: {
      SEND: '/auth/otp/send',
      RESEND: '/auth/otp/resend',
      VERIFY: '/auth/otp/verify',
      HEALTH: '/auth/otp/health',
    },
  },
  
  // Consumer
  CONSUMER: {
    DASHBOARD: '/consumers/dashboard',
    RECOMMENDATIONS: '/consumers/recommendations',
    PROFILE: '/consumers/profile',
  },
  
  // Vendor
  VENDOR: {
    DASHBOARD: '/vendors/dashboard',
    PROFILE: '/vendors/profile',
    SEARCH: '/vendors/search',
  },
  
  // Ratings
  RATINGS: {
    CREATE: '/ratings',
    GET: '/ratings',
    UPDATE: '/ratings',
  },
  
  // Invitations
  INVITATIONS: {
    SEND: '/invitations/send',
    BULK: '/invitations/bulk',
    RECEIVED: '/invitations/received',
    SENT: '/invitations/sent',
  },
  
  // Contacts
  CONTACTS: {
    IMPORT: '/contacts/import',
    SYNC: '/contacts/sync',
    SEARCH: '/contacts/search',
  },

  // Payments
  PAYMENTS: {
    CREATE_INTENT: '/payments/create-intent',
    CONFIRM: '/payments/confirm',
    CONFIG: '/payments/config',
    DETAIL: (paymentIntentId: string) => `/payments/${paymentIntentId}`,
  },

  // Invoices
  INVOICES: {
    UPLOAD: '/invoices/upload',
    LIST: '/invoices',
    DETAIL: (invoiceId: string) => `/invoices/${invoiceId}`,
    DELETE: (invoiceId: string) => `/invoices/${invoiceId}`,
  },

  // Messaging
  MESSAGING: {
    CONVERSATIONS: '/messages',
    ENSURE_DIRECT: '/messages/ensure-direct',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
};
