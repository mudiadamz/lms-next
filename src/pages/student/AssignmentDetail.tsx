import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, FileUpload, FormTextarea, Modal, Loading, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, formatDateTime, isPast } from '../../utils';
import { assignmentService, subjectService, userService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './AssignmentDetail.css';

interface StudentAssignmentDetailProps {
  readOnly?: boolean;
}

export const StudentAssignmentDetail = ({ readOnly = false }: StudentAssignmentDetailProps = {} as StudentAssignmentDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user?.id) return;
      
      try {
        setIsLoading(true);
        const [assignmentData, submissionsData] = await Promise.all([
          assignmentService.getAssignmentById(id),
          assignmentService.getSubmissions(id).catch(() => []),
        ]);

        setAssignment(assignmentData);

        // Find student's submission
        const studentSubmission = submissionsData.find(s => s.studentId === user.id);
        if (studentSubmission) {
          setSubmission(studentSubmission);
          setContent(studentSubmission.content || '');
        }

        // Get subject name - teacher name already included in assignment data
        const subjectInfo = await subjectService.getSubjectById(assignmentData.subjectId);
        setSubjectName(subjectInfo.name);
        setTeacherName((assignmentData as any).teacherName || 'Unknown');
      } catch (error) {
        console.error('Error loading assignment detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !content.trim() && files.length === 0) {
      alert('Harap isi jawaban atau upload file');
      return;
    }

    // Confirm if resubmitting
    if (isSubmitted && !isGraded) {
      const confirm = window.confirm(
        'Anda sudah mengumpulkan jawaban sebelumnya. Apakah Anda yakin ingin merevisi jawaban?\n\nJawaban lama akan diganti dengan jawaban baru.'
      );
      if (!confirm) return;
    }

    setIsSubmitting(true);
    try {
      await assignmentService.submitAssignment(id, {
        content,
        attachments: [], // TODO: Handle file uploads
      });
      
      // Reload to get updated submission
      const submissionsData = await assignmentService.getSubmissions(id).catch(() => []);
      const studentSubmission = submissionsData.find(s => s.studentId === user?.id);
      if (studentSubmission) {
        setSubmission(studentSubmission);
      }
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengumpulkan tugas');
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

  if (!assignment) {
    return (
      <DashboardLayout>
        <EmptyState icon="assignment" title="Tugas Tidak Ditemukan" message="Tugas yang Anda cari tidak ditemukan." />
      </DashboardLayout>
    );
  }

  const isOverdue = isPast(new Date(assignment.dueDate));
  const isSubmitted = submission !== null;
  const isGraded = submission?.score !== null && submission?.score !== undefined;
  const canEdit = !readOnly && !isOverdue && !isGraded; // Can edit if not graded yet

  return (
    <DashboardLayout>
      <div className="assignment-detail">
        <div className="detail-header">
          <Button variant="outline" onClick={() => navigate(ROUTES.STUDENT_ASSIGNMENTS)}>
            ← Kembali
          </Button>
        </div>

        <Card title={assignment.title}>
          <div className="assignment-info">
            <div className="info-item">
              <strong>Mata Pelajaran:</strong> {subjectName}
            </div>
            <div className="info-item">
              <strong>Guru:</strong> {teacherName}
            </div>
            <div className="info-item">
              <strong>Deadline:</strong>{' '}
              <Badge variant={isOverdue ? 'danger' : 'warning'}>
                {formatDateTime(new Date(assignment.dueDate))}
              </Badge>
            </div>
            <div className="info-item">
              <strong>Nilai Maksimal:</strong> {assignment.maxScore}
            </div>
            <div className="info-item">
              <strong>Waktu Mulai:</strong> {formatDateTime(new Date(assignment.startDate || assignment.createdAt))}
            </div>
            {submission?.score !== null && submission?.score !== undefined && (
              <div className="info-item">
                <strong>Nilai Anda:</strong>{' '}
                <Badge variant="success">{submission.score}/{assignment.maxScore}</Badge>
              </div>
            )}
          </div>

          <div className="assignment-description">
            <h3>Deskripsi</h3>
            <p>{assignment.description}</p>
          </div>

          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="assignment-attachments">
              <h3>Lampiran</h3>
              <ul>
                {assignment.attachments.map((file: string, index: number) => (
                  <li key={index}>
                    <a href={file} download target="_blank" rel="noopener noreferrer">
                      📎 {file.split('/').pop() || file}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {readOnly ? (
          <Card title="Informasi Tugas">
            <div className="info-note" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <p>Sebagai orang tua, Anda dapat melihat detail tugas ini tetapi tidak dapat mengerjakan tugas.</p>
            </div>
          </Card>
        ) : canEdit ? (
          <>
            {/* Show status if already submitted */}
            {isSubmitted && (
              <Card title="Status" variant="elevated">
                <div style={{ padding: '0.5rem' }}>
                  <Badge variant="warning">Menunggu Penilaian</Badge>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--ios-gray)' }}>
                    Waktu Submit: {formatDateTime(new Date(submission.submittedAt))}
                  </p>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--ios-blue)' }}>
                    💡 Anda masih bisa merevisi jawaban sebelum guru memberikan nilai.
                  </p>
                </div>
              </Card>
            )}
            
            {/* Form - always show if can edit */}
            <Card title={isSubmitted ? "Revisi Jawaban" : "Kerjakan Tugas"} variant="elevated">
              <form onSubmit={handleSubmit} className="submission-form">
                <FormTextarea
                  label="Jawaban"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder="Tulis jawaban Anda di sini..."
                  required
                />

                <FileUpload
                  label="Upload File Jawaban (Opsional)"
                  onFileSelect={setFiles}
                  multiple={false}
                  maxSize={10}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />

                <div className="form-actions">
                  <Button type="submit" isLoading={isSubmitting}>
                    {isSubmitted ? 'Update Jawaban' : 'Kumpulkan Tugas'}
                  </Button>
                </div>
              </form>
            </Card>
          </>
        ) : (
          <>
            {/* Status Card */}
            <Card title="Status Tugas" variant="elevated">
              <div className="submission-info">
                {isSubmitted ? (
                  <>
                    <p>
                      <strong>Status:</strong>{' '}
                      <Badge variant={isGraded ? 'success' : 'warning'}>
                        {isGraded ? 'Sudah Dinilai' : 'Menunggu Penilaian'}
                      </Badge>
                    </p>
                    <p>
                      <strong>Waktu Submit:</strong> {formatDateTime(new Date(submission.submittedAt))}
                    </p>
                    {isGraded && (
                      <>
                        <p>
                          <strong>Nilai:</strong>{' '}
                          <Badge variant="success" style={{ fontSize: '1.1rem', padding: '0.5rem 1rem' }}>
                            {submission.score}/{assignment.maxScore} ({Math.round((submission.score / assignment.maxScore) * 100)}%)
                          </Badge>
                        </p>
                        {submission.feedback && (
                          <div className="feedback-section" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--accent-blue)', borderRadius: '8px', borderLeft: '3px solid var(--ios-blue)' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--ios-blue)' }}>Feedback Guru:</h4>
                            <p style={{ margin: 0, lineHeight: '1.6' }}>{submission.feedback}</p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : isOverdue ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <Badge variant="danger" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                      Deadline Sudah Lewat
                    </Badge>
                    <p style={{ marginTop: '0.75rem', color: 'var(--ios-gray)' }}>
                      Anda tidak dapat lagi mengumpulkan tugas ini.
                    </p>
                  </div>
                ) : null}
              </div>
            </Card>

            {/* Jawaban Siswa Card */}
            {isSubmitted && (
              <Card title="Jawaban Anda" variant="elevated">
                <div className="submission-content">
                  <div className="answer-text">
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--ios-gray)' }}>Jawaban:</h4>
                    <p style={{ 
                      padding: '1rem', 
                      backgroundColor: 'var(--ios-secondary-background)', 
                      borderRadius: '8px',
                      border: '0.5px solid var(--ios-separator)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {submission.content || 'Tidak ada konten'}
                    </p>
                  </div>
                  {submission.attachments && submission.attachments.length > 0 && (
                    <div className="submission-attachments" style={{ marginTop: '1.5rem' }}>
                      <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--ios-gray)' }}>
                        Lampiran ({submission.attachments.length}):
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {submission.attachments.map((file: string, index: number) => (
                          <a 
                            key={index}
                            href={file} 
                            download 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.75rem',
                              backgroundColor: 'var(--ios-secondary-background)',
                              borderRadius: '8px',
                              border: '0.5px solid var(--ios-separator)',
                              textDecoration: 'none',
                              color: 'var(--ios-blue)',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-blue)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--ios-secondary-background)'}
                          >
                            <span style={{ fontSize: '1.5rem' }}>📎</span>
                            <span style={{ flex: 1, fontWeight: '500' }}>
                              {file.split('/').pop() || file}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--ios-gray)' }}>
                              Download →
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </>
        )}

        <Modal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            navigate(readOnly ? ROUTES.PARENT_ASSIGNMENTS : ROUTES.STUDENT_ASSIGNMENTS);
          }}
          title="Berhasil"
          size="small"
        >
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              {isSubmitted ? 'Jawaban berhasil direvisi!' : 'Tugas berhasil dikumpulkan!'}
            </p>
            <Button onClick={() => {
              setShowSuccessModal(false);
              navigate(readOnly ? ROUTES.PARENT_ASSIGNMENTS : ROUTES.STUDENT_ASSIGNMENTS);
            }}>
              Kembali ke Tugas
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

