import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import './ParentAttendance.css';

export const ParentAttendance = () => {
  const { user } = useAuth();
  // TODO: Filter attendance berdasarkan studentId dari user.studentId
  // const studentId = user?.studentId;
  return (
    <DashboardLayout>
      <div className="parent-attendance">
        <h1>Absensi Anak</h1>
        <Card title="Riwayat Kehadiran" variant="elevated">
          <p>Kehadiran bulan ini: 20/22 hari</p>
          <p>Persentase: 90.9%</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

