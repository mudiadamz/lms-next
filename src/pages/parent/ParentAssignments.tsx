import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, isPast } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import './ParentAssignments.css';

const mockAssignments = [
  {
    id: '1',
    title: 'Tugas Matematika - Aljabar',
    subject: 'Matematika',
    teacher: 'Ibu Siti',
    dueDate: new Date('2024-01-20T23:59:59'),
    status: 'not_started',
    score: null,
  },
  {
    id: '2',
    title: 'Tugas Bahasa Indonesia - Menulis Esai',
    subject: 'Bahasa Indonesia',
    teacher: 'Bapak Budi',
    dueDate: new Date('2024-01-25T23:59:59'),
    status: 'submitted',
    score: 85,
  },
];

export const ParentAssignments = () => {
  const { user } = useAuth();
  // TODO: Filter assignments berdasarkan studentId dari user.studentId
  // const studentId = user?.studentId;

  const getStatusBadge = (assignment: typeof mockAssignments[0]) => {
    if (assignment.score !== null) {
      return <Badge variant="success">Sudah Dinilai</Badge>;
    }
    if (assignment.status === 'submitted') {
      return <Badge variant="warning">Menunggu Penilaian</Badge>;
    }
    if (isPast(assignment.dueDate)) {
      return <Badge variant="danger">Terlambat</Badge>;
    }
    return <Badge variant="secondary">Belum Dikerjakan</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="parent-assignments">
        <h1>Tugas Anak</h1>

        {mockAssignments.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Tidak Ada Tugas"
            message="Belum ada tugas yang diberikan untuk anak Anda saat ini."
          />
        ) : (
          <div className="assignments-grid">
            {mockAssignments.map((assignment) => (
              <Card key={assignment.id} title={assignment.title} variant="elevated">
                <div className="assignment-card-info">
                  <p>
                    <strong>Mata Pelajaran:</strong> {assignment.subject}
                  </p>
                  <p>
                    <strong>Guru:</strong> {assignment.teacher}
                  </p>
                  <p>
                    <strong>Deadline:</strong> {formatDate(assignment.dueDate)}
                  </p>
                  <div className="assignment-status">
                    <strong>Status:</strong> {getStatusBadge(assignment)}
                  </div>
                  {assignment.score !== null && (
                    <p>
                      <strong>Nilai:</strong> {assignment.score}/100
                    </p>
                  )}
                </div>
                <Link to={`${ROUTES.PARENT_ASSIGNMENTS}/${assignment.id}`}>
                  <Button variant="outline" className="assignment-action-button">
                    Lihat Detail
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

