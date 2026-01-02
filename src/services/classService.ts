import { Class } from '../types';
import { apiClient } from './api';

export const classService = {
  async getClasses(schoolLevel?: string): Promise<Class[]> {
    // TODO: Replace with actual API call
    return [];
  },

  async getClassById(id: string): Promise<Class> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async createClass(classData: Omit<Class, 'id'>): Promise<Class> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async updateClass(id: string, classData: Partial<Class>): Promise<Class> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async deleteClass(id: string): Promise<void> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },
};

