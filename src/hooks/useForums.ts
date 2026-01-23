import { useState, useEffect } from 'react';
import { ForumPost } from '../types';
import { forumService } from '../services';

export function useForums(classId: string) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!classId) {
      setIsLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const data = await forumService.getPosts(classId);
        setPosts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch forum posts'));
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [classId]);

  return { posts, isLoading, error, refetch: async () => {
    if (!classId) return;
    try {
      setIsLoading(true);
      const data = await forumService.getPosts(classId);
      setPosts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch forum posts'));
    } finally {
      setIsLoading(false);
    }
  } };
}
