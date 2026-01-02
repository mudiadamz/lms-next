import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon, Table } from '../../components/common';
import { ROUTES, SCHOOL_LEVELS } from '../../constants';
import './TeacherClasses.css';

// Mock data untuk detail kelas
const mockClassData = {
  id: 'class1',
  name: 'X IPA 1',
  grade: 10,
  schoolLevel: 'sma',
  studentCount: 30,
  maxStudents: 36,
  homeroomTeacher: 'Ibu Siti',
  subjects: [
    { id: 'subj1', name: 'Matematika', teacher: 'Ibu Siti' },
    { id: 'subj2', name: 'Fisika', teacher: 'Bapak Budi' },
  ],
  academicYear: '2024-2025',
  semester: 1,
  students: [
    { id: '1', studentNumber: '2024001', fullName: 'Budi Santoso', gender: 'Laki-laki' },
    { id: '2', studentNumber: '2024002', fullName: 'Siti Nurhaliza', gender: 'Perempuan' },
    { id: '3', studentNumber: '2024003', fullName: 'Andi Pratama', gender: 'Laki-laki' },
  ],
};

export const TeacherClassDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [classData, setClassData] = useState(mockClassData);

  useEffect(() => {
    // TODO: Fetch class data from API based on id
    // For now, using mock data
  }, [id]);

  const studentColumns = [
    {
      key: 'studentNumber',
      header: 'NIS',
    },
    {
      key: 'fullName',
      header: 'Nama Lengkap',
      render: (item: typeof mockClassData.students[0]) => (
        <div>
          <strong>{item.fullName}</strong>
        </div>
      ),
    },
    {
      key: 'gender',
      header: 'Jenis Kelamin',
      render: (item: typeof mockClassData.students[0]) => (
        <Badge variant="secondary">{item.gender}</Badge>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="teacher-class-detail">
        <div className="page-header">
          <Button variant="outline" onClick={() => navigate(ROUTES.TEACHER_CLASSES)}>
            <Icon name="chevronLeft" size={20} /> Kembali
          </Button>
          <h1>Detail Kelas - {classData.name}</h1>
        </div>

        <div className="detail-actions">
          <Button onClick={() => navigate(`${ROUTES.TEACHER_CLASSES_MANAGE.replace(':id', id || '')}`)}>
            <Icon name="settings" size={16} style={{ marginRight: '0.5rem' }} />
            Kelola Kelas
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
              <span className="info-value">{classData.homeroomTeacher}</span>
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
                {classData.studentCount}/{classData.maxStudents}
                <Badge
                  variant={classData.studentCount >= classData.maxStudents ? 'danger' : 'primary'}
                  style={{ marginLeft: '0.5rem' }}
                >
                  {Math.round((classData.studentCount / classData.maxStudents) * 100)}%
                </Badge>
              </span>
            </div>
          </div>
        </Card>

        <Card title="Mata Pelajaran yang Diajar" variant="elevated" style={{ marginTop: '1.5rem' }}>
          <div className="subjects-list-detail">
            {classData.subjects.map((subject) => (
              <div key={subject.id} className="subject-item">
                <div>
                  <strong>{subject.name}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--ios-gray)', marginTop: '0.25rem' }}>
                    Guru: {subject.teacher}
                  </div>
                </div>
                <Button variant="outline" size="small">
                  Lihat Materi
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Daftar Siswa" variant="elevated" style={{ marginTop: '1.5rem' }}>
          <Table columns={studentColumns} data={classData.students} />
        </Card>
      </div>
    </DashboardLayout>
  );
};

