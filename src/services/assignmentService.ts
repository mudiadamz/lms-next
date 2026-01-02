import { Assignment, AssignmentSubmission } from '../types';
import { apiClient } from './api';
import { PaginatedResponse } from '../types';

export const assignmentService = {
  async getAssignments(classId?: string): Promise<Assignment[]> {
    // TODO: Replace with actual API call
    // return apiClient.get<Assignment[]>('/assignments', { classId });
    return [];
  },

  async getAssignmentById(id: string): Promise<Assignment> {
    // TODO: Replace with actual API call
    // return apiClient.get<Assignment>(`/assignments/${id}`);
    throw new Error('Not implemented');
  },

  async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assignment> {
    // TODO: Replace with actual API call
    // return apiClient.post<Assignment>('/assignments', assignment);
    throw new Error('Not implemented');
  },

  async updateAssignment(id: string, assignment: Partial<Assignment>): Promise<Assignment> {
    // TODO: Replace with actual API call
    // return apiClient.put<Assignment>(`/assignments/${id}`, assignment);
    throw new Error('Not implemented');
  },

  async deleteAssignment(id: string): Promise<void> {
    // TODO: Replace with actual API call
    // return apiClient.delete(`/assignments/${id}`);
    throw new Error('Not implemented');
  },

  async submitAssignment(assignmentId: string, submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'>): Promise<AssignmentSubmission> {
    // TODO: Replace with actual API call
    // return apiClient.post<AssignmentSubmission>(`/assignments/${assignmentId}/submissions`, submission);
    throw new Error('Not implemented');
  },

  async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    // TODO: Replace with actual API call
    // return apiClient.get<AssignmentSubmission[]>(`/assignments/${assignmentId}/submissions`);
    return [];
  },

  async gradeSubmission(submissionId: string, score: number, feedback?: string): Promise<AssignmentSubmission> {
    // TODO: Replace with actual API call
    // return apiClient.patch<AssignmentSubmission>(`/submissions/${submissionId}`, { score, feedback });
    throw new Error('Not implemented');
  },
};

