import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormInput, FormSelect, FormTextarea, Modal, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { QuestionType } from '../../types';
import { quizService, subjectService, classService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './CreateQuiz.css';

interface Question {
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  points: number;
}

export const CreateQuiz = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    classId: '',
    startDate: '',
    endDate: '',
    timeLimit: '',
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
  });

  const addQuestion = () => {
    if (currentQuestion.question && currentQuestion.correctAnswer) {
      setQuestions([...questions, { ...currentQuestion }]);
      setCurrentQuestion({
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
      });
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert('Minimal harus ada 1 soal');
      return;
    }

    setIsSubmitting(true);
    try {
      await quizService.createQuiz({
        title: formData.title,
        description: formData.description,
        subjectId: formData.subjectId,
        classId: formData.classId,
        teacherId: user?.id || '',
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        timeLimit: parseInt(formData.timeLimit) || 30,
        questions: questions.map(q => ({
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
        })),
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Gagal membuat kuis. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="create-quiz">
        <h1>Buat Kuis Baru</h1>

        <Card>
          <form onSubmit={handleSubmit} className="quiz-form">
            <FormInput
              label="Judul Kuis"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <FormTextarea
              label="Deskripsi"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <div className="form-row">
              <FormSelect
                label="Mata Pelajaran"
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                options={[
                  { value: '', label: 'Pilih mata pelajaran' },
                  ...subjects,
                ]}
                required
              />

              <FormSelect
                label="Kelas"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                options={[
                  { value: '', label: 'Pilih kelas' },
                  ...classes,
                ]}
                required
              />
            </div>

            <div className="form-row">
              <FormInput
                label="Waktu Mulai"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />

              <FormInput
                label="Waktu Selesai"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>

            <FormInput
              label="Batas Waktu (menit)"
              type="number"
              value={formData.timeLimit}
              onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
              placeholder="30"
            />

            <div className="questions-section">
              <h3>Tambah Soal</h3>
              <Card variant="outlined">
                <div className="question-form">
                  <FormTextarea
                    label="Pertanyaan"
                    value={currentQuestion.question}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, question: e.target.value })
                    }
                    rows={3}
                  />

                  <FormSelect
                    label="Tipe Soal"
                    value={currentQuestion.type}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        type: e.target.value as QuestionType,
                      })
                    }
                    options={[
                      { value: 'multiple_choice', label: 'Pilihan Ganda' },
                      { value: 'true_false', label: 'Benar/Salah' },
                      { value: 'short_answer', label: 'Jawaban Pendek' },
                      { value: 'essay', label: 'Esai' },
                    ]}
                  />

                  {currentQuestion.type === 'multiple_choice' && (
                    <div className="options-list">
                      {currentQuestion.options.map((option, index) => (
                        <FormInput
                          key={index}
                          label={`Opsi ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = e.target.value;
                            setCurrentQuestion({ ...currentQuestion, options: newOptions });
                          }}
                        />
                      ))}
                      <FormSelect
                        label="Jawaban Benar"
                        value={currentQuestion.correctAnswer}
                        onChange={(e) =>
                          setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })
                        }
                        options={currentQuestion.options.map((opt, idx) => ({
                          value: `option${idx}`,
                          label: opt || `Opsi ${idx + 1}`,
                        }))}
                      />
                    </div>
                  )}

                  <FormInput
                    label="Poin"
                    type="number"
                    value={currentQuestion.points.toString()}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        points: parseInt(e.target.value) || 1,
                      })
                    }
                    min="1"
                  />

                  <Button type="button" onClick={addQuestion} variant="secondary">
                    Tambah Soal
                  </Button>
                </div>
              </Card>

              {questions.length > 0 && (
                <div className="questions-list">
                  <h4>Daftar Soal ({questions.length})</h4>
                  {questions.map((q, index) => (
                    <div key={index} className="question-item">
                      <p>
                        <strong>{index + 1}.</strong> {q.question}
                      </p>
                      <Button
                        type="button"
                        variant="danger"
                        size="small"
                        onClick={() => removeQuestion(index)}
                      >
                        Hapus
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.TEACHER_QUIZZES)}
              >
                Batal
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Buat Kuis
              </Button>
            </div>
          </form>
        </Card>

        <Modal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            navigate(ROUTES.TEACHER_QUIZZES);
          }}
          title="Berhasil"
          size="small"
        >
          <p>Kuis berhasil dibuat!</p>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

