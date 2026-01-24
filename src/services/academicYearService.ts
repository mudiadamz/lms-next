import { AcademicYear } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to convert API response to AcademicYear with Date objects
const mapAcademicYear = (ay: any): AcademicYear => {
  const startDate = ay.startDate ? new Date(ay.startDate) : null;
  const endDate = ay.endDate ? new Date(ay.endDate) : null;
  
  // Validate dates - if invalid, set to null
  const validStartDate = startDate && !isNaN(startDate.getTime()) ? startDate : null;
  const validEndDate = endDate && !isNaN(endDate.getTime()) ? endDate : null;
  
  return {
    ...ay,
    startDate: validStartDate || new Date(), // Fallback to current date if invalid
    endDate: validEndDate || new Date(), // Fallback to current date if invalid
  };
};

export const academicYearService = {
  async getAcademicYears(filters?: {
    isActive?: boolean;
  }): Promise<AcademicYear[]> {
    const response = await apiClient.get<ApiResponse<any[]>>('/academic-years', filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch academic years');
    }
    return response.data.map(mapAcademicYear);
  },

  async getAcademicYearById(id: string): Promise<AcademicYear> {
    const response = await apiClient.get<ApiResponse<any>>(`/academic-years/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch academic year');
    }
    return mapAcademicYear(response.data);
  },

  async createAcademicYear(academicYear: Partial<AcademicYear>): Promise<AcademicYear> {
    const response = await apiClient.post<ApiResponse<any>>('/academic-years', academicYear);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create academic year');
    }
    return mapAcademicYear(response.data);
  },

  async updateAcademicYear(id: string, academicYear: Partial<AcademicYear>): Promise<AcademicYear> {
    const response = await apiClient.put<ApiResponse<any>>(`/academic-years/${id}`, academicYear);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update academic year');
    }
    return mapAcademicYear(response.data);
  },

  async activateAcademicYear(id: string): Promise<AcademicYear> {
    const response = await apiClient.post<ApiResponse<any>>(`/academic-years/${id}/activate`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to activate academic year');
    }
    return mapAcademicYear(response.data);
  },
};
