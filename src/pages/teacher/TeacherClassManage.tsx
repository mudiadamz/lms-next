import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon } from '../../components/common';
import { ROUTES, SCHOOL_LEVELS } from '../../constants';
import './TeacherClasses.css';

// Mock data
const mockClassData = {
  id: 'class1',
  name: 'X IPA 1',
  grade: 10,
  schoolLevel: 'sma',
  studentCount: 30,
  maxStudents: 36,
  academicYear: '2024-2025',
  semester: 1,
};

export const TeacherClassManage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // TODO: Fetch class data from API based on id
  }, [id]);

  const tabs = [
    { id: 'overview', label: 'Ringkasan' },
    { id: 'students', label: 'Siswa' },
    { id: 'materials', label: 'Materi' },
    { id: 'assignments', label: 'Tugas' },
    { id: 'quizzes', label: 'Kuis' },
    { id: 'attendance', label: 'Absensi' },
    { id: 'grades', label: 'Nilai' },
  ];

  return (
    <DashboardLayout>
      <div className="teacher-class-manage">
        <div className="page-header">
          <Button variant="outline" onClick={() => navigate(ROUTES.TEACHER_CLASSES)}>
            <Icon name="chevronLeft" size={20} /> Kembali
          </Button>
          <h1>Kelola Kelas - {mockClassData.name}</h1>
        </div>

        <Card variant="elevated">
          <div className="manage-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`manage-tab ${activeTab === tab.id ? 'manage-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="manage-content">
            {activeTab === 'overview' && (
              <div className="tab-content">
                <h3>Ringkasan Kelas</h3>
                <div className="overview-grid">
                  <div className="overview-card">
                    <Icon name="users" size={24} />
                    <div>
                      <div className="overview-value">{mockClassData.studentCount}</div>
                      <div className="overview-label">Total Siswa</div>
                    </div>
                  </div>
                  <div className="overview-card">
                    <Icon name="assignment" size={24} />
                    <div>
                      <div className="overview-value">12</div>
                      <div className="overview-label">Tugas Aktif</div>
                    </div>
                  </div>
                  <div className="overview-card">
                    <Icon name="quiz" size={24} />
                    <div>
                      <div className="overview-value">5</div>
                      <div className="overview-label">Kuis Aktif</div>
                    </div>
                  </div>
                  <div className="overview-card">
                    <Icon name="grade" size={24} />
                    <div>
                      <div className="overview-value">85%</div>
                      <div className="overview-label">Rata-rata Nilai</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="tab-content">
                <h3>Daftar Siswa</h3>
                <p>Fitur manajemen siswa akan ditampilkan di sini.</p>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="tab-content">
                <h3>Materi Pembelajaran</h3>
                <Button onClick={() => navigate(ROUTES.TEACHER_MATERIALS)}>
                  <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
                  Tambah Materi
                </Button>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="tab-content">
                <h3>Tugas</h3>
                <Button onClick={() => navigate(ROUTES.TEACHER_ASSIGNMENTS_CREATE)}>
                  <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
                  Buat Tugas
                </Button>
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="tab-content">
                <h3>Kuis</h3>
                <Button onClick={() => navigate(ROUTES.TEACHER_QUIZZES_CREATE)}>
                  <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
                  Buat Kuis
                </Button>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="tab-content">
                <h3>Absensi</h3>
                <Button onClick={() => navigate(ROUTES.TEACHER_ATTENDANCE)}>
                  <Icon name="userGroup" size={16} style={{ marginRight: '0.5rem' }} />
                  Kelola Absensi
                </Button>
              </div>
            )}

            {activeTab === 'grades' && (
              <div className="tab-content">
                <h3>Nilai</h3>
                <Button onClick={() => navigate(ROUTES.TEACHER_GRADING)}>
                  <Icon name="grade" size={16} style={{ marginRight: '0.5rem' }} />
                  Kelola Nilai
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

