import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherDashboard.css';

export const TeacherDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="teacher-dashboard">
        <h1>Dashboard Guru</h1>
        <p>Selamat datang, {user?.fullName}!</p>

        <div className="dashboard-grid">
          <Card title="Kelas yang Diajar" variant="elevated">
            <p>3 kelas aktif</p>
          </Card>
          <Card title="Tugas yang Perlu Dinilai" variant="elevated">
            <p>5 tugas menunggu penilaian</p>
          </Card>
          <Card title="Absensi Hari Ini" variant="elevated">
            <p>Belum diinput</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

