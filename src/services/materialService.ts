import { Material } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const materialService = {
  async getMaterials(classId?: string, subjectId?: string): Promise<Material[]> {
    const params: Record<string, string> = {};
    if (classId) params.classId = classId;
    if (subjectId) params.subjectId = subjectId;
    
    const response = await apiClient.get<ApiResponse<Material[]>>('/materials', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch materials');
    }
    
    return response.data;
  },

  async getMaterialById(id: string): Promise<Material> {
    const response = await apiClient.get<ApiResponse<Material>>(`/materials/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Material not found');
    }
    
    return response.data;
  },

  async createMaterial(material: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
    const response = await apiClient.post<ApiResponse<Material>>('/materials', material);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create material');
    }
    
    return response.data;
  },

  async updateMaterial(id: string, material: Partial<Material>): Promise<Material> {
    const response = await apiClient.put<ApiResponse<Material>>(`/materials/${id}`, material);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update material');
    }
    
    return response.data;
  },

  async deleteMaterial(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/materials/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete material');
    }
  },

  async uploadFile(file: File, materialId: string): Promise<string> {
    // TODO: Implement actual file upload endpoint
    // For now, return a placeholder URL
    throw new Error('File upload not yet implemented');
  },
};

