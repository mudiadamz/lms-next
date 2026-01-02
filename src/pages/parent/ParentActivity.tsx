import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import './ParentActivity.css';

export const ParentActivity = () => {
  return (
    <DashboardLayout>
      <div className="parent-activity">
        <h1>Riwayat Aktivitas Anak</h1>
        <Card title="Aktivitas Terbaru" variant="elevated">
          <p>15 Jan 2024 - Submit tugas Matematika</p>
          <p>14 Jan 2024 - Mengikuti kuis Bahasa Indonesia</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

