import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, Badge, Dropdown, Modal, FormInput, FormTextarea, FormSelect, Icon, EmptyState, Pagination } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import './TeacherGrading.css';

// Interface untuk item yang perlu dinilai
interface PendingGrading {
  id: string;
  type: 'assignment' | 'quiz';
  title: string;
  class: string;
  subject: string;
  dueDate: Date;
  submittedCount: number;
  totalStudents: number;
  maxScore: number;
}

// Interface untuk nilai yang sudah diberikan
interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  type: 'assignment' | 'quiz' | 'midterm' | 'final' | 'other';
  title: string;
  class: string;
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  notes?: string;
  gradedAt: Date;
}

// Contoh data tugas/kuis yang perlu dinilai
const mockPendingGradings: PendingGrading[] = [
  {
    id: '1',
    type: 'assignment',
    title: 'Tugas Matematika - Aljabar',
    class: 'X IPA 1',
    subject: 'Matematika',
    dueDate: new Date('2024-01-20'),
    submittedCount: 25,
    totalStudents: 30,
    maxScore: 100,
  },
  {
    id: '2',
    type: 'assignment',
    title: 'Tugas Fisika - Gerak Lurus',
    class: 'X IPA 1',
    subject: 'Fisika',
    dueDate: new Date('2024-01-22'),
    submittedCount: 28,
    totalStudents: 30,
    maxScore: 100,
  },
  {
    id: '3',
    type: 'quiz',
    title: 'Kuis Matematika - Trigonometri',
    class: 'XI IPA 1',
    subject: 'Matematika',
    dueDate: new Date('2024-01-18'),
    submittedCount: 30,
    totalStudents: 32,
    maxScore: 50,
  },
  {
    id: '4',
    type: 'assignment',
    title: 'Tugas Bahasa Indonesia - Menulis Esai',
    class: 'X IPA 2',
    subject: 'Bahasa Indonesia',
    dueDate: new Date('2024-01-25'),
    submittedCount: 15,
    totalStudents: 28,
    maxScore: 100,
  },
];

// Contoh data nilai yang sudah diberikan
const mockGrades: GradeRecord[] = [
  {
    id: '1',
    studentId: 'student1',
    studentName: 'Budi Santoso',
    studentNumber: '2024001',
    type: 'assignment',
    title: 'Tugas Matematika - Aljabar',
    class: 'X IPA 1',
    subject: 'Matematika',
    score: 85,
    maxScore: 100,
    percentage: 85,
    notes: 'Bagus, perlu lebih teliti dalam perhitungan',
    gradedAt: new Date('2024-01-19'),
  },
  {
    id: '2',
    studentId: 'student2',
    studentName: 'Siti Nurhaliza',
    studentNumber: '2024002',
    type: 'assignment',
    title: 'Tugas Matematika - Aljabar',
    class: 'X IPA 1',
    subject: 'Matematika',
    score: 92,
    maxScore: 100,
    percentage: 92,
    notes: 'Sangat baik',
    gradedAt: new Date('2024-01-19'),
  },
  {
    id: '3',
    studentId: 'student3',
    studentName: 'Andi Pratama',
    studentNumber: '2024003',
    type: 'quiz',
    title: 'Kuis Matematika - Trigonometri',
    class: 'XI IPA 1',
    subject: 'Matematika',
    score: 45,
    maxScore: 50,
    percentage: 90,
    gradedAt: new Date('2024-01-18'),
  },
  {
    id: '4',
    studentId: 'student1',
    studentName: 'Budi Santoso',
    studentNumber: '2024001',
    type: 'assignment',
    title: 'Tugas Fisika - Gerak Lurus',
    class: 'X IPA 1',
    subject: 'Fisika',
    score: 78,
    maxScore: 100,
    percentage: 78,
    gradedAt: new Date('2024-01-21'),
  },
];

export const TeacherGrading = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pending' | 'graded'>('pending');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PendingGrading | null>(null);
  const [formData, setFormData] = useState({
    score: '',
    notes: '',
  });
  const itemsPerPage = 10;

  const [pendingGradings, setPendingGradings] = useState<PendingGrading[]>(mockPendingGradings);
  const [grades, setGrades] = useState<GradeRecord[]>(mockGrades);

  const filteredPending = pendingGradings.filter((item) => {
    const matchesClass = selectedClass === 'all' || item.class === selectedClass;
    const matchesSubject = selectedSubject === 'all' || item.subject === selectedSubject;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesClass && matchesSubject && matchesType;
  });

  const filteredGraded = grades.filter((item) => {
    const matchesClass = selectedClass === 'all' || item.class === selectedClass;
    const matchesSubject = selectedSubject === 'all' || item.subject === selectedSubject;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesClass && matchesSubject && matchesType;
  });

  const currentData = activeTab === 'pending' ? filteredPending : filteredGraded;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleGrade = (item: PendingGrading) => {
    setSelectedItem(item);
    setFormData({
      score: '',
      notes: '',
    });
    setShowGradeModal(true);
  };

  const handleEditGrade = (grade: GradeRecord) => {
    setSelectedItem({
      id: grade.id,
      type: grade.type,
      title: grade.title,
      class: grade.class,
      subject: grade.subject,
      dueDate: new Date(),
      submittedCount: 0,
      totalStudents: 0,
      maxScore: grade.maxScore,
    });
    setFormData({
      score: grade.score.toString(),
      notes: grade.notes || '',
    });
    setShowGradeModal(true);
  };

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const score = parseFloat(formData.score);
      if (selectedItem) {
        // In real app, this would save to backend
        console.log('Grading:', {
          itemId: selectedItem.id,
          score,
          maxScore: selectedItem.maxScore,
          notes: formData.notes,
        });

        // Update pending count if grading assignment
        if (activeTab === 'pending') {
          setPendingGradings(
            pendingGradings.map((item) =>
              item.id === selectedItem.id
                ? { ...item, submittedCount: item.submittedCount + 1 }
                : item
            )
          );
        }
      }

      setShowGradeModal(false);
      setSelectedItem(null);
      setFormData({
        score: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Gagal menyimpan nilai');
    }
  };

  const getGradeBadgeVariant = (percentage: number) => {
    if (percentage >= 85) return 'success';
    if (percentage >= 70) return 'primary';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const pendingColumns = [
    {
      key: 'title',
      header: 'Judul',
      render: (item: PendingGrading) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon
              name={item.type === 'assignment' ? 'assignment' : 'quiz'}
              size={18}
            />
            <strong>{item.title}</strong>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {item.subject} - {item.class}
          </div>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Deadline',
      render: (item: PendingGrading) => formatDate(item.dueDate),
    },
    {
      key: 'submissions',
      header: 'Pengumpulan',
      render: (item: PendingGrading) => (
        <div>
          <Badge
            variant={item.submittedCount === item.totalStudents ? 'success' : 'warning'}
          >
            {item.submittedCount}/{item.totalStudents}
          </Badge>
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {item.totalStudents - item.submittedCount} belum dinilai
          </div>
        </div>
      ),
    },
    {
      key: 'maxScore',
      header: 'Nilai Maks',
      render: (item: PendingGrading) => `${item.maxScore}`,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: PendingGrading) => (
        <Button
          onClick={() => {
            if (item.type === 'assignment') {
              navigate(`${ROUTES.TEACHER_ASSIGNMENT_GRADE.replace(':assignmentId', item.id).replace(':submissionId', 'all')}`);
            } else {
              handleGrade(item);
            }
          }}
          size="small"
        >
          <Icon name="grade" size={16} style={{ marginRight: '0.5rem' }} />
          Nilai
        </Button>
      ),
    },
  ];

  const gradedColumns = [
    {
      key: 'student',
      header: 'Siswa',
      render: (item: GradeRecord) => (
        <div>
          <strong>{item.studentName}</strong>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            NIS: {item.studentNumber}
          </div>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Judul',
      render: (item: GradeRecord) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon
              name={item.type === 'assignment' ? 'assignment' : 'quiz'}
              size={18}
            />
            <strong>{item.title}</strong>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {item.subject} - {item.class}
          </div>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'Nilai',
      render: (item: GradeRecord) => (
        <div>
          <Badge variant={getGradeBadgeVariant(item.percentage)}>
            {item.score}/{item.maxScore}
          </Badge>
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {item.percentage}%
          </div>
        </div>
      ),
    },
    {
      key: 'gradedAt',
      header: 'Tanggal Dinilai',
      render: (item: GradeRecord) => formatDate(item.gradedAt),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: GradeRecord) => (
        <Dropdown
          trigger={<Button variant="outline" size="small">Kelola</Button>}
          items={[
            { label: 'Edit Nilai', onClick: () => handleEditGrade(item) },
            { label: 'Lihat Detail', onClick: () => console.log('View detail', item.id) },
          ]}
          align="right"
        />
      ),
    },
  ];

  // Calculate statistics
  const pendingCount = pendingGradings.length;
  const gradedCount = grades.length;
  const averageScore =
    grades.length > 0
      ? Math.round(
          grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length
        )
      : 0;

  return (
    <DashboardLayout>
      <div className="teacher-grading">
        <div className="page-header">
          <h1>Penilaian</h1>
        </div>

        {/* Statistics Cards */}
        <div className="grading-stats">
          <Card variant="elevated" className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 149, 0, 0.1)' }}>
              <Icon name="assignment" size={18} style={{ color: '#ff9500' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{pendingCount}</div>
              <div className="stat-label">Menunggu Penilaian</div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)' }}>
              <Icon name="checkCircle" size={18} style={{ color: '#34c759' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{gradedCount}</div>
              <div className="stat-label">Sudah Dinilai</div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
              <Icon name="grade" size={18} style={{ color: '#007aff' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{averageScore}%</div>
              <div className="stat-label">Rata-rata Nilai</div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="grading-tabs">
          <button
            className={`grading-tab ${activeTab === 'pending' ? 'grading-tab--active' : ''}`}
            onClick={() => {
              setActiveTab('pending');
              setCurrentPage(1);
            }}
          >
            <Icon name="clock" size={18} style={{ marginRight: '0.5rem' }} />
            Menunggu Penilaian ({pendingCount})
          </button>
          <button
            className={`grading-tab ${activeTab === 'graded' ? 'grading-tab--active' : ''}`}
            onClick={() => {
              setActiveTab('graded');
              setCurrentPage(1);
            }}
          >
            <Icon name="checkCircle" size={18} style={{ marginRight: '0.5rem' }} />
            Sudah Dinilai ({gradedCount})
          </button>
        </div>

        {/* Filters */}
        <div className="page-filters">
          <div className="filter-group">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">Semua Kelas</option>
              <option value="X IPA 1">X IPA 1</option>
              <option value="X IPA 2">X IPA 2</option>
              <option value="XI IPA 1">XI IPA 1</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">Semua Mata Pelajaran</option>
              <option value="Matematika">Matematika</option>
              <option value="Fisika">Fisika</option>
              <option value="Bahasa Indonesia">Bahasa Indonesia</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">Semua Jenis</option>
              <option value="assignment">Tugas</option>
              <option value="quiz">Kuis</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {paginatedData.length === 0 ? (
          <EmptyState
            icon={activeTab === 'pending' ? 'clock' : 'checkCircle'}
            title={`Tidak Ada ${activeTab === 'pending' ? 'Tugas/Kuis yang Menunggu Penilaian' : 'Nilai'}`}
            message={selectedClass !== 'all' || selectedSubject !== 'all' || selectedType !== 'all'
              ? 'Tidak ada data yang sesuai dengan filter yang dipilih.'
              : activeTab === 'pending'
              ? 'Tidak ada tugas atau kuis yang menunggu penilaian.'
              : 'Belum ada nilai yang diberikan.'}
          />
        ) : (
          <Card
            title={`${activeTab === 'pending' ? 'Menunggu Penilaian' : 'Nilai yang Sudah Diberikan'} (${currentData.length})`}
            variant="elevated"
          >
            <Table
              columns={activeTab === 'pending' ? pendingColumns : gradedColumns}
              data={paginatedData}
            />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </Card>
        )}

        {/* Grade Modal */}
        <Modal
          isOpen={showGradeModal}
          onClose={() => {
            setShowGradeModal(false);
            setSelectedItem(null);
            setFormData({
              score: '',
              notes: '',
            });
          }}
          title={selectedItem ? `Nilai ${selectedItem.title}` : 'Nilai'}
          size="medium"
        >
          {selectedItem && (
            <form onSubmit={handleSubmitGrade} className="grade-form">
              <div className="grade-info">
                <div className="info-row">
                  <span className="info-label">Kelas:</span>
                  <span className="info-value">{selectedItem.class}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Mata Pelajaran:</span>
                  <span className="info-value">{selectedItem.subject}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Nilai Maksimal:</span>
                  <span className="info-value">{selectedItem.maxScore}</span>
                </div>
              </div>

              <FormInput
                label="Nilai"
                type="number"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                placeholder={`0 - ${selectedItem.maxScore}`}
                min="0"
                max={selectedItem.maxScore.toString()}
                required
              />

              <FormTextarea
                label="Catatan (Opsional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Masukkan catatan atau feedback untuk siswa"
                rows={4}
              />

              <div className="modal-footer">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setShowGradeModal(false);
                    setSelectedItem(null);
                  }}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan Nilai</Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};
