import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BadgeCounts {
  assignments?: number;
  quizzes?: number;
  payments?: number;
  grading?: number;
  notifications?: number;
}

export const badgeService = {
  async getBadges(): Promise<BadgeCounts> {
    const response = await apiClient.get<ApiResponse<BadgeCounts>>('/badges');
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch badges');
    }
    
    return response.data;
  },
};
