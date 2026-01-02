import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import './StudentSubjects.css';

export const StudentSubjects = () => {
  return (
    <DashboardLayout>
      <div className="student-subjects">
        <h1>Mata Pelajaran</h1>
        <div className="subjects-grid">
          <Card title="Matematika" variant="elevated">
            <p>Guru: Ibu Siti</p>
            <p>Kelas: X IPA 1</p>
          </Card>
          <Card title="Bahasa Indonesia" variant="elevated">
            <p>Guru: Bapak Budi</p>
            <p>Kelas: X IPA 1</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

