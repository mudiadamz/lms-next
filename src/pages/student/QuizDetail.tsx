import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Modal } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime, isPast } from '../../utils';
import './QuizDetail.css';

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

const mockQuestions = [
  {
    id: '1',
    question: 'Berapakah hasil dari 2x + 3x?',
    type: 'multiple_choice',
    options: ['5x', '6x', '5', '6'],
    correctAnswer: '5x',
  },
  {
    id: '2',
    question: 'Sederhanakan: 3(x + 2)',
    type: 'multiple_choice',
    options: ['3x + 2', '3x + 6', 'x + 6', '3x'],
    correctAnswer: '3x + 6',
  },
];

export const StudentQuizDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(mockQuiz.timeLimit * 60);

  const handleStart = () => {
    setShowStartModal(false);
    // Start timer
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Call quizService.submitQuiz
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate(ROUTES.STUDENT_QUIZZES);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Gagal mengumpulkan kuis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isActive = new Date() >= mockQuiz.startDate && new Date() <= mockQuiz.endDate;
  const isOverdue = isPast(mockQuiz.endDate);

  if (!isActive && !isOverdue) {
    return (
      <DashboardLayout>
        <Card>
          <div className="quiz-not-available">
            <h2>Kuis Belum Dimulai</h2>
            <p>Kuis akan dimulai pada: {formatDateTime(mockQuiz.startDate)}</p>
            <Button onClick={() => navigate(ROUTES.STUDENT_QUIZZES)}>Kembali</Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="quiz-detail">
        {showStartModal && (
          <Modal
            isOpen={showStartModal}
            onClose={() => navigate(ROUTES.STUDENT_QUIZZES)}
            title="Mulai Kuis"
            size="medium"
          >
            <div className="quiz-instructions">
              <p><strong>Judul:</strong> {mockQuiz.title}</p>
              <p><strong>Waktu:</strong> {mockQuiz.timeLimit} menit</p>
              <p><strong>Jumlah Soal:</strong> {mockQuiz.questions}</p>
              <p><strong>Nilai Maksimal:</strong> {mockQuiz.maxScore}</p>
              <div className="instructions-warning">
                <p>⚠️ Setelah memulai, timer akan berjalan dan tidak dapat dihentikan.</p>
                <p>Pastikan koneksi internet Anda stabil.</p>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={() => navigate(ROUTES.STUDENT_QUIZZES)}>
                Batal
              </Button>
              <Button onClick={handleStart}>Mulai Kuis</Button>
            </div>
          </Modal>
        )}

        <div className="quiz-header">
          <div>
            <h1>{mockQuiz.title}</h1>
            <div className="quiz-meta">
              <Badge variant="info">{mockQuiz.subject}</Badge>
              <span>Guru: {mockQuiz.teacher}</span>
            </div>
          </div>
          <div className="quiz-timer">
            <Badge variant={timeRemaining < 300 ? 'danger' : 'warning'}>
              ⏱️ {formatTime(timeRemaining)}
            </Badge>
          </div>
        </div>

        <Card>
          <div className="quiz-questions">
            {mockQuestions.map((question, index) => (
              <div key={question.id} className="question-item">
                <h3>
                  Soal {index + 1}: {question.question}
                </h3>
                <div className="question-options">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="option-label">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) =>
                          setAnswers({ ...answers, [question.id]: e.target.value })
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="quiz-actions">
            <Button variant="outline" onClick={() => setShowConfirmModal(true)}>
              Kembali
            </Button>
            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={Object.keys(answers).length < mockQuestions.length}
            >
              Kumpulkan Kuis
            </Button>
          </div>
        </Card>

        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Konfirmasi"
          size="small"
        >
          <p>Apakah Anda yakin ingin mengumpulkan kuis ini?</p>
          <div className="modal-footer">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Ya, Kumpulkan
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

