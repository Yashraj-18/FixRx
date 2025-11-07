import { apiClient, ApiResponse } from './apiClient';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';

export interface InvoiceUploadPayload {
  uri: string;
  name: string;
  type: string;
  serviceRequestId?: string;
  vendorId?: string;
  consumerId?: string;
  amount?: number;
  description?: string;
  metadata?: Record<string, string>;
}

export interface InvoiceUploadResult {
  invoiceId: string;
  fileUrl: string;
  uploadedAt: string;
  message?: string;
}

export interface InvoiceSummary {
  id: string;
  fileUrl: string;
  serviceRequestId?: string;
  vendorId?: string;
  amount?: number;
  uploadedAt: string;
  status?: string;
}

const buildAuthorizedHeaders = () => {
  const token = apiClient.getAuthToken();
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as Record<string, string>;
};

class InvoiceService {
  private buildUrl(path: string): string {
    return `${API_CONFIG.BASE_URL}${path}`;
  }

  async uploadInvoice(payload: InvoiceUploadPayload): Promise<ApiResponse<InvoiceUploadResult>> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: payload.uri,
        name: payload.name,
        type: payload.type,
      } as any);

      if (payload.serviceRequestId) {
        formData.append('serviceRequestId', payload.serviceRequestId);
      }

      if (payload.vendorId) {
        formData.append('vendorId', payload.vendorId);
      }

      if (payload.consumerId) {
        formData.append('consumerId', payload.consumerId);
      }

      if (typeof payload.amount === 'number') {
        formData.append('amount', payload.amount.toString());
      }

      if (payload.description) {
        formData.append('description', payload.description);
      }

      if (payload.metadata) {
        Object.entries(payload.metadata).forEach(([key, value]) => {
          formData.append(`metadata[${key}]`, value);
        });
      }

      const response = await fetch(this.buildUrl(API_ENDPOINTS.INVOICES.UPLOAD), {
        method: 'POST',
        headers: buildAuthorizedHeaders(),
        body: formData,
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: json?.message || 'Invoice upload failed',
          error: json?.error || json || 'INVOICE_UPLOAD_FAILED',
          code: json?.code || 'INVOICE_UPLOAD_FAILED',
        };
      }

      const data: InvoiceUploadResult = json?.data || json;

      return {
        success: true,
        data,
        message: json?.message,
        status: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Network error while uploading invoice',
        code: 'INVOICE_UPLOAD_NETWORK_ERROR',
      };
    }
  }

  async listInvoices(): Promise<ApiResponse<InvoiceSummary[]>> {
    return apiClient.get<InvoiceSummary[]>(API_ENDPOINTS.INVOICES.LIST);
  }

  async getInvoice(invoiceId: string): Promise<ApiResponse<InvoiceSummary>> {
    return apiClient.get<InvoiceSummary>(API_ENDPOINTS.INVOICES.DETAIL(invoiceId));
  }

  async deleteInvoice(invoiceId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.INVOICES.DELETE(invoiceId));
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;
