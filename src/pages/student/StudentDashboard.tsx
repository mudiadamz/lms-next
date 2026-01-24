import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Button, Loading } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';
import { formatDate, isPast } from '../../utils';
import { assignmentService, gradeService, announcementService, scheduleService, attendanceService } from '../../services';
import './StudentDashboard.css';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [urgentAssignments, setUrgentAssignments] = useState<any[]>([]);
  const [recentGrades, setRecentGrades] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
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
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        // Get student's class
        const studentData = user?.id ? await (await import('../../services')).userService.getUserById(user.id) : null;
        const classId = (studentData as any)?.classId;

        const [assignmentsData, quizzesData, gradesData, announcementsData, schedulesData, attendanceData] = await Promise.all([
          assignmentService.getAssignments(classId ? { classId } : {}),
          quizService.getQuizzes(classId ? { classId } : {}),
          gradeService.getGrades(user?.id ? { studentId: user.id } : {}),
          announcementService.getAnnouncements({ targetAudience: 'student' }),
          scheduleService.getSchedules(classId ? { classId } : {}),
          attendanceService.getAttendance(user?.id ? { studentId: user.id } : {}),
        ]);

        // Filter urgent assignments (due within 3 days)
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        const urgent = assignmentsData
          .filter(a => {
            const dueDate = new Date(a.dueDate);
            return dueDate <= threeDaysFromNow && dueDate >= today;
          })
          .slice(0, 5);
        setUrgentAssignments(urgent);

        // Get recent grades (last 5)
        const recent = gradesData
          .sort((a, b) => {
            const aDate = new Date(b.createdAt || b.date || 0);
            const bDate = new Date(a.createdAt || a.date || 0);
            if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) return 0;
            return aDate.getTime() - bDate.getTime();
          })
          .slice(0, 5);
        setRecentGrades(recent);

        // Get recent announcements
        const recentAnnouncements = announcementsData
          .sort((a, b) => {
            const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) return 0;
            return bDate.getTime() - aDate.getTime();
          })
          .slice(0, 5);
        setAnnouncements(recentAnnouncements);

        // Get today's schedule
        const todaySchedules = schedulesData.filter(s => s.dayOfWeek === dayOfWeek);
        setTodaySchedule(todaySchedules);

        // Calculate stats
        const activeAssignments = assignmentsData.filter(a => {
          const dueDate = new Date(a.dueDate);
          return dueDate >= today;
        }).length;

        const averageGrade = gradesData.length > 0
          ? gradesData.reduce((sum, g) => sum + (g.score || 0), 0) / gradesData.length
          : 0;

        const totalAttendance = attendanceData.length;
        const presentCount = attendanceData.filter(a => a.status === 'present').length;
        const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

        // Get upcoming quizzes
        const upcomingQuizzes = quizzesData.filter(q => {
          const startDate = new Date(q.startDate || q.startTime || 0);
          const endDate = new Date(q.endDate || q.endTime || 0);
          const now = new Date();
          return startDate <= now && endDate >= now;
        }).length;

        setStats({
          activeAssignments,
          upcomingQuizzes,
          averageGrade: Math.round(averageGrade),
          attendanceRate: Math.round(attendanceRate),
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
      <div className="student-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard Siswa</h1>
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
            <Card title="Tugas Mendesak" variant="elevated">
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
                  <Link to={ROUTES.STUDENT_ASSIGNMENTS}>
                    <Button variant="outline" size="small" className="view-all-button">
                      Lihat Semua Tugas
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            <Card title="Nilai Terbaru" variant="elevated">
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
                  <Link to={ROUTES.STUDENT_GRADES}>
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

            <Card title="Jadwal Hari Ini" variant="elevated">
              {todaySchedule.length === 0 ? (
                <p className="empty-text">Tidak ada jadwal hari ini</p>
              ) : (
                <>
                  <div className="today-schedule">
                    {todaySchedule
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((schedule) => (
                        <div key={schedule.id} className="schedule-item">
                          <span className="schedule-time">{schedule.startTime} - {schedule.endTime}</span>
                          <span className="schedule-subject">{(schedule as any).subjectName || schedule.subjectId}</span>
                        </div>
                      ))}
                  </div>
                  <Link to={ROUTES.STUDENT_SCHEDULE}>
                    <Button variant="outline" size="small" className="view-all-button">
                      Lihat Jadwal Lengkap
                    </Button>
                  </Link>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

