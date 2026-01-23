import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, FormSelect, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, isPast } from '../../utils';
import './StudentAssignments.css';

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
  {
    id: '3',
    title: 'Tugas Fisika - Hukum Newton',
    subject: 'Fisika',
    teacher: 'Bapak Andi',
    dueDate: new Date('2024-01-28T23:59:59'),
    status: 'not_started',
    score: null,
  },
];

// Get unique subjects from assignments
const getUniqueSubjects = () => {
  const subjects = new Set(mockAssignments.map((a) => a.subject));
  return Array.from(subjects).sort();
};

interface StudentAssignmentsProps {
  readOnly?: boolean;
}

export const StudentAssignments = ({ readOnly = false }: StudentAssignmentsProps = {} as StudentAssignmentsProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const uniqueSubjects = getUniqueSubjects();
  const subjectOptions = [
    { value: 'all', label: 'Semua Mata Pelajaran' },
    ...uniqueSubjects.map((subject) => ({ value: subject, label: subject })),
  ];

  const filteredAssignments =
    selectedSubject === 'all'
      ? mockAssignments
      : mockAssignments.filter((assignment) => assignment.subject === selectedSubject);

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
      <div className="student-assignments">
        <h1>Tugas</h1>

        <div className="page-filters">
          <FormSelect
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            options={subjectOptions}
          />
        </div>

        {filteredAssignments.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Tidak Ada Tugas"
            message={
              selectedSubject !== 'all'
                ? `Tidak ada tugas untuk mata pelajaran ${selectedSubject}.`
                : 'Belum ada tugas yang diberikan untuk Anda saat ini.'
            }
          />
        ) : (
          <div className="assignments-grid">
            {filteredAssignments.map((assignment) => (
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
                <Link to={`${readOnly ? ROUTES.PARENT_ASSIGNMENTS : ROUTES.STUDENT_ASSIGNMENTS}/${assignment.id}`}>
                  <Button variant={readOnly ? "outline" : "primary"} className="assignment-action-button">
                    {readOnly ? 'Lihat Detail' : (assignment.status === 'submitted' ? 'Lihat Detail' : 'Kerjakan Tugas')}
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

