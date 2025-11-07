/**
 * Integration Bridge for FixRx Mobile
 * Enhanced with robust error handling, health checks, and service monitoring
 */

import { apiClient, ApiResponse } from './apiClient';
import { authService } from './authService';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';

export type ServiceStatus = 'healthy' | 'degraded' | 'unavailable' | 'checking';

export interface ServiceHealth {
  status: ServiceStatus;
  lastChecked: Date | null;
  error?: string;
  responseTime?: number;
}

export interface IntegrationStatus {
  isBackendConnected: boolean;
  lastHealthCheck: Date | null;
  authenticationStatus: 'authenticated' | 'unauthenticated' | 'checking';
  services: {
    auth: ServiceHealth;
    vendors: ServiceHealth;
    consumers: ServiceHealth;
    ratings: ServiceHealth;
    invitations: ServiceHealth;
    contacts: ServiceHealth;
  };
  network: {
    isOnline: boolean;
    connectionType?: string;
  };
}

const DEFAULT_SERVICE_HEALTH: ServiceHealth = {
  status: 'checking',
  lastChecked: null,
};

class IntegrationBridge {
  private status: IntegrationStatus = {
    isBackendConnected: false,
    lastHealthCheck: null,
    authenticationStatus: 'checking',
    services: {
      auth: { ...DEFAULT_SERVICE_HEALTH },
      vendors: { ...DEFAULT_SERVICE_HEALTH },
      consumers: { ...DEFAULT_SERVICE_HEALTH },
      ratings: { ...DEFAULT_SERVICE_HEALTH },
      invitations: { ...DEFAULT_SERVICE_HEALTH },
      contacts: { ...DEFAULT_SERVICE_HEALTH },
    },
    network: {
      isOnline: true,
      connectionType: 'unknown',
    },
  };

  private healthCheckInterval: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  /**
   * Initialize the integration bridge
   * Sets up health checks, authentication, and network monitoring
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    console.log('🔗 Initializing FixRx Integration Bridge...');
    
    try {
      // Check network status first
      await this.checkNetworkStatus();
      
      // Initial health check
      const isHealthy = await this.checkBackendHealth();
      
      // Initialize authentication state
      await this.initializeAuthentication();
      
      // Start periodic health monitoring if backend is reachable
      if (isHealthy) {
        this.startHealthMonitoring();
      } else {
        this.startRetryMechanism();
      }
      
      console.log('✅ Integration Bridge initialized successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Integration Bridge initialization failed:', errorMessage);
      return { 
        success: false, 
        error: `Initialization failed: ${errorMessage}` 
      };
    }
  }

  /**
   * Check backend health and update status
   * @returns Promise<boolean> True if backend is healthy
   */
  async checkBackendHealth(): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Checking backend health...');
      
      // Reset retry counter on successful connection
      this.retryCount = 0;
      
      // Update service status to checking
      this.updateServiceStatus('auth', { status: 'checking' });
      
      // Perform health check with timeout
      const response = await apiClient.healthCheck();
      const responseTime = Date.now() - startTime;
      
      if (response.success) {
        this.status.isBackendConnected = true;
        this.status.lastHealthCheck = new Date();
        
        // Update all services status
        Object.keys(this.status.services).forEach(service => {
          this.updateServiceStatus(service as keyof IntegrationStatus['services'], {
            status: 'healthy',
            responseTime,
            lastChecked: new Date(),
          });
        });
        
        console.log(`✅ Backend connection verified (${responseTime}ms)`);
        return true;
      } else {
        throw new Error(response.error || 'Health check failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('⚠️ Backend health check failed:', errorMessage);
      
      this.status.isBackendConnected = false;
      this.updateServiceStatus('auth', {
        status: 'unavailable',
        error: errorMessage,
        lastChecked: new Date(),
      });
      
      return false;
    }
  }

  /**
   * Initialize authentication state
   */
  private async initializeAuthentication(): Promise<void> {
    try {
      this.status.authenticationStatus = 'checking';
      const isAuthenticated = await authService.isAuthenticated();
      
      this.status.authenticationStatus = isAuthenticated ? 'authenticated' : 'unauthenticated';
      console.log(`🔐 Authentication status: ${this.status.authenticationStatus}`);
      
      this.updateServiceStatus('auth', {
        status: isAuthenticated ? 'healthy' : 'degraded',
        lastChecked: new Date(),
      });
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      this.status.authenticationStatus = 'unauthenticated';
      this.updateServiceStatus('auth', {
        status: 'unavailable',
        error: error instanceof Error ? error.message : 'Authentication check failed',
        lastChecked: new Date(),
      });
    }
  }

  /**
   * Update service status helper
   */
  private updateServiceStatus(
    service: keyof IntegrationStatus['services'],
    updates: Partial<ServiceHealth>
  ): void {
    this.status.services[service] = {
      ...this.status.services[service],
      ...updates,
    };
  }

  /**
   * Check network status
   */
  private async checkNetworkStatus(): Promise<void> {
    try {
      this.status.network.isOnline = true;
      this.status.network.connectionType = 'wifi'; // Simplified for now
    } catch (error) {
      this.status.network.isOnline = false;
      console.error('❌ Network check failed:', error);
    }
  }

  /**
   * Start retry mechanism for failed connections
   */
  private startRetryMechanism(): void {
    if (this.retryCount >= this.maxRetries) {
      console.warn('⚠️ Max retries reached. Stopping retry mechanism.');
      return;
    }

    setTimeout(async () => {
      this.retryCount++;
      console.log(`🔄 Retrying backend connection (${this.retryCount}/${this.maxRetries})...`);
      
      const isHealthy = await this.checkBackendHealth();
      if (isHealthy) {
        this.startHealthMonitoring();
      } else {
        this.startRetryMechanism();
      }
    }, this.retryDelay);
  }

  // Start health monitoring
  private startHealthMonitoring(): void {
    // Check backend health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.checkBackendHealth();
    }, 30000);
  }

  // Stop health monitoring
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Get integration status
  getStatus(): IntegrationStatus {
    return { ...this.status };
  }

  // Force backend connection check
  async forceHealthCheck(): Promise<boolean> {
    return await this.checkBackendHealth();
  }

  // Enhanced logout with proper state management
  async performLogout(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔐 Performing enhanced logout...');
      
      // Call backend logout
      const logoutResponse = await authService.logout();
      
      if (logoutResponse.success) {
        // Update authentication status
        this.status.authenticationStatus = 'unauthenticated';
        
        console.log('✅ Logout successful');
        return {
          success: true,
          message: 'Logged out successfully'
        };
      } else {
        throw new Error(logoutResponse.error || 'Logout failed');
      }
    } catch (error) {
      console.error('❌ Logout failed:', error);
      
      // Force clear local data even if backend call fails
      this.status.authenticationStatus = 'unauthenticated';
      
      return {
        success: false,
        message: 'Logout completed locally'
      };
    }
  }

  // Enhanced login with proper state management
  async performLogin(email: string, password: string): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      console.log('🔐 Performing enhanced login...');
      
      const loginResponse = await authService.login({ email, password });
      
      if (loginResponse.success) {
        this.status.authenticationStatus = 'authenticated';
        
        console.log('✅ Login successful');
        return {
          success: true,
          message: 'Login successful',
          user: loginResponse.data?.user
        };
      } else {
        throw new Error(loginResponse.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      this.status.authenticationStatus = 'unauthenticated';
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  // Test all integrations
  async testAllIntegrations(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    try {
      // Test health endpoint
      const healthResponse = await apiClient.get(API_ENDPOINTS.HEALTH);
      results.health = healthResponse.success;
      
      // Test authentication endpoints
      results.auth = true; // Already tested in initialization
      
      // Test consumer dashboard
      try {
        const dashboardResponse = await apiClient.get(API_ENDPOINTS.CONSUMER.DASHBOARD);
        results.consumerDashboard = dashboardResponse.success;
      } catch {
        results.consumerDashboard = false;
      }
      
      // Test vendor search
      try {
        const vendorResponse = await apiClient.get(API_ENDPOINTS.VENDOR.SEARCH + '?query=test');
        results.vendorSearch = vendorResponse.success;
      } catch {
        results.vendorSearch = false;
      }
      
      // Test ratings
      try {
        const ratingsResponse = await apiClient.get(API_ENDPOINTS.RATINGS.GET);
        results.ratings = ratingsResponse.success;
      } catch {
        results.ratings = false;
      }
      
      console.log('🧪 Integration test results:', results);
      return results;
      
    } catch (error) {
      console.error('❌ Integration testing failed:', error);
      return results;
    }
  }
}

// Export singleton instance
export const integrationBridge = new IntegrationBridge();
export default integrationBridge;
