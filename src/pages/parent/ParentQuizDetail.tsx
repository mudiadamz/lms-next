import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Loading, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime, isPast } from '../../utils';
import { quizService, subjectService, userService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './ParentQuizDetail.css';

export const ParentQuizDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user?.id) return;
      
      try {
        setIsLoading(true);
        const parentData = await userService.getUserById(user.id);
        const studentIds = (parentData as any)?.studentIds || [];
        
        if (studentIds.length === 0) {
          setIsLoading(false);
          return;
        }

        const [quizData, submissionsData] = await Promise.all([
          quizService.getQuizById(id),
          quizService.getQuizSubmissions(id).catch(() => []),
        ]);

        setQuiz(quizData);

        // Find submission for first child
        const childSubmission = submissionsData.find(s => studentIds.includes(s.studentId));
        setSubmission(childSubmission || null);

        // Extract questions from quiz
        if (quizData.questions) {
          setQuestions(quizData.questions);
        }

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
  }, [id, user?.id]);

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
  const isSubmitted = submission !== null;

  return (
    <DashboardLayout>
      <div className="parent-quiz-detail">
        <div className="detail-header">
        </div>

        <Card>
          <div className="quiz-header">
            <div>
              <h1>{quiz.title}</h1>
              <div className="quiz-meta">
                <Badge variant="info">{subjectName}</Badge>
                <span>Guru: {teacherName}</span>
              </div>
            </div>
          </div>

          <div className="quiz-info">
            <div className="info-grid">
              <div className="info-item">
                <strong>Waktu:</strong> {quiz.timeLimit} menit
              </div>
              <div className="info-item">
                <strong>Jumlah Soal:</strong> {questions.length}
              </div>
              <div className="info-item">
                <strong>Nilai Maksimal:</strong> {quiz.maxScore}
              </div>
              <div className="info-item">
                <strong>Batas Waktu:</strong> {formatDateTime(new Date(quiz.endDate))}
              </div>
            </div>
          </div>

          {quiz.description && (
            <div className="quiz-description">
              <h3>Deskripsi</h3>
              <p>{quiz.description}</p>
            </div>
          )}

          {isSubmitted ? (
            <div className="quiz-result">
              <div className="result-header">
                <h3>Hasil Kuis Anak</h3>
                <Badge variant="success" size="large">
                  {submission.score || 0}/{quiz.maxScore}
                </Badge>
              </div>
              <p>
                <strong>Waktu Submit:</strong> {formatDateTime(new Date(submission.submittedAt))}
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
                    : `Kuis akan dimulai pada ${formatDateTime(new Date(quiz.startDate))}`}
                </p>
              )}
            </div>
          )}
        </Card>

        {isSubmitted && submission.answers && questions.length > 0 && (
          <Card title="Jawaban Anak">
            <div className="quiz-questions">
              {questions.map((question, index) => {
                const studentAnswer = submission.answers[question.id];
                const isCorrect = studentAnswer === question.correctAnswer;
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
                      {question.options?.map((option: string, optIndex: number) => {
                        const isSelected = studentAnswer === option;
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

