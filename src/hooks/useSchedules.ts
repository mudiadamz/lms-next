import { useState, useEffect } from 'react';
import { Schedule } from '../types';
import { scheduleService } from '../services';

interface UseSchedulesOptions {
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  dayOfWeek?: number;
  academicYear?: string;
  semester?: number;
}

export function useSchedules(options?: UseSchedulesOptions) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        const data = await scheduleService.getSchedules(options);
        setSchedules(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch schedules'));
        setSchedules([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [options?.classId, options?.subjectId, options?.teacherId, options?.dayOfWeek, options?.academicYear, options?.semester]);

  return { schedules, isLoading, error, refetch: () => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        const data = await scheduleService.getSchedules(options);
        setSchedules(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch schedules'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedules();
  } };
}
