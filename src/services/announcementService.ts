import { Announcement } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to convert API response to Announcement with Date objects
const mapAnnouncement = (ann: any): Announcement => ({
  ...ann,
  createdAt: ann.createdAt ? new Date(ann.createdAt) : new Date(),
  startDate: ann.startDate ? new Date(ann.startDate) : undefined,
  endDate: ann.endDate ? new Date(ann.endDate) : undefined,
});

export const announcementService = {
  async getAnnouncements(filters?: {
    classId?: string;
    targetAudience?: string;
    isPinned?: boolean;
  }): Promise<Announcement[]> {
    const response = await apiClient.get<ApiResponse<any[]>>('/announcements', filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch announcements');
    }
    return response.data.map(mapAnnouncement);
  },

  async getAnnouncementById(id: string): Promise<Announcement> {
    const response = await apiClient.get<ApiResponse<any>>(`/announcements/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch announcement');
    }
    return mapAnnouncement(response.data);
  },

  async createAnnouncement(announcement: Partial<Announcement>): Promise<Announcement> {
    const response = await apiClient.post<ApiResponse<any>>('/announcements', announcement);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create announcement');
    }
    return mapAnnouncement(response.data);
  },

  async updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<Announcement> {
    const response = await apiClient.put<ApiResponse<any>>(`/announcements/${id}`, announcement);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update announcement');
    }
    return mapAnnouncement(response.data);
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/announcements/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete announcement');
    }
  },
};
