import { User } from '../types';
// import { apiClient } from './api';
// import { PaginatedResponse } from '../types';

export const userService = {
  async getUsers(_role?: User['role']): Promise<User[]> {
    // TODO: Replace with actual API call
    return [];
  },

  async getUserById(_id: string): Promise<User> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async createUser(_user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async updateUser(_id: string, _user: Partial<User>): Promise<User> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async deleteUser(_id: string): Promise<void> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },
};

