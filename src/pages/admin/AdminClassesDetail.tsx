import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon, Table, Loading, EmptyState } from '../../components/common';
import { SCHOOL_LEVELS, ROUTES } from '../../constants';
import { classService, userService, academicYearService } from '../../services';
import './AdminClasses.css';

export const AdminClassesDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [classData, setClassData] = useState<any>(null);
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [academicYears, setAcademicYears] = useState<Record<string, string>>({});
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [moveTargets, setMoveTargets] = useState<Record<string, string>>({});
  const [isMovingStudentId, setIsMovingStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [classInfo, teachersData, studentsData, classesData, academicYearsData] = await Promise.all([
          classService.getClassById(id),
          userService.getUsers('teacher'),
          userService.getUsers('student'),
          classService.getClasses(),
          academicYearService.getAcademicYears(),
        ]);

        setClassData(classInfo);

        // Create teacher map
        const teacherMap: Record<string, string> = {};
        teachersData.forEach(t => { teacherMap[t.id] = t.fullName; });
        setTeachers(teacherMap);

        // Create academic year map
        const academicYearMap: Record<string, string> = {};
        academicYearsData.forEach(ay => { academicYearMap[ay.id] = ay.name; });
        setAcademicYears(academicYearMap);

        const classStudentIds = (classInfo as any).studentIds || [];
        const classStudents = studentsData.filter((student) =>
          student.classId === id || classStudentIds.includes(student.id)
        );
        setStudents(classStudents);

        const availableClasses = classesData.filter((cls: any) => cls.id !== classInfo.id);
        setClasses(availableClasses);

        const studentTargets: Record<string, string> = {};
        classStudents.forEach((student) => {
          studentTargets[student.id] = '';
        });
        setMoveTargets(studentTargets);
      } catch (error) {
        console.error('Error loading class detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const studentColumns = [
    {
      key: 'fullName',
      header: 'Nama',
      render: (item: any) => item.fullName || '-',
    },
    {
      key: 'studentNumber',
      header: 'NIS',
      render: (item: any) => item.studentNumber || '-',
    },
    {
      key: 'email',
      header: 'Email',
      render: (item: any) => item.email || '-',
    },
    {
      key: 'moveClass',
      header: 'Pindah Kelas',
      render: (item: any) => (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            className="filter-select"
            value={moveTargets[item.id] || ''}
            onChange={(e) => setMoveTargets({ ...moveTargets, [item.id]: e.target.value })}
            disabled={classes.length === 0 || isMovingStudentId === item.id}
          >
            <option value="">
              {classes.length === 0 ? 'Tidak ada kelas lain' : 'Pilih kelas'}
            </option>
            {classes.map((cls: any) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="small"
            disabled={!moveTargets[item.id] || isMovingStudentId === item.id}
            onClick={async () => {
              const targetClassId = moveTargets[item.id];
              if (!targetClassId) return;
              try {
                setIsMovingStudentId(item.id);
                await userService.updateUser(item.id, { classId: targetClassId });
                setStudents(students.filter((s) => s.id !== item.id));
              } catch (error) {
                console.error('Error moving student:', error);
                alert('Gagal memindahkan siswa');
              } finally {
                setIsMovingStudentId(null);
              }
            }}
          >
            Pindah
          </Button>
        </div>
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

  if (!classData) {
    return (
      <DashboardLayout>
        <EmptyState icon="class" title="Kelas Tidak Ditemukan" message="Kelas yang Anda cari tidak ditemukan." />
      </DashboardLayout>
    );
  }

  const studentCount = students.length || (classData as any).studentCount || 0;
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
              <span className="info-value">{academicYears[classData.academicYear] || classData.academicYear}</span>
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

        <Card title="Daftar Siswa" variant="elevated">
          {students.length === 0 ? (
            <EmptyState icon="users" title="Tidak Ada Siswa" message="Belum ada siswa yang terdaftar di kelas ini." />
          ) : (
            <Table columns={studentColumns} data={students} />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

