import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import './ParentChildProfile.css';

export const ParentChildProfile = () => {
  return (
    <DashboardLayout>
      <div className="parent-child-profile">
        <h1>Profil Anak</h1>
        <Card title="Informasi Anak" variant="elevated">
          <p>Nama: Budi Santoso</p>
          <p>Kelas: X IPA 1</p>
          <p>NIS: 12345</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

