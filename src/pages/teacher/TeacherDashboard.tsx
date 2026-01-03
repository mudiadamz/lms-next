import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';
import { Icon } from '../../components/common';
import './TeacherDashboard.css';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: 'Kelas yang Diajar',
      value: '3',
      color: 'blue',
      icon: 'userGroup',
      route: ROUTES.TEACHER_CLASSES,
    },
    {
      title: 'Tugas yang Perlu Dinilai',
      value: '5',
      color: 'orange',
      icon: 'assignment',
      route: ROUTES.TEACHER_GRADING,
    },
    {
      title: 'Absensi Hari Ini',
      value: 'Belum diinput',
      color: 'green',
      icon: 'checkCircle',
      route: ROUTES.TEACHER_ATTENDANCE,
    },
    {
      title: 'Materi',
      value: '12',
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
      </div>
    </DashboardLayout>
  );
};

