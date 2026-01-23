import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, Badge, Dropdown, Modal, FormInput, FormTextarea, FormSelect, Icon, EmptyState, Pagination, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import { assignmentService, quizService, gradeService, classService, subjectService, userService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
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

export const TeacherGrading = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [pendingGradings, setPendingGradings] = useState<PendingGrading[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [classes, setClasses] = useState<Record<string, string>>({});
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [students, setStudents] = useState<Record<string, { fullName: string; studentNumber: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [assignmentsData, quizzesData, classesData, subjectsData, studentsData] = await Promise.all([
          assignmentService.getAssignments({ teacherId: user?.id }),
          quizService.getQuizzes({ teacherId: user?.id }),
          classService.getClasses(),
          subjectService.getSubjects(),
          userService.getUsers('student'),
        ]);

        // Get all grades and filter by teacher's assignments/quizzes
        // Note: gradeService.getGrades() doesn't accept teacherId, so we filter manually
        const allGrades = await gradeService.getGrades();
        const teacherAssignmentIds = assignmentsData.map(a => a.id);
        const teacherQuizIds = quizzesData.map(q => q.id);
        const gradesData = allGrades.filter(g => 
          (g.assignmentId && teacherAssignmentIds.includes(g.assignmentId)) ||
          (g.quizId && teacherQuizIds.includes(g.quizId)) ||
          g.teacherId === user?.id
        );

        // Create lookup maps
        const classMap: Record<string, string> = {};
        classesData.forEach(c => { classMap[c.id] = c.name; });
        setClasses(classMap);

        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);

        const studentMap: Record<string, { fullName: string; studentNumber: string }> = {};
        studentsData.forEach(s => {
          studentMap[s.id] = {
            fullName: s.fullName,
            studentNumber: (s as any).studentNumber || '',
          };
        });
        setStudents(studentMap);

        // Process pending gradings from assignments and quizzes
        const pendingItems: PendingGrading[] = [];
        
        assignmentsData.forEach(assignment => {
          const submissionCount = (assignment as any).submissionCount || 0;
          const totalStudents = (assignment as any).totalStudents || 0;
          if (submissionCount < totalStudents || submissionCount === 0) {
            pendingItems.push({
              id: assignment.id,
              type: 'assignment',
              title: assignment.title,
              class: classMap[assignment.classId] || assignment.classId,
              subject: subjectMap[assignment.subjectId] || assignment.subjectId,
              dueDate: new Date(assignment.dueDate),
              submittedCount: submissionCount,
              totalStudents: totalStudents,
              maxScore: assignment.maxScore || 100,
            });
          }
        });

        quizzesData.forEach(quiz => {
          const submissionCount = (quiz as any).submissionCount || 0;
          const totalStudents = (quiz as any).totalStudents || 0;
          if (submissionCount < totalStudents || submissionCount === 0) {
            pendingItems.push({
              id: quiz.id,
              type: 'quiz',
              title: quiz.title,
              class: classMap[quiz.classId] || quiz.classId,
              subject: subjectMap[quiz.subjectId] || quiz.subjectId,
              dueDate: new Date(quiz.endDate || quiz.endTime || Date.now()),
              submittedCount: submissionCount,
              totalStudents: totalStudents,
              maxScore: quiz.maxScore || 100,
            });
          }
        });

        setPendingGradings(pendingItems);

        // Process graded items
        const gradedItems: GradeRecord[] = gradesData.map(grade => {
          const student = studentMap[grade.studentId] || { fullName: grade.studentId, studentNumber: '' };
          const assignment = assignmentsData.find(a => a.id === grade.assignmentId);
          const quiz = quizzesData.find(q => q.id === grade.quizId);
          const item = assignment || quiz;
          
          return {
            id: grade.id,
            studentId: grade.studentId,
            studentName: student.fullName,
            studentNumber: student.studentNumber,
            type: grade.type as any,
            title: item?.title || 'Unknown',
            class: item ? (classMap[item.classId] || item.classId) : '',
            subject: item ? (subjectMap[item.subjectId] || item.subjectId) : '',
            score: grade.score,
            maxScore: grade.maxScore || 100,
            percentage: Math.round((grade.score / (grade.maxScore || 100)) * 100),
            notes: grade.feedback,
            gradedAt: new Date(grade.createdAt),
          };
        });

        setGrades(gradedItems);
      } catch (error) {
        console.error('Error loading grading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const uniqueClasses = Array.from(new Set([...pendingGradings.map(p => p.class), ...grades.map(g => g.class)]));
  const uniqueSubjects = Array.from(new Set([...pendingGradings.map(p => p.subject), ...grades.map(g => g.subject)]));

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
    if (!selectedItem) return;

    try {
      setIsSubmitting(true);
      const score = parseFloat(formData.score);
      
      // TODO: Need to get studentId - this is a simplified version
      // In real implementation, you'd need to select which student to grade
      // For now, we'll just create a grade record
      await gradeService.createGrade({
        studentId: '', // This should come from the grading interface
        assignmentId: selectedItem.type === 'assignment' ? selectedItem.id : undefined,
        quizId: selectedItem.type === 'quiz' ? selectedItem.id : undefined,
        score: score,
        maxScore: selectedItem.maxScore,
        feedback: formData.notes || undefined,
        type: selectedItem.type,
      });

      // Reload data
      const [assignmentsData, quizzesData] = await Promise.all([
        assignmentService.getAssignments({ teacherId: user?.id }),
        quizService.getQuizzes({ teacherId: user?.id }),
      ]);

      const allGrades = await gradeService.getGrades();
      const teacherAssignmentIds = assignmentsData.map(a => a.id);
      const teacherQuizIds = quizzesData.map(q => q.id);
      const gradesData = allGrades.filter(g => 
        (g.assignmentId && teacherAssignmentIds.includes(g.assignmentId)) ||
        (g.quizId && teacherQuizIds.includes(g.quizId)) ||
        g.teacherId === user?.id
      );

      // Update pending gradings
      const pendingItems: PendingGrading[] = [];
      assignmentsData.forEach(assignment => {
        const submissionCount = (assignment as any).submissionCount || 0;
        const totalStudents = (assignment as any).totalStudents || 0;
        if (submissionCount < totalStudents || submissionCount === 0) {
          pendingItems.push({
            id: assignment.id,
            type: 'assignment',
            title: assignment.title,
            class: classes[assignment.classId] || assignment.classId,
            subject: subjects[assignment.subjectId] || assignment.subjectId,
            dueDate: new Date(assignment.dueDate),
            submittedCount: submissionCount,
            totalStudents: totalStudents,
            maxScore: assignment.maxScore || 100,
          });
        }
      });

      quizzesData.forEach(quiz => {
        const submissionCount = (quiz as any).submissionCount || 0;
        const totalStudents = (quiz as any).totalStudents || 0;
        if (submissionCount < totalStudents || submissionCount === 0) {
          pendingItems.push({
            id: quiz.id,
            type: 'quiz',
            title: quiz.title,
            class: classes[quiz.classId] || quiz.classId,
            subject: subjects[quiz.subjectId] || quiz.subjectId,
            dueDate: new Date(quiz.endDate || quiz.endTime || Date.now()),
            submittedCount: submissionCount,
            totalStudents: totalStudents,
            maxScore: quiz.maxScore || 100,
          });
        }
      });

      setPendingGradings(pendingItems);

      // Update grades
      const gradedItems: GradeRecord[] = gradesData.map(grade => {
        const student = students[grade.studentId] || { fullName: grade.studentId, studentNumber: '' };
        const assignment = assignmentsData.find(a => a.id === grade.assignmentId);
        const quiz = quizzesData.find(q => q.id === grade.quizId);
        const item = assignment || quiz;
        
        return {
          id: grade.id,
          studentId: grade.studentId,
          studentName: student.fullName,
          studentNumber: student.studentNumber,
          type: grade.type as any,
          title: item?.title || 'Unknown',
          class: item ? (classes[item.classId] || item.classId) : '',
          subject: item ? (subjects[item.subjectId] || item.subjectId) : '',
          score: grade.score,
          maxScore: grade.maxScore || 100,
          percentage: Math.round((grade.score / (grade.maxScore || 100)) * 100),
          notes: grade.feedback,
          gradedAt: new Date(grade.createdAt),
        };
      });

      setGrades(gradedItems);

      setShowGradeModal(false);
      setSelectedItem(null);
      setFormData({
        score: '',
        notes: '',
      });
      alert('Nilai berhasil disimpan');
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Gagal menyimpan nilai');
    } finally {
      setIsSubmitting(false);
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
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
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
              {uniqueSubjects.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
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
                <Button type="submit" isLoading={isSubmitting}>Simpan Nilai</Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};
