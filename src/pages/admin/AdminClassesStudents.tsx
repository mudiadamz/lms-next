import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, Badge, Icon, Pagination } from '../../components/common';
import { ROUTES } from '../../constants';
import './AdminClasses.css';

// Mock students data
const mockStudents = [
  {
    id: '1',
    studentNumber: '2024001',
    fullName: 'Budi Santoso',
    gender: 'Laki-laki',
    phoneNumber: '081234567890',
  },
  {
    id: '2',
    studentNumber: '2024002',
    fullName: 'Siti Nurhaliza',
    gender: 'Perempuan',
    phoneNumber: '081234567891',
  },
  {
    id: '3',
    studentNumber: '2024003',
    fullName: 'Andi Pratama',
    gender: 'Laki-laki',
    phoneNumber: '081234567892',
  },
];

export const AdminClassesStudents = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState(mockStudents);
  const itemsPerPage = 10;

  useEffect(() => {
    // TODO: Fetch students data from API based on classId
    // For now, using mock data
  }, [id]);

  const filteredStudents = students;

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      key: 'studentNumber',
      header: 'NIS',
    },
    {
      key: 'fullName',
      header: 'Nama Lengkap',
      render: (item: typeof mockStudents[0]) => (
        <div>
          <strong>{item.fullName}</strong>
        </div>
      ),
    },
    {
      key: 'gender',
      header: 'Jenis Kelamin',
      render: (item: typeof mockStudents[0]) => (
        <Badge variant="secondary">{item.gender}</Badge>
      ),
    },
    {
      key: 'phoneNumber',
      header: 'No. HP',
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: typeof mockStudents[0]) => (
        <Button variant="outline" size="small" onClick={() => console.log('View student', item.id)}>
          Detail
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="admin-classes-students">
        <div className="page-header">
          <h1>Daftar Siswa</h1>
        </div>

        <Card
          title={`Daftar Siswa (${filteredStudents.length})`}
          variant="elevated"
          headerAction={
            <Button size="small">
              <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
              Tambah Siswa
            </Button>
          }
        >
          {paginatedStudents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Tidak ada siswa yang ditemukan
            </div>
          ) : (
            <>
              <Table columns={columns} data={paginatedStudents} />
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};
