import { Assignment, AssignmentSubmission } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const assignmentService = {
  async getAssignments(filters?: string | { classId?: string; teacherId?: string; subjectId?: string }): Promise<Assignment[]> {
    let params: Record<string, string> | undefined;
    
    if (typeof filters === 'string') {
      // Legacy: classId as string
      params = { classId: filters };
    } else if (filters) {
      // New: filters object
      params = {};
      if (filters.classId) params.classId = filters.classId;
      if (filters.teacherId) params.teacherId = filters.teacherId;
      if (filters.subjectId) params.subjectId = filters.subjectId;
    }
    
    const response = await apiClient.get<ApiResponse<Assignment[]>>('/assignments', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch assignments');
    }
    
    return response.data;
  },

  async getAssignmentById(id: string): Promise<Assignment> {
    const response = await apiClient.get<ApiResponse<Assignment>>(`/assignments/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Assignment not found');
    }
    
    return response.data;
  },

  async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assignment> {
    const response = await apiClient.post<ApiResponse<Assignment>>('/assignments', assignment);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create assignment');
    }
    
    return response.data;
  },

  async updateAssignment(id: string, assignment: Partial<Assignment>): Promise<Assignment> {
    const response = await apiClient.put<ApiResponse<Assignment>>(`/assignments/${id}`, assignment);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update assignment');
    }
    
    return response.data;
  },

  async deleteAssignment(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/assignments/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete assignment');
    }
  },

  async submitAssignment(assignmentId: string, submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'>): Promise<AssignmentSubmission> {
    const response = await apiClient.post<ApiResponse<AssignmentSubmission>>(
      `/assignments/${assignmentId}/submissions`,
      submission
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to submit assignment');
    }
    
    return response.data;
  },

  async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    const response = await apiClient.get<ApiResponse<AssignmentSubmission[]>>(
      `/assignments/${assignmentId}/submissions`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch submissions');
    }
    
    return response.data;
  },

  async gradeSubmission(submissionId: string, score: number, feedback?: string): Promise<AssignmentSubmission> {
    const response = await apiClient.patch<ApiResponse<AssignmentSubmission>>(
      `/assignments/submissions/${submissionId}`,
      { score, feedback }
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to grade submission');
    }
    
    return response.data;
  },

  async uploadFile(file: File): Promise<{ url: string; name: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const response = await fetch(`${API_BASE_URL}/assignments/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to upload file');
    }
    
    return data.data;
  },
};

