import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Curriculum {
  id: string;
  name: string;
  description: string;
  schoolLevel: 'sd' | 'smp' | 'sma' | 'all';
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

export const curriculumService = {
  async getCurriculums(schoolLevel?: string): Promise<Curriculum[]> {
    const params = schoolLevel ? { schoolLevel } : undefined;
    const response = await apiClient.get<ApiResponse<Curriculum[]>>('/curriculums', params);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch curriculums');
    }

    return response.data.map(c => ({
      ...c,
      startDate: new Date(c.startDate),
      endDate: c.endDate ? new Date(c.endDate) : undefined,
      createdAt: new Date(c.createdAt),
    }));
  },

  async getCurriculumById(id: string): Promise<Curriculum> {
    const response = await apiClient.get<ApiResponse<Curriculum>>(`/curriculums/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Curriculum not found');
    }

    return {
      ...response.data,
      startDate: new Date(response.data.startDate),
      endDate: response.data.endDate ? new Date(response.data.endDate) : undefined,
      createdAt: new Date(response.data.createdAt),
    };
  },

  async createCurriculum(curriculum: Omit<Curriculum, 'id' | 'isActive' | 'createdAt'>): Promise<Curriculum> {
    const response = await apiClient.post<ApiResponse<Curriculum>>('/curriculums', {
      ...curriculum,
      startDate: curriculum.startDate instanceof Date ? curriculum.startDate.toISOString().split('T')[0] : curriculum.startDate,
      endDate: curriculum.endDate instanceof Date ? curriculum.endDate.toISOString().split('T')[0] : curriculum.endDate,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create curriculum');
    }

    return {
      ...response.data,
      startDate: new Date(response.data.startDate),
      endDate: response.data.endDate ? new Date(response.data.endDate) : undefined,
      createdAt: new Date(response.data.createdAt),
    };
  },

  async updateCurriculum(id: string, curriculum: Partial<Curriculum>): Promise<Curriculum> {
    const updateData: any = { ...curriculum };
    if (curriculum.startDate) {
      updateData.startDate = curriculum.startDate instanceof Date 
        ? curriculum.startDate.toISOString().split('T')[0] 
        : curriculum.startDate;
    }
    if (curriculum.endDate) {
      updateData.endDate = curriculum.endDate instanceof Date 
        ? curriculum.endDate.toISOString().split('T')[0] 
        : curriculum.endDate;
    }

    const response = await apiClient.put<ApiResponse<Curriculum>>(`/curriculums/${id}`, updateData);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update curriculum');
    }

    return {
      ...response.data,
      startDate: new Date(response.data.startDate),
      endDate: response.data.endDate ? new Date(response.data.endDate) : undefined,
      createdAt: new Date(response.data.createdAt),
    };
  },

  async activateCurriculum(id: string): Promise<Curriculum> {
    const response = await apiClient.post<ApiResponse<Curriculum>>(`/curriculums/${id}/activate`);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to activate curriculum');
    }

    return {
      ...response.data,
      startDate: new Date(response.data.startDate),
      endDate: response.data.endDate ? new Date(response.data.endDate) : undefined,
      createdAt: new Date(response.data.createdAt),
    };
  },

  async deleteCurriculum(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/curriculums/${id}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete curriculum');
    }
  },
};
