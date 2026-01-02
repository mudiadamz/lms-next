import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Button } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';
import { formatDate, isPast } from '../../utils';
import './StudentDashboard.css';

const mockUrgentAssignments = [
  {
    id: '1',
    title: 'Tugas Matematika - Aljabar',
    dueDate: new Date('2024-01-20T23:59:59'),
    subject: 'Matematika',
  },
];

const mockRecentGrades = [
  {
    subject: 'Bahasa Indonesia',
    score: 85,
    maxScore: 100,
    date: new Date('2024-01-18'),
  },
];

const mockAnnouncements = [
  {
    id: '1',
    title: 'Pengumuman Ujian Tengah Semester',
    date: new Date('2024-01-15'),
  },
];

export const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="student-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard Siswa</h1>
            <p className="welcome-message">Selamat datang, {user?.fullName}!</p>
          </div>
        </div>

        <div className="dashboard-stats">
          <Card variant="elevated" className="stat-card">
            <div className="stat-value">3</div>
            <div className="stat-label">Tugas Aktif</div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-value">2</div>
            <div className="stat-label">Kuis Mendatang</div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-value">85</div>
            <div className="stat-label">Rata-rata Nilai</div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-value">95%</div>
            <div className="stat-label">Kehadiran</div>
          </Card>
        </div>

        <div className="dashboard-grid">
          <Card title="Tugas Mendesak" variant="elevated">
            {mockUrgentAssignments.length === 0 ? (
              <p className="empty-text">Tidak ada tugas yang mendesak</p>
            ) : (
              <div className="urgent-assignments">
                {mockUrgentAssignments.map((assignment) => (
                  <div key={assignment.id} className="urgent-item">
                    <div>
                      <strong>{assignment.title}</strong>
                      <p className="item-meta">
                        {assignment.subject} • Deadline: {formatDate(assignment.dueDate)}
                      </p>
                    </div>
                    <Badge variant={isPast(assignment.dueDate) ? 'danger' : 'warning'}>
                      {isPast(assignment.dueDate) ? 'Terlambat' : 'Mendesak'}
                    </Badge>
                  </div>
                ))}
                <Link to={ROUTES.STUDENT_ASSIGNMENTS}>
                  <Button variant="outline" size="small" className="view-all-button">
                    Lihat Semua Tugas
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          <Card title="Nilai Terbaru" variant="elevated">
            {mockRecentGrades.length === 0 ? (
              <p className="empty-text">Belum ada nilai baru</p>
            ) : (
              <div className="recent-grades">
                {mockRecentGrades.map((grade, index) => (
                  <div key={index} className="grade-item">
                    <div>
                      <strong>{grade.subject}</strong>
                      <p className="item-meta">{formatDate(grade.date)}</p>
                    </div>
                    <Badge variant="success">
                      {grade.score}/{grade.maxScore}
                    </Badge>
                  </div>
                ))}
                <Link to={ROUTES.STUDENT_GRADES}>
                  <Button variant="outline" size="small" className="view-all-button">
                    Lihat Semua Nilai
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          <Card title="Pengumuman Terbaru" variant="elevated">
            {mockAnnouncements.length === 0 ? (
              <p className="empty-text">Tidak ada pengumuman baru</p>
            ) : (
              <div className="announcements">
                {mockAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="announcement-item">
                    <strong>{announcement.title}</strong>
                    <p className="item-meta">{formatDate(announcement.date)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Jadwal Hari Ini" variant="elevated">
            <div className="today-schedule">
              <div className="schedule-item">
                <span className="schedule-time">08:00 - 09:30</span>
                <span className="schedule-subject">Matematika</span>
              </div>
              <div className="schedule-item">
                <span className="schedule-time">10:00 - 11:30</span>
                <span className="schedule-subject">Bahasa Indonesia</span>
              </div>
            </div>
            <Link to={ROUTES.STUDENT_SCHEDULE}>
              <Button variant="outline" size="small" className="view-all-button">
                Lihat Jadwal Lengkap
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

