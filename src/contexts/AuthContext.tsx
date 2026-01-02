import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (studentNumber: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token and user data
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (studentNumber: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now, using mock data
      const mockUsers: User[] = [
        {
          id: '1',
          studentNumber: '2024001',
          fullName: 'Budi Santoso',
          role: 'student',
          schoolLevel: 'sma',
          classId: 'class1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          teacherNumber: '1985001',
          fullName: 'Ibu Siti',
          role: 'teacher',
          schoolLevel: 'sma',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          adminNumber: 'ADM001',
          fullName: 'Admin Sekolah',
          role: 'admin',
          schoolLevel: 'sma',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '4',
          studentNumber: '2024001', // Parent uses student's number
          fullName: 'Bapak Santoso',
          role: 'parent',
          studentId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Find user by studentNumber, teacherNumber, or adminNumber
      const foundUser = mockUsers.find(
        (u) =>
          u.studentNumber === studentNumber ||
          u.teacherNumber === studentNumber ||
          u.adminNumber === studentNumber
      );
      
      if (foundUser && password === 'password') {
        const token = `mock_token_${foundUser.id}`;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(foundUser));
        setUser(foundUser);
      } else {
        throw new Error('Nomor induk atau password salah');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

