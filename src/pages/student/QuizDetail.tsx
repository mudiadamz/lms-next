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
  const [showStartModal, setShowStartModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user?.id) return;
      
      try {
        setIsLoading(true);
        console.log('Loading quiz:', id);
        const quizData = await quizService.getQuizById(id);
        console.log('Quiz data received:', quizData);
        setQuiz(quizData);

        if (quizData.questions) {
          setQuestions(quizData.questions);
        }

        setTimeRemaining(quizData.timeLimit * 60);

        // Get subject name - teacher name already in quiz data
        const subjectInfo = await subjectService.getSubjectById(quizData.subjectId);

        setSubjectName(subjectInfo.name);
        setTeacherName((quizData as any).teacherName || 'Unknown');
        
        // Check if already submitted - only if explicitly submitted or has score
        const hasScore = (quizData as any).score !== null && (quizData as any).score !== undefined;
        const hasSubmission = (quizData as any).status === 'submitted';
        const submissionExists = hasScore || hasSubmission;
        
        console.log('Quiz status check:', {
          quizId: id,
          status: (quizData as any).status,
          score: (quizData as any).score,
          submissionExists,
        });
        
        if (submissionExists) {
          // Already submitted - show results directly
          setIsSubmitted(true);
          setShowStartModal(false);
          
          // Try to load their submission to show answers
          try {
            const submissions = await quizService.getSubmissions(id);
            console.log('All submissions:', submissions);
            const studentSubmission = submissions.find((s: any) => s.studentId === user.id);
            console.log('Student submission:', studentSubmission);
            if (studentSubmission && (studentSubmission as any).answers) {
              console.log('Submission answers:', (studentSubmission as any).answers);
              // Pre-fill answers to show what they submitted
              const submittedAnswers: Record<string, string> = {};
              (studentSubmission as any).answers.forEach((ans: any) => {
                submittedAnswers[ans.questionId] = ans.answer;
                console.log('Mapping answer:', ans.questionId, '→', ans.answer);
              });
              console.log('Final answers object:', submittedAnswers);
              setAnswers(submittedAnswers);
            } else {
              console.log('No answers found in submission');
            }
          } catch (error) {
            console.error('Error loading submission:', error);
          }
        } else if (!readOnly) {
          // Quiz belum submit - show start modal
          setIsSubmitted(false);
          setShowStartModal(true);
          console.log('Quiz not submitted - will show start modal and quiz form');
        }
      } catch (error) {
        console.error('Error loading quiz detail:', error);
        console.error('Error details:', error instanceof Error ? error.message : error);
        setQuiz(null);
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
    console.log('Starting quiz - closing modal and starting timer');
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
      // Reload page to show results instead of navigating away
      window.location.reload();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Gagal mengumpulkan kuis');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isImageValue = (value?: string) => {
    if (!value) return false;
    return value.startsWith('data:image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(value);
  };

  const normalizeOption = (option: any, index: number) => {
    if (typeof option === 'string') {
      return {
        value: option,
        text: isImageValue(option) ? '' : option,
        imageUrl: isImageValue(option) ? option : undefined,
      };
    }
    const value = option?.value || option?.text || `option-${index + 1}`;
    return {
      value,
      text: option?.text || '',
      imageUrl: option?.imageUrl,
    };
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
        <div style={{ padding: '2rem' }}>
          <EmptyState 
            icon="quiz" 
            title="Kuis/Test/Ujian Tidak Ditemukan" 
            message="Kuis/test/ujian yang Anda cari tidak ditemukan atau terjadi kesalahan saat memuat data. Silakan cek browser console untuk detail error."
            action={{
              label: 'Kembali ke Daftar Kuis',
              onClick: () => navigate(ROUTES.STUDENT_QUIZZES)
            }}
          />
        </div>
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
              <p><strong>Mulai:</strong> {formatDateTime(new Date(quiz.startDate))}</p>
              <p><strong>Waktu:</strong> {quiz.timeLimit} menit</p>
              <p><strong>Jumlah Soal:</strong> {questions.length}</p>
              <p><strong>Nilai Maksimal:</strong> {quiz.maxScore}</p>
              <p><strong>Batas Waktu:</strong> {formatDateTime(new Date(quiz.endDate))}</p>
            </div>
            <div className="info-note" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <p>Sebagai orang tua, Anda dapat melihat detail kuis/test/ujian ini tetapi tidak dapat mengerjakan kuis/test/ujian.</p>
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
            <h2>Kuis/Test/Ujian Belum Dimulai</h2>
            <p>Kuis/test/ujian akan dimulai pada: {formatDateTime(new Date(quiz.startDate))}</p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  // If already submitted, show results view (no popup!)
  const isGraded = (quiz as any).score !== null && (quiz as any).score !== undefined;

  console.log('QuizDetail render check:', {
    quizId: id,
    status: (quiz as any).status,
    score: (quiz as any).score,
    isSubmitted,
    willShowResults: isSubmitted,
    willShowForm: !isSubmitted,
  });

  if (isSubmitted) {
    return (
      <DashboardLayout>
        <div className="quiz-detail">
          <Button variant="outline" onClick={() => navigate(ROUTES.STUDENT_QUIZZES)} style={{ marginBottom: '1rem' }}>
            ← Kembali
          </Button>

          <Card title={quiz.title} variant="elevated">
            <div className="quiz-info">
              <p><strong>Mata Pelajaran:</strong> {subjectName}</p>
              <p><strong>Guru:</strong> {teacherName}</p>
              <p><strong>Jumlah Soal:</strong> {questions.length}</p>
              <p><strong>Nilai Maksimal:</strong> {quiz.maxScore}</p>
              {(quiz as any).submittedAt && (
                <p><strong>Waktu Submit:</strong> {formatDateTime(new Date((quiz as any).submittedAt))}</p>
              )}
            </div>
          </Card>

          <Card title="Status & Nilai" variant="elevated">
            <div style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <Badge variant="success" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  ✅ Sudah Dinilai
                </Badge>
              </div>
              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: 'var(--ios-secondary-background)',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--ios-gray)', marginBottom: '0.5rem' }}>
                  Nilai Anda
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--ios-blue)' }}>
                  {(quiz as any).score !== null && (quiz as any).score !== undefined ? (quiz as any).score : 0}/{quiz.maxScore}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--ios-gray)', marginTop: '0.25rem' }}>
                  ({((((quiz as any).score || 0) / quiz.maxScore) * 100).toFixed(1)}%)
                </div>
              </div>
              {(quiz as any).feedback && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  backgroundColor: 'var(--accent-blue)', 
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--ios-blue)'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--ios-blue)' }}>Feedback Guru:</h4>
                  <p style={{ margin: 0 }}>{(quiz as any).feedback}</p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Jawaban Anda" variant="elevated">
            <div className="quiz-results">
              {console.log('Rendering results - Answers object:', answers)}
              {console.log('Questions:', questions.map(q => ({ id: q.id, question: q.question })))}
              {questions.map((question, index) => {
                const studentAnswer = answers[question.id];
                console.log(`Question ${index + 1} (${question.id}):`, 'Answer:', studentAnswer);
                const normalizedOptions = (question.options || []).map((option: any, optIndex: number) =>
                  normalizeOption(option, optIndex)
                );
                const selectedOption = normalizedOptions.find((opt: any) => opt.value === studentAnswer);
                console.log('Selected option:', selectedOption);
                
                return (
                  <div key={question.id} className="result-item" style={{ 
                    padding: '1rem', 
                    marginBottom: '1rem',
                    backgroundColor: 'var(--ios-secondary-background)',
                    borderRadius: '8px',
                    border: '0.5px solid var(--ios-separator)'
                  }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <strong>Soal {index + 1}:</strong>
                      <p style={{ margin: '0.5rem 0', lineHeight: '1.6' }}>{question.question}</p>
                      {question.questionImage && (
                        <img 
                          src={question.questionImage} 
                          alt={`Soal ${index + 1}`}
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '200px', 
                            marginTop: '0.5rem',
                            borderRadius: '8px'
                          }}
                        />
                      )}
                    </div>
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: 'var(--accent-blue)',
                      borderRadius: '6px',
                      borderLeft: '3px solid var(--ios-blue)'
                    }}>
                      <strong style={{ color: 'var(--ios-blue)' }}>Jawaban Anda:</strong>
                      <p style={{ margin: '0.5rem 0 0 0' }}>
                        {selectedOption ? (selectedOption.text || selectedOption.value) : (studentAnswer || '(Tidak dijawab)')}
                      </p>
                      {selectedOption?.imageUrl && (
                        <img 
                          src={selectedOption.imageUrl} 
                          alt="Jawaban"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '150px', 
                            marginTop: '0.5rem',
                            borderRadius: '6px'
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
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
            title="Mulai Kuis/Test/Ujian"
            size="medium"
          >
            <div className="quiz-instructions">
              <p><strong>Judul:</strong> {quiz.title}</p>
              <p><strong>Mulai:</strong> {formatDateTime(new Date(quiz.startDate))}</p>
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
              <Button onClick={handleStart}>Mulai Kuis/Test/Ujian</Button>
            </div>
          </Modal>
        )}

        {!showStartModal && (
          <>
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
            {questions.map((question, index) => {
              const questionText = typeof question.question === 'string' ? question.question : '';
              const questionImage = question.questionImage || (isImageValue(questionText) ? questionText : undefined);
              const questionTextToShow = questionImage && isImageValue(questionText) ? '' : questionText;
              const normalizedOptions = (question.options || []).map((option: any, optIndex: number) =>
                normalizeOption(option, optIndex)
              );

              return (
                <div key={question.id} className="question-item">
                  <h3>Soal {index + 1}</h3>
                  {questionTextToShow && <p className="question-text">{questionTextToShow}</p>}
                  {questionImage && (
                    <div className="question-image-preview">
                      <img src={questionImage} alt={`Soal ${index + 1}`} />
                    </div>
                  )}
                  <div className="question-options">
                    {normalizedOptions.map((option: any, optIndex: number) => (
                      <label key={option.value || optIndex} className="option-label">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.value}
                          checked={answers[question.id] === option.value}
                          onChange={(e) =>
                            setAnswers({ ...answers, [question.id]: e.target.value })
                          }
                        />
                        <span className="option-content">
                          {option.imageUrl && (
                            <img
                              src={option.imageUrl}
                              alt={option.text || `Opsi ${optIndex + 1}`}
                              className="option-image"
                            />
                          )}
                          {option.text && <span>{option.text}</span>}
                          {!option.text && !option.imageUrl && <span>{`Opsi ${optIndex + 1}`}</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="quiz-actions">
            <Button variant="outline" onClick={() => setShowConfirmModal(true)}>
              Tutup
            </Button>
            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={Object.keys(answers).length < questions.length}
            >
              Kumpulkan Kuis/Test/Ujian
            </Button>
          </div>
        </Card>

        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Konfirmasi"
          size="small"
        >
          <p>Apakah Anda yakin ingin mengumpulkan kuis/test/ujian ini?</p>
          <div className="modal-footer">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Ya, Kumpulkan
            </Button>
          </div>
        </Modal>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

