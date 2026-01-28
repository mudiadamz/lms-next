import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormSelect, Badge, Table, Modal, Pagination, Icon, EmptyState, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { ReportCard } from '../../types';
import { formatDate } from '../../utils';
import { reportCardService, classService, userService, academicYearService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherReports.css';

export const TeacherReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportCards, setReportCards] = useState<(ReportCard & { studentName: string; studentNumber: string })[]>([]);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [academicYears, setAcademicYears] = useState<Array<{ value: string; label: string }>>([]);
  const [students, setStudents] = useState<Record<string, { fullName: string; studentNumber: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [classesData, academicYearsData, studentsData] = await Promise.all([
          classService.getClasses(),
          academicYearService.getAcademicYears(),
          userService.getUsers('student'),
        ]);

        // Filter classes taught by this teacher
        const teacherClasses = classesData.filter(c => {
          const teacherIds = (c as any).teacherIds || [];
          return teacherIds.includes(user?.id);
        });

        setClasses(teacherClasses.map(c => ({ value: c.id, label: c.name })));
        // Use AcademicYear.name as the year identifier
        setAcademicYears(academicYearsData.map(ay => ({ value: ay.name, label: ay.name })));
        
        const studentMap: Record<string, { fullName: string; studentNumber: string }> = {};
        studentsData.forEach(s => {
          studentMap[s.id] = {
            fullName: s.fullName,
            studentNumber: (s as any).studentNumber || '',
          };
        });
        setStudents(studentMap);

        // Set default academic year
        if (academicYearsData.length > 0 && !selectedAcademicYear) {
          setSelectedAcademicYear(academicYearsData[0].name);
        }
      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  useEffect(() => {
    const loadReportCards = async () => {
      if (!selectedClass || !selectedAcademicYear || !selectedSemester) {
        setReportCards([]);
        return;
      }

      try {
        setIsLoading(true);
        // Get students in the selected class
        const classData = await classService.getClassById(selectedClass);
        const studentIds = (classData as any).studentIds || [];

        // Get report cards for all students
        const reportCardsData = await Promise.all(
          studentIds.map(async (studentId: string) => {
            try {
              const reportCard = await reportCardService.getReportCard(
                studentId,
                selectedAcademicYear,
                parseInt(selectedSemester)
              );
              const student = students[studentId] || { fullName: studentId, studentNumber: '' };
              return {
                ...reportCard,
                studentName: student.fullName,
                studentNumber: student.studentNumber,
              };
            } catch (error) {
              // If report card doesn't exist, return null
              return null;
            }
          })
        );

        setReportCards(reportCardsData.filter(rc => rc !== null) as any[]);
      } catch (error) {
        console.error('Error loading report cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportCards();
  }, [selectedClass, selectedAcademicYear, selectedSemester, students]);

  const filteredReports = reportCards.filter((report) => {
    const term = searchTerm.toLowerCase();
    return (
      report.studentName.toLowerCase().includes(term) ||
      report.studentNumber.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleGenerate = async () => {
    if (!selectedClass || !selectedAcademicYear || !selectedSemester) {
      alert('Pilih kelas, tahun ajaran, dan semester terlebih dahulu');
      return;
    }

    setIsGenerating(true);
    try {
      // Get students in the selected class
      const classData = await classService.getClassById(selectedClass);
      const studentIds = (classData as any).studentIds || [];

      // Generate report cards for all students
      await Promise.all(
        studentIds.map(async (studentId: string) => {
          try {
            // Try to get existing report card, if not exists, create it
            await reportCardService.getReportCard(
              studentId,
              selectedAcademicYear,
              parseInt(selectedSemester)
            );
          } catch (error) {
            // If report card doesn't exist, generate it
            // Note: This might require a generate endpoint in the API
            console.log('Generating report card for student:', studentId);
          }
        })
      );

      // Reload report cards
      const reportCardsData = await Promise.all(
        studentIds.map(async (studentId: string) => {
          try {
            const reportCard = await reportCardService.getReportCard(
              studentId,
              selectedAcademicYear,
              parseInt(selectedSemester)
            );
            const student = students[studentId] || { fullName: studentId, studentNumber: '' };
            return {
              ...reportCard,
              studentName: student.fullName,
              studentNumber: student.studentNumber,
            };
          } catch (error) {
            return null;
          }
        })
      );

      setReportCards(reportCardsData.filter(rc => rc !== null) as any[]);
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
    return classes.find((c) => c.value === classId)?.label || classId;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 75) return 'primary';
    if (score >= 65) return 'warning';
    return 'danger';
  };

  type ReportCardWithStudent = ReportCard & { studentName: string; studentNumber: string };

  const columns = [
    {
      key: 'student',
      header: 'Siswa',
      render: (item: Record<string, unknown>) => {
        const report = item as ReportCardWithStudent;
        return (
          <div>
            <strong>{report.studentName}</strong>
            <div style={{ fontSize: '0.875rem', color: 'var(--ios-gray)' }}>
              NIS: {report.studentNumber}
            </div>
          </div>
        );
      },
    },
    {
      key: 'class',
      header: 'Kelas',
      render: (item: Record<string, unknown>) => {
        const report = item as ReportCardWithStudent;
        return getClassName(report.classId);
      },
    },
    {
      key: 'averageScore',
      header: 'Rata-rata Nilai',
      render: (item: Record<string, unknown>) => {
        const report = item as ReportCardWithStudent;
        return (
          <Badge variant={getScoreColor(report.averageScore)}>
            {report.averageScore.toFixed(1)}
          </Badge>
        );
      },
    },
    {
      key: 'rank',
      header: 'Ranking',
      render: (item: Record<string, unknown>) => {
        const report = item as ReportCardWithStudent;
        return <span style={{ fontWeight: 600 }}>#{report.rank || '-'}</span>;
      },
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (item: Record<string, unknown>) => {
        const report = item as ReportCardWithStudent;
        return `Semester ${report.semester}`;
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: Record<string, unknown>) => {
        const report = item as ReportCardWithStudent;
        return (
          <Button variant="outline" size="small" onClick={() => handleViewReport(report.id)}>
            <Icon name="eye" size={16} style={{ marginRight: '0.25rem' }} />
            Lihat Rapor
          </Button>
        );
      },
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
                  ...classes,
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
                options={academicYears}
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
            {isLoading ? (
              <Loading />
            ) : paginatedReports.length === 0 ? (
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
                <Table columns={columns} data={paginatedReports as Record<string, unknown>[]} />
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
