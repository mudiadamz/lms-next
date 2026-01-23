import { Message } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Conversation {
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export const messageService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<ApiResponse<Conversation[]>>('/messages/conversations');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch conversations');
    }
    return response.data;
  },

  async getMessages(userId: string, limit?: number, offset?: number): Promise<Message[]> {
    const params: any = {};
    if (limit !== undefined) params.limit = limit;
    if (offset !== undefined) params.offset = offset;
    
    const response = await apiClient.get<ApiResponse<Message[]>>(`/messages/${userId}`, params);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch messages');
    }
    return response.data;
  },

  async sendMessage(message: {
    receiverId: string;
    subject?: string;
    content: string;
    attachments?: Array<{ fileUrl: string; fileName: string }>;
  }): Promise<Message> {
    const response = await apiClient.post<ApiResponse<Message>>('/messages', message);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to send message');
    }
    return response.data;
  },

  async markAsRead(id: string): Promise<void> {
    const response = await apiClient.patch<ApiResponse<void>>(`/messages/${id}/read`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to mark message as read');
    }
  },

  async deleteMessage(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/messages/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete message');
    }
  },
};
