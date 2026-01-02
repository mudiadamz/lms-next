import { Class } from '../types';
// import { apiClient } from './api';

export const classService = {
  async getClasses(_schoolLevel?: string): Promise<Class[]> {
    // TODO: Replace with actual API call
    return [];
  },

  async getClassById(_id: string): Promise<Class> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async createClass(_classData: Omit<Class, 'id'>): Promise<Class> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async updateClass(_id: string, _classData: Partial<Class>): Promise<Class> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async deleteClass(_id: string): Promise<void> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },
};

