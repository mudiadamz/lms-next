import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon, Table } from '../../components/common';
import { SCHOOL_LEVELS, ROUTES } from '../../constants';
import './SubjectManagement.css';

// Mock subject data
const mockSubjectData = {
  id: '1',
  name: 'Matematika',
  code: 'MAT',
  description: 'Mata pelajaran matematika untuk semua tingkat',
  schoolLevel: 'sma',
  teacher: 'Ibu Siti',
  teacherId: 'teacher1',
  classCount: 5,
  classes: [
    { id: '1', name: 'X IPA 1', studentCount: 30 },
    { id: '2', name: 'X IPA 2', studentCount: 28 },
    { id: '3', name: 'XI IPA 1', studentCount: 32 },
  ],
};

export const AdminSubjectsDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [subjectData, setSubjectData] = useState(mockSubjectData);

  useEffect(() => {
    // TODO: Fetch subject data from API
    // For now, using mock data
  }, [id]);

  const classColumns = [
    {
      key: 'name',
      header: 'Nama Kelas',
    },
    {
      key: 'studentCount',
      header: 'Jumlah Siswa',
      render: (item: typeof mockSubjectData.classes[0]) => `${item.studentCount} siswa`,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: typeof mockSubjectData.classes[0]) => (
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

  return (
    <DashboardLayout>
      <div className="subject-detail">
        <div className="page-header">
          <Button variant="outline" onClick={() => navigate(ROUTES.ADMIN_SUBJECT_MANAGEMENT)}>
            <Icon name="chevronLeft" size={20} /> Kembali
          </Button>
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
              <span className="info-value">{subjectData.teacher}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Deskripsi:</span>
              <span className="info-value">{subjectData.description || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Jumlah Kelas:</span>
              <span className="info-value">{subjectData.classCount} kelas</span>
            </div>
          </div>
        </Card>

        <Card title="Kelas yang Menggunakan Mata Pelajaran Ini" variant="elevated">
          {subjectData.classes.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Belum ada kelas yang menggunakan mata pelajaran ini
            </div>
          ) : (
            <Table columns={classColumns} data={subjectData.classes} />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

