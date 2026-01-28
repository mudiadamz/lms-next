import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';
import { Icon, IconName } from '../common/Icon';
import { badgeService } from '../../services/badgeService';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon?: IconName;
  badge?: number;
  subMenu?: SubMenuItem[];
}

interface SubMenuItem {
  label: string;
  path: string;
  role?: string;
}

const normalizeRole = (role: string) => {
  const normalized = role.toLowerCase();
  if (normalized === 'guru') return 'teacher';
  if (normalized === 'murid' || normalized === 'siswa') return 'student';
  if (normalized === 'ortu' || normalized === 'wali') return 'parent';
  return normalized;
};

const getMenuItems = (role: string): MenuItem[] => {
  switch (normalizeRole(role)) {
    case 'student':
      return [
        { label: 'Dashboard', path: ROUTES.STUDENT_DASHBOARD, icon: 'home' },
        { label: 'Tugas', path: ROUTES.STUDENT_ASSIGNMENTS, icon: 'assignment' },
        { label: 'Kuis/Test/Ujian', path: ROUTES.STUDENT_QUIZZES, icon: 'quiz' },
        { label: 'Forum', path: ROUTES.STUDENT_FORUM, icon: 'forum' },
        { label: 'Jadwal', path: ROUTES.STUDENT_SCHEDULE, icon: 'schedule' },
        { label: 'Absensi', path: ROUTES.STUDENT_ATTENDANCE, icon: 'checkCircle' },
        { label: 'Pembayaran SPP', path: ROUTES.STUDENT_PAYMENT, icon: 'analytics' },
        { label: 'Materi', path: ROUTES.STUDENT_MATERIALS, icon: 'document' },
        { label: 'Nilai', path: ROUTES.STUDENT_PORTFOLIO, icon: 'grade' },
        { label: 'Kalender', path: ROUTES.STUDENT_CALENDAR, icon: 'calendar' },
      ];
    case 'teacher':
      return [
        { label: 'Dashboard', path: ROUTES.TEACHER_DASHBOARD, icon: 'home' },
        { label: 'Kelas', path: ROUTES.TEACHER_CLASSES, icon: 'userGroup' },
        { label: 'Materi', path: ROUTES.TEACHER_MATERIALS, icon: 'document' },
        { label: 'Tugas', path: ROUTES.TEACHER_ASSIGNMENTS, icon: 'assignment' },
        { label: 'Penilaian Tugas', path: ROUTES.TEACHER_GRADING, icon: 'grade' },
        { label: 'Kuis/Test/Ujian', path: ROUTES.TEACHER_QUIZZES, icon: 'quiz' },
        { label: 'Absensi', path: ROUTES.TEACHER_ATTENDANCE, icon: 'checkCircle' },
        { label: 'Forum', path: ROUTES.TEACHER_FORUM, icon: 'forum' },
        { label: 'Jadwal', path: ROUTES.TEACHER_SCHEDULE, icon: 'schedule' },
        { label: 'Kurikulum', path: ROUTES.ADMIN_CURRICULUM, icon: 'book' },
        { label: 'Rapor', path: ROUTES.TEACHER_REPORTS, icon: 'report' },
        { label: 'Pengumuman', path: ROUTES.TEACHER_ANNOUNCEMENTS, icon: 'announcement' },
        { label: 'Kalender', path: ROUTES.TEACHER_CALENDAR, icon: 'calendar' },
      ];
    case 'admin':
      return [
        { label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: 'home' },
        { label: 'Guru', path: `${ROUTES.ADMIN_USERS}?role=teacher`, icon: 'user' },
        { label: 'Murid', path: `${ROUTES.ADMIN_USERS}?role=student`, icon: 'users' },
        { label: 'Pembayaran SPP', path: ROUTES.ADMIN_PAYMENT, icon: 'analytics' },
        { label: 'Kelas', path: ROUTES.ADMIN_CLASSES, icon: 'userGroup' },
        { label: 'Mata Pelajaran', path: ROUTES.ADMIN_SUBJECTS, icon: 'book' },
        { label: 'Jadwal', path: ROUTES.ADMIN_SCHEDULE, icon: 'schedule' },
        { label: 'Tahun Ajaran', path: ROUTES.ADMIN_ACADEMIC_YEAR, icon: 'calendar' },
        { label: 'Pengumuman', path: ROUTES.ADMIN_ANNOUNCEMENTS, icon: 'announcement' },
        { label: 'Laporan', path: ROUTES.ADMIN_REPORTS, icon: 'report' },
        { label: 'Kurikulum', path: ROUTES.ADMIN_CURRICULUM, icon: 'book' },
        { label: 'Pengaturan', path: ROUTES.ADMIN_SETTINGS, icon: 'settings' },
      ];
    case 'parent':
      return [
        { label: 'Dashboard', path: ROUTES.PARENT_DASHBOARD, icon: 'home' },
        { label: 'Jadwal', path: ROUTES.PARENT_SCHEDULE, icon: 'schedule' },
        { label: 'Absensi', path: ROUTES.PARENT_ATTENDANCE, icon: 'checkCircle' },
        { label: 'Pembayaran SPP', path: ROUTES.PARENT_PAYMENT, icon: 'analytics' },
        { label: 'Materi', path: ROUTES.PARENT_MATERIALS, icon: 'document' },
        { label: 'Tugas', path: ROUTES.PARENT_ASSIGNMENTS, icon: 'assignment' },
        { label: 'Kuis/Test/Ujian', path: ROUTES.PARENT_QUIZZES, icon: 'quiz' },
        { label: 'Nilai', path: ROUTES.PARENT_GRADES, icon: 'grade' },
        { label: 'Forum', path: ROUTES.PARENT_FORUM, icon: 'forum' },
        { label: 'Portofolio', path: ROUTES.PARENT_PORTFOLIO, icon: 'folder' },
        { label: 'Kalender', path: ROUTES.PARENT_CALENDAR, icon: 'calendar' },
      ];
    default:
      return [];
  }
};

export const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const [menuBadges, setMenuBadges] = useState<Record<string, number>>({});
  
  // Auto-expand menus that have active sub-items
  const getInitialExpandedMenus = (items: MenuItem[]): string[] => {
    return items
      .filter((item) => {
        if (!item.subMenu) return false;
        return item.subMenu.some((subItem) => {
          const [path, query] = subItem.path.split('?');
          if (query) {
            const params = new URLSearchParams(query);
            const role = params.get('role');
            const currentParams = new URLSearchParams(location.search);
            return location.pathname === path && currentParams.get('role') === role;
          }
          return location.pathname === path;
        });
      })
      .map((item) => item.path);
  };

  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    if (!user) return [];
    const menuItems = getMenuItems(user.role);
    return getInitialExpandedMenus(menuItems);
  });

  // Fetch all badge counts in ONE API call
  useEffect(() => {
    const fetchBadgeCounts = async () => {
      if (!user) return;

      try {
        const badges = await badgeService.getBadges();

        // Map badge counts to routes
        const badgeMap: Record<string, number> = {};

        if (user.role === 'student') {
          if (badges.assignments) badgeMap[ROUTES.STUDENT_ASSIGNMENTS] = badges.assignments;
          if (badges.quizzes) badgeMap[ROUTES.STUDENT_QUIZZES] = badges.quizzes;
          if (badges.payments) badgeMap[ROUTES.STUDENT_PAYMENT] = badges.payments;
        } else if (user.role === 'teacher') {
          if (badges.grading) badgeMap[ROUTES.TEACHER_GRADING] = badges.grading;
        } else if (user.role === 'admin') {
          if (badges.payments) badgeMap[ROUTES.ADMIN_PAYMENT] = badges.payments;
        }

        setMenuBadges(badgeMap);
      } catch (error) {
        console.error('Error fetching badge counts:', error);
      }
    };

    fetchBadgeCounts();
    // Refresh every 5 minutes
    const interval = setInterval(fetchBadgeCounts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const menuItems = getMenuItems(user.role).map(item => ({
    ...item,
    badge: menuBadges[item.path] || undefined,
  }));

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const isMenuExpanded = (path: string) => {
    return expandedMenus.includes(path);
  };

  const toggleSubMenu = (path: string) => {
    setExpandedMenus((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const isSubMenuActive = (subMenu: SubMenuItem[]) => {
    return subMenu.some((subItem) => {
      const [path, query] = subItem.path.split('?');
      if (query) {
        const params = new URLSearchParams(query);
        const role = params.get('role');
        const currentParams = new URLSearchParams(location.search);
        return location.pathname === path && currentParams.get('role') === role;
      }
      return location.pathname === path;
    });
  };

  const isSubMenuItemActive = (subItem: SubMenuItem) => {
    const [path, query] = subItem.path.split('?');
    if (query) {
      const params = new URLSearchParams(query);
      const role = params.get('role');
      const currentParams = new URLSearchParams(location.search);
      return location.pathname === path && currentParams.get('role') === role;
    }
    return location.pathname === path;
  };

  const isMenuItemActive = (itemPath: string) => {
    const [path, query] = itemPath.split('?');
    if (query) {
      const params = new URLSearchParams(query);
      const role = params.get('role');
      const currentParams = new URLSearchParams(location.search);
      return location.pathname === path && currentParams.get('role') === role;
    }
    return location.pathname === path;
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => {
              const hasSubMenu = item.subMenu && item.subMenu.length > 0;
              const isExpanded = hasSubMenu && isMenuExpanded(item.path);
              const isActive = hasSubMenu ? isSubMenuActive(item.subMenu!) : isMenuItemActive(item.path);

              return (
                <li key={item.path}>
                  {hasSubMenu ? (
                    <>
                      <button
                        className={`sidebar-menu-item ${isActive ? 'sidebar-menu-item--active' : ''} ${isExpanded ? 'sidebar-menu-item--expanded' : ''}`}
                        onClick={() => toggleSubMenu(item.path)}
                      >
                        {item.icon && (
                          <span className="sidebar-menu-icon">
                            <Icon name={item.icon} size={22} />
                          </span>
                        )}
                        <span className="sidebar-menu-label">{item.label}</span>
                        <span className="sidebar-menu-arrow">
                          <Icon name="chevronRight" size={16} />
                        </span>
                      </button>
                      {isExpanded && (
                        <ul className="sidebar-submenu">
                          {item.subMenu!.map((subItem) => (
                            <li key={subItem.path}>
                              <Link
                                to={subItem.path}
                                className={`sidebar-submenu-item ${
                                  isSubMenuItemActive(subItem) ? 'sidebar-submenu-item--active' : ''
                                }`}
                                onClick={handleLinkClick}
                              >
                                <span className="sidebar-submenu-label">{subItem.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`sidebar-menu-item ${
                        isMenuItemActive(item.path) ? 'sidebar-menu-item--active' : ''
                      }`}
                      onClick={handleLinkClick}
                    >
                      {item.icon && (
                        <span className="sidebar-menu-icon">
                          <Icon name={item.icon} size={22} />
                        </span>
                      )}
                      <span className="sidebar-menu-label">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="sidebar-menu-badge">{item.badge}</span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

