import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, Badge, Icon, Pagination, Loading, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { classService, userService } from '../../services';
import './AdminClasses.css';

export const AdminClassesStudents = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const classInfo = await classService.getClassById(id);
        const studentIds = (classInfo as any).studentIds || [];
        
        if (studentIds.length > 0) {
          const studentsData = await Promise.all(
            studentIds.map((studentId: string) => userService.getUserById(studentId))
          );
          setStudents(studentsData);
        }
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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
      render: (item: any) => (item as any).studentNumber || '-',
    },
    {
      key: 'fullName',
      header: 'Nama Lengkap',
      render: (item: any) => (
        <div>
          <strong>{item.fullName}</strong>
        </div>
      ),
    },
    {
      key: 'gender',
      header: 'Jenis Kelamin',
      render: (item: any) => (
        <Badge variant="secondary">{(item as any).gender || '-'}</Badge>
      ),
    },
    {
      key: 'phoneNumber',
      header: 'No. HP',
      render: (item: any) => (item as any).phoneNumber || '-',
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: any) => (
        <Button variant="outline" size="small" onClick={() => console.log('View student', item.id)}>
          Detail
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="admin-classes-students">
        <div className="page-header">
          <h1>Daftar Siswa</h1>
        </div>

        <Card
          title={`Daftar Siswa (${students.length})`}
          variant="elevated"
          headerAction={
            <Button size="small">
              <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
              Tambah Siswa
            </Button>
          }
        >
          {paginatedStudents.length === 0 ? (
            <EmptyState icon="users" title="Tidak Ada Siswa" message="Belum ada siswa yang terdaftar di kelas ini." />
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
