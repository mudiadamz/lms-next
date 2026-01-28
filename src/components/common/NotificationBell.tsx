import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { notificationService } from '../../services';
import { getRelativeTime } from '../../utils';
import { requestNotificationPermission, showBrowserNotification } from '../../utils/browserNotification';
import './NotificationBell.css';

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, refetch } = useNotifications({ limit: 10 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Request permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Auto-refresh and check for new notifications
  useEffect(() => {
    let prevCount = unreadCount;

    const interval = setInterval(async () => {
      await refetch();
      
      // Show browser notification if new notifications
      const newCount = unreadCount;
      if (newCount > prevCount) {
        showBrowserNotification('Notifikasi Baru', {
          body: `Anda memiliki ${newCount - prevCount} notifikasi baru`,
          tag: 'new-notification',
        });
      }
      prevCount = newCount;
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, [refetch, unreadCount]);

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.isRead) {
      await notificationService.markAsRead(notification.id);
      refetch();
    }

    // Navigate if has link
    if (notification.link) {
      navigate(notification.link);
    }

    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    refetch();
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      assignment: '📝',
      quiz: '📋',
      grade: '📊',
      announcement: '📢',
      payment: '💰',
      attendance: '✅',
      message: '💬',
      other: '🔔',
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button 
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifikasi</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read"
                onClick={handleMarkAllRead}
              >
                Tandai Semua Dibaca
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <div style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '0.5rem' }}>🔔</div>
                <p>Tidak ada notifikasi</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.isRead ? 'notification-item--unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notif.title}</div>
                    <div className="notification-message">{notif.message}</div>
                    <div className="notification-time">{getRelativeTime(notif.createdAt)}</div>
                  </div>
                  {!notif.isRead && <div className="notification-dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
