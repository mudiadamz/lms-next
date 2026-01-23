import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon, Table, Loading, EmptyState } from '../../components/common';
import { SCHOOL_LEVELS, ROUTES } from '../../constants';
import { classService, subjectService, userService } from '../../services';
import './AdminClasses.css';

export const AdminClassesDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [classData, setClassData] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [classInfo, subjectsData, teachersData] = await Promise.all([
          classService.getClassById(id),
          subjectService.getSubjects(),
          userService.getUsers('teacher'),
        ]);

        setClassData(classInfo);

        // Get subjects for this class
        const subjectIds = (classInfo as any).subjectIds || [];
        const classSubjects = subjectsData.filter(s => subjectIds.includes(s.id));
        setSubjects(classSubjects);

        // Create teacher map
        const teacherMap: Record<string, string> = {};
        teachersData.forEach(t => { teacherMap[t.id] = t.fullName; });
        setTeachers(teacherMap);
      } catch (error) {
        console.error('Error loading class detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const subjectColumns = [
    {
      key: 'name',
      header: 'Mata Pelajaran',
    },
    {
      key: 'teacher',
      header: 'Guru',
      render: (item: any) => teachers[item.teacherId] || '-',
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  if (!classData) {
    return (
      <DashboardLayout>
        <EmptyState icon="class" title="Kelas Tidak Ditemukan" message="Kelas yang Anda cari tidak ditemukan." />
      </DashboardLayout>
    );
  }

  const studentIds = (classData as any).studentIds || [];
  const studentCount = studentIds.length;
  const maxStudents = 36; // Default

  return (
    <DashboardLayout>
      <div className="admin-classes-detail">
        <div className="page-header">
          <h1>Detail Kelas</h1>
        </div>

        <div className="detail-actions">
          <Button variant="outline" onClick={() => navigate(`${ROUTES.ADMIN_CLASSES_EDIT.replace(':id', id || '')}`)}>
            <Icon name="edit" size={16} style={{ marginRight: '0.5rem' }} />
            Edit Kelas
          </Button>
          <Button onClick={() => navigate(`${ROUTES.ADMIN_CLASSES_STUDENTS.replace(':id', id || '')}`)}>
            <Icon name="users" size={16} style={{ marginRight: '0.5rem' }} />
            Daftar Siswa
          </Button>
        </div>

        <Card title="Informasi Kelas" variant="elevated">
          <div className="detail-info">
            <div className="info-row">
              <span className="info-label">Nama Kelas:</span>
              <span className="info-value">
                <strong>{classData.name}</strong>
                <Badge variant="secondary" style={{ marginLeft: '0.5rem' }}>
                  {SCHOOL_LEVELS[classData.schoolLevel]}
                </Badge>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Kelas:</span>
              <span className="info-value">Kelas {classData.grade}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Wali Kelas:</span>
              <span className="info-value">{teachers[classData.homeroomTeacherId] || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tahun Ajaran:</span>
              <span className="info-value">{classData.academicYear}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Semester:</span>
              <span className="info-value">Semester {classData.semester}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Jumlah Siswa:</span>
              <span className="info-value">
                {studentCount}/{maxStudents}
                <Badge
                  variant={studentCount >= maxStudents ? 'danger' : 'primary'}
                  style={{ marginLeft: '0.5rem' }}
                >
                  {Math.round((studentCount / maxStudents) * 100)}%
                </Badge>
              </span>
            </div>
          </div>
        </Card>

        <Card title="Mata Pelajaran" variant="elevated">
          {subjects.length === 0 ? (
            <EmptyState icon="book" title="Tidak Ada Mata Pelajaran" message="Belum ada mata pelajaran yang ditambahkan untuk kelas ini." />
          ) : (
            <Table columns={subjectColumns} data={subjects} />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

