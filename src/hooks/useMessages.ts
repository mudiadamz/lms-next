import { useState, useEffect } from 'react';
import { messageService } from '../services';

interface Conversation {
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const data = await messageService.getConversations();
        setConversations(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch conversations'));
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return { conversations, isLoading, error, refetch: async () => {
    try {
      setIsLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch conversations'));
    } finally {
      setIsLoading(false);
    }
  } };
}

export function useMessages(userId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const data = await messageService.getMessages(userId);
        setMessages(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

  return { messages, isLoading, error, refetch: async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const data = await messageService.getMessages(userId);
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
    } finally {
      setIsLoading(false);
    }
  } };
}
