import { Attendance, AttendanceStatus } from '../types';
import { apiClient } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const attendanceService = {
  async getAttendance(studentId?: string, classId?: string, date?: Date): Promise<Attendance[]> {
    const params: Record<string, string> = {};
    if (studentId) params.studentId = studentId;
    if (classId) params.classId = classId;
    if (date) params.date = date.toISOString().split('T')[0];
    
    const response = await apiClient.get<ApiResponse<Attendance[]>>('/attendance', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch attendance');
    }
    
    return response.data;
  },

  async createAttendance(attendance: Omit<Attendance, 'id' | 'createdAt'>): Promise<Attendance> {
    const response = await apiClient.post<ApiResponse<Attendance>>('/attendance', attendance);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create attendance');
    }
    
    return response.data;
  },

  async updateAttendance(id: string, status: AttendanceStatus, notes?: string): Promise<Attendance> {
    const response = await apiClient.put<ApiResponse<Attendance>>(`/attendance/${id}`, { status, notes });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update attendance');
    }
    
    return response.data;
  },

  async bulkCreateAttendance(classId: string, date: Date, attendances: Array<{ studentId: string; status: AttendanceStatus }>): Promise<Attendance[]> {
    const response = await apiClient.post<ApiResponse<Attendance[]>>('/attendance/bulk', {
      classId,
      date: date.toISOString().split('T')[0],
      attendances,
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create bulk attendance');
    }
    
    return response.data;
  },
};

