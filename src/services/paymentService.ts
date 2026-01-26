import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber?: string;
  classId?: string;
  className?: string;
  month: string;
  year: number;
  amount: number;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
  receiptNumber?: string;
  receiptFileUrl?: string;
  notes?: string;
  createdAt: Date;
}

export const paymentService = {
  async getPayments(filters?: {
    classId?: string;
    studentId?: string;
    status?: 'paid' | 'pending' | 'overdue';
    month?: string;
    year?: number;
  }): Promise<Payment[]> {
    const params: Record<string, string> = {};
    if (filters?.classId) params.classId = filters.classId;
    if (filters?.studentId) params.studentId = filters.studentId;
    if (filters?.status) params.status = filters.status;
    if (filters?.month) params.month = filters.month;
    if (filters?.year) params.year = String(filters.year);

    const response = await apiClient.get<ApiResponse<Payment[]>>('/payments', params);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch payments');
    }

    return response.data.map(p => ({
      ...p,
      dueDate: new Date(p.dueDate),
      createdAt: new Date(p.createdAt),
    }));
  },

  async getPaymentById(id: string): Promise<Payment> {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Payment not found');
    }

    return {
      ...response.data,
      dueDate: new Date(response.data.dueDate),
      createdAt: new Date(response.data.createdAt),
    };
  },

  async createPayment(payment: {
    classIds: string[];
    month: string;
    year: number;
    amount: number;
    dueDate: string;
    paymentMethod?: string;
    notes?: string;
  }): Promise<Payment[]> {
    const response = await apiClient.post<ApiResponse<Payment[]>>('/payments', payment);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create payment');
    }

    return response.data.map(p => ({
      ...p,
      dueDate: new Date(p.dueDate),
      createdAt: new Date(p.createdAt),
    }));
  },

  async updatePayment(id: string, payment: Partial<Payment & { classId?: string }>): Promise<Payment> {
    const response = await apiClient.put<ApiResponse<Payment>>(`/payments/${id}`, payment);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update payment');
    }

    return {
      ...response.data,
      dueDate: new Date(response.data.dueDate),
      createdAt: new Date(response.data.createdAt),
    };
  },

  async deletePayment(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/payments/${id}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete payment');
    }
  },

  async uploadReceipt(
    id: string,
    file: File,
    paymentMethod: string,
    receiptNumber?: string
  ): Promise<Payment> {
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('paymentMethod', paymentMethod);
    if (receiptNumber) {
      formData.append('receiptNumber', receiptNumber);
    }

    const token = localStorage.getItem('token');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${API_BASE_URL}/payments/${id}/upload-receipt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary for FormData
      },
      body: formData,
    });

    const data = await response.json() as ApiResponse<Payment>;

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to upload receipt');
    }

    return {
      ...data.data!,
      dueDate: new Date(data.data!.dueDate),
      createdAt: new Date(data.data!.createdAt),
    };
  },
};
