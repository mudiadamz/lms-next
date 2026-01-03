import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';
import { Icon, IconName } from '../common/Icon';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon?: IconName;
}

const getMenuItems = (role: string): MenuItem[] => {
  switch (role) {
    case 'student':
      return [
        { label: 'Dashboard', path: ROUTES.STUDENT_DASHBOARD, icon: 'home' },
        { label: 'Jadwal', path: ROUTES.STUDENT_SCHEDULE, icon: 'schedule' },
        { label: 'Absensi', path: ROUTES.STUDENT_ATTENDANCE, icon: 'checkCircle' },
        { label: 'Materi', path: ROUTES.STUDENT_MATERIALS, icon: 'document' },
        { label: 'Tugas', path: ROUTES.STUDENT_ASSIGNMENTS, icon: 'assignment' },
        { label: 'Kuis', path: ROUTES.STUDENT_QUIZZES, icon: 'quiz' },
        { label: 'Nilai', path: ROUTES.STUDENT_GRADES, icon: 'grade' },
        { label: 'Forum', path: ROUTES.STUDENT_FORUM, icon: 'forum' },
        { label: 'Pesan', path: ROUTES.STUDENT_MESSAGES, icon: 'message' },
        { label: 'Portofolio', path: ROUTES.STUDENT_PORTFOLIO, icon: 'folder' },
        { label: 'Kalender', path: ROUTES.STUDENT_CALENDAR, icon: 'calendar' },
      ];
    case 'teacher':
      return [
        { label: 'Dashboard', path: ROUTES.TEACHER_DASHBOARD, icon: 'home' },
        { label: 'Kelas', path: ROUTES.TEACHER_CLASSES, icon: 'userGroup' },
        { label: 'Materi', path: ROUTES.TEACHER_MATERIALS, icon: 'document' },
        { label: 'Tugas', path: ROUTES.TEACHER_ASSIGNMENTS, icon: 'assignment' },
        { label: 'Kuis', path: ROUTES.TEACHER_QUIZZES, icon: 'quiz' },
        { label: 'Penilaian', path: ROUTES.TEACHER_GRADING, icon: 'grade' },
        { label: 'Absensi', path: ROUTES.TEACHER_ATTENDANCE, icon: 'checkCircle' },
        { label: 'Forum', path: ROUTES.TEACHER_FORUM, icon: 'forum' },
        { label: 'Jadwal', path: ROUTES.TEACHER_SCHEDULE, icon: 'schedule' },
        { label: 'Rapor', path: ROUTES.TEACHER_REPORTS, icon: 'report' },
        { label: 'Pesan', path: ROUTES.TEACHER_MESSAGES, icon: 'message' },
        { label: 'Pengumuman', path: ROUTES.TEACHER_ANNOUNCEMENTS, icon: 'announcement' },
        { label: 'Analitik', path: ROUTES.TEACHER_ANALYTICS, icon: 'analytics' },
        { label: 'Bank Soal', path: ROUTES.TEACHER_QUESTION_BANK, icon: 'question' },
      ];
    case 'admin':
      return [
        { label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: 'home' },
        { label: 'User', path: ROUTES.ADMIN_USERS, icon: 'users' },
        { label: 'Kelas', path: ROUTES.ADMIN_CLASSES, icon: 'userGroup' },
        { label: 'Mata Pelajaran', path: ROUTES.ADMIN_SUBJECTS, icon: 'book' },
        { label: 'Jadwal', path: ROUTES.ADMIN_SCHEDULE, icon: 'schedule' },
        { label: 'Tahun Ajaran', path: ROUTES.ADMIN_ACADEMIC_YEAR, icon: 'calendar' },
        { label: 'Pengumuman', path: ROUTES.ADMIN_ANNOUNCEMENTS, icon: 'announcement' },
        { label: 'Laporan', path: ROUTES.ADMIN_REPORTS, icon: 'report' },
        { label: 'Kurikulum', path: ROUTES.ADMIN_CURRICULUM, icon: 'book' },
        { label: 'Pengaturan', path: ROUTES.ADMIN_SETTINGS, icon: 'settings' },
        { label: 'Audit Log', path: ROUTES.ADMIN_AUDIT_LOG, icon: 'document' },
      ];
    case 'parent':
      return [
        { label: 'Dashboard', path: ROUTES.PARENT_DASHBOARD, icon: 'home' },
        { label: 'Profil Anak', path: ROUTES.PARENT_CHILD_PROFILE, icon: 'user' },
        { label: 'Mata Pelajaran', path: ROUTES.PARENT_SUBJECTS, icon: 'book' },
        { label: 'Materi', path: ROUTES.PARENT_MATERIALS, icon: 'document' },
        { label: 'Tugas', path: ROUTES.PARENT_ASSIGNMENTS, icon: 'assignment' },
        { label: 'Kuis', path: ROUTES.PARENT_QUIZZES, icon: 'quiz' },
        { label: 'Nilai', path: ROUTES.PARENT_GRADES, icon: 'grade' },
        { label: 'Jadwal', path: ROUTES.PARENT_SCHEDULE, icon: 'schedule' },
        { label: 'Absensi', path: ROUTES.PARENT_ATTENDANCE, icon: 'checkCircle' },
        { label: 'Forum', path: ROUTES.PARENT_FORUM, icon: 'forum' },
        { label: 'Pesan', path: ROUTES.PARENT_MESSAGES, icon: 'message' },
        { label: 'Portofolio', path: ROUTES.PARENT_PORTFOLIO, icon: 'folder' },
        { label: 'Kalender', path: ROUTES.PARENT_CALENDAR, icon: 'calendar' },
        { label: 'Pengumuman', path: ROUTES.PARENT_ANNOUNCEMENTS, icon: 'announcement' },
        { label: 'Progress', path: ROUTES.PARENT_PROGRESS, icon: 'analytics' },
        { label: 'Aktivitas', path: ROUTES.PARENT_ACTIVITY, icon: 'clock' },
      ];
    default:
      return [];
  }
};

export const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems = getMenuItems(user.role);

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.path}>
              <Link
                to={item.path}
                className={`sidebar-menu-item ${
                  location.pathname === item.path ? 'sidebar-menu-item--active' : ''
                }`}
                onClick={handleLinkClick}
              >
                {item.icon && (
                  <span className="sidebar-menu-icon">
                    <Icon name={item.icon} size={22} />
                  </span>
                )}
                <span className="sidebar-menu-label">{item.label}</span>
              </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

