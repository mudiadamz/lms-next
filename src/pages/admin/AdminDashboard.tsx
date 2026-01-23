import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';
import { Icon, Loading } from '../../components/common';
import { userService, classService, subjectService } from '../../services';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [studentsData, teachersData, classesData, subjectsData] = await Promise.all([
          userService.getUsers('student'),
          userService.getUsers('teacher'),
          classService.getClasses(),
          subjectService.getSubjects(),
        ]);

        setStats({
          totalStudents: studentsData.length,
          totalTeachers: teachersData.length,
          totalClasses: classesData.length,
          totalSubjects: subjectsData.length,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const dashboardCards = [
    {
      title: 'Total Siswa',
      value: stats.totalStudents.toString(),
      color: 'blue',
      icon: 'userGroup',
      route: `${ROUTES.ADMIN_USERS}?role=student`,
    },
    {
      title: 'Total Guru',
      value: stats.totalTeachers.toString(),
      color: 'green',
      icon: 'user',
      route: `${ROUTES.ADMIN_USERS}?role=teacher`,
    },
    {
      title: 'Total Kelas',
      value: stats.totalClasses.toString(),
      color: 'purple',
      icon: 'userGroup',
      route: ROUTES.ADMIN_CLASSES,
    },
    {
      title: 'Total Mata Pelajaran',
      value: stats.totalSubjects.toString(),
      color: 'orange',
      icon: 'book',
      route: ROUTES.ADMIN_SUBJECT_MANAGEMENT,
    },
  ];

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <DashboardLayout>
      <div className="admin-dashboard">
        <h1>Dashboard Admin</h1>
        <p>Selamat datang, {user?.fullName}!</p>

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

