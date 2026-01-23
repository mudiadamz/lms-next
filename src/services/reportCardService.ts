import { ReportCard } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const reportCardService = {
  async getReportCards(filters?: {
    studentId?: string;
    classId?: string;
    academicYear?: string;
    semester?: number;
  }): Promise<ReportCard[]> {
    const response = await apiClient.get<ApiResponse<ReportCard[]>>('/report-cards', filters);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch report cards');
    }
    return response.data;
  },

  async getReportCardById(id: string): Promise<ReportCard> {
    const response = await apiClient.get<ApiResponse<ReportCard>>(`/report-cards/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch report card');
    }
    return response.data;
  },

  async generateReportCard(data: {
    studentId: string;
    classId: string;
    academicYear: string;
    semester: number;
  }): Promise<ReportCard> {
    const response = await apiClient.post<ApiResponse<ReportCard>>('/report-cards/generate', data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate report card');
    }
    return response.data;
  },

  async updateReportCard(id: string, updates: {
    teacherNotes?: string;
    rank?: number;
  }): Promise<ReportCard> {
    const response = await apiClient.put<ApiResponse<ReportCard>>(`/report-cards/${id}`, updates);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update report card');
    }
    return response.data;
  },
};
