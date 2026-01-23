import { useState, useEffect } from 'react';
import { Announcement } from '../types';
import { announcementService } from '../services';

interface UseAnnouncementsOptions {
  classId?: string;
  targetAudience?: string;
  isPinned?: boolean;
}

export function useAnnouncements(options?: UseAnnouncementsOptions) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const data = await announcementService.getAnnouncements(options);
        setAnnouncements(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch announcements'));
        setAnnouncements([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, [options?.classId, options?.targetAudience, options?.isPinned]);

  return { announcements, isLoading, error, refetch: () => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const data = await announcementService.getAnnouncements(options);
        setAnnouncements(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch announcements'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  } };
}
