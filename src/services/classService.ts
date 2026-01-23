import { Class } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const classService = {
  async getClasses(schoolLevel?: string): Promise<Class[]> {
    const params = schoolLevel ? { schoolLevel } : undefined;
    const response = await apiClient.get<ApiResponse<Class[]>>('/classes', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch classes');
    }
    
    return response.data;
  },

  async getClassById(id: string): Promise<Class> {
    const response = await apiClient.get<ApiResponse<Class>>(`/classes/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Class not found');
    }
    
    return response.data;
  },

  async createClass(classData: Omit<Class, 'id'>): Promise<Class> {
    const response = await apiClient.post<ApiResponse<Class>>('/classes', classData);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create class');
    }
    
    return response.data;
  },

  async updateClass(id: string, classData: Partial<Class>): Promise<Class> {
    const response = await apiClient.put<ApiResponse<Class>>(`/classes/${id}`, classData);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update class');
    }
    
    return response.data;
  },

  async deleteClass(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/classes/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete class');
    }
  },
};

