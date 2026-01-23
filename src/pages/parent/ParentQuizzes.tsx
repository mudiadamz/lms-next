import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, isPast } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import './ParentQuizzes.css';

const mockQuizzes = [
  {
    id: '1',
    title: 'Kuis Matematika - Bab 1',
    subject: 'Matematika',
    teacher: 'Ibu Siti',
    timeLimit: 30,
    questions: 10,
    startDate: new Date('2024-01-18T08:00:00'),
    endDate: new Date('2024-01-25T23:59:59'),
    status: 'available',
    score: null,
  },
  {
    id: '2',
    title: 'Kuis Bahasa Indonesia',
    subject: 'Bahasa Indonesia',
    teacher: 'Bapak Budi',
    timeLimit: 20,
    questions: 5,
    startDate: new Date('2024-01-20T08:00:00'),
    endDate: new Date('2024-01-27T23:59:59'),
    status: 'completed',
    score: 85,
  },
];

export const ParentQuizzes = () => {
  const { user } = useAuth();
  // TODO: Filter quizzes berdasarkan studentId dari user.studentId
  // const studentId = user?.studentId;

  const getStatusBadge = (quiz: typeof mockQuizzes[0]) => {
    const now = new Date();
    if (quiz.score !== null) {
      return <Badge variant="success">Selesai - {quiz.score}/100</Badge>;
    }
    if (now < quiz.startDate) {
      return <Badge variant="info">Belum Dimulai</Badge>;
    }
    if (isPast(quiz.endDate)) {
      return <Badge variant="danger">Sudah Berakhir</Badge>;
    }
    return <Badge variant="warning">Tersedia</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="parent-quizzes">
        <h1>Kuis Anak</h1>

        {mockQuizzes.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Tidak Ada Kuis"
            message="Belum ada kuis yang tersedia untuk anak Anda saat ini."
          />
        ) : (
          <div className="quizzes-grid">
            {mockQuizzes.map((quiz) => (
              <Card key={quiz.id} title={quiz.title} variant="elevated">
                <div className="quiz-card-info">
                  <p>
                    <strong>Mata Pelajaran:</strong> {quiz.subject}
                  </p>
                  <p>
                    <strong>Guru:</strong> {quiz.teacher}
                  </p>
                  <p>
                    <strong>Waktu:</strong> {quiz.timeLimit} menit
                  </p>
                  <p>
                    <strong>Jumlah Soal:</strong> {quiz.questions}
                  </p>
                  <p>
                    <strong>Batas Waktu:</strong> {formatDate(quiz.endDate)}
                  </p>
                  <div className="quiz-status">
                    <strong>Status:</strong> {getStatusBadge(quiz)}
                  </div>
                  {quiz.score !== null && (
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

