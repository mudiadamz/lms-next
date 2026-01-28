import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, EmptyState, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import { quizService, classService, subjectService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherQuizzes.css';

export const TeacherQuizzes = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [classes, setClasses] = useState<Record<string, string>>({});
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [quizzesData, classesData, subjectsData] = await Promise.all([
          quizService.getQuizzes(),
          classService.getClasses(),
          subjectService.getSubjects(),
        ]);

        const teacherQuizzes = quizzesData.filter((quiz) => quiz.teacherId === user?.id);
        setQuizzes(teacherQuizzes);
        const classMap: Record<string, string> = {};
        classesData.forEach(c => { classMap[c.id] = c.name; });
        setClasses(classMap);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);
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

  const getStatus = (quiz: any) => {
    const now = new Date();
    const startDate = new Date(quiz.startDate || quiz.startTime || 0);
    const endDate = new Date(quiz.endDate || quiz.endTime || 0);
    
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';
    return 'active';
  };

  return (
    <DashboardLayout>
      <div className="teacher-quizzes">
        <div className="page-header">
          <h1>Kuis/Test/Ujian</h1>
          <Link to={ROUTES.TEACHER_QUIZZES_CREATE}>
            <Button>Buat Kuis/Test/Ujian Baru</Button>
          </Link>
        </div>

        {isLoading ? (
          <Loading />
        ) : quizzes.length === 0 ? (
          <EmptyState
            icon="quiz"
            title="Tidak Ada Kuis/Test/Ujian"
            message="Belum ada kuis/test/ujian yang dibuat. Buat kuis/test/ujian baru untuk memulai."
            action={{
              label: 'Buat Kuis/Test/Ujian Baru',
              onClick: () => window.location.href = ROUTES.TEACHER_QUIZZES_CREATE,
            }}
          />
        ) : (
          <div className="quizzes-grid">
            {quizzes.map((quiz) => {
              const status = getStatus(quiz);
              return (
                <Card key={quiz.id} title={quiz.title} variant="elevated">
                  <div className="quiz-info">
                    <Badge variant={status === 'active' ? 'success' : status === 'upcoming' ? 'info' : 'secondary'}>
                      {status === 'active' ? 'Aktif' : status === 'upcoming' ? 'Akan Dimulai' : 'Berakhir'}
                    </Badge>
                    <p>Kelas: {classes[quiz.classId] || quiz.classId}</p>
                    <p>Mata Pelajaran: {subjects[quiz.subjectId] || quiz.subjectId}</p>
                    <p>Waktu: {quiz.timeLimit || quiz.duration || 0} menit</p>
                    <p>Jumlah Soal: {quiz.questionCount ?? (Array.isArray(quiz.questions) ? quiz.questions.length : quiz.questions || 0)}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Mulai: {formatDate(new Date(quiz.startDate || quiz.startTime || Date.now()))} - Selesai: {formatDate(new Date(quiz.endDate || quiz.endTime || Date.now()))}
                    </p>
                  </div>
                  <div className="quiz-actions">
                    <Link to={ROUTES.TEACHER_QUIZ_DETAIL.replace(':id', quiz.id)}>
                      <Button variant="outline" size="small">
                        Kelola
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

