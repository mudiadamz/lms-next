import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Icon, EmptyState, Pagination, Modal, Loading, FormSelect, Button } from '../../components/common';
import { formatDate, formatDateTime } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { assignmentService, quizService, gradeService, subjectService, userService } from '../../services';
import './ParentPortfolio.css';

interface PortfolioItem {
  id: string;
  type: 'assignment' | 'project' | 'quiz';
  title: string;
  subject: string;
  subjectId: string;
  teacher: string;
  submittedAt: Date | string;
  gradedAt?: Date | string;
  score?: number;
  maxScore: number;
  grade?: string;
  feedback?: string;
  attachments?: string[];
  description?: string;
  semester?: number;
  academicYear?: string;
}

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

export const ParentPortfolio = () => {
  const { user } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 9;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const parentData = user?.id ? await userService.getUserById(user.id) : null;
        const studentIds = (parentData as any)?.studentIds || [];
        
        if (studentIds.length === 0) {
          setIsLoading(false);
          return;
        }

        const firstChild = await userService.getUserById(studentIds[0]);
        const classId = (firstChild as any)?.classId;

        const [assignmentsData, quizzesData, gradesData, subjectsData, teachersData] = await Promise.all([
          assignmentService.getAssignments(classId ? { classId } : {}),
          quizService.getQuizzes(classId ? { classId } : {}),
          Promise.all(studentIds.map((studentId: string) => gradeService.getGrades({ studentId }))).then(results => results.flat()),
          subjectService.getSubjects(),
          userService.getUsers('teacher'),
        ]);

        // Combine assignments, quizzes, and grades into portfolio items
        const items: PortfolioItem[] = [];
        
        // Add assignments with grades
        assignmentsData.forEach(assignment => {
          const grade = gradesData.find(g => g.assignmentId === assignment.id);
          if (grade || assignment.status === 'submitted') {
            items.push({
              id: assignment.id,
              type: 'assignment',
              title: assignment.title,
              subject: assignment.subjectId,
              subjectId: assignment.subjectId,
              teacher: assignment.teacherId,
              submittedAt: assignment.submittedAt || assignment.createdAt || Date.now(),
              gradedAt: grade?.createdAt,
              score: grade?.score,
              maxScore: grade?.maxScore || assignment.maxScore || 100,
              grade: grade?.grade,
              feedback: grade?.feedback,
              attachments: assignment.attachments,
              description: assignment.description,
            });
          }
        });

        // Add quizzes with grades
        quizzesData.forEach(quiz => {
          const grade = gradesData.find(g => g.quizId === quiz.id);
          if (grade || quiz.score !== null) {
            items.push({
              id: quiz.id,
              type: 'quiz',
              title: quiz.title,
              subject: quiz.subjectId,
              subjectId: quiz.subjectId,
              teacher: quiz.teacherId,
              submittedAt: quiz.submittedAt || quiz.createdAt || Date.now(),
              gradedAt: grade?.createdAt || quiz.gradedAt,
              score: grade?.score || quiz.score,
              maxScore: grade?.maxScore || quiz.maxScore || 100,
              grade: grade?.grade,
              feedback: grade?.feedback,
            });
          }
        });

        setPortfolioItems(items);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);
        const teacherMap: Record<string, string> = {};
        teachersData.forEach(t => { teacherMap[t.id] = t.fullName; });
        setTeachers(teacherMap);
      } catch (error) {
        console.error('Error loading portfolio:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const uniqueSubjects = Array.from(new Set(portfolioItems.map(item => item.subjectId).filter(Boolean)));
  const subjectOptions = [
    { value: 'all', label: 'Semua Mata Pelajaran' },
    ...uniqueSubjects.map((subjectId) => ({ value: subjectId, label: subjects[subjectId] || subjectId })),
  ];

  const filteredItems = portfolioItems.filter((item) => {
    const matchesSubject = selectedSubject === 'all' || item.subjectId === selectedSubject;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSemester = selectedSemester === 'all' || item.semester?.toString() === selectedSemester;
    return matchesSubject && matchesType && matchesSemester;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalItems = portfolioItems.length;
  const assignmentsCount = portfolioItems.filter((item) => item.type === 'assignment').length;
  const projectsCount = portfolioItems.filter((item) => item.type === 'project').length;
  const quizzesCount = portfolioItems.filter((item) => item.type === 'quiz').length;
  const averageScore =
    portfolioItems.filter((item) => item.score !== undefined).length > 0
      ? portfolioItems.reduce((sum, item) => sum + (item.score || 0), 0) /
        portfolioItems.filter((item) => item.score !== undefined).length
      : 0;

  const handleViewDetail = (item: PortfolioItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

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

export const ParentPortfolio = () => {
  const { user } = useAuth();
  // TODO: Filter portfolio items berdasarkan studentId dari user.studentId
  // const studentId = user?.studentId;

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 9;

  const filteredItems = portfolioItems.filter((item) => {
    const matchesSubject = selectedSubject === 'all' || item.subjectId === selectedSubject;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSemester = selectedSemester === 'all' || item.semester?.toString() === selectedSemester;
    return matchesSubject && matchesType && matchesSemester;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalItems = portfolioItems.length;
  const assignmentsCount = portfolioItems.filter((item) => item.type === 'assignment').length;
  const projectsCount = portfolioItems.filter((item) => item.type === 'project').length;
  const quizzesCount = portfolioItems.filter((item) => item.type === 'quiz').length;
  const averageScore =
    portfolioItems.filter((item) => item.score !== undefined).length > 0
      ? portfolioItems.reduce((sum, item) => sum + (item.score || 0), 0) /
        portfolioItems.filter((item) => item.score !== undefined).length
      : 0;

  const handleViewDetail = (item: PortfolioItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  return (
    <DashboardLayout>
      <div className="parent-portfolio">
        <div className="page-header">
          <h1>Portofolio Anak</h1>
        </div>

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
              {subjectOptions.map((subj) => (
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
              <option value="all">Semua Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : paginatedItems.length === 0 ? (
          <EmptyState
            icon="folder"
            title="Tidak Ada Portofolio"
            message={
              selectedSubject !== 'all' || selectedType !== 'all' || selectedSemester !== 'all'
                ? 'Tidak ada portofolio yang sesuai dengan filter yang dipilih.'
                : 'Belum ada karya yang ditambahkan ke portofolio anak Anda.'
            }
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
                      {subjects[item.subjectId] || item.subject}
                    </div>
                    <div className="meta-item">
                      <Icon name="user" size={14} style={{ marginRight: '0.25rem' }} />
                      {teachers[item.teacher] || item.teacher}
                    </div>
                  </div>
                  {item.description && (
                    <p className="portfolio-item-description">{item.description}</p>
                  )}
                  <div className="portfolio-item-footer">
                    <div className="footer-date">
                      <Icon name="calendar" size={14} style={{ marginRight: '0.25rem' }} />
                      {formatDate(new Date(item.submittedAt))}
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
                  <Badge variant="secondary">{subjects[selectedItem.subjectId] || selectedItem.subject}</Badge>
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
                  <strong>Mata Pelajaran:</strong> {subjects[selectedItem.subjectId] || selectedItem.subject}
                </div>
                <div className="info-item">
                  <strong>Guru:</strong> {teachers[selectedItem.teacher] || selectedItem.teacher}
                </div>
                <div className="info-item">
                  <strong>Dikirim:</strong> {formatDateTime(new Date(selectedItem.submittedAt))}
                </div>
                {selectedItem.gradedAt && (
                  <div className="info-item">
                    <strong>Dinilai:</strong> {formatDateTime(new Date(selectedItem.gradedAt))}
                  </div>
                )}
                {selectedItem.semester && (
                  <div className="info-item">
                    <strong>Semester:</strong> Semester {selectedItem.semester}
                  </div>
                )}
                {selectedItem.academicYear && (
                  <div className="info-item">
                    <strong>Tahun Ajaran:</strong> {selectedItem.academicYear}
                  </div>
                )}
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

