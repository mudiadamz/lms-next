import { Quiz, QuizSubmission } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const quizService = {
  async getQuizzes(filters?: string | { classId?: string; teacherId?: string; subjectId?: string }): Promise<Quiz[]> {
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
    
    const response = await apiClient.get<ApiResponse<Quiz[]>>('/quizzes', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch quizzes');
    }
    
    return response.data;
  },

  async getQuizById(id: string): Promise<Quiz> {
    const response = await apiClient.get<ApiResponse<Quiz>>(`/quizzes/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Quiz not found');
    }
    
    return response.data;
  },

  async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>): Promise<Quiz> {
    const response = await apiClient.post<ApiResponse<Quiz>>('/quizzes', quiz);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create quiz');
    }
    
    return response.data;
  },

  async updateQuiz(id: string, quiz: Partial<Quiz>): Promise<Quiz> {
    const response = await apiClient.put<ApiResponse<Quiz>>(`/quizzes/${id}`, quiz);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update quiz');
    }
    
    return response.data;
  },

  async deleteQuiz(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/quizzes/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete quiz');
    }
  },

  async submitQuiz(quizId: string, answers: Record<string, string | string[]>): Promise<QuizSubmission> {
    const response = await apiClient.post<ApiResponse<QuizSubmission>>(
      `/quizzes/${quizId}/submit`,
      { answers }
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to submit quiz');
    }
    
    return response.data;
  },

  async getQuizSubmissions(quizId: string): Promise<QuizSubmission[]> {
    const response = await apiClient.get<ApiResponse<QuizSubmission[]>>(
      `/quizzes/${quizId}/submissions`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch quiz submissions');
    }
    
    return response.data;
  },

  async gradeQuizSubmission(submissionId: string): Promise<QuizSubmission> {
    // Auto-grading is handled on submission, but we can fetch the graded submission
    const response = await apiClient.get<ApiResponse<QuizSubmission>>(
      `/quizzes/submissions/${submissionId}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch quiz submission');
    }
    
    return response.data;
  },
};

