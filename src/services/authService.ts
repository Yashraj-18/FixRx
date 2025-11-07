/**
 * Authentication Service for FixRx Mobile
 * Full backend integration - no mock fallback
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { ApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { magicLinkAuthService } from './magicLinkAuthService';
import { otpAuthService, type OtpResponseData } from './otpAuthService';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'consumer' | 'vendor';
  phone?: string;
  profileImage?: string;
  isVerified?: boolean;
  metroArea?: string;
  createdAt?: string;
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'consumer' | 'vendor';
  phone?: string;
  metroArea?: string;
}

export interface OtpSendParams {
  phone: string;
  purpose?: 'LOGIN' | 'REGISTRATION';
  userType?: 'CONSUMER' | 'VENDOR';
}

export interface OtpVerifyParams {
  phone: string;
  code: string;
  userType?: 'CONSUMER' | 'VENDOR';
}

class AuthService {
  private _user: AuthUser | null = null;

  // Getter for user that ensures type safety
  private get user(): AuthUser | null {
    return this._user;
  }

  // Setter for user that ensures type safety
  private set user(value: AuthUser | null) {
    this._user = value;
  }
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_KEY = 'auth_user';

  // Direct backend call helper
  private async makeBackendCall<T>(
    backendCall: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    try {
      return await backendCall();
    } catch (error: any) {
      console.error('Backend call failed:', error);
      return {
        success: false,
        error: error.message || 'Backend request failed',
        message: error.message || 'Failed to connect to backend'
      };
    }
  }

  /**
   * Register user
   * @param userData Registration data
   * @returns Promise with authentication response
   */
  async register(userData: RegisterData): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    const response = await apiClient.post<{ user: AuthUser; token: string }>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );

    if (response.success && response.data) {
      await this.saveAuthData(response.data.user, response.data.token);
    }

    return response;
  }

  /**
   * Login user
   * @param credentials Login credentials
   * @returns Promise with authentication response
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    const response = await apiClient.post<{ user: AuthUser; token: string }>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.success && response.data) {
      await this.saveAuthData(response.data.user, response.data.token);
    }

    return response;
  }

  // Login via Google OAuth using ID token
  async loginWithGoogle(
    idToken: string
  ): Promise<ApiResponse<{ user: AuthUser; token: string; isNewUser: boolean }>> {
    const response = await apiClient.post<{ user: AuthUser; token: string; isNewUser: boolean }>(
      API_ENDPOINTS.AUTH.OAUTH.GOOGLE_VERIFY,
      { idToken }
    );

    if (response.success && response.data) {
      await this.saveAuthData(response.data.user, response.data.token);
    }

    return response;
  }

  // Verify if token is still valid
  async verifyToken(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) {
        console.log('No token found');
        return false;
      }
      
      // Set token in API client
      apiClient.setAuthToken(token);
      
      // Make a simple API call to verify token
      const response = await apiClient.get('/users/profile');
      
      if (!response.success) {
        console.log('Token verification failed:', response.error);
        // Clear invalid token
        await this.clearAuthData();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      await this.clearAuthData();
      return false;
    }
  }

  // Logout user
  async logout(): Promise<ApiResponse> {
    // Get token before clearing (needed for backend call)
    const token = await this.getStoredToken();

    // Clear local data first - logout should always succeed locally
    await this.clearAuthData();

    // Try to notify backend (best effort, don't fail if it doesn't work)
    if (token) {
      try {
        apiClient.setAuthToken(token);
        // Fire and forget - we don't care if this fails (expired tokens, network errors, etc.)
        apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {}).catch(() => {
          // Silently ignore - user is already logged out locally
        });
      } catch (error) {
        // Silently ignore - user is already logged out locally
      }
    }

    return {
      success: true,
      message: 'Logged out successfully'
    };
  }

  // Get user profile
  async getProfile(): Promise<ApiResponse<AuthUser>> {
    return await apiClient.get<AuthUser>(API_ENDPOINTS.AUTH.PROFILE);
  }

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>): Promise<ApiResponse<AuthUser>> {
    const currentUser = this.user;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Determine the correct profile endpoint based on user type
    const endpoint = currentUser.userType === 'vendor' 
      ? API_ENDPOINTS.VENDOR.PROFILE 
      : API_ENDPOINTS.CONSUMER.PROFILE;
    
    try {
      const response = await apiClient.put<AuthUser>(endpoint, updates);
      
      // Update local user data if the update was successful
      if (response.success && response.data) {
        const token = await this.getStoredToken();
        if (!token) {
          throw new Error('No authentication token found');
        }
        this.user = { ...this.user, ...response.data };
        await this.saveAuthData(this.user, token);
      }
      
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Save authentication data to storage
  private async saveAuthData(user: AuthUser, token: string, refreshToken?: string): Promise<void> {
    try {
      const pairs: [string, string][] = [
        [AuthService.TOKEN_KEY, token],
        [AuthService.USER_KEY, JSON.stringify(user)],
      ];

      if (refreshToken) {
        pairs.push([AuthService.REFRESH_TOKEN_KEY, refreshToken]);
      }

      await AsyncStorage.multiSet(pairs);
      
      // Set token in API client
      apiClient.setAuthToken(token);
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  }

  // Clear authentication data
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        AuthService.TOKEN_KEY,
        AuthService.REFRESH_TOKEN_KEY,
        AuthService.USER_KEY,
      ]);
      
      // Clear token from API client
      apiClient.setAuthToken(null);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  // Get stored token
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AuthService.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  // Get stored user
  async getStoredUser(): Promise<AuthUser | null> {
    try {
      const userJson = await AsyncStorage.getItem(AuthService.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to get stored user:', error);
      return null;
    }
  }

  /**
   * Phone OTP Authentication
   */
  async sendOtp({ phone, purpose = 'LOGIN', userType = 'CONSUMER' }: OtpSendParams): Promise<ApiResponse<OtpResponseData>> {
    try {
      const result = await otpAuthService.sendCode({ phone, purpose, userType });
      return {
        success: result.success,
        message:
          result.message || (result.success ? 'Verification code sent' : 'Failed to send verification code'),
        data: {
          ...result.data,
          retryAfterSeconds: result.retryAfterSeconds,
        },
        error: result.success ? undefined : result.message || 'Failed to send verification code',
      };
    } catch (error) {
      console.error('OTP send failed:', error);
      return {
        success: false,
        message: 'Failed to send verification code',
        error: 'NETWORK_ERROR',
      };
    }
  }

  async verifyOtp({ phone, code, userType = 'CONSUMER' }: OtpVerifyParams): Promise<ApiResponse<{ user: AuthUser; token: string; isNewUser: boolean }>> {
    try {
      const result = await otpAuthService.verifyCode({ phone, code, userType });

      if (result.success && result.data?.user && result.data?.token) {
        const normalizedUser = this.mapBackendUser(result.data.user);
        await this.saveAuthData(normalizedUser, result.data.token, result.data.refreshToken);

        return {
          success: true,
          message: result.message || 'Phone number verified successfully',
          data: {
            user: normalizedUser,
            token: result.data.token,
            isNewUser: Boolean(result.data.isNewUser),
          },
        };
      }

      return {
        success: false,
        message: result.message || 'Failed to verify code',
        error: result.message || 'Failed to verify code',
      };
    } catch (error) {
      console.error('OTP verify failed:', error);
      return {
        success: false,
        message: 'Failed to verify code',
        error: 'NETWORK_ERROR',
      };
    }
  }
  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    const user = await this.getStoredUser();

    if (token && user) {
      apiClient.setAuthToken(token);
      return true;
    }

    return false;
  }

  // Initialize auth service (call on app start)
  async initialize(): Promise<void> {
    const token = await this.getStoredToken();
    if (token) {
      apiClient.setAuthToken(token);
    }
  }

  // Magic Link Authentication Methods
  // These methods integrate magic link auth with existing auth flow

  /**
   * Send magic link for passwordless login
   */
  async sendMagicLink(email: string, purpose: 'LOGIN' | 'REGISTRATION' = 'REGISTRATION'): Promise<ApiResponse<{ expiresIn: number }>> {

    try {
      const result = await magicLinkAuthService.sendMagicLink({ email, purpose });
      
      if (result.success) {
        return {
          success: true,
          message: result.message,
          data: { expiresIn: result.data?.expiresIn || 900 },
        };
      } else {
        return {
          success: false,
          message: result.message,
          error: result.message || 'Magic link request failed',
        };
      }
    } catch (error) {
      console.error('Magic link send error:', error);
      return {
        success: false,
        message: 'Failed to send magic link',
        error: 'Network error occurred',
      };
    }
  }

  /**
   * Verify magic link and authenticate user
   */
  async verifyMagicLink(token: string, email: string): Promise<ApiResponse<{ user: AuthUser; token: string; isNewUser: boolean }>> {
    try {
      const result = await magicLinkAuthService.verifyMagicLink({ token, email });
      
      if (result.success && result.data?.user && result.data?.token) {
        // Transform magic link user to AuthUser format
        const authUser: AuthUser = {
          id: result.data.user.id,
          email: result.data.user.email,
          firstName: result.data.user.firstName,
          lastName: result.data.user.lastName,
          userType: result.data.user.userType.toLowerCase() as 'consumer' | 'vendor',
          isVerified: result.data.user.isVerified,
        };

        // Save auth data using existing method
        await this.saveAuthData(authUser, result.data.token);

        return {
          success: true,
          message: result.message,
          data: {
            user: authUser,
            token: result.data.token,
            isNewUser: result.data.isNewUser || false,
          },
        };
      } else {
        return {
          success: false,
          message: result.message,
          error: result.message || 'Magic link verification failed',
        };
      }
    } catch (error) {
      console.error('Magic link verification error:', error);
      return {
        success: false,
        message: 'Failed to verify magic link',
        error: 'Network error occurred',
      };
    }
  }

  private mapBackendUser(raw: any): AuthUser {
    // Normalize the user type, defaulting to 'consumer' if not specified
    const normalizedUserType = raw.userType 
      ? (raw.userType.toLowerCase() as 'consumer' | 'vendor')
      : 'consumer';
      
    return {
      id: raw.id || '',
      email: raw.email || '',
      firstName: raw.firstName || '',
      lastName: raw.lastName || '',
      userType: normalizedUserType,
      phone: raw.phone,
      profileImage: raw.profileImage || raw.avatar,
      isVerified: raw.isVerified || false,
      metroArea: raw.metroArea,
      createdAt: raw.createdAt ?? raw.created_at,
    };
  }

  /**
   * Check if magic link service is available
   */
  async isMagicLinkAvailable(): Promise<boolean> {
    try {
      return await magicLinkAuthService.checkHealth();
    } catch (error) {
      console.error('Magic link health check failed:', error);
      return false;
    }
  }

  /**
   * Validate email format for magic link
   */
  validateEmailForMagicLink(email: string): boolean {
    return magicLinkAuthService.validateEmail(email);
  }

  /**
   * Update user type (consumer/vendor)
   */
  async updateUserType(userType: 'consumer' | 'vendor'): Promise<ApiResponse<any>> {
    try {
      // Ensure token is set in API client
      const token = await this.getStoredToken();
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      const response = await apiClient.patch('/users/profile', { userType });

      if (response.data) {
        // Update stored user
        const storedUser = await this.getStoredUser();
        if (storedUser) {
          const updatedUser = { ...storedUser, userType };
          await AsyncStorage.setItem(AuthService.USER_KEY, JSON.stringify(updatedUser));
        }
        
        return { success: true, data: response.data };
      }

      return { success: false, error: 'Failed to update user type' };
    } catch (error: any) {
      console.error('Error updating user type:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to update user type' 
      };
    }
  }

  /**
   * Verify 2FA code and complete authentication
   */
  async verifyTwoFactor(params: {
    sessionToken: string;
    code: string;
    email?: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>> {
    try {
      const response = await apiClient.post<{ user: AuthUser; tokens: AuthTokens }>(
        '/auth/verify-2fa',
        params
      );

      if (response.success && response.data) {
        await this.saveAuthData(
          response.data.user,
          response.data.tokens.token,
          response.data.tokens.refreshToken
        );
      }

      return response;
    } catch (error: any) {
      console.error('2FA verification error:', error);
      return {
        success: false,
        message: error.message || 'Failed to verify 2FA code',
        error: error.message || 'Verification failed',
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
