import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Button, EmptyState, Loading } from '../../components/common';
import { quizService, classService, subjectService } from '../../services';
import { formatDateTime } from '../../utils';
import { ROUTES } from '../../constants';
import './TeacherQuizDetail.css';

export const TeacherQuizDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [subjectName, setSubjectName] = useState('');
  const [className, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const quizData = await quizService.getQuizById(id);
        setQuiz(quizData);
        const [subject, classroom] = await Promise.all([
          subjectService.getSubjectById(quizData.subjectId).catch(() => null),
          classService.getClassById(quizData.classId).catch(() => null),
        ]);
        setSubjectName(subject?.name || quizData.subjectId);
        setClassName(classroom?.name || quizData.classId);
      } catch (error) {
        console.error('Error loading quiz detail:', error);
        setQuiz(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

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

  const getCorrectAnswerValue = (correctAnswer: string | string[]) =>
    Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;

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
        <EmptyState icon="quiz" title="Kuis/Test/Ujian Tidak Ditemukan" message="Data kuis tidak ditemukan." />
      </DashboardLayout>
    );
  }

  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];

  return (
    <DashboardLayout>
      <div className="quiz-detail">
        <div className="quiz-header">
          <div>
            <h1>{quiz.title}</h1>
            <div className="quiz-meta">
              <Badge variant="info">{subjectName}</Badge>
              <span>Kelas: {className}</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(ROUTES.TEACHER_QUIZZES)}>
            Kembali
          </Button>
        </div>

        <Card>
          <div className="quiz-info">
            <p><strong>Mulai:</strong> {formatDateTime(new Date(quiz.startDate))}</p>
            <p><strong>Batas Waktu:</strong> {formatDateTime(new Date(quiz.endDate))}</p>
            <p><strong>Waktu:</strong> {quiz.timeLimit || 0} menit</p>
            <p><strong>Jumlah Soal:</strong> {questions.length}</p>
            <p><strong>Nilai Maksimal:</strong> {quiz.maxScore}</p>
          </div>
        </Card>

        <Card title="Daftar Soal">
          <div className="quiz-questions">
            {questions.length === 0 ? (
              <EmptyState icon="quiz" title="Belum Ada Soal" message="Soal belum ditambahkan." />
            ) : (
              questions.map((question: any, index: number) => {
                const questionText = typeof question.question === 'string' ? question.question : '';
                const questionImage = question.questionImage || (isImageValue(questionText) ? questionText : undefined);
                const questionTextToShow = questionImage && isImageValue(questionText) ? '' : questionText;
                const normalizedOptions = (question.options || []).map((option: any, optIndex: number) =>
                  normalizeOption(option, optIndex)
                );
                const correctValue = getCorrectAnswerValue(question.correctAnswer);

                return (
                  <div key={question.id || `${index}`} className="question-item">
                    <h3>Soal {index + 1}</h3>
                    {questionTextToShow && <p className="question-text">{questionTextToShow}</p>}
                    {questionImage && (
                      <div className="question-image-preview">
                        <img src={questionImage} alt={`Soal ${index + 1}`} />
                      </div>
                    )}
                    {normalizedOptions.length > 0 && (
                      <div className="question-options">
                        {normalizedOptions.map((option: any, optIndex: number) => {
                          const isCorrect = option.value === correctValue || option.text === correctValue;
                          return (
                            <div key={option.value || optIndex} className={`option-label ${isCorrect ? 'option-label--correct' : ''}`}>
                              <div className="option-content">
                                {option.imageUrl && (
                                  <img
                                    src={option.imageUrl}
                                    alt={option.text || `Opsi ${optIndex + 1}`}
                                    className="option-image"
                                  />
                                )}
                                {option.text && <span>{option.text}</span>}
                                {!option.text && !option.imageUrl && <span>{`Opsi ${optIndex + 1}`}</span>}
                              </div>
                              {isCorrect && <Badge variant="success">Benar</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {question.type !== 'multiple_choice' && question.correctAnswer && (
                      <p className="question-answer">
                        <strong>Kunci Jawaban:</strong> {correctValue}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
