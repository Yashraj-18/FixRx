import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
  error?: ApiError;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
  isNetworkError?: boolean;
  isServerError?: boolean;
  isClientError?: boolean;
  data?: any;
  message: string;
  requiresLogin?: boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private pendingRequests: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
  }> = [];

  private constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0',
        'X-Platform': 'mobile',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Add request ID for tracking
        const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        // Ensure headers object exists and is properly typed
        if (!config.headers) {
          config.headers = {} as any;
        }
        config.headers['X-Request-ID'] = requestId;
        
        // Add device info
        if (Constants.deviceName) {
          config.headers['X-Device-Name'] = Constants.deviceName;
        }
        config.headers['X-Platform'] = Platform.OS;
        config.headers['X-App-Version'] = Constants.expoConfig?.version || '1.0.0';
        
        // Add auth token if available
        try {
          const token = await AsyncStorage.getItem('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Failed to get auth token from storage', error);
        }
        
        console.log(`➡️ [${requestId}] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(this.normalizeError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const requestId = response.config.headers?.['X-Request-ID'] || 'unknown';
        console.log(`✅ [${requestId}] ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        const requestId = originalRequest?.headers?.['X-Request-ID'] || 'unknown';
        const apiError = this.normalizeError(error);

        // Log the error
        if (error.response) {
          console.error(`❌ [${requestId}] ${error.response.status} ${error.config?.url}`, {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          console.error(`❌ [${requestId}] No response received`, error.request);
        } else {
          console.error(`❌ [${requestId}] Request setup error`, error.message);
        }

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
          // If this is a login request, just reject with the error
          if (originalRequest?.url?.includes('/auth/login')) {
            return Promise.reject(apiError);
          }

          // If we're already refreshing the token, queue the request
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          // Try to refresh the token
          this.isRefreshing = true;
          try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            console.log('🔄 Attempting to refresh token...');
            const response = await this.client.post<ApiResponse<{ token: string; refreshToken: string }>>(
              '/auth/refresh-token',
              { refreshToken }
            );

            if (response.data.success && response.data.data) {
              const { token, refreshToken: newRefreshToken } = response.data.data;
              
              // Save the new tokens
              await AsyncStorage.setItem('auth_token', token);
              if (newRefreshToken) {
                await AsyncStorage.setItem('refresh_token', newRefreshToken);
              }
              
              // Update the authorization header
              this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              originalRequest.headers.Authorization = `Bearer ${token}`;
              
              // Process queued requests
              this.refreshSubscribers.forEach(callback => callback(token));
              this.refreshSubscribers = [];
              
              // Retry the original request
              return this.client(originalRequest);
            } else {
              throw new Error('Failed to refresh token');
            }
          } catch (refreshError) {
            // If refresh fails, log out the user
            console.error('Token refresh failed:', refreshError);
            await this.handleLogout();
            
            // Reject all queued requests
            this.refreshSubscribers = [];
            
            // Return the original error
            return Promise.reject({
              ...apiError,
              message: 'Session expired. Please log in again.',
              requiresLogin: true
            });
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle network errors
        if (!error.response) {
          const isConnected = await NetInfo.fetch().then(state => state.isConnected);
          if (!isConnected) {
            return Promise.reject({
              ...apiError,
              message: 'No internet connection',
              isNetworkError: true
            });
          }
          
          // For other network errors, reject with the normalized error
          return Promise.reject(apiError);
        }
        
        // For all other errors, just reject with the normalized error
        return Promise.reject(apiError);
      }
    );
  }

  private normalizeError(error: any): ApiError {
    const apiError: ApiError = new Error(error.message || 'An unknown error occurred');
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response as { status: number; data: any };
      apiError.message = data?.message || error.message;
      apiError.code = data?.code || `HTTP_${status}`;
      apiError.status = status;
      apiError.data = data;
      apiError.isNetworkError = false;
      apiError.isServerError = status >= 500;
      apiError.isClientError = status >= 400 && status < 500;
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = 'No response from server';
      apiError.isNetworkError = true;
    } else {
      // Something happened in setting up the request
      apiError.message = error.message || 'Request setup error';
      apiError.isServerError = false;
      apiError.isClientError = true;
    }
    
    return apiError;
  }

  private async handleLogout(): Promise<void> {
    try {
      // Clear auth tokens from storage
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
      
      // Clear any cached user data
      const keys = await AsyncStorage.getAllKeys();
      const userDataKeys = keys.filter(key => 
        key.startsWith('user_') || 
        key.includes('_prefs') ||
        key.includes('_settings')
      );
      
      if (userDataKeys.length > 0) {
        await AsyncStorage.multiRemove(userDataKeys);
      }
      
      // Clear the authorization header
      delete this.client.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with logout even if clearing storage fails
    }
  }

  // Public methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      const normalizedError = this.normalizeError(error);
      return {
        success: false,
        message: normalizedError.message,
        error: normalizedError
      };
    }
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      const normalizedError = this.normalizeError(error);
      return {
        success: false,
        message: normalizedError.message,
        error: normalizedError
      };
    }
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      const normalizedError = this.normalizeError(error);
      return {
        success: false,
        message: normalizedError.message,
        error: normalizedError
      };
    }
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      const normalizedError = this.normalizeError(error);
      return {
        success: false,
        message: normalizedError.message,
        error: normalizedError
      };
    }
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      const normalizedError = this.normalizeError(error);
      return {
        success: false,
        message: normalizedError.message,
        error: normalizedError
      };
    }
  }

  // Check network connectivity
  public async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  }
}

export const apiClient = ApiClient.getInstance();
export default apiClient;
