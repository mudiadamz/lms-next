import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Button, Loading } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';
import { formatDate, isPast } from '../../utils';
import { assignmentService, gradeService, announcementService, userService } from '../../services';
import './ParentDashboard.css';

export const ParentDashboard = () => {
  const { user } = useAuth();
  const [urgentAssignments, setUrgentAssignments] = useState<any[]>([]);
  const [recentGrades, setRecentGrades] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeAssignments: 0,
    upcomingQuizzes: 0,
    averageGrade: 0,
    attendanceRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Get parent's children (students)
        const parentData = user?.id ? await userService.getUserById(user.id) : null;
        const studentIds = (parentData as any)?.studentIds || [];
        
        if (studentIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // Get first student's data
        const firstStudent = await userService.getUserById(studentIds[0]);
        const classId = (firstStudent as any)?.classId;

        const [assignmentsData, gradesData, announcementsData] = await Promise.all([
          assignmentService.getAssignments(classId ? { classId } : {}),
          gradeService.getGrades({ studentId: studentIds[0] }),
          announcementService.getAnnouncements({ targetAudience: 'parent' }),
        ]);

        // Filter urgent assignments
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        const urgent = assignmentsData
          .filter(a => {
            const dueDate = new Date(a.dueDate);
            return dueDate <= threeDaysFromNow && dueDate >= today;
          })
          .slice(0, 5);
        setUrgentAssignments(urgent);

        // Get recent grades
        const recent = gradesData
          .sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime())
          .slice(0, 5);
        setRecentGrades(recent);

        // Get recent announcements
        const recentAnnouncements = announcementsData
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setAnnouncements(recentAnnouncements);

        // Calculate stats
        const activeAssignments = assignmentsData.filter(a => {
          const dueDate = new Date(a.dueDate);
          return dueDate >= today;
        }).length;

        const averageGrade = gradesData.length > 0
          ? gradesData.reduce((sum, g) => sum + (g.score || 0), 0) / gradesData.length
          : 0;

        setStats({
          activeAssignments,
          upcomingQuizzes: 0,
          averageGrade: Math.round(averageGrade),
          attendanceRate: 0, // TODO: Get from attendanceService
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  return (
    <DashboardLayout>
      <div className="parent-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard Orang Tua</h1>
            <p className="welcome-message">Selamat datang, {user?.fullName}!</p>
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="dashboard-stats">
              <Card variant="elevated" className="stat-card">
                <div className="stat-value">{stats.activeAssignments}</div>
                <div className="stat-label">Tugas Aktif</div>
              </Card>
              <Card variant="elevated" className="stat-card">
                <div className="stat-value">{stats.upcomingQuizzes}</div>
                <div className="stat-label">Kuis Mendatang</div>
              </Card>
              <Card variant="elevated" className="stat-card">
                <div className="stat-value">{stats.averageGrade}</div>
                <div className="stat-label">Rata-rata Nilai</div>
              </Card>
              <Card variant="elevated" className="stat-card">
                <div className="stat-value">{stats.attendanceRate}%</div>
                <div className="stat-label">Kehadiran</div>
              </Card>
            </div>
          </>
        )}

        {!isLoading && (
          <div className="dashboard-grid">
            <Card title="Tugas Mendesak Anak" variant="elevated">
              {urgentAssignments.length === 0 ? (
                <p className="empty-text">Tidak ada tugas yang mendesak</p>
              ) : (
                <div className="urgent-assignments">
                  {urgentAssignments.map((assignment) => (
                    <div key={assignment.id} className="urgent-item">
                      <div>
                        <strong>{assignment.title}</strong>
                        <p className="item-meta">
                          {(assignment as any).subjectName || assignment.subjectId} • Deadline: {formatDate(new Date(assignment.dueDate))}
                        </p>
                      </div>
                      <Badge variant={isPast(new Date(assignment.dueDate)) ? 'danger' : 'warning'}>
                        {isPast(new Date(assignment.dueDate)) ? 'Terlambat' : 'Mendesak'}
                      </Badge>
                    </div>
                  ))}
                  <Link to={ROUTES.PARENT_ASSIGNMENTS}>
                    <Button variant="outline" size="small" className="view-all-button">
                      Lihat Semua Tugas
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            <Card title="Nilai Terbaru Anak" variant="elevated">
              {recentGrades.length === 0 ? (
                <p className="empty-text">Belum ada nilai baru</p>
              ) : (
                <div className="recent-grades">
                  {recentGrades.map((grade, index) => (
                    <div key={index} className="grade-item">
                      <div>
                        <strong>{(grade as any).subjectName || grade.subjectId}</strong>
                        <p className="item-meta">{formatDate(new Date(grade.createdAt || grade.date || Date.now()))}</p>
                      </div>
                      <Badge variant="success">
                        {grade.score}/{grade.maxScore || 100}
                      </Badge>
                    </div>
                  ))}
                  <Link to={ROUTES.PARENT_GRADES}>
                    <Button variant="outline" size="small" className="view-all-button">
                      Lihat Semua Nilai
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            <Card title="Pengumuman Terbaru" variant="elevated">
              {announcements.length === 0 ? (
                <p className="empty-text">Tidak ada pengumuman baru</p>
              ) : (
                <div className="announcements">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="announcement-item">
                      <strong>{announcement.title}</strong>
                      <p className="item-meta">{formatDate(announcement.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

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
            <Link to={ROUTES.PARENT_SCHEDULE}>
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

