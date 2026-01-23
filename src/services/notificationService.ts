import { Notification } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const notificationService = {
  async getNotifications(filters?: {
    isRead?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications', filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch notifications');
    }
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch unread count');
    }
    return response.data.count;
  },

  async markAsRead(id: string): Promise<void> {
    const response = await apiClient.patch<ApiResponse<void>>(`/notifications/${id}/read`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to mark notification as read');
    }
  },

  async markAllAsRead(): Promise<void> {
    const response = await apiClient.patch<ApiResponse<void>>('/notifications/read-all');
    if (!response.success) {
      throw new Error(response.error || 'Failed to mark all notifications as read');
    }
  },

  async deleteNotification(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/notifications/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete notification');
    }
  },
};
