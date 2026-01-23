import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon, Table } from '../../components/common';
import { SCHOOL_LEVELS, ROUTES } from '../../constants';
import './AdminClasses.css';

// Mock class data
const mockClassData = {
  id: '1',
  name: 'X IPA 1',
  grade: 10,
  schoolLevel: 'sma',
  homeroomTeacher: 'Ibu Siti',
  homeroomTeacherId: 'teacher1',
  studentCount: 30,
  maxStudents: 36,
  academicYear: '2024-2025',
  semester: 1,
  subjects: [
    { id: '1', name: 'Matematika', teacher: 'Ibu Siti' },
    { id: '2', name: 'Fisika', teacher: 'Bapak Budi' },
    { id: '3', name: 'Kimia', teacher: 'Ibu Rina' },
  ],
};

export const AdminClassesDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [classData, setClassData] = useState(mockClassData);

  useEffect(() => {
    // TODO: Fetch class data from API
    // For now, using mock data
  }, [id]);

  const subjectColumns = [
    {
      key: 'name',
      header: 'Mata Pelajaran',
    },
    {
      key: 'teacher',
      header: 'Guru',
    },
  ];

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

        <Card title="Mata Pelajaran" variant="elevated">
          {classData.subjects.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Belum ada mata pelajaran yang ditambahkan
            </div>
          ) : (
            <Table columns={subjectColumns} data={classData.subjects} />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

