import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { ROUTES } from '../../constants';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import './Header.css';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth();
  const { settings, toggleDarkMode } = useSettings();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getProfileRoute = () => {
    if (!user) return '';
    switch (user.role) {
      case 'student':
        return ROUTES.STUDENT_PROFILE;
      case 'teacher':
        return ROUTES.TEACHER_PROFILE;
      case 'admin':
        return ROUTES.ADMIN_PROFILE;
      case 'parent':
        return ROUTES.PARENT_PROFILE;
      default:
        return '';
    }
  };

  const handleProfileClick = () => {
    const profileRoute = getProfileRoute();
    if (profileRoute) {
      navigate(profileRoute);
      setShowUserMenu(false);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button className="header-menu-button" onClick={onMenuClick} aria-label="Menu">
            <Icon name="menu" size={24} />
          </button>
          <div className="header-logo">
            <h1>{settings.schoolName}</h1>
          </div>
        </div>
        <nav className="header-nav">
          {user && (
            <>
              <div className="header-user" onClick={() => setShowUserMenu(!showUserMenu)}>
                <span className="header-user-name">{user.fullName}</span>
                <Icon name="user" size={20} style={{ marginLeft: '0.5rem', flexShrink: 0 }} />
                {showUserMenu && (
                  <>
                    <div 
                      className="header-user-menu-overlay"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="header-user-menu">
                      <button onClick={handleProfileClick} className="header-user-menu-item header-user-menu-item--profile">
                        <Icon name="user" size={18} style={{ marginRight: '0.5rem' }} />
                        Profile
                      </button>
                      <button onClick={toggleDarkMode} className="header-user-menu-item header-user-menu-item--settings">
                        <Icon name={settings.darkMode ? 'sun' : 'moon'} size={18} style={{ marginRight: '0.5rem' }} />
                        {settings.darkMode ? 'Mode Terang' : 'Mode Gelap'}
                      </button>
                      <button onClick={logout} className="header-user-menu-item">
                        <Icon name="logout" size={18} style={{ marginRight: '0.5rem' }} />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

