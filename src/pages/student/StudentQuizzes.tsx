import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, FormSelect, EmptyState, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, isPast } from '../../utils';
import { quizService, subjectService, userService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './StudentQuizzes.css';

interface StudentQuizzesProps {
  readOnly?: boolean;
}

export const StudentQuizzes = ({ readOnly = false }: StudentQuizzesProps = {} as StudentQuizzesProps) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const studentData = user?.id ? await userService.getUserById(user.id) : null;
        const classId = (studentData as any)?.classId;

        const [quizzesData, subjectsData, teachersData] = await Promise.all([
          quizService.getQuizzes(classId ? { classId } : {}),
          subjectService.getSubjects(),
          userService.getUsers('teacher'),
        ]);

        setQuizzes(quizzesData);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);
        const teacherMap: Record<string, string> = {};
        teachersData.forEach(t => { teacherMap[t.id] = t.fullName; });
        setTeachers(teacherMap);
      } catch (error) {
        console.error('Error loading quizzes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const uniqueSubjects = Array.from(new Set(quizzes.map(q => q.subjectId).filter(Boolean)));
  const subjectOptions = [
    { value: 'all', label: 'Semua Mata Pelajaran' },
    ...uniqueSubjects.map((subjectId) => ({ value: subjectId, label: subjects[subjectId] || subjectId })),
  ];

  const filteredQuizzes =
    selectedSubject === 'all'
      ? quizzes
      : quizzes.filter((quiz) => quiz.subjectId === selectedSubject);

  const getStatusBadge = (quiz: any) => {
    const now = new Date();
    if (quiz.score !== null && quiz.score !== undefined) {
      return <Badge variant="success">Selesai - {quiz.score}/100</Badge>;
    }
    const startDate = new Date(quiz.startDate || quiz.startTime || 0);
    const endDate = new Date(quiz.endDate || quiz.endTime || 0);
    if (now < startDate) {
      return <Badge variant="info">Belum Dimulai</Badge>;
    }
    if (isPast(endDate)) {
      return <Badge variant="danger">Sudah Berakhir</Badge>;
    }
    return <Badge variant="warning">Tersedia</Badge>;
  };

  const canTakeQuiz = (quiz: any) => {
    const now = new Date();
    const startDate = new Date(quiz.startDate || quiz.startTime || 0);
    const endDate = new Date(quiz.endDate || quiz.endTime || 0);
    return now >= startDate && now <= endDate && (quiz.score === null || quiz.score === undefined);
  };

  return (
    <DashboardLayout>
      <div className="student-quizzes">
        <h1>Kuis</h1>

        <div className="page-filters">
          <FormSelect
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            options={subjectOptions}
          />
        </div>

        {isLoading ? (
          <Loading />
        ) : filteredQuizzes.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Tidak Ada Kuis"
            message={
              selectedSubject !== 'all'
                ? `Tidak ada kuis untuk mata pelajaran ${subjects[selectedSubject] || selectedSubject}.`
                : 'Belum ada kuis yang tersedia untuk Anda saat ini.'
            }
          />
        ) : (
          <div className="quizzes-grid">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} title={quiz.title} variant="elevated">
                <div className="quiz-card-info">
                  <p>
                    <strong>Mata Pelajaran:</strong> {subjects[quiz.subjectId] || quiz.subjectId}
                  </p>
                  <p>
                    <strong>Guru:</strong> {teachers[quiz.teacherId] || quiz.teacherId}
                  </p>
                  <p>
                    <strong>Waktu:</strong> {quiz.timeLimit || quiz.duration || 0} menit
                  </p>
                  <p>
                    <strong>Jumlah Soal:</strong> {quiz.questionCount || quiz.questions || 0}
                  </p>
                  <p>
                    <strong>Batas Waktu:</strong> {formatDate(new Date(quiz.endDate || quiz.endTime || Date.now()))}
                  </p>
                  <div className="quiz-status">
                    <strong>Status:</strong> {getStatusBadge(quiz)}
                  </div>
                </div>
                {readOnly ? (
                  <Link to={`${ROUTES.PARENT_QUIZZES}/${quiz.id}`}>
                    <Button variant="outline" className="quiz-action-button">
                      Lihat Detail
                    </Button>
                  </Link>
                ) : canTakeQuiz(quiz) ? (
                  <Link to={`${ROUTES.STUDENT_QUIZZES}/${quiz.id}`}>
                    <Button variant="primary" className="quiz-action-button">
                      Mulai Kuis
                    </Button>
                  </Link>
                ) : quiz.score !== null && quiz.score !== undefined ? (
                  <Link to={`${ROUTES.STUDENT_QUIZZES}/${quiz.id}`}>
                    <Button variant="outline" className="quiz-action-button">
                      Lihat Hasil
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" disabled className="quiz-action-button">
                    Tidak Tersedia
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
