import { ForumPost, ForumComment } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to convert API response to ForumPost with Date objects
const mapForumPost = (post: any): ForumPost => ({
  ...post,
  createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
  comments: post.comments ? post.comments.map((c: any) => ({
    ...c,
    createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
  })) : [],
});

// Helper function to convert API response to ForumComment with Date objects
const mapForumComment = (comment: any): ForumComment => ({
  ...comment,
  createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date(),
});

export const forumService = {
  async getPosts(classId: string): Promise<ForumPost[]> {
    const response = await apiClient.get<ApiResponse<any[]>>('/forums/posts', { classId });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch forum posts');
    }
    return response.data.map(mapForumPost);
  },

  async getPostById(id: string): Promise<ForumPost> {
    const response = await apiClient.get<ApiResponse<any>>(`/forums/posts/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch forum post');
    }
    return mapForumPost(response.data);
  },

  async createPost(post: Partial<ForumPost>): Promise<ForumPost> {
    const response = await apiClient.post<ApiResponse<any>>('/forums/posts', post);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create forum post');
    }
    return mapForumPost(response.data);
  },

  async updatePost(id: string, post: Partial<ForumPost>): Promise<ForumPost> {
    const response = await apiClient.put<ApiResponse<any>>(`/forums/posts/${id}`, post);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update forum post');
    }
    return mapForumPost(response.data);
  },

  async deletePost(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/forums/posts/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete forum post');
    }
  },

  async addComment(postId: string, content: string): Promise<ForumComment> {
    const response = await apiClient.post<ApiResponse<any>>(`/forums/posts/${postId}/comments`, { content });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to add comment');
    }
    return mapForumComment(response.data);
  },

  async updateComment(id: string, content: string): Promise<ForumComment> {
    const response = await apiClient.put<ApiResponse<any>>(`/forums/comments/${id}`, { content });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update comment');
    }
    return mapForumComment(response.data);
  },

  async deleteComment(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/forums/comments/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete comment');
    }
  },
};
