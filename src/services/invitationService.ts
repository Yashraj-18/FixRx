/**
 * Enhanced Invitation Service for FixRx Mobile
 * Comprehensive invitation management with contact integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, ApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  isSelected?: boolean;
}

export interface Invitation {
  id: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  type: 'contractor' | 'friend';
  status: 'pending' | 'sent' | 'accepted' | 'declined';
  message?: string;
  createdAt: string;
  sentAt?: string;
  respondedAt?: string;
}

export interface InvitationData {
  contacts: Contact[];
  type: 'contractor' | 'friend';
  message?: string;
  method: 'sms' | 'email' | 'both';
}

export interface BulkInvitationResult {
  totalSent: number;
  successful: number;
  failed: number;
  invitations: Invitation[];
}

class InvitationService {

  // Send single invitation
  async sendInvitation(invitationData: {
    contact: Contact;
    type: 'contractor' | 'friend';
    message?: string;
    method: 'sms' | 'email' | 'both';
  }): Promise<ApiResponse<Invitation>> {
    return await apiClient.post<Invitation>(API_ENDPOINTS.INVITATIONS.SEND, invitationData);
  }

  // Send bulk invitations
  async sendBulkInvitations(invitationData: InvitationData): Promise<ApiResponse<BulkInvitationResult>> {
    return await apiClient.post<BulkInvitationResult>(API_ENDPOINTS.INVITATIONS.BULK, invitationData);
  }

  // Get sent invitations
  async getSentInvitations(): Promise<ApiResponse<Invitation[]>> {
    return await apiClient.get<Invitation[]>(API_ENDPOINTS.INVITATIONS.SENT);
  }

  // Get received invitations
  async getReceivedInvitations(): Promise<ApiResponse<Invitation[]>> {
    return await apiClient.get<Invitation[]>(API_ENDPOINTS.INVITATIONS.RECEIVED);
  }

  // Accept invitation
  async acceptInvitation(invitationId: string): Promise<ApiResponse<Invitation>> {
    return await apiClient.post<Invitation>(`${API_ENDPOINTS.INVITATIONS.RECEIVED}/${invitationId}/accept`, {});
  }

  // Decline invitation
  async declineInvitation(invitationId: string): Promise<ApiResponse<Invitation>> {
    return await apiClient.post<Invitation>(`${API_ENDPOINTS.INVITATIONS.RECEIVED}/${invitationId}/decline`, {});
  }

  // Get invitation statistics
  async getInvitationStats(): Promise<ApiResponse<{
    totalSent: number;
    totalReceived: number;
    acceptedSent: number;
    acceptedReceived: number;
    pendingSent: number;
    pendingReceived: number;
  }>> {
    return await apiClient.get<{
      totalSent: number;
      totalReceived: number;
      acceptedSent: number;
      acceptedReceived: number;
      pendingSent: number;
      pendingReceived: number;
    }>('/invitations/stats');
  }

  // Resend invitation
  async resendInvitation(invitationId: string): Promise<ApiResponse<Invitation>> {
    return await apiClient.post<Invitation>(`${API_ENDPOINTS.INVITATIONS.SENT}/${invitationId}/resend`, {});
  }

  // Cancel invitation
  async cancelInvitation(invitationId: string): Promise<ApiResponse> {
    return await apiClient.delete<{ message: string }>(`${API_ENDPOINTS.INVITATIONS.SENT}/${invitationId}`);
  }
}

// Export singleton instance
export const invitationService = new InvitationService();
export default invitationService;
