import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import './ParentSchedule.css';

export const ParentSchedule = () => {
  const { user } = useAuth();
  // TODO: Filter schedule berdasarkan classId dari student (user.studentId -> student.classId)
  // const studentId = user?.studentId;

  return (
    <DashboardLayout>
      <div className="parent-schedule">
        <h1>Jadwal Pelajaran Anak</h1>
        <Card title="Jadwal Minggu Ini" variant="elevated">
          <p>Senin: Matematika, Bahasa Indonesia</p>
          <p>Selasa: IPA, IPS</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

