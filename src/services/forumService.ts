import { ForumPost, ForumComment } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const forumService = {
  async getPosts(classId: string): Promise<ForumPost[]> {
    const response = await apiClient.get<ApiResponse<ForumPost[]>>('/forums/posts', { classId });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch forum posts');
    }
    return response.data;
  },

  async getPostById(id: string): Promise<ForumPost> {
    const response = await apiClient.get<ApiResponse<ForumPost>>(`/forums/posts/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch forum post');
    }
    return response.data;
  },

  async createPost(post: Partial<ForumPost>): Promise<ForumPost> {
    const response = await apiClient.post<ApiResponse<ForumPost>>('/forums/posts', post);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create forum post');
    }
    return response.data;
  },

  async updatePost(id: string, post: Partial<ForumPost>): Promise<ForumPost> {
    const response = await apiClient.put<ApiResponse<ForumPost>>(`/forums/posts/${id}`, post);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update forum post');
    }
    return response.data;
  },

  async deletePost(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/forums/posts/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete forum post');
    }
  },

  async addComment(postId: string, content: string): Promise<ForumComment> {
    const response = await apiClient.post<ApiResponse<ForumComment>>(`/forums/posts/${postId}/comments`, { content });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to add comment');
    }
    return response.data;
  },

  async updateComment(id: string, content: string): Promise<ForumComment> {
    const response = await apiClient.put<ApiResponse<ForumComment>>(`/forums/comments/${id}`, { content });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update comment');
    }
    return response.data;
  },

  async deleteComment(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/forums/comments/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete comment');
    }
  },
};
