import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { ROUTES } from '../../constants';
import { Icon } from '../common/Icon';
import { notificationService } from '../../services';
import { formatDateTime } from '../../utils/dateUtils';
import './Header.css';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth();
  const { settings, toggleDarkMode } = useSettings();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAnnouncementMenu, setShowAnnouncementMenu] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);

  useEffect(() => {
    const loadAnnouncements = async () => {
      if (!user) return;
      try {
        const data = await notificationService.getNotifications({ limit: 20 });
        const announcementItems = data
          .filter((item) => item.type === 'announcement')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAnnouncements(announcementItems);
        setUnreadAnnouncements(announcementItems.filter((item) => !item.isRead).length);
      } catch (error) {
        console.error('Error loading announcements:', error);
      }
    };

    loadAnnouncements();
  }, [user]);

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

  const getAnnouncementRoute = () => {
    if (!user) return '';
    switch (user.role) {
      case 'admin':
        return ROUTES.ADMIN_ANNOUNCEMENTS;
      case 'teacher':
        return ROUTES.TEACHER_ANNOUNCEMENTS;
      case 'student':
        return ROUTES.STUDENT_DASHBOARD;
      case 'parent':
        return ROUTES.PARENT_DASHBOARD;
      default:
        return '';
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
              {announcements.length > 0 && (
                <div className="header-notification">
                  <button
                    className="header-notification-button"
                    onClick={() => {
                      setShowAnnouncementMenu(!showAnnouncementMenu);
                      setShowUserMenu(false);
                    }}
                    aria-label="Pengumuman"
                  >
                    <Icon name="announcement" size={20} />
                    {unreadAnnouncements > 0 && (
                      <span className="header-notification-badge">{unreadAnnouncements}</span>
                    )}
                  </button>
                  {showAnnouncementMenu && (
                    <>
                      <div
                        className="header-notification-overlay"
                        onClick={() => setShowAnnouncementMenu(false)}
                      />
                      <div className="header-notification-menu">
                        <div className="header-notification-title">Pengumuman</div>
                        {announcements.map((item) => (
                          <button
                            key={item.id}
                            className="header-notification-item"
                            onClick={async () => {
                              try {
                                if (!item.isRead) {
                                  await notificationService.markAsRead(item.id);
                                  setUnreadAnnouncements((prev) => Math.max(prev - 1, 0));
                                }
                                const fallbackRoute = getAnnouncementRoute();
                                if (item.link) {
                                  const match = item.link.match(/\/announcements\/([^/?#]+)/);
                                  if (match && fallbackRoute) {
                                    navigate(`${fallbackRoute}?announcementId=${match[1]}`);
                                  } else {
                                    navigate(item.link);
                                  }
                                } else if (fallbackRoute) {
                                  navigate(`${fallbackRoute}?announcementId=${item.id}`);
                                }
                              } catch (error) {
                                console.error('Error updating announcement:', error);
                              } finally {
                                setShowAnnouncementMenu(false);
                              }
                            }}
                          >
                            <div className="header-notification-item-title">{item.title}</div>
                            <div className="header-notification-item-time">
                              {formatDateTime(item.createdAt)}
                            </div>
                            <div className="header-notification-item-message">{item.message}</div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="header-user" onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowAnnouncementMenu(false);
              }}>
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

