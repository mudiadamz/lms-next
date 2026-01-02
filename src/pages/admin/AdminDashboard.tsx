import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="admin-dashboard">
        <h1>Dashboard Admin</h1>
        <p>Selamat datang, {user?.fullName}!</p>

        <div className="dashboard-grid">
          <Card title="Total Siswa" variant="elevated">
            <p className="stat-number">500</p>
          </Card>
          <Card title="Total Guru" variant="elevated">
            <p className="stat-number">50</p>
          </Card>
          <Card title="Total Kelas" variant="elevated">
            <p className="stat-number">25</p>
          </Card>
          <Card title="Total Mata Pelajaran" variant="elevated">
            <p className="stat-number">15</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

