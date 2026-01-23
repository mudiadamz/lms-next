import { Announcement } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const announcementService = {
  async getAnnouncements(filters?: {
    classId?: string;
    targetAudience?: string;
    isPinned?: boolean;
  }): Promise<Announcement[]> {
    const response = await apiClient.get<ApiResponse<Announcement[]>>('/announcements', filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch announcements');
    }
    return response.data;
  },

  async getAnnouncementById(id: string): Promise<Announcement> {
    const response = await apiClient.get<ApiResponse<Announcement>>(`/announcements/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch announcement');
    }
    return response.data;
  },

  async createAnnouncement(announcement: Partial<Announcement>): Promise<Announcement> {
    const response = await apiClient.post<ApiResponse<Announcement>>('/announcements', announcement);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create announcement');
    }
    return response.data;
  },

  async updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<Announcement> {
    const response = await apiClient.put<ApiResponse<Announcement>>(`/announcements/${id}`, announcement);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update announcement');
    }
    return response.data;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/announcements/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete announcement');
    }
  },
};
