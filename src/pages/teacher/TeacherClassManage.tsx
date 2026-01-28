import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon, Loading, EmptyState } from '../../components/common';
import { ROUTES, SCHOOL_LEVELS } from '../../constants';
import { classService, assignmentService, quizService, gradeService, materialService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherClasses.css';

export const TeacherClassManage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [classData, setClassData] = useState<any>(null);
  const [stats, setStats] = useState({
    studentCount: 0,
    activeAssignments: 0,
    activeQuizzes: 0,
    averageGrade: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [classInfo, assignmentsData, quizzesData, gradesData] = await Promise.all([
          classService.getClassById(id),
          assignmentService.getAssignments(id),
          quizService.getQuizzes(id),
          gradeService.getGrades(),
        ]);

        setClassData(classInfo);
        
        // Calculate stats
        const studentIds = (classInfo as any).studentIds || [];
        const now = new Date();
        
        const activeAssignments = assignmentsData.filter(a => {
          const dueDate = new Date(a.dueDate);
          return dueDate > now;
        }).length;

        const activeQuizzes = quizzesData.filter(q => {
          const endDate = new Date(q.endDate);
          return endDate > now;
        }).length;

        // Calculate average grade for this class
        const classGrades = gradesData.filter(g => 
          studentIds.includes(g.studentId)
        );
        const averageGrade = classGrades.length > 0
          ? Math.round((classGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / classGrades.length))
          : 0;

        setStats({
          studentCount: studentIds.length,
          activeAssignments,
          activeQuizzes,
          averageGrade,
        });
      } catch (error) {
        console.error('Error loading class data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const tabs = [
    { id: 'overview', label: 'Ringkasan' },
    { id: 'students', label: 'Siswa' },
    { id: 'materials', label: 'Materi' },
    { id: 'assignments', label: 'Tugas' },
    { id: 'quizzes', label: 'Kuis/Test/Ujian' },
    { id: 'attendance', label: 'Absensi' },
    { id: 'grades', label: 'Nilai' },
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

  return (
    <DashboardLayout>
      <div className="teacher-class-manage">
        <div className="page-header">
          <h1>Kelola Kelas - {classData.name}</h1>
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
                      <div className="overview-value">{stats.studentCount}</div>
                      <div className="overview-label">Total Siswa</div>
                    </div>
                  </div>
                  <div className="overview-card">
                    <Icon name="assignment" size={24} />
                    <div>
                      <div className="overview-value">{stats.activeAssignments}</div>
                      <div className="overview-label">Tugas Aktif</div>
                    </div>
                  </div>
                  <div className="overview-card">
                    <Icon name="quiz" size={24} />
                    <div>
                      <div className="overview-value">{stats.activeQuizzes}</div>
                      <div className="overview-label">Kuis/Test/Ujian Aktif</div>
                    </div>
                  </div>
                  <div className="overview-card">
                    <Icon name="grade" size={24} />
                    <div>
                      <div className="overview-value">{stats.averageGrade}%</div>
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
                <h3>Kuis/Test/Ujian</h3>
                <Button onClick={() => navigate(ROUTES.TEACHER_QUIZZES_CREATE)}>
                  <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
                  Buat Kuis/Test/Ujian
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

