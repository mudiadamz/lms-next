import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon, EmptyState, Pagination, Modal, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, formatDateTime, getFileUrl, getFileName } from '../../utils';
import { assignmentService, quizService, gradeService, subjectService, userService } from '../../services';
import './StudentPortfolio.css';

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
  quiz: 'Kuis/Test/Ujian',
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
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 9;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const studentData = user?.id ? await userService.getUserById(user.id) : null;
        const classId = (studentData as any)?.classId;

        const [assignmentsData, quizzesData, gradesData, subjectsData] = await Promise.all([
          assignmentService.getAssignments(classId ? { classId } : {}),
          quizService.getQuizzes(classId ? { classId } : {}),
          gradeService.getGrades(user?.id ? { studentId: user.id } : {}),
          subjectService.getSubjects(),
        ]);

        // Combine assignments, quizzes, and grades into portfolio items
        const items: PortfolioItem[] = [];
        
        // Extract teacher names from assignments and quizzes (backend already includes teacherName via JOIN)
        const teacherMap: Record<string, string> = {};
        
        // Add assignments with grades
        assignmentsData.forEach((assignment: any) => {
          // Store teacher name from assignment
          if (assignment.teacherId && assignment.teacherName) {
            teacherMap[assignment.teacherId] = assignment.teacherName;
          }
          
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
        quizzesData.forEach((quiz: any) => {
          // Store teacher name from quiz
          if (quiz.teacherId && quiz.teacherName) {
            teacherMap[quiz.teacherId] = quiz.teacherName;
          }
          
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

  const totalPages = Math.ceil(portfolioItems.length / itemsPerPage);
  const paginatedItems = portfolioItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetail = (item: PortfolioItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // Calculate statistics
  const gradedItems = portfolioItems.filter(item => item.score !== undefined && item.score !== null);
  console.log('Portfolio items:', portfolioItems.length);
  console.log('Graded items:', gradedItems.length);
  console.log('Graded items detail:', gradedItems);
  const averageScore = gradedItems.length > 0
    ? gradedItems.reduce((sum, item) => sum + (item.score! / item.maxScore * 100), 0) / gradedItems.length
    : 0;
  console.log('Average score:', averageScore);
  
  const subjectScores: Record<string, { total: number; count: number; name: string }> = {};
  gradedItems.forEach(item => {
    if (!subjectScores[item.subjectId]) {
      subjectScores[item.subjectId] = { 
        total: 0, 
        count: 0, 
        name: subjects[item.subjectId] || item.subject 
      };
    }
    subjectScores[item.subjectId].total += (item.score! / item.maxScore * 100);
    subjectScores[item.subjectId].count += 1;
  });

  return (
    <DashboardLayout>
      <div className="student-portfolio">
        <div className="page-header">
          <h1>Nilai</h1>
        </div>

        {/* Grades Summary */}
        {!isLoading && gradedItems.length > 0 && (
          <div className="grades-summary" style={{ marginBottom: '1.5rem' }}>
            <Card title="Ringkasan Nilai" variant="elevated">
              <div className="summary-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="stat-box" style={{ 
                  padding: '1rem', 
                  backgroundColor: 'var(--ios-secondary-background)', 
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--ios-blue)' }}>
                    {averageScore.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--ios-gray)', marginTop: '0.25rem' }}>
                    Rata-rata Nilai
                  </div>
                </div>
                <div className="stat-box" style={{ 
                  padding: '1rem', 
                  backgroundColor: 'var(--ios-secondary-background)', 
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--ios-blue)' }}>
                    {gradedItems.length}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--ios-gray)', marginTop: '0.25rem' }}>
                    Total Nilai
                  </div>
                </div>
              </div>
              
              {Object.keys(subjectScores).length > 0 && (
                <div className="subject-grades">
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>Nilai Per Mata Pelajaran</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.entries(subjectScores).map(([subjectId, data]) => {
                      const avg = data.total / data.count;
                      return (
                        <div key={subjectId} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '0.75rem',
                          backgroundColor: 'var(--ios-secondary-background)',
                          borderRadius: '8px',
                          border: '0.5px solid var(--ios-separator)'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{data.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--ios-gray)' }}>
                              {data.count} nilai
                            </div>
                          </div>
                          <Badge variant={getScoreColor(avg, 100)} size="large">
                            {avg.toFixed(1)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Portfolio Grid */}
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600 }}>Riwayat Tugas & Kuis</h2>
        {isLoading ? (
          <Loading />
        ) : paginatedItems.length === 0 ? (
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
                        <span>{getFileName(file)}</span>
                        <a href={getFileUrl(file)} download target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="small">
                            <Icon name="download" size={14} style={{ marginRight: '0.25rem' }} />
                            Unduh
                          </Button>
                        </a>
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
