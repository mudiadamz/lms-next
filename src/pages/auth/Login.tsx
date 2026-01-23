import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { ROUTES } from '../../constants';
import './Login.css';

export const Login = () => {
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const performLogin = async (username: string, pass: string) => {
    setError('');
    setIsLoading(true);

    try {
      await login(username, pass);
      
      // Redirect based on role
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      switch (user.role) {
        case 'student':
          navigate(ROUTES.STUDENT_DASHBOARD);
          break;
        case 'teacher':
          navigate(ROUTES.TEACHER_DASHBOARD);
          break;
        case 'admin':
          navigate(ROUTES.ADMIN_DASHBOARD);
          break;
        case 'parent':
          navigate(ROUTES.PARENT_DASHBOARD);
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(studentNumber, password);
  };

  const handleQuickLogin = async (username: string, password: string) => {
    setStudentNumber(username);
    setPassword(password);
    await performLogin(username, password);
  };


  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-header">
          <div className="login-header-icon">
            <Icon name="book" size={36} />
          </div>
          <h1>{settings.schoolName}</h1>
          <p>Silakan login untuk melanjutkan</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <Input
            label="Username"
            type="text"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
            required
            autoFocus
            placeholder="Masukkan username (student/teacher/admin/parent)"
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Masukkan password"
          />
          
          <Button type="submit" isLoading={isLoading} className="login-button">
            Login
          </Button>
        </form>
        
        <div className="login-info">
          <p className="login-info-title"><strong>Login Cepat (Demo):</strong></p>
          <div className="login-buttons-grid">
            <button
              type="button"
              className="login-quick-button login-quick-button--admin"
              onClick={() => handleQuickLogin('admin', 'password')}
              disabled={isLoading}
            >
              <Icon name="users" size={18} />
              <span>Admin</span>
            </button>
            <button
              type="button"
              className="login-quick-button login-quick-button--teacher"
              onClick={() => handleQuickLogin('teacher', 'password')}
              disabled={isLoading}
            >
              <Icon name="user" size={18} />
              <span>Guru</span>
            </button>
            <button
              type="button"
              className="login-quick-button login-quick-button--student"
              onClick={() => handleQuickLogin('student', 'password')}
              disabled={isLoading}
            >
              <Icon name="userGroup" size={18} />
              <span>Murid</span>
            </button>
            <button
              type="button"
              className="login-quick-button login-quick-button--parent"
              onClick={() => handleQuickLogin('parent', 'password')}
              disabled={isLoading}
            >
              <Icon name="users" size={18} />
              <span>Orang Tua</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

