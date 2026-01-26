import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Table, Loading, EmptyState } from '../../components/common';
import { ROUTES, SCHOOL_LEVELS } from '../../constants';
import { subjectService, classService, userService } from '../../services';
import './AdminSubjects.css';

export const AdminSubjects = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [subjectsData, classesData, teachersData] = await Promise.all([
          subjectService.getSubjects(),
          classService.getClasses(),
          userService.getUsers('teacher'),
        ]);

        setSubjects(subjectsData);
        setClasses(classesData);
        const teacherMap: Record<string, string> = {};
        teachersData.forEach(t => { teacherMap[t.id] = t.fullName; });
        setTeachers(teacherMap);
      } catch (error) {
        console.error('Error loading subjects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getClassCount = (subjectId: string) => {
    return classes.filter(c => (c as any).subjectIds?.includes(subjectId)).length;
  };

  const getTeacherName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.teacherId ? teachers[subject.teacherId] || '-' : '-';
  };

  const columns = [
    {
      key: 'name',
      header: 'Nama Mata Pelajaran',
      render: (item: any) => (
        <div>
          <strong>{item.name}</strong>
          <br />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Kode: {item.code || '-'}</span>
        </div>
      ),
    },
    {
      key: 'schoolLevel',
      header: 'Tingkat',
      render: (item: any) => (
        <Badge variant="secondary">{SCHOOL_LEVELS[item.schoolLevel]}</Badge>
      ),
    },
    {
      key: 'teacher',
      header: 'Guru Pengampu',
      render: (item: any) => getTeacherName(item.id),
    },
    {
      key: 'classCount',
      header: 'Jumlah Kelas',
      render: (item: any) => `${getClassCount(item.id)} kelas`,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: any) => (
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
              <Button>Tambah Mata Pelajaran</Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : subjects.length === 0 ? (
          <EmptyState
            icon="book"
            title="Tidak Ada Mata Pelajaran"
            message="Belum ada mata pelajaran yang terdaftar."
          />
        ) : (
          <Card title={`Daftar Mata Pelajaran (${subjects.length})`} variant="elevated">
            <Table columns={columns} data={subjects} />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

