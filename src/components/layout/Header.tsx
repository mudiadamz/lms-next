import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import './Header.css';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

