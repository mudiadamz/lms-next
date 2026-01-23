import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Modal, Loading, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime, isPast } from '../../utils';
import { quizService, subjectService, userService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './QuizDetail.css';

interface StudentQuizDetailProps {
  readOnly?: boolean;
}

export const StudentQuizDetail = ({ readOnly = false }: StudentQuizDetailProps = {} as StudentQuizDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(!readOnly);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user?.id) return;
      
      try {
        setIsLoading(true);
        const quizData = await quizService.getQuizById(id);
        setQuiz(quizData);

        if (quizData.questions) {
          setQuestions(quizData.questions);
        }

        setTimeRemaining(quizData.timeLimit * 60);

        // Get subject and teacher names
        const [subjectInfo, teacherInfo] = await Promise.all([
          subjectService.getSubjectById(quizData.subjectId),
          userService.getUserById(quizData.teacherId),
        ]);

        setSubjectName(subjectInfo.name);
        setTeacherName(teacherInfo.fullName);
      } catch (error) {
        console.error('Error loading quiz detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [id, user?.id]);

  const handleStart = () => {
    setShowStartModal(false);
    // Start timer
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await quizService.submitQuiz(id, answers);
      navigate(readOnly ? ROUTES.PARENT_QUIZZES : ROUTES.STUDENT_QUIZZES);
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  if (!quiz) {
    return (
      <DashboardLayout>
        <EmptyState icon="quiz" title="Kuis Tidak Ditemukan" message="Kuis yang Anda cari tidak ditemukan." />
      </DashboardLayout>
    );
  }

  const isActive = new Date() >= new Date(quiz.startDate) && new Date() <= new Date(quiz.endDate);
  const isOverdue = isPast(new Date(quiz.endDate));

  if (readOnly) {
    return (
      <DashboardLayout>
        <div className="quiz-detail">
          <div className="quiz-header">
            <div>
              <h1>{quiz.title}</h1>
              <div className="quiz-meta">
                <Badge variant="info">{subjectName}</Badge>
                <span>Guru: {teacherName}</span>
              </div>
            </div>
          </div>
          <Card>
            <div className="quiz-info">
              <p><strong>Waktu:</strong> {quiz.timeLimit} menit</p>
              <p><strong>Jumlah Soal:</strong> {questions.length}</p>
              <p><strong>Nilai Maksimal:</strong> {quiz.maxScore}</p>
              <p><strong>Batas Waktu:</strong> {formatDateTime(new Date(quiz.endDate))}</p>
            </div>
            <div className="info-note" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <p>Sebagai orang tua, Anda dapat melihat detail kuis ini tetapi tidak dapat mengerjakan kuis.</p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!isActive && !isOverdue) {
    return (
      <DashboardLayout>
        <Card>
          <div className="quiz-not-available">
            <h2>Kuis Belum Dimulai</h2>
            <p>Kuis akan dimulai pada: {formatDateTime(new Date(quiz.startDate))}</p>
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
            onClose={() => navigate(readOnly ? ROUTES.PARENT_QUIZZES : ROUTES.STUDENT_QUIZZES)}
            title="Mulai Kuis"
            size="medium"
          >
            <div className="quiz-instructions">
              <p><strong>Judul:</strong> {quiz.title}</p>
              <p><strong>Waktu:</strong> {quiz.timeLimit} menit</p>
              <p><strong>Jumlah Soal:</strong> {questions.length}</p>
              <p><strong>Nilai Maksimal:</strong> {quiz.maxScore}</p>
              <div className="instructions-warning">
                <p>⚠️ Setelah memulai, timer akan berjalan dan tidak dapat dihentikan.</p>
                <p>Pastikan koneksi internet Anda stabil.</p>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={() => navigate(readOnly ? ROUTES.PARENT_QUIZZES : ROUTES.STUDENT_QUIZZES)}>
                Batal
              </Button>
              <Button onClick={handleStart}>Mulai Kuis</Button>
            </div>
          </Modal>
        )}

        <div className="quiz-header">
          <div>
            <h1>{quiz.title}</h1>
            <div className="quiz-meta">
              <Badge variant="info">{subjectName}</Badge>
              <span>Guru: {teacherName}</span>
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
            {questions.map((question, index) => (
              <div key={question.id} className="question-item">
                <h3>
                  Soal {index + 1}: {question.question}
                </h3>
                <div className="question-options">
                  {question.options?.map((option: string, optIndex: number) => (
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
              Tutup
            </Button>
            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={Object.keys(answers).length < questions.length}
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

