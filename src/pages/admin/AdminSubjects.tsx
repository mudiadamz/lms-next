import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Table } from '../../components/common';
import { ROUTES, SCHOOL_LEVELS } from '../../constants';
import './AdminSubjects.css';

const mockSubjects = [
  {
    id: '1',
    name: 'Matematika',
    code: 'MAT',
    schoolLevel: 'sma',
    teacher: 'Ibu Siti',
    classCount: 5,
  },
  {
    id: '2',
    name: 'Bahasa Indonesia',
    code: 'BIN',
    schoolLevel: 'sma',
    teacher: 'Bapak Budi',
    classCount: 5,
  },
];

export const AdminSubjects = () => {
  const navigate = useNavigate();
  
  const columns = [
    {
      key: 'name',
      header: 'Nama Mata Pelajaran',
      render: (item: typeof mockSubjects[0]) => (
        <div>
          <strong>{item.name}</strong>
          <br />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Kode: {item.code}</span>
        </div>
      ),
    },
    {
      key: 'schoolLevel',
      header: 'Tingkat',
      render: (item: typeof mockSubjects[0]) => (
        <Badge variant="secondary">{SCHOOL_LEVELS[item.schoolLevel]}</Badge>
      ),
    },
    {
      key: 'teacher',
      header: 'Guru Pengampu',
    },
    {
      key: 'classCount',
      header: 'Jumlah Kelas',
      render: (item: typeof mockSubjects[0]) => `${item.classCount} kelas`,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: typeof mockSubjects[0]) => (
        <Button 
          variant="outline" 
          size="small"
          onClick={() => navigate(`${ROUTES.ADMIN_SUBJECTS_DETAIL.replace(':id', item.id)}`)}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="admin-subjects">
        <div className="page-header">
          <h1>Mata Pelajaran</h1>
          <div className="header-actions">
            <Link to={ROUTES.ADMIN_SUBJECT_MANAGEMENT}>
              <Button>Kelola Mata Pelajaran</Button>
            </Link>
          </div>
        </div>

        <Card title={`Daftar Mata Pelajaran (${mockSubjects.length})`} variant="elevated">
          <Table columns={columns} data={mockSubjects} />
        </Card>
      </div>
    </DashboardLayout>
  );
};

