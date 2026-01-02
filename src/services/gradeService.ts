import { Grade, ReportCard } from '../types';
import { apiClient } from './api';

export const gradeService = {
  async getGrades(studentId?: string, subjectId?: string): Promise<Grade[]> {
    // TODO: Replace with actual API call
    return [];
  },

  async createGrade(grade: Omit<Grade, 'id' | 'createdAt'>): Promise<Grade> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async updateGrade(id: string, grade: Partial<Grade>): Promise<Grade> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async deleteGrade(id: string): Promise<void> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async getReportCard(studentId: string, academicYear: string, semester: number): Promise<ReportCard> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },
};

