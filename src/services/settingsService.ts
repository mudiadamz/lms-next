import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaymentSettings {
  defaultAmount?: number;
  defaultDueDay?: number;
  autoGenerate?: boolean;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  paymentMethods?: string[];
}

export interface SchoolSettings {
  schoolName: string;
  address: string;
  schoolLevel: 'sd' | 'smp' | 'sma' | '';
  darkMode: boolean;
  paymentSettings?: PaymentSettings;
}

export const settingsService = {
  async getSettings(): Promise<SchoolSettings> {
    const response = await apiClient.get<ApiResponse<SchoolSettings>>('/settings');

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch settings');
    }

    return response.data;
  },

  async updateSettings(settings: Partial<SchoolSettings>): Promise<SchoolSettings> {
    const response = await apiClient.put<ApiResponse<SchoolSettings>>('/settings', settings);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update settings');
    }

    return response.data;
  },

  async updateDarkMode(darkMode: boolean): Promise<{ darkMode: boolean }> {
    const response = await apiClient.put<ApiResponse<{ darkMode: boolean }>>('/settings/dark-mode', { darkMode });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update dark mode');
    }

    return response.data;
  },
};
