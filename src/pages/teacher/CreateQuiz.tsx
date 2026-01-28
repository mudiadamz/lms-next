import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormInput, FormSelect, FormTextarea, Modal, Loading, FileUpload } from '../../components/common';
import { ROUTES } from '../../constants';
import { QuestionType } from '../../types';
import { quizService, subjectService, classService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './CreateQuiz.css';

interface QuestionOption {
  value: string;
  text: string;
  imageUrl?: string;
}

interface Question {
  question: string;
  questionImage?: string;
  type: QuestionType;
  options: QuestionOption[];
  correctAnswer: string;
  points: number;
}

export const CreateQuiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [subjects, setSubjects] = useState<Array<{ value: string; label: string }>>([]);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    classId: '',
    startDate: '',
    endDate: '',
    timeLimit: '',
  });
  const createOption = (overrides: Partial<QuestionOption> = {}): QuestionOption => ({
    value: `opt-${Math.random().toString(36).slice(2, 9)}`,
    text: '',
    imageUrl: undefined,
    ...overrides,
  });

  const createEmptyQuestion = (): Question => ({
    question: '',
    questionImage: undefined,
    type: 'multiple_choice',
    options: [createOption(), createOption(), createOption(), createOption()],
    correctAnswer: '',
    points: 1,
  });

  const [questions, setQuestions] = useState<Question[]>([createEmptyQuestion()]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [subjectsData, classesData] = await Promise.all([
          subjectService.getSubjects(undefined, user?.id),
          classService.getClasses(),
        ]);
        setSubjects(subjectsData.map(s => ({ value: s.id, label: s.name })));
        setClasses(classesData.map(c => ({ value: c.id, label: c.name })));
      } catch (error) {
        console.error('Error loading quiz data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const addQuestion = () => {
    setQuestions((prev) => {
      const next = [...prev, createEmptyQuestion()];
      setActiveQuestionIndex(next.length - 1);
      return next;
    });
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    const nextQuestions = questions.filter((_, i) => i !== index);
    setQuestions(nextQuestions);
    setActiveQuestionIndex((prev) => {
      if (prev > index) return prev - 1;
      if (prev === index) return Math.max(0, prev - 1);
      return prev;
    });
  };

  const updateActiveQuestion = (updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === activeQuestionIndex ? { ...q, ...updates } : q))
    );
  };

  const updateOption = (index: number, updates: Partial<QuestionOption>) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== activeQuestionIndex) return q;
        const nextOptions = q.options.map((opt, optIndex) =>
          optIndex === index ? { ...opt, ...updates } : opt
        );
        const nextCorrectAnswer = nextOptions.some((opt) => opt.value === q.correctAnswer)
          ? q.correctAnswer
          : '';
        return { ...q, options: nextOptions, correctAnswer: nextCorrectAnswer };
      })
    );
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    const missingFields: string[] = [];
    if (!formData.title.trim()) missingFields.push('Judul');
    if (!formData.description.trim()) missingFields.push('Deskripsi');
    if (!formData.subjectId) missingFields.push('Mata Pelajaran');
    if (!formData.classId) missingFields.push('Kelas');
    if (!formData.startDate) missingFields.push('Tanggal Mulai');
    if (!formData.endDate) missingFields.push('Tanggal Selesai');

    if (missingFields.length > 0) {
      alert(`Field yang wajib diisi:\n- ${missingFields.join('\n- ')}`);
      return;
    }

    if (questions.length === 0) {
      alert('Minimal harus ada 1 soal');
      return;
    }
    const invalidQuestionIndex = questions.findIndex((q) => {
      if (!q.question.trim() && !q.questionImage) return true;
      if (q.type === 'multiple_choice') {
        const validOptions = q.options.filter((opt) => opt.text.trim() || opt.imageUrl);
        if (validOptions.length < 2) return true;
        return !validOptions.some((opt) => opt.value === q.correctAnswer);
      }
      if (q.type === 'true_false') {
        return q.correctAnswer !== 'true' && q.correctAnswer !== 'false';
      }
      return false;
    });
    if (invalidQuestionIndex !== -1) {
      setActiveQuestionIndex(invalidQuestionIndex);
      alert(`Soal ${invalidQuestionIndex + 1} belum lengkap.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const totalMaxScore = questions.reduce((sum, q) => sum + (Number.isFinite(q.points) ? q.points : 0), 0);
      await quizService.createQuiz({
        title: formData.title,
        description: formData.description,
        subjectId: formData.subjectId,
        classId: formData.classId,
        teacherId: user?.id || '',
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : new Date().toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        timeLimit: parseInt(formData.timeLimit) || 30,
        maxScore: totalMaxScore || questions.length,
        questions: questions.map(q => ({
          question: q.question,
          questionImage: q.questionImage,
          type: q.type,
          options: q.type === 'multiple_choice' || q.type === 'true_false'
            ? q.options
                .filter((opt) => opt.text.trim() || opt.imageUrl)
                .map((opt) => ({
                  value: opt.value,
                  text: opt.text.trim() || undefined,
                  imageUrl: opt.imageUrl || undefined,
                }))
            : [],
          correctAnswer: q.correctAnswer,
          points: q.points,
        })),
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating quiz:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal membuat kuis/test/ujian';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeQuestion = questions[activeQuestionIndex] || createEmptyQuestion();

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
        <h1>Buat Kuis/Test/Ujian Baru</h1>

        <Card>
          <form onSubmit={handleSubmit} className="quiz-form">
            <FormInput
              label="Judul Kuis/Test/Ujian"
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
                <div className="question-tabs">
                  {questions.map((_, index) => (
                    <button
                      key={`question-tab-${index}`}
                      type="button"
                      className={`question-tab ${index === activeQuestionIndex ? 'question-tab--active' : ''}`}
                      onClick={() => setActiveQuestionIndex(index)}
                    >
                      Soal {index + 1}
                    </button>
                  ))}
                  <Button type="button" variant="secondary" className="question-tab-add" onClick={addQuestion}>
                    + Tambah Soal
                  </Button>
                </div>
                <div className="question-form">
                  <FormTextarea
                    label="Pertanyaan"
                    value={activeQuestion.question}
                    onChange={(e) => updateActiveQuestion({ question: e.target.value })}
                    rows={3}
                  />
                  <div className="question-image">
                    <FileUpload
                      label="Gambar Soal (opsional)"
                      accept="image/*"
                      onFileSelect={async (files) => {
                        if (!files || files.length === 0) {
                          updateActiveQuestion({ questionImage: undefined });
                          return;
                        }
                        try {
                          const imageUrl = await readFileAsDataUrl(files[0]);
                          updateActiveQuestion({ questionImage: imageUrl });
                        } catch (error) {
                          console.error('Error reading question image:', error);
                          alert('Gagal membaca gambar soal');
                        }
                      }}
                    />
                    {activeQuestion.questionImage && (
                      <div className="question-image-preview">
                        <img src={activeQuestion.questionImage} alt="Preview soal" />
                        <Button
                          type="button"
                          variant="outline"
                          size="small"
                          onClick={() => updateActiveQuestion({ questionImage: undefined })}
                        >
                          Hapus Gambar
                        </Button>
                      </div>
                    )}
                  </div>

                  <FormSelect
                    label="Tipe Soal"
                    value={activeQuestion.type}
                    onChange={(e) => {
                      const nextType = e.target.value as QuestionType;
                      if (nextType === 'multiple_choice') {
                        updateActiveQuestion({
                          type: nextType,
                          options: activeQuestion.options?.length
                            ? activeQuestion.options
                            : [createOption(), createOption(), createOption(), createOption()],
                          correctAnswer: '',
                        });
                        return;
                      }
                      if (nextType === 'true_false') {
                        updateActiveQuestion({
                          type: nextType,
                          options: [
                            createOption({ value: 'true', text: 'Benar' }),
                            createOption({ value: 'false', text: 'Salah' }),
                          ],
                          correctAnswer: '',
                        });
                        return;
                      }
                      updateActiveQuestion({ type: nextType, options: [], correctAnswer: '' });
                    }}
                    options={[
                      { value: 'multiple_choice', label: 'Pilihan Ganda' },
                      { value: 'true_false', label: 'Benar/Salah' },
                    ]}
                  />

                  {activeQuestion.type === 'multiple_choice' && (
                    <div className="options-list">
                      {activeQuestion.options.map((option, index) => (
                        <div key={option.value} className="option-item">
                          <FormInput
                            label={`Opsi ${index + 1}`}
                            value={option.text}
                            onChange={(e) => updateOption(index, { text: e.target.value })}
                            placeholder="Teks opsi (opsional jika pakai gambar)"
                          />
                          <FileUpload
                            label={`Gambar Opsi ${index + 1} (opsional)`}
                            accept="image/*"
                            onFileSelect={async (files) => {
                              if (!files || files.length === 0) {
                                updateOption(index, { imageUrl: undefined });
                                return;
                              }
                              try {
                                const imageUrl = await readFileAsDataUrl(files[0]);
                                updateOption(index, { imageUrl });
                              } catch (error) {
                                console.error('Error reading option image:', error);
                                alert('Gagal membaca gambar opsi');
                              }
                            }}
                          />
                          {option.imageUrl && (
                            <div className="option-image-preview">
                              <img src={option.imageUrl} alt={`Preview opsi ${index + 1}`} />
                              <Button
                                type="button"
                                variant="outline"
                                size="small"
                                onClick={() => updateOption(index, { imageUrl: undefined })}
                              >
                                Hapus Gambar
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                      <FormSelect
                        label="Jawaban Benar"
                        value={activeQuestion.correctAnswer}
                        onChange={(e) => updateActiveQuestion({ correctAnswer: e.target.value })}
                        options={activeQuestion.options.map((opt, idx) => ({
                          value: opt.value,
                          label: opt.text || (opt.imageUrl ? `Gambar Opsi ${idx + 1}` : `Opsi ${idx + 1}`),
                        }))}
                      />
                    </div>
                  )}

                  {activeQuestion.type === 'true_false' && (
                    <FormSelect
                      label="Jawaban Benar"
                      value={activeQuestion.correctAnswer}
                      onChange={(e) => updateActiveQuestion({ correctAnswer: e.target.value })}
                      options={[
                        { value: '', label: 'Pilih jawaban benar' },
                        { value: 'true', label: 'Benar' },
                        { value: 'false', label: 'Salah' },
                      ]}
                    />
                  )}

                  <FormInput
                    label="Poin"
                    type="number"
                    value={activeQuestion.points.toString()}
                    onChange={(e) =>
                      updateActiveQuestion({
                        points: parseInt(e.target.value) || 1,
                      })
                    }
                    min="1"
                  />

                  <div className="question-actions">
                    <Button
                      type="button"
                      variant="danger"
                      disabled={questions.length === 1}
                      onClick={() => removeQuestion(activeQuestionIndex)}
                    >
                      Hapus Soal
                    </Button>
                  </div>
                </div>
              </Card>
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
                Buat Kuis/Test/Ujian
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
          <p>Kuis/Test/Ujian berhasil dibuat!</p>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

