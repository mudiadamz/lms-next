import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';
import { Icon, Loading } from '../../components/common';
import { classService, assignmentService, attendanceService, materialService } from '../../services';
import './TeacherDashboard.css';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    classesCount: 0,
    pendingGrading: 0,
    todayAttendance: 'Belum diinput',
    materialsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [classesData, assignmentsData, attendanceData, materialsData] = await Promise.all([
          classService.getClasses(),
          assignmentService.getAssignments({ teacherId: user?.id }),
          attendanceService.getAttendance({ teacherId: user?.id }),
          materialService.getMaterials(),
        ]);

        // Filter classes taught by this teacher
        const teacherClasses = classesData.filter(c => (c as any).teacherIds?.includes(user?.id));
        
        // Count pending grading (assignments with submissions not graded)
        const pendingGrading = assignmentsData.length; // TODO: Filter by submissions that need grading

        // Check today's attendance
        const today = new Date().toISOString().split('T')[0];
        const todayAttendanceRecords = attendanceData.filter(a => {
          const recordDate = new Date(a.date).toISOString().split('T')[0];
          return recordDate === today;
        });
        const todayAttendanceStatus = todayAttendanceRecords.length > 0 ? `${todayAttendanceRecords.length} siswa` : 'Belum diinput';

        setStats({
          classesCount: teacherClasses.length,
          pendingGrading,
          todayAttendance: todayAttendanceStatus,
          materialsCount: materialsData.length,
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

  const dashboardCards = [
    {
      title: 'Kelas yang Diajar',
      value: stats.classesCount.toString(),
      color: 'blue',
      icon: 'userGroup',
      route: ROUTES.TEACHER_CLASSES,
    },
    {
      title: 'Tugas yang Perlu Dinilai',
      value: stats.pendingGrading.toString(),
      color: 'orange',
      icon: 'assignment',
      route: ROUTES.TEACHER_GRADING,
    },
    {
      title: 'Absensi Hari Ini',
      value: stats.todayAttendance,
      color: 'green',
      icon: 'checkCircle',
      route: ROUTES.TEACHER_ATTENDANCE,
    },
    {
      title: 'Materi',
      value: stats.materialsCount.toString(),
      color: 'purple',
      icon: 'document',
      route: ROUTES.TEACHER_MATERIALS,
    },
  ];

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <DashboardLayout>
      <div className="teacher-dashboard">
        <h1>Dashboard Guru</h1>
        <p>Selamat datang, {user?.fullName}!</p>

        {isLoading ? (
          <Loading />
        ) : (
          <div className="dashboard-grid">
          {dashboardCards.map((card, index) => (
            <Card
              key={index}
              variant="elevated"
              className={`dashboard-card dashboard-card--${card.color}`}
              onClick={() => handleCardClick(card.route)}
            >
              <div className="dashboard-card-content">
                <div className="dashboard-card-icon">
                  <Icon name={card.icon as any} size={24} />
                </div>
                <div className="dashboard-card-info">
                  <p className="dashboard-card-title">{card.title}</p>
                  <p className="dashboard-card-value">{card.value}</p>
                </div>
              </div>
            </Card>
          ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

