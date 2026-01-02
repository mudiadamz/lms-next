import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime, isPast } from '../../utils';
import './ParentQuizDetail.css';

const mockQuiz = {
  id: '1',
  title: 'Kuis Matematika - Bab 1',
  description: 'Kuis tentang aljabar dasar. Waktu pengerjaan 30 menit.',
  subject: 'Matematika',
  teacher: 'Ibu Siti',
  timeLimit: 30,
  questions: 10,
  startDate: new Date('2024-01-18T08:00:00'),
  endDate: new Date('2024-01-25T23:59:59'),
  maxScore: 100,
};

const mockSubmission = {
  id: '1',
  submittedAt: new Date('2024-01-20T10:30:00'),
  score: 85,
  answers: {
    '1': '5x',
    '2': '3x + 6',
  },
};

const mockQuestions = [
  {
    id: '1',
    question: 'Berapakah hasil dari 2x + 3x?',
    type: 'multiple_choice',
    options: ['5x', '6x', '5', '6'],
    correctAnswer: '5x',
    studentAnswer: '5x',
  },
  {
    id: '2',
    question: 'Sederhanakan: 3(x + 2)',
    type: 'multiple_choice',
    options: ['3x + 2', '3x + 6', 'x + 6', '3x'],
    correctAnswer: '3x + 6',
    studentAnswer: '3x + 6',
  },
];

export const ParentQuizDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isActive = new Date() >= mockQuiz.startDate && new Date() <= mockQuiz.endDate;
  const isOverdue = isPast(mockQuiz.endDate);
  const isSubmitted = mockSubmission.submittedAt !== null;

  return (
    <DashboardLayout>
      <div className="parent-quiz-detail">
        <div className="detail-header">
          <Button variant="outline" onClick={() => navigate(ROUTES.PARENT_QUIZZES)}>
            ← Kembali
          </Button>
        </div>

        <Card>
          <div className="quiz-header">
            <div>
              <h1>{mockQuiz.title}</h1>
              <div className="quiz-meta">
                <Badge variant="info">{mockQuiz.subject}</Badge>
                <span>Guru: {mockQuiz.teacher}</span>
              </div>
            </div>
          </div>

          <div className="quiz-info">
            <div className="info-grid">
              <div className="info-item">
                <strong>Waktu:</strong> {mockQuiz.timeLimit} menit
              </div>
              <div className="info-item">
                <strong>Jumlah Soal:</strong> {mockQuiz.questions}
              </div>
              <div className="info-item">
                <strong>Nilai Maksimal:</strong> {mockQuiz.maxScore}
              </div>
              <div className="info-item">
                <strong>Batas Waktu:</strong> {formatDateTime(mockQuiz.endDate)}
              </div>
            </div>
          </div>

          {mockQuiz.description && (
            <div className="quiz-description">
              <h3>Deskripsi</h3>
              <p>{mockQuiz.description}</p>
            </div>
          )}

          {isSubmitted ? (
            <div className="quiz-result">
              <div className="result-header">
                <h3>Hasil Kuis Anak</h3>
                <Badge variant="success" size="large">
                  {mockSubmission.score}/{mockQuiz.maxScore}
                </Badge>
              </div>
              <p>
                <strong>Waktu Submit:</strong> {formatDateTime(mockSubmission.submittedAt)}
              </p>
            </div>
          ) : (
            <div className="quiz-status">
              <Badge variant={isOverdue ? 'danger' : isActive ? 'warning' : 'info'}>
                {isOverdue
                  ? 'Sudah Berakhir'
                  : isActive
                  ? 'Tersedia'
                  : 'Belum Dimulai'}
              </Badge>
              {!isSubmitted && (
                <p className="status-note">
                  {isOverdue
                    ? 'Anak Anda belum mengerjakan kuis ini.'
                    : isActive
                    ? 'Anak Anda dapat mengerjakan kuis ini.'
                    : `Kuis akan dimulai pada ${formatDateTime(mockQuiz.startDate)}`}
                </p>
              )}
            </div>
          )}
        </Card>

        {isSubmitted && (
          <Card title="Jawaban Anak">
            <div className="quiz-questions">
              {mockQuestions.map((question, index) => {
                const isCorrect = question.studentAnswer === question.correctAnswer;
                return (
                  <div key={question.id} className="question-item">
                    <div className="question-header">
                      <h3>
                        Soal {index + 1}: {question.question}
                      </h3>
                      <Badge variant={isCorrect ? 'success' : 'danger'}>
                        {isCorrect ? '✓ Benar' : '✗ Salah'}
                      </Badge>
                    </div>
                    <div className="question-options">
                      {question.options.map((option, optIndex) => {
                        const isSelected = question.studentAnswer === option;
                        const isCorrectAnswer = question.correctAnswer === option;
                        return (
                          <div
                            key={optIndex}
                            className={`option-item ${
                              isSelected ? 'option-item--selected' : ''
                            } ${isCorrectAnswer ? 'option-item--correct' : ''}`}
                          >
                            {option}
                            {isSelected && <span className="option-label">Jawaban Anak</span>}
                            {isCorrectAnswer && (
                              <span className="option-label option-label--correct">
                                Jawaban Benar
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

