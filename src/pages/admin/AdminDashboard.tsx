import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';
import { Icon } from '../../components/common';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: 'Total Siswa',
      value: '500',
      color: 'blue',
      icon: 'userGroup',
      route: `${ROUTES.ADMIN_USERS}?role=student`,
    },
    {
      title: 'Total Guru',
      value: '50',
      color: 'green',
      icon: 'user',
      route: `${ROUTES.ADMIN_USERS}?role=teacher`,
    },
    {
      title: 'Total Kelas',
      value: '25',
      color: 'purple',
      icon: 'userGroup',
      route: ROUTES.ADMIN_CLASSES,
    },
    {
      title: 'Total Mata Pelajaran',
      value: '15',
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
      </div>
    </DashboardLayout>
  );
};

