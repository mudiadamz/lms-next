import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import './ParentSubjects.css';

export const ParentSubjects = () => {
  const { user } = useAuth();
  // TODO: Filter subjects berdasarkan studentId dari user.studentId
  // const studentId = user?.studentId;
  return (
    <DashboardLayout>
      <div className="parent-subjects">
        <h1>Mata Pelajaran Anak</h1>
        <div className="subjects-grid">
          <Card title="Matematika" variant="elevated">
            <p>Guru: Ibu Siti</p>
            <p>Kelas: X IPA 1</p>
          </Card>
          <Card title="Bahasa Indonesia" variant="elevated">
            <p>Guru: Bapak Budi</p>
            <p>Kelas: X IPA 1</p>
          </Card>
          <Card title="IPA" variant="elevated">
            <p>Guru: Ibu Rina</p>
            <p>Kelas: X IPA 1</p>
          </Card>
          <Card title="IPS" variant="elevated">
            <p>Guru: Bapak Andi</p>
            <p>Kelas: X IPA 1</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

