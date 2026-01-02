import { Grade, ReportCard } from '../types';
// import { apiClient } from './api';

export const gradeService = {
  async getGrades(_studentId?: string, _subjectId?: string): Promise<Grade[]> {
    // TODO: Replace with actual API call
    return [];
  },

  async createGrade(_grade: Omit<Grade, 'id' | 'createdAt'>): Promise<Grade> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async updateGrade(_id: string, _grade: Partial<Grade>): Promise<Grade> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async deleteGrade(_id: string): Promise<void> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async getReportCard(_studentId: string, _academicYear: string, _semester: number): Promise<ReportCard> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },
};

