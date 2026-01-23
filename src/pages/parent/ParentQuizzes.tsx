import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, EmptyState, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, isPast } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { quizService, subjectService, userService } from '../../services';
import './ParentQuizzes.css';

export const ParentQuizzes = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const parentData = user?.id ? await userService.getUserById(user.id) : null;
        const studentIds = (parentData as any)?.studentIds || [];
        
        if (studentIds.length === 0) {
          setIsLoading(false);
          return;
        }

        const firstChild = await userService.getUserById(studentIds[0]);
        const classId = (firstChild as any)?.classId;

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

  return (
    <DashboardLayout>
      <div className="parent-quizzes">
        <h1>Kuis Anak</h1>

        {isLoading ? (
          <Loading />
        ) : quizzes.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Tidak Ada Kuis"
            message="Belum ada kuis yang tersedia untuk anak Anda saat ini."
          />
        ) : (
          <div className="quizzes-grid">
            {quizzes.map((quiz) => (
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
                  {quiz.score !== null && quiz.score !== undefined && (
                    <p>
                      <strong>Nilai:</strong> {quiz.score}/100
                    </p>
                  )}
                </div>
                <Link to={`${ROUTES.PARENT_QUIZZES}/${quiz.id}`}>
                  <Button variant="outline" className="quiz-action-button">
                    Lihat Detail
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};


