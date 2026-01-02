import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormSelect, Badge, Table, Modal, SearchBar, Pagination, Icon, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { ReportCard } from '../../types';
import { formatDate } from '../../utils';
import './TeacherReports.css';

const MOCK_CLASSES = [
  { value: 'class1', label: 'X IPA 1' },
  { value: 'class2', label: 'X IPA 2' },
  { value: 'class3', label: 'XI IPA 1' },
];

const MOCK_STUDENTS = [
  { id: 'student1', studentNumber: '2024001', fullName: 'Budi Santoso', classId: 'class1' },
  { id: 'student2', studentNumber: '2024002', fullName: 'Siti Nurhaliza', classId: 'class1' },
  { id: 'student3', studentNumber: '2024003', fullName: 'Andi Pratama', classId: 'class1' },
  { id: 'student4', studentNumber: '2024004', fullName: 'Rina Wijaya', classId: 'class2' },
  { id: 'student5', studentNumber: '2024005', fullName: 'Dedi Kurniawan', classId: 'class2' },
];

// Mock data rapor
const mockReportCards: (ReportCard & { studentName: string; studentNumber: string })[] = [
  {
    id: '1',
    studentId: 'student1',
    studentName: 'Budi Santoso',
    studentNumber: '2024001',
    classId: 'class1',
    academicYear: '2024-2025',
    semester: 1,
    averageScore: 85.5,
    rank: 5,
    teacherNotes: 'Siswa menunjukkan kemajuan yang baik dalam pembelajaran. Perlu lebih aktif dalam diskusi kelas.',
    grades: [
      {
        id: 'g1',
        studentId: 'student1',
        subjectId: 'subject1',
        score: 88,
        maxScore: 100,
        type: 'assignment',
        teacherId: 'teacher1',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'g2',
        studentId: 'student1',
        subjectId: 'subject1',
        score: 85,
        maxScore: 100,
        type: 'quiz',
        teacherId: 'teacher1',
        createdAt: new Date('2024-01-20'),
      },
    ],
    createdAt: new Date('2024-01-30'),
  },
  {
    id: '2',
    studentId: 'student2',
    studentName: 'Siti Nurhaliza',
    studentNumber: '2024002',
    classId: 'class1',
    academicYear: '2024-2025',
    semester: 1,
    averageScore: 92.3,
    rank: 2,
    teacherNotes: 'Siswa sangat aktif dan berprestasi. Pertahankan semangat belajar!',
    grades: [
      {
        id: 'g3',
        studentId: 'student2',
        subjectId: 'subject1',
        score: 95,
        maxScore: 100,
        type: 'assignment',
        teacherId: 'teacher1',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'g4',
        studentId: 'student2',
        subjectId: 'subject1',
        score: 90,
        maxScore: 100,
        type: 'quiz',
        teacherId: 'teacher1',
        createdAt: new Date('2024-01-20'),
      },
    ],
    createdAt: new Date('2024-01-30'),
  },
  {
    id: '3',
    studentId: 'student3',
    studentName: 'Andi Pratama',
    studentNumber: '2024003',
    classId: 'class1',
    academicYear: '2024-2025',
    semester: 1,
    averageScore: 78.2,
    rank: 12,
    teacherNotes: 'Perlu lebih banyak latihan untuk meningkatkan pemahaman materi.',
    grades: [
      {
        id: 'g5',
        studentId: 'student3',
        subjectId: 'subject1',
        score: 75,
        maxScore: 100,
        type: 'assignment',
        teacherId: 'teacher1',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'g6',
        studentId: 'student3',
        subjectId: 'subject1',
        score: 80,
        maxScore: 100,
        type: 'quiz',
        teacherId: 'teacher1',
        createdAt: new Date('2024-01-20'),
      },
    ],
    createdAt: new Date('2024-01-30'),
  },
];

export const TeacherReports = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2024-2025');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredReports = mockReportCards.filter((report) => {
    const matchesClass = selectedClass === '' || report.classId === selectedClass;
    const matchesSemester = report.semester.toString() === selectedSemester;
    const matchesAcademicYear = report.academicYear === selectedAcademicYear;
    const matchesSearch =
      report.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.studentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSemester && matchesAcademicYear && matchesSearch;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleGenerate = async () => {
    if (!selectedClass) {
      alert('Pilih kelas terlebih dahulu');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Gagal generate rapor');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewReport = (reportId: string) => {
    navigate(`${ROUTES.TEACHER_REPORTS_DETAIL?.replace(':id', reportId) || `/teacher/reports/${reportId}`}`);
  };

  const getClassName = (classId: string) => {
    return MOCK_CLASSES.find((c) => c.value === classId)?.label || classId;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 75) return 'primary';
    if (score >= 65) return 'warning';
    return 'danger';
  };

  const columns = [
    {
      key: 'student',
      header: 'Siswa',
      render: (item: typeof mockReportCards[0]) => (
        <div>
          <strong>{item.studentName}</strong>
          <div style={{ fontSize: '0.875rem', color: 'var(--ios-gray)' }}>
            NIS: {item.studentNumber}
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Kelas',
      render: (item: typeof mockReportCards[0]) => getClassName(item.classId),
    },
    {
      key: 'averageScore',
      header: 'Rata-rata Nilai',
      render: (item: typeof mockReportCards[0]) => (
        <Badge variant={getScoreColor(item.averageScore)}>
          {item.averageScore.toFixed(1)}
        </Badge>
      ),
    },
    {
      key: 'rank',
      header: 'Ranking',
      render: (item: typeof mockReportCards[0]) => (
        <span style={{ fontWeight: 600 }}>#{item.rank || '-'}</span>
      ),
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (item: typeof mockReportCards[0]) => `Semester ${item.semester}`,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: typeof mockReportCards[0]) => (
        <Button variant="outline" size="small" onClick={() => handleViewReport(item.id)}>
          <Icon name="eye" size={16} style={{ marginRight: '0.25rem' }} />
          Lihat Rapor
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="teacher-reports">
        <div className="page-header">
          <h1>Rapor Siswa</h1>
        </div>

        <Card title="Generate Rapor" variant="elevated">
          <div className="report-form">
            <div className="form-row">
              <FormSelect
                label="Kelas"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '', label: 'Pilih kelas' },
                  ...MOCK_CLASSES,
                ]}
                required
              />
              <FormSelect
                label="Tahun Ajaran"
                value={selectedAcademicYear}
                onChange={(e) => {
                  setSelectedAcademicYear(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '2024-2025', label: '2024-2025' },
                  { value: '2023-2024', label: '2023-2024' },
                ]}
                required
              />
              <FormSelect
                label="Semester"
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '1', label: 'Semester 1' },
                  { value: '2', label: 'Semester 2' },
                ]}
                required
              />
            </div>
            <div className="form-actions">
              <Button onClick={handleGenerate} isLoading={isGenerating}>
                <Icon name="download" size={16} style={{ marginRight: '0.5rem' }} />
                Generate Rapor
              </Button>
            </div>
          </div>
        </Card>

        {selectedClass && (
          <>
            <div className="page-filters">
              <SearchBar
                placeholder="Cari siswa..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {paginatedReports.length === 0 ? (
              <EmptyState
                icon="document"
                title="Tidak Ada Rapor"
                message={
                  searchTerm || selectedClass
                    ? 'Tidak ada rapor yang sesuai dengan filter yang dipilih.'
                    : 'Pilih kelas, tahun ajaran, dan semester untuk melihat rapor.'
                }
              />
            ) : (
              <Card
                title={`Daftar Rapor - ${getClassName(selectedClass)} - Semester ${selectedSemester}`}
                variant="elevated"
              >
                <Table columns={columns} data={paginatedReports} />
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </Card>
            )}
          </>
        )}

        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Berhasil"
          size="small"
        >
          <p>Rapor berhasil di-generate!</p>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setShowSuccessModal(false)}>OK</Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
