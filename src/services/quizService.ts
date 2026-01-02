import { Quiz, QuizSubmission } from '../types';
import { apiClient } from './api';

export const quizService = {
  async getQuizzes(_classId?: string): Promise<Quiz[]> {
    // TODO: Replace with actual API call
    return [];
  },

  async getQuizById(_id: string): Promise<Quiz> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async createQuiz(_quiz: Omit<Quiz, 'id' | 'createdAt'>): Promise<Quiz> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async updateQuiz(_id: string, _quiz: Partial<Quiz>): Promise<Quiz> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async deleteQuiz(_id: string): Promise<void> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async submitQuiz(_quizId: string, _answers: Record<string, string | string[]>): Promise<QuizSubmission> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async getQuizSubmissions(_quizId: string): Promise<QuizSubmission[]> {
    // TODO: Replace with actual API call
    return [];
  },

  async gradeQuizSubmission(_submissionId: string): Promise<QuizSubmission> {
    // TODO: Replace with actual API call (auto-grade for multiple choice)
    throw new Error('Not implemented');
  },
};

