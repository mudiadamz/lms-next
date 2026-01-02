import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, SearchBar, FormSelect, Icon, EmptyState, Pagination, Modal } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, formatDateTime } from '../../utils';
import './StudentPortfolio.css';

interface PortfolioItem {
  id: string;
  type: 'assignment' | 'project' | 'quiz';
  title: string;
  subject: string;
  subjectId: string;
  teacher: string;
  submittedAt: Date;
  gradedAt?: Date;
  score?: number;
  maxScore: number;
  grade?: string;
  feedback?: string;
  attachments?: string[];
  description?: string;
  semester: number;
  academicYear: string;
}

const MOCK_SUBJECTS = [
  { value: 'all', label: 'Semua Mata Pelajaran' },
  { value: 'subject1', label: 'Matematika' },
  { value: 'subject2', label: 'Fisika' },
  { value: 'subject3', label: 'Kimia' },
  { value: 'subject4', label: 'Biologi' },
  { value: 'subject5', label: 'Bahasa Indonesia' },
];

// Contoh data portofolio
const mockPortfolioItems: PortfolioItem[] = [
  {
    id: '1',
    type: 'assignment',
    title: 'Tugas Matematika - Aljabar',
    subject: 'Matematika',
    subjectId: 'subject1',
    teacher: 'Ibu Siti',
    submittedAt: new Date('2024-01-18T14:30:00'),
    gradedAt: new Date('2024-01-20T10:00:00'),
    score: 85,
    maxScore: 100,
    grade: 'B+',
    feedback: 'Kerja bagus! Perlu lebih teliti dalam perhitungan.',
    attachments: ['tugas_aljabar.pdf'],
    description: 'Menyelesaikan soal aljabar linear dan kuadrat',
    semester: 1,
    academicYear: '2024-2025',
  },
  {
    id: '2',
    type: 'project',
    title: 'Proyek Fisika - Rangkaian Listrik',
    subject: 'Fisika',
    subjectId: 'subject2',
    teacher: 'Bapak Budi',
    submittedAt: new Date('2024-01-15T16:00:00'),
    gradedAt: new Date('2024-01-22T09:00:00'),
    score: 92,
    maxScore: 100,
    grade: 'A',
    feedback: 'Sangat baik! Presentasi dan laporan sangat detail.',
    attachments: ['proyek_fisika.pdf', 'presentasi_fisika.pptx'],
    description: 'Membuat rangkaian listrik sederhana dan laporan',
    semester: 1,
    academicYear: '2024-2025',
  },
  {
    id: '3',
    type: 'assignment',
    title: 'Tugas Bahasa Indonesia - Menulis Esai',
    subject: 'Bahasa Indonesia',
    subjectId: 'subject5',
    teacher: 'Ibu Rina',
    submittedAt: new Date('2024-01-20T12:00:00'),
    gradedAt: new Date('2024-01-25T11:00:00'),
    score: 88,
    maxScore: 100,
    grade: 'A-',
    feedback: 'Esai sangat menarik dengan struktur yang baik.',
    attachments: ['esai_bahasa.pdf'],
    description: 'Menulis esai tentang lingkungan hidup',
    semester: 1,
    academicYear: '2024-2025',
  },
  {
    id: '4',
    type: 'quiz',
    title: 'Kuis Kimia - Tabel Periodik',
    subject: 'Kimia',
    subjectId: 'subject3',
    teacher: 'Ibu Dewi',
    submittedAt: new Date('2024-01-19T10:00:00'),
    gradedAt: new Date('2024-01-19T10:05:00'),
    score: 90,
    maxScore: 100,
    grade: 'A',
    feedback: 'Jawaban sangat akurat!',
    semester: 1,
    academicYear: '2024-2025',
  },
  {
    id: '5',
    type: 'project',
    title: 'Proyek Biologi - Observasi Tumbuhan',
    subject: 'Biologi',
    subjectId: 'subject4',
    teacher: 'Bapak Eko',
    submittedAt: new Date('2024-01-17T15:00:00'),
    gradedAt: new Date('2024-01-24T14:00:00'),
    score: 87,
    maxScore: 100,
    grade: 'B+',
    feedback: 'Observasi detail, dokumentasi lengkap.',
    attachments: ['laporan_biologi.pdf', 'foto_tumbuhan.jpg'],
    description: 'Observasi dan dokumentasi pertumbuhan tanaman',
    semester: 1,
    academicYear: '2024-2025',
  },
];

const TYPE_LABELS = {
  assignment: 'Tugas',
  project: 'Proyek',
  quiz: 'Kuis',
};

const TYPE_ICONS = {
  assignment: 'assignment',
  project: 'folder',
  quiz: 'quiz',
};

const getScoreColor = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 85) return 'success';
  if (percentage >= 75) return 'primary';
  if (percentage >= 65) return 'warning';
  return 'danger';
};

export const StudentPortfolio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 9;

  const filteredItems = mockPortfolioItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || item.subjectId === selectedSubject;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSemester = item.semester.toString() === selectedSemester;
    return matchesSearch && matchesSubject && matchesType && matchesSemester;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate statistics
  const totalItems = mockPortfolioItems.length;
  const assignmentsCount = mockPortfolioItems.filter((item) => item.type === 'assignment').length;
  const projectsCount = mockPortfolioItems.filter((item) => item.type === 'project').length;
  const quizzesCount = mockPortfolioItems.filter((item) => item.type === 'quiz').length;
  const averageScore =
    mockPortfolioItems.reduce((sum, item) => sum + (item.score || 0), 0) /
    mockPortfolioItems.filter((item) => item.score !== undefined).length;

  const handleViewDetail = (item: PortfolioItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  return (
    <DashboardLayout>
      <div className="student-portfolio">
        <div className="page-header">
          <h1>Portofolio</h1>
        </div>

        {/* Statistics Cards */}
        <div className="portfolio-stats">
          <Card variant="elevated" className="stat-card stat-card--primary">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
              <Icon name="folder" size={24} style={{ color: 'var(--ios-blue)' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalItems}</div>
              <div className="stat-label">Total Karya</div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{assignmentsCount}</div>
              <div className="stat-label">Tugas</div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{projectsCount}</div>
              <div className="stat-label">Proyek</div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{quizzesCount}</div>
              <div className="stat-label">Kuis</div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{averageScore.toFixed(1)}</div>
              <div className="stat-label">Rata-rata Nilai</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="page-filters">
          <SearchBar
            placeholder="Cari portofolio..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="filter-group">
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              {MOCK_SUBJECTS.map((subj) => (
                <option key={subj.value} value={subj.value}>
                  {subj.label}
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
              <option value="assignment">Tugas</option>
              <option value="project">Proyek</option>
              <option value="quiz">Kuis</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
        </div>

        {/* Portfolio Grid */}
        {paginatedItems.length === 0 ? (
          <EmptyState
            icon="folder"
            title="Tidak Ada Portofolio"
            message={searchTerm || selectedSubject !== 'all' || selectedType !== 'all'
              ? 'Tidak ada portofolio yang sesuai dengan filter yang dipilih.'
              : 'Belum ada karya yang ditambahkan ke portofolio.'}
          />
        ) : (
          <>
            <div className="portfolio-grid">
              {paginatedItems.map((item) => (
                <Card
                  key={item.id}
                  variant="elevated"
                  className="portfolio-item-card"
                  onClick={() => handleViewDetail(item)}
                >
                  <div className="portfolio-item-header">
                    <div className="portfolio-type-badge">
                      <Icon name={TYPE_ICONS[item.type] as any} size={18} />
                      <Badge variant="info" size="small">
                        {TYPE_LABELS[item.type]}
                      </Badge>
                    </div>
                    {item.score !== undefined && (
                      <Badge variant={getScoreColor(item.score, item.maxScore)}>
                        {item.score}/{item.maxScore}
                      </Badge>
                    )}
                  </div>
                  <h3 className="portfolio-item-title">{item.title}</h3>
                  <div className="portfolio-item-meta">
                    <div className="meta-item">
                      <Icon name="book" size={14} style={{ marginRight: '0.25rem' }} />
                      {item.subject}
                    </div>
                    <div className="meta-item">
                      <Icon name="user" size={14} style={{ marginRight: '0.25rem' }} />
                      {item.teacher}
                    </div>
                  </div>
                  {item.description && (
                    <p className="portfolio-item-description">{item.description}</p>
                  )}
                  <div className="portfolio-item-footer">
                    <div className="footer-date">
                      <Icon name="calendar" size={14} style={{ marginRight: '0.25rem' }} />
                      {formatDate(item.submittedAt)}
                    </div>
                    {item.grade && (
                      <Badge variant="primary" size="small">
                        {item.grade}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedItem(null);
          }}
          title={selectedItem?.title || 'Detail Portofolio'}
          size="large"
        >
          {selectedItem && (
            <div className="portfolio-detail">
              <div className="detail-header-info">
                <div className="detail-badges">
                  <Badge variant="info">{TYPE_LABELS[selectedItem.type]}</Badge>
                  <Badge variant="secondary">{selectedItem.subject}</Badge>
                  {selectedItem.grade && (
                    <Badge variant="primary">{selectedItem.grade}</Badge>
                  )}
                </div>
                {selectedItem.score !== undefined && (
                  <div className="detail-score">
                    <div className="score-value">
                      <Badge variant={getScoreColor(selectedItem.score, selectedItem.maxScore)} size="large">
                        {selectedItem.score}/{selectedItem.maxScore}
                      </Badge>
                    </div>
                    <div className="score-percentage">
                      {((selectedItem.score / selectedItem.maxScore) * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>

              <div className="detail-info-grid">
                <div className="info-item">
                  <strong>Mata Pelajaran:</strong> {selectedItem.subject}
                </div>
                <div className="info-item">
                  <strong>Guru:</strong> {selectedItem.teacher}
                </div>
                <div className="info-item">
                  <strong>Dikirim:</strong> {formatDateTime(selectedItem.submittedAt)}
                </div>
                {selectedItem.gradedAt && (
                  <div className="info-item">
                    <strong>Dinilai:</strong> {formatDateTime(selectedItem.gradedAt)}
                  </div>
                )}
                <div className="info-item">
                  <strong>Semester:</strong> Semester {selectedItem.semester}
                </div>
                <div className="info-item">
                  <strong>Tahun Ajaran:</strong> {selectedItem.academicYear}
                </div>
              </div>

              {selectedItem.description && (
                <div className="detail-description">
                  <h4>Deskripsi</h4>
                  <p>{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.feedback && (
                <div className="detail-feedback">
                  <h4>Feedback Guru</h4>
                  <div className="feedback-content">
                    <p>{selectedItem.feedback}</p>
                  </div>
                </div>
              )}

              {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                <div className="detail-attachments">
                  <h4>Lampiran</h4>
                  <div className="attachments-list">
                    {selectedItem.attachments.map((file, index) => (
                      <div key={index} className="attachment-item">
                        <Icon name="document" size={18} style={{ marginRight: '0.5rem' }} />
                        <span>{file}</span>
                        <Button variant="outline" size="small">
                          <Icon name="download" size={14} style={{ marginRight: '0.25rem' }} />
                          Unduh
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedItem(null);
                  }}
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};
