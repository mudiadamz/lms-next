import { useState, useEffect } from 'react';
import { Notification } from '../types';
import { notificationService } from '../services';

interface UseNotificationsOptions {
  isRead?: boolean;
  limit?: number;
  offset?: number;
}

export function useNotifications(options?: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [notifs, count] = await Promise.all([
          notificationService.getNotifications(options),
          notificationService.getUnreadCount(),
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [options?.isRead, options?.limit, options?.offset]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: async () => {
      try {
        setIsLoading(true);
        const [notifs, count] = await Promise.all([
          notificationService.getNotifications(options),
          notificationService.getUnreadCount(),
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
      } finally {
        setIsLoading(false);
      }
    },
  };
}
