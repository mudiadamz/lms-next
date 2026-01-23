import { User } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const userService = {
  async getUsers(role?: User['role']): Promise<User[]> {
    const params = role ? { role } : undefined;
    const response = await apiClient.get<ApiResponse<User[]>>('/users', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch users');
    }
    
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'User not found');
    }
    
    return response.data;
  },

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/users', user);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create user');
    }
    
    return response.data;
  },

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, user);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update user');
    }
    
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete user');
    }
  },
};

