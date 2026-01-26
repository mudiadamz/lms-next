import { Class } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const classService = {
  async getClasses(schoolLevel?: string): Promise<Class[]> {
    try {
      const params = schoolLevel ? { schoolLevel } : undefined;
      const response = await apiClient.get<ApiResponse<Class[]>>('/classes', params);
      
      console.log('getClasses response:', response);
      
      if (!response.success) {
        console.error('getClasses failed:', response.error);
        throw new Error(response.error || 'Failed to fetch classes');
      }
      
      // Return empty array if data is null/undefined, otherwise return the data (even if empty array)
      const result = response.data || [];
      console.log('getClasses returning:', result, 'length:', result.length);
      return result;
    } catch (error) {
      console.error('getClasses error:', error);
      throw error;
    }
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

