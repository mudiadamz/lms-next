import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon, EmptyState, Pagination, Modal } from '../../components/common';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 9;

  const totalPages = Math.ceil(mockPortfolioItems.length / itemsPerPage);
  const paginatedItems = mockPortfolioItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

        {/* Portfolio Grid */}
        {paginatedItems.length === 0 ? (
          <EmptyState
            icon="folder"
            title="Tidak Ada Portofolio"
            message="Belum ada karya yang ditambahkan ke portofolio."
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
