/**
 * Consumer Service for FixRx Mobile
 * Full backend integration - no mock fallback
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export interface Vendor {
  id: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  services: string[];
  rating: number;
  reviewCount: number;
  profileImage?: string;
  distance?: number;
  isOnline?: boolean;
  metroArea?: string;
  isVerified?: boolean;
  recommendationReason?: string;
  recommendedBy?: number;
  available?: boolean;
}

export interface ConsumerStats {
  totalConnections: number;
  activeProjects: number;
  completedProjects: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export interface RecentService {
  id: string;
  vendorName: string;
  service: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  rating?: number;
  completedAt?: string;
}

export interface DashboardData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  stats: ConsumerStats;
  recentActivity: RecentActivity[];
  recommendedVendors: Vendor[];
  recentServices: RecentService[];
}

class ConsumerService {

  // Get consumer dashboard data
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return await apiClient.get<DashboardData>(API_ENDPOINTS.CONSUMER.DASHBOARD);
  }

  // Get recommended vendors
  async getRecommendations(): Promise<ApiResponse<{ vendors: Vendor[]; total: number }>> {
    return await apiClient.get<{ vendors: Vendor[]; total: number }>(API_ENDPOINTS.CONSUMER.RECOMMENDATIONS);
  }

  // Search vendors
  async searchVendors(query: string, filters?: {
    service?: string;
    location?: string;
    rating?: number;
    availability?: boolean;
  }): Promise<ApiResponse<{ vendors: Vendor[]; total: number }>> {
    const params = new URLSearchParams({
      q: query,
      ...(filters?.service && { service: filters.service }),
      ...(filters?.location && { location: filters.location }),
      ...(filters?.rating && { rating: filters.rating.toString() }),
      ...(filters?.availability && { availability: filters.availability.toString() }),
    });
    
    return await apiClient.get<{ vendors: Vendor[]; total: number }>(`${API_ENDPOINTS.VENDOR.SEARCH}?${params}`);
  }

  // Get vendor profile
  async getVendorProfile(vendorId: string): Promise<ApiResponse<Vendor>> {
    return await apiClient.get<Vendor>(`${API_ENDPOINTS.VENDOR.PROFILE}/${vendorId}`);
  }
}

const consumerService = new ConsumerService();
export default consumerService;
