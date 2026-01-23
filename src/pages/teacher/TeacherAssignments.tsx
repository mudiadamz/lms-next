import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Table } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import './TeacherAssignments.css';

const mockAssignments = [
  {
    id: '1',
    title: 'Tugas Matematika - Aljabar',
    class: 'X IPA 1',
    subject: 'Matematika',
    dueDate: new Date('2024-01-20'),
    submissions: 25,
    totalStudents: 30,
  },
];

export const TeacherAssignments = () => {
  const columns = [
    {
      key: 'title',
      header: 'Judul',
      render: (item: typeof mockAssignments[0]) => (
        <div>
          <strong>{item.title}</strong>
          <br />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {item.subject} - {item.class}
          </span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Deadline',
      render: (item: typeof mockAssignments[0]) => formatDate(item.dueDate),
    },
    {
      key: 'submissions',
      header: 'Pengumpulan',
      render: (item: typeof mockAssignments[0]) => (
        <Badge variant={item.submissions === item.totalStudents ? 'success' : 'warning'}>
          {item.submissions}/{item.totalStudents}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: typeof mockAssignments[0]) => (
        <Link to={`${ROUTES.TEACHER_ASSIGNMENTS}/${item.id}`}>
          <Button variant="outline" size="small">
            Detail
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="teacher-assignments">
        <div className="page-header">
          <h1>Tugas</h1>
          <Link to={ROUTES.TEACHER_ASSIGNMENTS_CREATE}>
            <Button>Buat Tugas Baru</Button>
          </Link>
        </div>

        <Card>
          <Table columns={columns} data={mockAssignments} />
        </Card>
      </div>
    </DashboardLayout>
  );
};

