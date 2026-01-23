import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const auditLogService = {
  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedAuditLogs> {
    const params: Record<string, string> = {};
    if (filters?.userId) params.userId = filters.userId;
    if (filters?.action) params.action = filters.action;
    if (filters?.page) params.page = String(filters.page);
    if (filters?.limit) params.limit = String(filters.limit);

    const response = await apiClient.get<ApiResponse<PaginatedAuditLogs>>('/audit-logs', params);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch audit logs');
    }

    return {
      ...response.data,
      data: response.data.data.map(log => ({
        ...log,
        createdAt: new Date(log.createdAt),
      })),
    };
  },

  async getAuditLogById(id: string): Promise<AuditLog> {
    const response = await apiClient.get<ApiResponse<AuditLog>>(`/audit-logs/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Audit log not found');
    }

    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
    };
  },
};
