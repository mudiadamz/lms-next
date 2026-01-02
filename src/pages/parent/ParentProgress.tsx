import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import './ParentProgress.css';

export const ParentProgress = () => {
  return (
    <DashboardLayout>
      <div className="parent-progress">
        <h1>Progress Belajar Anak</h1>
        <Card title="Statistik" variant="elevated">
          <p>Rata-rata nilai: 85</p>
          <p>Tingkat kehadiran: 90.9%</p>
          <p>Jumlah tugas selesai: 15/20</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

