import { Material } from '../types';
// import { apiClient } from './api';

export const materialService = {
  async getMaterials(_classId?: string, _subjectId?: string): Promise<Material[]> {
    // TODO: Replace with actual API call
    return [];
  },

  async getMaterialById(_id: string): Promise<Material> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async createMaterial(_material: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async updateMaterial(_id: string, _material: Partial<Material>): Promise<Material> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async deleteMaterial(_id: string): Promise<void> {
    // TODO: Replace with actual API call
    throw new Error('Not implemented');
  },

  async uploadFile(_file: File, _materialId: string): Promise<string> {
    // TODO: Implement file upload
    throw new Error('Not implemented');
  },
};

