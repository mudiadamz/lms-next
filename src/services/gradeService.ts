import { Grade, ReportCard } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const gradeService = {
  async getGrades(studentId?: string, subjectId?: string): Promise<Grade[]> {
    const params: Record<string, string> = {};
    if (studentId) params.studentId = studentId;
    if (subjectId) params.subjectId = subjectId;
    
    const response = await apiClient.get<ApiResponse<Grade[]>>('/grades', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch grades');
    }
    
    return response.data;
  },

  async getGradeById(id: string): Promise<Grade> {
    const response = await apiClient.get<ApiResponse<Grade>>(`/grades/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Grade not found');
    }
    
    return response.data;
  },

  async createGrade(grade: Omit<Grade, 'id' | 'createdAt'>): Promise<Grade> {
    const response = await apiClient.post<ApiResponse<Grade>>('/grades', grade);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create grade');
    }
    
    return response.data;
  },

  async updateGrade(id: string, grade: Partial<Grade>): Promise<Grade> {
    const response = await apiClient.put<ApiResponse<Grade>>(`/grades/${id}`, grade);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update grade');
    }
    
    return response.data;
  },

  async deleteGrade(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/grades/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete grade');
    }
  },

  async getReportCard(studentId: string, academicYear: string, semester: number): Promise<ReportCard> {
    const response = await apiClient.get<ApiResponse<ReportCard>>(
      `/grades/report-card/${studentId}`,
      { academicYear, semester: String(semester) }
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch report card');
    }
    
    return response.data;
  },
};

