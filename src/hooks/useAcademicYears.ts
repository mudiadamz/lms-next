import { useState, useEffect } from 'react';
import { AcademicYear } from '../types';
import { academicYearService } from '../services';

interface UseAcademicYearsOptions {
  isActive?: boolean;
}

export function useAcademicYears(options?: UseAcademicYearsOptions) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        setIsLoading(true);
        const data = await academicYearService.getAcademicYears(options);
        setAcademicYears(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch academic years'));
        setAcademicYears([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcademicYears();
  }, [options?.isActive]);

  return { academicYears, isLoading, error, refetch: async () => {
    try {
      setIsLoading(true);
      const data = await academicYearService.getAcademicYears(options);
      setAcademicYears(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch academic years'));
    } finally {
      setIsLoading(false);
    }
  } };
}
