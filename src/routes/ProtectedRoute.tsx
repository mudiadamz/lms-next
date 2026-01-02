import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'student':
        return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
      case 'teacher':
        return <Navigate to={ROUTES.TEACHER_DASHBOARD} replace />;
      case 'admin':
        return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
      case 'parent':
        return <Navigate to={ROUTES.PARENT_DASHBOARD} replace />;
      default:
        return <Navigate to={ROUTES.LOGIN} replace />;
    }
  }

  return <>{children}</>;
};

