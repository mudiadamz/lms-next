import { User } from '../types';
import { apiClient } from './api';
import { PaginatedResponse } from '../types';

export const userService = {
  async getUsers(role?: User['role']): Promise<User[]> {
    // TODO: Replace with actual API call
    return [];
  },

  async getUserById(id: string): Promise<User> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async deleteUser(id: string): Promise<void> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },
};

