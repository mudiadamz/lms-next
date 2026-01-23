import { Subject } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const subjectService = {
  async getSubjects(schoolLevel?: string, teacherId?: string): Promise<Subject[]> {
    const params: Record<string, string> = {};
    if (schoolLevel) params.schoolLevel = schoolLevel;
    if (teacherId) params.teacherId = teacherId;
    
    const response = await apiClient.get<ApiResponse<Subject[]>>('/subjects', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch subjects');
    }
    
    return response.data;
  },

  async getSubjectById(id: string): Promise<Subject> {
    const response = await apiClient.get<ApiResponse<Subject>>(`/subjects/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Subject not found');
    }
    
    return response.data;
  },

  async createSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
    const response = await apiClient.post<ApiResponse<Subject>>('/subjects', subject);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create subject');
    }
    
    return response.data;
  },

  async updateSubject(id: string, subject: Partial<Subject>): Promise<Subject> {
    const response = await apiClient.put<ApiResponse<Subject>>(`/subjects/${id}`, subject);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update subject');
    }
    
    return response.data;
  },

  async deleteSubject(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/subjects/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete subject');
    }
  },
};
