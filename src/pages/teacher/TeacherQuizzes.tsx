import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, SearchBar } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import './TeacherQuizzes.css';

const mockQuizzes = [
  {
    id: '1',
    title: 'Kuis Matematika - Bab 1',
    class: 'X IPA 1',
    subject: 'Matematika',
    timeLimit: 30,
    questions: 10,
    startDate: new Date('2024-01-18'),
    endDate: new Date('2024-01-25'),
    status: 'active',
  },
];

export const TeacherQuizzes = () => {
  return (
    <DashboardLayout>
      <div className="teacher-quizzes">
        <div className="page-header">
          <h1>Kuis</h1>
          <Link to={ROUTES.TEACHER_QUIZZES_CREATE}>
            <Button>Buat Kuis Baru</Button>
          </Link>
        </div>

        <div className="page-filters">
          <SearchBar placeholder="Cari kuis..." />
        </div>

        <div className="quizzes-grid">
          {mockQuizzes.map((quiz) => (
            <Card key={quiz.id} title={quiz.title} variant="elevated">
              <div className="quiz-info">
                <Badge variant={quiz.status === 'active' ? 'success' : 'secondary'}>
                  {quiz.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
                <p>Kelas: {quiz.class}</p>
                <p>Mata Pelajaran: {quiz.subject}</p>
                <p>Waktu: {quiz.timeLimit} menit</p>
                <p>Jumlah Soal: {quiz.questions}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Mulai: {formatDate(quiz.startDate)} - Selesai: {formatDate(quiz.endDate)}
                </p>
              </div>
              <div className="quiz-actions">
                <Button variant="outline" size="small">
                  Kelola
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

