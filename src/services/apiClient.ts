/**
 * API Client for FixRx Mobile
 * Enhanced with better error handling, timeouts, and health checks
 */

import { API_CONFIG } from '../config/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | any;
  code?: string;
  status?: number;
}

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
  };

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    console.log('API Client initialized with base URL:', this.baseUrl);
  }

  // Set authentication token
  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // Get authentication token
  getAuthToken(): string | null {
    return this.authToken;
  }

  // Enhanced request method with retry logic
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
      
      const headers = {
        ...this.defaultHeaders,
        ...(options.headers || {})
      };

      console.log(`[API] ${options.method || 'GET'} ${url}`, {
        headers,
        body: options.body ? JSON.parse(options.body as string) : undefined
      });

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return {
          success: response.ok,
          status: response.status,
          message: text || response.statusText,
          error: !response.ok ? text || response.statusText : undefined,
        };
      }

      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        console.error(`[API Error] ${response.status} ${response.statusText}`, data);
        
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401 && data.code === 'TOKEN_INVALID') {
          console.log('⚠️ Token invalid/expired - clearing auth state');
          // Clear token immediately
          this.setAuthToken(null);
          // Import and clear storage (we'll handle this in authService)
          // Don't throw - just return the error response
        }
        
        return {
          success: false,
          status: response.status,
          message: data.message || response.statusText,
          error: data.error || data.message || 'Request failed',
          code: data.code,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
        status: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle network errors and timeouts
      const err = error as any;
      if (err.name === 'AbortError') {
        console.error(`[API Timeout] ${options.method || 'GET'} ${endpoint}`);
        if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
          console.log(`Retrying (${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})...`);
          return this.request<T>(endpoint, options, retryCount + 1);
        }
        return {
          success: false,
          error: 'Request timed out. Please check your network connection and try again.',
          code: 'TIMEOUT_ERROR',
        };
      }

      console.error(`[API Request Error] ${err.message}`, error);
      return {
        success: false,
        error: err.message || 'Network request failed',
        code: 'NETWORK_ERROR',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${query}`, {
      method: 'GET',
      headers,
    });
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  // Health check with direct fetch to bypass auth
  async healthCheck(): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(API_CONFIG.HEALTH_CHECK_ENDPOINT, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Health check failed with status ${response.status}`);
      }

      const data = await response.json();
      return { success: true, status: data.status };
    } catch (error) {
      const err = error as any;
      console.error('Health check failed:', error);
      return { 
        success: false, 
        error: err.message || 'Failed to connect to the server' 
      };
    }
  }

  // Check if backend is available (with retry logic)
  async isBackendAvailable(retries = 2, delay = 1000): Promise<boolean> {
    for (let i = 0; i <= retries; i++) {
      try {
        const result = await this.healthCheck();
        if (result.success) return true;
      } catch (error) {
        const err = error as any;
        console.warn(`Backend check attempt ${i + 1} failed:`, err.message);
      }
      
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return false;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
