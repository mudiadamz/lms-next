import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import './ParentAnnouncements.css';

export const ParentAnnouncements = () => {
  return (
    <DashboardLayout>
      <div className="parent-announcements">
        <h1>Pengumuman Sekolah</h1>
        <div className="announcements-list">
          <Card title="Pengumuman Ujian Nasional" variant="elevated">
            <p>Tanggal: 15 Januari 2024</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

