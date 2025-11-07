/**
 * Rating Service for FixRx Mobile
 * Full backend integration - no mock fallback
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export interface Rating {
  id: string;
  vendorId: string;
  consumerId: string;
  vendorName: string;
  consumerName: string;
  serviceType: string;
  cost: number;
  quality: number;
  timeliness: number;
  professionalism: number;
  overallRating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RatingData {
  vendorId: string;
  serviceType: string;
  cost: number;
  quality: number;
  timeliness: number;
  professionalism: number;
  comment?: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  categoryAverages: {
    cost: number;
    quality: number;
    timeliness: number;
    professionalism: number;
  };
  recentRatings: Rating[];
}

class RatingService {

  // Create a new rating
  async createRating(ratingData: RatingData): Promise<ApiResponse<Rating>> {
    return await apiClient.post<Rating>(API_ENDPOINTS.RATINGS.CREATE, ratingData);
  }

  // Get ratings for a vendor
  async getVendorRatings(vendorId: string): Promise<ApiResponse<Rating[]>> {
    return await apiClient.get<Rating[]>(`${API_ENDPOINTS.RATINGS.GET}/vendor/${vendorId}`);
  }

  // Get ratings by a consumer
  async getConsumerRatings(consumerId: string): Promise<ApiResponse<Rating[]>> {
    return await apiClient.get<Rating[]>(`${API_ENDPOINTS.RATINGS.GET}/consumer/${consumerId}`);
  }

  // Get rating statistics for a vendor
  async getVendorRatingStats(vendorId: string): Promise<ApiResponse<RatingStats>> {
    return await apiClient.get<RatingStats>(`${API_ENDPOINTS.RATINGS.GET}/vendor/${vendorId}/stats`);
  }

  // Update a rating
  async updateRating(ratingId: string, ratingData: Partial<RatingData>): Promise<ApiResponse<Rating>> {
    return await apiClient.put<Rating>(`${API_ENDPOINTS.RATINGS.UPDATE}/${ratingId}`, ratingData);
  }

  // Delete a rating
  async deleteRating(ratingId: string): Promise<ApiResponse> {
    return await apiClient.delete<{ message: string }>(`${API_ENDPOINTS.RATINGS.GET}/${ratingId}`);
  }

  // Get pending ratings (services that need to be rated)
  async getPendingRatings(): Promise<ApiResponse<{ id: string; vendorId: string; vendorName: string; serviceType: string; completedAt: string; }[]>> {
    return await apiClient.get<{ id: string; vendorId: string; vendorName: string; serviceType: string; completedAt: string; }[]>(`${API_ENDPOINTS.RATINGS.GET}/pending`);
  }
}

// Export singleton instance
export const ratingService = new RatingService();
export default ratingService;
