/**
 * Vendor Service for FixRx Mobile
 * Full backend integration - no mock fallback
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export interface VendorProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  businessName?: string;
  services: string[];
  metroArea?: string;
  profileImage?: string;
  portfolio?: any[];
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  isOnline?: boolean;
}

export interface VendorStats {
  totalConnections: number;
  activeProjects: number;
  completedProjects: number;
  averageRating: number;
  totalReviews: number;
}

export interface Connection {
  id: string;
  consumerName: string;
  consumerImage?: string;
  service: string;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
  lastActivity?: string;
}

export interface VendorDashboardData {
  user: VendorProfile;
  stats: VendorStats;
  recentConnections: Connection[];
  pendingRequests: Connection[];
}

class VendorService {
  // Get vendor dashboard data
  async getDashboard(): Promise<ApiResponse<VendorDashboardData>> {
    return await apiClient.get<VendorDashboardData>(API_ENDPOINTS.VENDOR.DASHBOARD);
  }

  // Get vendor profile
  async getProfile(vendorId: string): Promise<ApiResponse<VendorProfile>> {
    return await apiClient.get<VendorProfile>(`${API_ENDPOINTS.VENDOR.PROFILE}/${vendorId}`);
  }

  // Update vendor profile
  async updateProfile(vendorId: string, profileData: Partial<VendorProfile>): Promise<ApiResponse<VendorProfile>> {
    return await apiClient.put<VendorProfile>(`${API_ENDPOINTS.VENDOR.PROFILE}/${vendorId}`, profileData);
  }

  // Search vendors (for vendor-to-vendor connections)
  async searchVendors(query: string, filters?: {
    service?: string;
    location?: string;
    rating?: number;
  }): Promise<ApiResponse<{ vendors: VendorProfile[]; total: number }>> {
    const params = new URLSearchParams({
      q: query,
      ...(filters?.service && { service: filters.service }),
      ...(filters?.location && { location: filters.location }),
      ...(filters?.rating && { rating: filters.rating.toString() }),
    });
    
    return await apiClient.get<{ vendors: VendorProfile[]; total: number }>(`${API_ENDPOINTS.VENDOR.SEARCH}?${params}`);
  }

  // Get vendor connections
  async getConnections(): Promise<ApiResponse<Connection[]>> {
    return await apiClient.get<Connection[]>(`${API_ENDPOINTS.VENDOR.PROFILE}/connections`);
  }

  // Accept connection request
  async acceptConnection(connectionId: string): Promise<ApiResponse<Connection>> {
    return await apiClient.put<Connection>(`${API_ENDPOINTS.VENDOR.PROFILE}/connections/${connectionId}/accept`);
  }

  // Decline connection request
  async declineConnection(connectionId: string): Promise<ApiResponse> {
    return await apiClient.put<{ message: string }>(`${API_ENDPOINTS.VENDOR.PROFILE}/connections/${connectionId}/decline`);
  }
}

// Export singleton instance
export const vendorService = new VendorService();
export default vendorService;
