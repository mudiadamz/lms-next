import { Material } from '../types';
import { apiClient } from './api';

export const materialService = {
  async getMaterials(classId?: string, subjectId?: string): Promise<Material[]> {
    // TODO: Replace with actual API call
    return [];
  },

  async getMaterialById(id: string): Promise<Material> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async createMaterial(material: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async updateMaterial(id: string, material: Partial<Material>): Promise<Material> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async deleteMaterial(id: string): Promise<void> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async uploadFile(file: File, materialId: string): Promise<string> {
    // TODO: Implement file upload
    throw new Error('Not implemented');
  },
};

