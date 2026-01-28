import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, Badge, Icon, EmptyState, Pagination, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import { assignmentService, quizService, gradeService, classService, subjectService, userService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherGrading.css';

// Interface untuk submission yang perlu dinilai
interface PendingSubmission {
  submissionId: string;
  assignmentId: string;
  type: 'assignment' | 'quiz';
  title: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  class: string;
  subject: string;
  submittedAt: Date;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
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

        // Process pending submissions - show individual student submissions
        const pendingItems: PendingSubmission[] = [];
        
        // Get submissions for each assignment
        for (const assignment of assignmentsData) {
          try {
            const submissions = await assignmentService.getSubmissions(assignment.id);
            const ungradedSubmissions = submissions.filter((s: any) => s.score === null || s.score === undefined);
            
            ungradedSubmissions.forEach((submission: any) => {
              const student = studentMap[submission.studentId];
              if (student) {
                pendingItems.push({
                  submissionId: submission.id,
                  assignmentId: assignment.id,
                  type: 'assignment',
                  title: assignment.title,
                  studentId: submission.studentId,
                  studentName: student.fullName,
                  studentNumber: student.studentNumber,
                  class: classMap[assignment.classId] || assignment.classId,
                  subject: subjectMap[assignment.subjectId] || assignment.subjectId,
                  submittedAt: new Date(submission.submittedAt),
                  maxScore: assignment.maxScore || 100,
                });
              }
            });
          } catch (error) {
            console.error(`Error loading submissions for assignment ${assignment.id}:`, error);
          }
        }

        // Get submissions for each quiz
        for (const quiz of quizzesData) {
          try {
            const submissions = await quizService.getSubmissions(quiz.id);
            const ungradedSubmissions = submissions.filter((s: any) => s.score === null || s.score === undefined);
            
            ungradedSubmissions.forEach((submission: any) => {
              const student = studentMap[submission.studentId];
              if (student) {
                pendingItems.push({
                  submissionId: submission.id,
                  assignmentId: quiz.id,
                  type: 'quiz',
                  title: quiz.title,
                  studentId: submission.studentId,
                  studentName: student.fullName,
                  studentNumber: student.studentNumber,
                  class: classMap[quiz.classId] || quiz.classId,
                  subject: subjectMap[quiz.subjectId] || quiz.subjectId,
                  submittedAt: new Date(submission.submittedAt),
                  maxScore: quiz.maxScore || 100,
                });
              }
            });
          } catch (error) {
            console.error(`Error loading submissions for quiz ${quiz.id}:`, error);
          }
        }

        // Sort by submitted date (oldest first - FIFO)
        pendingItems.sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime());
        
        setPendingSubmissions(pendingItems);

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

  const currentData = activeTab === 'pending' ? pendingSubmissions : grades;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );



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
      key: 'student',
      header: 'Siswa',
      render: (item: PendingSubmission) => (
        <div>
          <strong>{item.studentName}</strong>
          <div style={{ fontSize: '0.85rem', color: 'var(--ios-gray)', marginTop: '0.25rem' }}>
            NIS: {item.studentNumber}
          </div>
        </div>
      ),
    },
    {
      key: 'assignment',
      header: 'Tugas/Kuis',
      render: (item: PendingSubmission) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name={item.type === 'assignment' ? 'assignment' : 'quiz'} size={16} />
            <strong>{item.title}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ios-gray)', marginTop: '0.25rem' }}>
            {item.subject} • {item.class}
          </div>
        </div>
      ),
    },
    {
      key: 'submittedAt',
      header: 'Waktu Submit',
      render: (item: PendingSubmission) => formatDate(item.submittedAt),
    },
    {
      key: 'maxScore',
      header: 'Nilai Maks',
      render: (item: PendingSubmission) => `${item.maxScore}`,
    },
    {
      key: 'actions',
      header: '',
      render: (item: PendingSubmission) => (
        <Button
          onClick={() => navigate(ROUTES.TEACHER_ASSIGNMENT_GRADE
            .replace(':assignmentId', item.assignmentId)
            .replace(':submissionId', item.submissionId))}
          size="small"
        >
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
      key: 'gradedAt',
      header: 'Tanggal',
      render: (item: GradeRecord) => formatDate(item.gradedAt),
    },
  ];

  // Calculate statistics
  const pendingCount = pendingSubmissions.length;
  const gradedCount = grades.length;

  return (
    <DashboardLayout>
      <div className="teacher-grading">
        <div className="page-header">
          <h1>Penilaian</h1>
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

        {/* Table */}
        {paginatedData.length === 0 ? (
          <EmptyState
            icon={activeTab === 'pending' ? 'clock' : 'checkCircle'}
            title={`Tidak Ada ${activeTab === 'pending' ? 'Tugas/Kuis yang Menunggu Penilaian' : 'Nilai'}`}
            message={activeTab === 'pending'
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
      </div>
    </DashboardLayout>
  );
};
