import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Dropdown, Modal, FormInput, FormSelect, FormTextarea, Icon, EmptyState, Pagination, Table, FileUpload, Loading } from '../../components/common';
import { QuestionType, QuizQuestion } from '../../types';
import { QUESTION_TYPE_LABELS } from '../../constants';
import { formatDate } from '../../utils';
import { quizService, subjectService } from '../../services';
import './TeacherQuestionBank.css';

interface QuestionBankItem {
  id: string;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  points: number;
  subjectId: string;
  subjectName: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
}

const DIFFICULTY_LABELS = {
  easy: 'Mudah',
  medium: 'Sedang',
  hard: 'Sulit',
};

const DIFFICULTY_COLORS = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
} as const;

export const TeacherQuestionBank = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionBankItem | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<QuestionBankItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    question: '',
    type: 'multiple_choice' as QuestionType,
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    subjectId: '',
    topic: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [quizzesData, subjectsData] = await Promise.all([
          quizService.getQuizzes({ teacherId: user?.id }),
          subjectService.getSubjects(),
        ]);

        // Extract questions from all quizzes
        const allQuestions: QuestionBankItem[] = [];
        quizzesData.forEach(quiz => {
          if (quiz.questions && Array.isArray(quiz.questions)) {
            quiz.questions.forEach((q: QuizQuestion, index: number) => {
              allQuestions.push({
                id: `${quiz.id}-${q.id || index}`,
                question: q.question,
                type: q.type,
                options: q.options || [],
                correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer,
                points: q.points,
                subjectId: quiz.subjectId,
                subjectName: '',
                topic: '',
                difficulty: 'medium',
                createdAt: quiz.createdAt,
                updatedAt: quiz.createdAt,
              });
            });
          }
        });

        setQuestions(allQuestions);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);

        // Update subject names in questions
        setQuestions(prev => prev.map(q => ({
          ...q,
          subjectName: subjectMap[q.subjectId] || q.subjectId,
        })));
      } catch (error) {
        console.error('Error loading question bank:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const filteredQuestions = questions.filter((q) => {
    const matchesSubject = selectedSubject === 'all' || q.subjectId === selectedSubject;
    const matchesType = selectedType === 'all' || q.type === selectedType;
    const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    return matchesSubject && matchesType && matchesDifficulty;
  });

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = () => {
    setFormData({
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
      subjectId: '',
      topic: '',
      difficulty: 'medium',
    });
    setSelectedQuestion(null);
    setShowCreateModal(true);
  };

  const handleEdit = (question: QuestionBankItem) => {
    setSelectedQuestion(question);
    setFormData({
      question: question.question,
      type: question.type,
      options: question.options.length > 0 ? question.options : ['', '', '', ''],
      correctAnswer: question.correctAnswer,
      points: question.points,
      subjectId: question.subjectId,
      topic: question.topic || '',
      difficulty: question.difficulty || 'medium',
    });
    setShowCreateModal(true);
  };

  const handleDelete = (question: QuestionBankItem) => {
    setSelectedQuestion(question);
    setShowDeleteDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.subjectId) {
      alert('Isi pertanyaan dan pilih mata pelajaran');
      return;
    }

    if (formData.type !== 'essay' && !formData.correctAnswer.trim()) {
      alert('Isi jawaban yang benar');
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const subjectName = subjects[formData.subjectId] || '';

      if (selectedQuestion) {
        // Update existing question
        const updatedQuestion: QuestionBankItem = {
          ...selectedQuestion,
          question: formData.question,
          type: formData.type,
          options: formData.type === 'essay' || formData.type === 'short_answer' ? [] : formData.options.filter((opt) => opt.trim()),
          correctAnswer: formData.correctAnswer,
          points: formData.points,
          subjectId: formData.subjectId,
          subjectName,
          topic: formData.topic || undefined,
          difficulty: formData.difficulty,
          updatedAt: new Date(),
        };
        setQuestions(questions.map((q) => (q.id === selectedQuestion.id ? updatedQuestion : q)));
      } else {
        // Create new question
        const newQuestion: QuestionBankItem = {
          id: Date.now().toString(),
          question: formData.question,
          type: formData.type,
          options: formData.type === 'essay' || formData.type === 'short_answer' ? [] : formData.options.filter((opt) => opt.trim()),
          correctAnswer: formData.correctAnswer,
          points: formData.points,
          subjectId: formData.subjectId,
          subjectName,
          topic: formData.topic || undefined,
          difficulty: formData.difficulty,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setQuestions([newQuestion, ...questions]);
      }

      setShowCreateModal(false);
      setFormData({
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
        subjectId: '',
        topic: '',
        difficulty: 'medium',
      });
      setSelectedQuestion(null);
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Gagal menyimpan soal');
    }
  };

  const confirmDelete = async () => {
    if (!selectedQuestion) return;
    try {
      // Note: Question deletion would need API support
      // For now, just update local state
      setQuestions(questions.filter((q) => q.id !== selectedQuestion.id));
      setShowDeleteDialog(false);
      setSelectedQuestion(null);
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Gagal menghapus soal');
    }
  };

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setImportFile(file);
    try {
      // Simulate reading Excel file
      // In real app, use library like xlsx or exceljs to parse Excel file
      // Example: const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Mock parsed data from Excel
      // Format Excel yang diharapkan:
      // Kolom: Mata Pelajaran | Topik | Tipe Soal | Tingkat Kesulitan | Pertanyaan | Pilihan 1 | Pilihan 2 | Pilihan 3 | Pilihan 4 | Jawaban Benar | Poin
      const mockParsedData: QuestionBankItem[] = [
        {
          id: 'import-1',
          question: 'Berapakah hasil dari 5 + 3?',
          type: 'multiple_choice',
          options: ['7', '8', '9', '10'],
          correctAnswer: '8',
          points: 1,
          subjectId: 'subject1',
          subjectName: 'Matematika',
          topic: 'Aritmatika',
          difficulty: 'easy',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'import-2',
          question: 'Jelaskan konsep fotosintesis!',
          type: 'essay',
          options: [],
          correctAnswer: 'Fotosintesis adalah proses pembuatan makanan oleh tumbuhan menggunakan cahaya matahari',
          points: 5,
          subjectId: 'subject4',
          subjectName: 'Biologi',
          topic: 'Fotosintesis',
          difficulty: 'medium',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      setImportPreview(mockParsedData);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      alert('Gagal membaca file Excel. Pastikan format file benar.');
      setImportFile(null);
    }
  };

  const handleImport = async () => {
    if (importPreview.length === 0) {
      alert('Tidak ada data untuk diimport');
      return;
    }

    setIsImporting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Add imported questions
      const newQuestions = importPreview.map((q) => ({
        ...q,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      }));
      
      setQuestions([...newQuestions, ...questions]);
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      alert(`Berhasil mengimport ${importPreview.length} soal`);
    } catch (error) {
      console.error('Error importing questions:', error);
      alert('Gagal mengimport soal');
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ''],
    });
  };

  const handleRemoveOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const columns = [
    {
      key: 'question',
      header: 'Soal',
      render: (item: QuestionBankItem) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
            {item.question.length > 100 ? `${item.question.substring(0, 100)}...` : item.question}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <Badge variant="info" size="small">{item.subjectName}</Badge>
            {item.topic && <Badge variant="secondary" size="small">{item.topic}</Badge>}
            <Badge variant={DIFFICULTY_COLORS[item.difficulty || 'medium']} size="small">
              {DIFFICULTY_LABELS[item.difficulty || 'medium']}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipe',
      render: (item: QuestionBankItem) => (
        <Badge variant="primary" size="small">
          {QUESTION_TYPE_LABELS[item.type]}
        </Badge>
      ),
    },
    {
      key: 'points',
      header: 'Poin',
      render: (item: QuestionBankItem) => <strong>{item.points}</strong>,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: QuestionBankItem) => (
        <Dropdown
          trigger={<Button variant="outline" size="small">⋯</Button>}
          items={[
            { label: 'Edit', onClick: () => handleEdit(item) },
            { divider: true },
            { label: 'Hapus', onClick: () => handleDelete(item) },
          ]}
          align="right"
        />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="teacher-question-bank">
        <div className="page-header">
          <h1>Bank Soal</h1>
          <div className="header-actions">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Icon name="upload" size={16} style={{ marginRight: '0.5rem' }} />
              Import Excel
            </Button>
            <Button onClick={handleCreate}>
              <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
              Tambah Soal
            </Button>
          </div>
        </div>

        <div className="page-filters">
          <div className="filter-group">
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {Object.entries(subjects).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">Semua Tipe</option>
              {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">Semua Tingkat</option>
              {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="question-stats">
          <Card variant="elevated" className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{questions.length}</div>
              <div className="stat-label">Total Soal</div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-content">
              <div className="stat-value">
                {questions.filter((q) => q.type === 'multiple_choice').length}
              </div>
              <div className="stat-label">Pilihan Ganda</div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-content">
              <div className="stat-value">
                {questions.filter((q) => q.type === 'essay').length}
              </div>
              <div className="stat-label">Esai</div>
            </div>
          </Card>
        </div>

        {isLoading ? (
          <Loading />
        ) : paginatedQuestions.length === 0 ? (
          <EmptyState
            icon="quiz"
            title="Tidak Ada Soal"
            message={searchTerm || selectedSubject !== 'all' || selectedType !== 'all' || selectedDifficulty !== 'all'
              ? 'Tidak ada soal yang sesuai dengan filter yang dipilih.'
              : 'Belum ada soal yang ditambahkan.'}
            action={{
              label: 'Tambah Soal',
              onClick: handleCreate,
            }}
          />
        ) : (
          <Card title={`Daftar Soal (${filteredQuestions.length})`} variant="elevated">
            <Table columns={columns} data={paginatedQuestions} />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </Card>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setFormData({
              question: '',
              type: 'multiple_choice',
              options: ['', '', '', ''],
              correctAnswer: '',
              points: 1,
              subjectId: '',
              topic: '',
              difficulty: 'medium',
            });
            setSelectedQuestion(null);
          }}
          title={selectedQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="question-form">
            <FormSelect
              label="Mata Pelajaran"
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              options={[
                { value: '', label: 'Pilih mata pelajaran' },
                ...Object.entries(subjects).map(([id, name]) => ({ value: id, label: name })),
              ]}
              required
            />
            <FormInput
              label="Topik (Opsional)"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="Contoh: Aljabar, Geometri, dll"
            />
            <FormSelect
              label="Tingkat Kesulitan"
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })
              }
              options={Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              required
            />
            <FormSelect
              label="Tipe Soal"
              value={formData.type}
              onChange={(e) => {
                const newType = e.target.value as QuestionType;
                setFormData({
                  ...formData,
                  type: newType,
                  options: newType === 'essay' || newType === 'short_answer' ? [] : ['', '', '', ''],
                  correctAnswer: '',
                });
              }}
              options={Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              required
            />
            <FormTextarea
              label="Pertanyaan"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Masukkan pertanyaan"
              rows={4}
              required
            />
            {(formData.type === 'multiple_choice' || formData.type === 'true_false') && (
              <div className="options-section">
                <label className="form-label">Pilihan Jawaban</label>
                {formData.options.map((option, index) => (
                  <div key={index} className="option-item">
                    <FormInput
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Pilihan ${index + 1}`}
                      required={formData.type === 'multiple_choice'}
                    />
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="small"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <Icon name="delete" size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                {formData.type === 'multiple_choice' && formData.options.length < 6 && (
                  <Button type="button" variant="outline" onClick={handleAddOption} style={{ marginTop: '0.5rem' }}>
                    <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
                    Tambah Pilihan
                  </Button>
                )}
              </div>
            )}
            {formData.type !== 'essay' && (
              <FormInput
                label={
                  formData.type === 'multiple_choice' || formData.type === 'true_false'
                    ? 'Jawaban Benar'
                    : 'Jawaban'
                }
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                placeholder={
                  formData.type === 'multiple_choice' || formData.type === 'true_false'
                    ? 'Masukkan jawaban yang benar (harus sama dengan salah satu pilihan)'
                    : 'Masukkan jawaban yang benar'
                }
                required
              />
            )}
            {formData.type === 'essay' && (
              <FormTextarea
                label="Jawaban Acuan (Opsional)"
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                placeholder="Masukkan jawaban acuan untuk membantu penilaian"
                rows={3}
              />
            )}
            <FormInput
              label="Poin"
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
              min={1}
              required
            />
            <div className="modal-footer">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    question: '',
                    type: 'multiple_choice',
                    options: ['', '', '', ''],
                    correctAnswer: '',
                    points: 1,
                    subjectId: '',
                    topic: '',
                    difficulty: 'medium',
                  });
                  setSelectedQuestion(null);
                }}
              >
                Batal
              </Button>
              <Button type="submit">{selectedQuestion ? 'Simpan Perubahan' : 'Simpan Soal'}</Button>
            </div>
          </form>
        </Modal>

        {/* Import Excel Modal */}
        <Modal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setImportFile(null);
            setImportPreview([]);
          }}
          title="Import Soal dari Excel"
          size="large"
        >
          <div className="import-form">
            <div className="import-instructions">
              <h4>Format Excel yang Diperlukan:</h4>
              <p>File Excel harus memiliki kolom berikut (dalam urutan):</p>
              <ol>
                <li><strong>Mata Pelajaran</strong> - Nama mata pelajaran (contoh: Matematika, Fisika)</li>
                <li><strong>Topik</strong> - Topik soal (opsional, contoh: Aljabar, Geometri)</li>
                <li><strong>Tipe Soal</strong> - Pilihan Ganda / Esai / Benar-Salah / Jawaban Pendek</li>
                <li><strong>Tingkat Kesulitan</strong> - Mudah / Sedang / Sulit</li>
                <li><strong>Pertanyaan</strong> - Teks pertanyaan</li>
                <li><strong>Pilihan 1</strong> - Opsi pertama (untuk Pilihan Ganda/Benar-Salah)</li>
                <li><strong>Pilihan 2</strong> - Opsi kedua (untuk Pilihan Ganda/Benar-Salah)</li>
                <li><strong>Pilihan 3</strong> - Opsi ketiga (opsional, untuk Pilihan Ganda)</li>
                <li><strong>Pilihan 4</strong> - Opsi keempat (opsional, untuk Pilihan Ganda)</li>
                <li><strong>Jawaban Benar</strong> - Jawaban yang benar</li>
                <li><strong>Poin</strong> - Poin untuk soal</li>
              </ol>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--ios-gray)' }}>
                <strong>Catatan:</strong> Untuk soal tipe Esai, kolom Pilihan 1-4 bisa dikosongkan. 
                Jawaban Benar untuk Esai adalah jawaban acuan (opsional).
              </p>
            </div>

            <FileUpload
              accept=".xlsx,.xls"
              onFileSelect={handleFileSelect}
              multiple={false}
              maxFiles={1}
              label="Pilih File Excel"
            />

            {importPreview.length > 0 && (
              <div className="import-preview">
                <h4>Preview Data ({importPreview.length} soal):</h4>
                <div className="preview-list">
                  {importPreview.map((q, index) => (
                    <Card key={index} variant="outlined" className="preview-item">
                      <div className="preview-header">
                        <strong>Soal {index + 1}</strong>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <Badge variant="info" size="small">{q.subjectName}</Badge>
                          {q.topic && <Badge variant="secondary" size="small">{q.topic}</Badge>}
                          <Badge variant={DIFFICULTY_COLORS[q.difficulty || 'medium']} size="small">
                            {DIFFICULTY_LABELS[q.difficulty || 'medium']}
                          </Badge>
                          <Badge variant="primary" size="small">
                            {QUESTION_TYPE_LABELS[q.type]}
                          </Badge>
                        </div>
                      </div>
                      <p style={{ margin: '0.5rem 0' }}>{q.question}</p>
                      {q.options.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <strong>Pilihan:</strong>
                          <ul style={{ margin: '0.25rem 0 0 1.5rem', padding: 0 }}>
                            {q.options.map((opt, optIndex) => (
                              <li key={optIndex} style={{ marginBottom: '0.25rem' }}>
                                {opt} {opt === q.correctAnswer && <Badge variant="success" size="small">Benar</Badge>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {q.type === 'essay' && q.correctAnswer && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--ios-secondary-background)', borderRadius: '6px' }}>
                          <strong>Jawaban Acuan:</strong> {q.correctAnswer}
                        </div>
                      )}
                      <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--ios-gray)' }}>
                        Poin: <strong>{q.points}</strong>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportPreview([]);
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleImport}
                disabled={importPreview.length === 0}
                isLoading={isImporting}
              >
                <Icon name="upload" size={16} style={{ marginRight: '0.5rem' }} />
                Import {importPreview.length > 0 && `(${importPreview.length} soal)`}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && selectedQuestion && (
          <div className="delete-dialog-overlay" onClick={() => setShowDeleteDialog(false)}>
            <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>Hapus Soal</h3>
              <p>
                Apakah Anda yakin ingin menghapus soal ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="dialog-actions">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Batal
                </Button>
                <Button variant="danger" onClick={confirmDelete}>
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
