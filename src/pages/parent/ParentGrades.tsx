import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import './ParentGrades.css';

export const ParentGrades = () => {
  const { user } = useAuth();
  // TODO: Filter grades berdasarkan studentId dari user.studentId
  // const studentId = user?.studentId;
  return (
    <DashboardLayout>
      <div className="parent-grades">
        <h1>Nilai Anak</h1>
        <Card title="Nilai Semester 1" variant="elevated">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Mata Pelajaran</th>
                <th>Nilai</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Matematika</td>
                <td>85</td>
                <td>Baik</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

