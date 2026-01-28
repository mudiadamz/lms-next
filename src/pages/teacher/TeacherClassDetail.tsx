import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Table, Loading, EmptyState } from '../../components/common';
import { SCHOOL_LEVELS } from '../../constants';
import { classService, subjectService, userService, academicYearService } from '../../services';
import './TeacherClasses.css';

export const TeacherClassDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [classData, setClassData] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [academicYears, setAcademicYears] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [classInfo, subjectsData, teachersData, studentsData, academicYearsData] = await Promise.all([
          classService.getClassById(id),
          subjectService.getSubjects(),
          userService.getUsers('teacher'),
          userService.getUsers('student'),
          academicYearService.getAcademicYears(),
        ]);

        setClassData(classInfo);
        
        // Get subjects for this class
        const subjectIds = (classInfo as any).subjectIds || [];
        const classSubjects = subjectsData.filter(s => subjectIds.includes(s.id));
        setSubjects(classSubjects);

        // Get students for this class
        const classStudents = studentsData.filter((student) => (student as any).classId === id);
        setStudents(classStudents);

        // Create teacher map
        const teacherMap: Record<string, string> = {};
        teachersData.forEach(t => { teacherMap[t.id] = t.fullName; });
        setTeachers(teacherMap);

        // Create academic year map
        const academicYearMap: Record<string, string> = {};
        academicYearsData.forEach(ay => { academicYearMap[ay.id] = ay.name; });
        setAcademicYears(academicYearMap);
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

  const studentCount = students.length;
  const maxStudents = 36; // Default max students

  return (
    <DashboardLayout>
      <div className="teacher-class-detail">
        <div className="page-header">
          <h1>Detail Kelas - {classData.name}</h1>
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

        <Card title="Mata Pelajaran yang Diajar" variant="elevated" style={{ marginTop: '1.5rem' }}>
          {subjects.length === 0 ? (
            <EmptyState icon="book" title="Tidak Ada Mata Pelajaran" message="Belum ada mata pelajaran yang ditambahkan untuk kelas ini." />
          ) : (
            <div className="subjects-list-detail">
              {subjects.map((subject) => (
                <div key={subject.id} className="subject-item">
                  <div>
                    <strong>{subject.name}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ios-gray)', marginTop: '0.25rem' }}>
                      Guru: {teachers[subject.teacherId] || '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Daftar Siswa" variant="elevated" style={{ marginTop: '1.5rem' }}>
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

