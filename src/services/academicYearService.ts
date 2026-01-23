import { AcademicYear } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const academicYearService = {
  async getAcademicYears(filters?: {
    isActive?: boolean;
  }): Promise<AcademicYear[]> {
    const response = await apiClient.get<ApiResponse<AcademicYear[]>>('/academic-years', filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch academic years');
    }
    return response.data;
  },

  async getAcademicYearById(id: string): Promise<AcademicYear> {
    const response = await apiClient.get<ApiResponse<AcademicYear>>(`/academic-years/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch academic year');
    }
    return response.data;
  },

  async createAcademicYear(academicYear: Partial<AcademicYear>): Promise<AcademicYear> {
    const response = await apiClient.post<ApiResponse<AcademicYear>>('/academic-years', academicYear);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create academic year');
    }
    return response.data;
  },

  async updateAcademicYear(id: string, academicYear: Partial<AcademicYear>): Promise<AcademicYear> {
    const response = await apiClient.put<ApiResponse<AcademicYear>>(`/academic-years/${id}`, academicYear);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update academic year');
    }
    return response.data;
  },

  async activateAcademicYear(id: string): Promise<AcademicYear> {
    const response = await apiClient.post<ApiResponse<AcademicYear>>(`/academic-years/${id}/activate`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to activate academic year');
    }
    return response.data;
  },
};
