import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon, Table, Loading, EmptyState } from '../../components/common';
import { SCHOOL_LEVELS, ROUTES } from '../../constants';
import { subjectService, classService, userService } from '../../services';
import './SubjectManagement.css';

export const AdminSubjectsDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [subjectData, setSubjectData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [subjectInfo, classesData, teachersData] = await Promise.all([
          subjectService.getSubjectById(id),
          classService.getClasses(),
          userService.getUsers('teacher'),
        ]);

        setSubjectData(subjectInfo);

        // Get classes using this subject
        const classIds = (subjectInfo as any).classIds || [];
        const subjectClasses = classesData.filter(c => classIds.includes(c.id));
        
        // Get student counts for each class
        const classesWithCounts = await Promise.all(
          subjectClasses.map(async (c) => {
            const studentIds = (c as any).studentIds || [];
            return {
              id: c.id,
              name: c.name,
              studentCount: studentIds.length,
            };
          })
        );
        setClasses(classesWithCounts);

        // Get teacher name
        const teacher = teachersData.find(t => t.id === subjectInfo.teacherId);
        setTeacherName(teacher?.fullName || '-');
      } catch (error) {
        console.error('Error loading subject detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const classColumns = [
    {
      key: 'name',
      header: 'Nama Kelas',
    },
    {
      key: 'studentCount',
      header: 'Jumlah Siswa',
      render: (item: any) => `${item.studentCount} siswa`,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: any) => (
        <Button
          variant="outline"
          size="small"
          onClick={() => navigate(`${ROUTES.ADMIN_CLASSES_DETAIL.replace(':id', item.id)}`)}
        >
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

  if (!subjectData) {
    return (
      <DashboardLayout>
        <EmptyState icon="book" title="Mata Pelajaran Tidak Ditemukan" message="Mata pelajaran yang Anda cari tidak ditemukan." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="subject-detail">
        <div className="page-header">
          <h1>Detail Mata Pelajaran</h1>
        </div>

        <div className="detail-actions">
          <Button
            variant="outline"
            onClick={() => {
              // Navigate to edit - you can implement edit page or modal
              console.log('Edit subject', id);
            }}
          >
            <Icon name="edit" size={16} style={{ marginRight: '0.5rem' }} />
            Edit Mata Pelajaran
          </Button>
        </div>

        <Card title="Informasi Mata Pelajaran" variant="elevated">
          <div className="detail-info">
            <div className="info-row">
              <span className="info-label">Nama Mata Pelajaran:</span>
              <span className="info-value">
                <strong>{subjectData.name}</strong>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Kode:</span>
              <span className="info-value">{subjectData.code}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tingkat Sekolah:</span>
              <span className="info-value">
                <Badge variant="secondary">{SCHOOL_LEVELS[subjectData.schoolLevel]}</Badge>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Guru Pengampu:</span>
              <span className="info-value">{teacherName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Deskripsi:</span>
              <span className="info-value">{subjectData.description || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Jumlah Kelas:</span>
              <span className="info-value">{classes.length} kelas</span>
            </div>
          </div>
        </Card>

        <Card title="Kelas yang Menggunakan Mata Pelajaran Ini" variant="elevated">
          {classes.length === 0 ? (
            <EmptyState icon="class" title="Tidak Ada Kelas" message="Belum ada kelas yang menggunakan mata pelajaran ini." />
          ) : (
            <Table columns={classColumns} data={classes} />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

