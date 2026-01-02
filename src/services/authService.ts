import { User } from '../types';
// import { apiClient } from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // TODO: Replace with actual API call
    // For now, return mock data
    const mockUsers: Record<string, User> = {
      student: {
        id: '1',
        studentNumber: '2024001',
        email: 'student@example.com',
        fullName: 'Budi Santoso',
        role: 'student',
        schoolLevel: 'sma',
        classId: 'class1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      teacher: {
        id: '2',
        teacherNumber: '1985001',
        email: 'teacher@example.com',
        fullName: 'Ibu Siti',
        role: 'teacher',
        schoolLevel: 'sma',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      admin: {
        id: '3',
        adminNumber: 'ADM001',
        email: 'admin@example.com',
        fullName: 'Admin Sekolah',
        role: 'admin',
        schoolLevel: 'sma',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      parent: {
        id: '4',
        studentNumber: '2024001',
        email: 'parent@example.com',
        fullName: 'Bapak Santoso',
        role: 'parent',
        studentId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const foundUser = mockUsers[credentials.username.toLowerCase()];
    
    if (foundUser && credentials.password === 'password') {
      const token = `mock_token_${foundUser.id}`;
      return {
        user: foundUser,
        token,
      };
    }

    throw new Error('Invalid username or password');
  },

  async logout(): Promise<void> {
    // TODO: Call logout API endpoint
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User | null> {
    // TODO: Replace with actual API call
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  },
};

