import { Schedule } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const scheduleService = {
  async getSchedules(filters?: {
    classId?: string;
    subjectId?: string;
    teacherId?: string;
    dayOfWeek?: number;
    academicYear?: string;
    semester?: number;
  }): Promise<Schedule[]> {
    const response = await apiClient.get<ApiResponse<Schedule[]>>('/schedules', filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch schedules');
    }
    return response.data;
  },

  async getScheduleById(id: string): Promise<Schedule> {
    const response = await apiClient.get<ApiResponse<Schedule>>(`/schedules/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch schedule');
    }
    return response.data;
  },

  async createSchedule(schedule: Partial<Schedule>): Promise<Schedule> {
    const response = await apiClient.post<ApiResponse<Schedule>>('/schedules', schedule);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create schedule');
    }
    return response.data;
  },

  async updateSchedule(id: string, schedule: Partial<Schedule>): Promise<Schedule> {
    const response = await apiClient.put<ApiResponse<Schedule>>(`/schedules/${id}`, schedule);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update schedule');
    }
    return response.data;
  },

  async deleteSchedule(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/schedules/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete schedule');
    }
  },
};
