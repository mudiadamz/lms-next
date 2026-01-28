import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormInput, FormTextarea, FileUpload, Badge, Modal, Loading, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime } from '../../utils';
import { assignmentService, userService } from '../../services';
import './GradingInterface.css';

export const GradingInterface = () => {
  const { assignmentId, submissionId } = useParams<{ assignmentId: string; submissionId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assignment, setAssignment] = useState<any>(null);
  const [studentName, setStudentName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!assignmentId || !submissionId) return;
      
      try {
        setIsLoading(true);
        const [assignmentData, submissionsData] = await Promise.all([
          assignmentService.getAssignmentById(assignmentId),
          assignmentService.getSubmissions(assignmentId),
        ]);

        setAssignment(assignmentData);
        setSubmissions(submissionsData);
        
        // If submissionId is 'all', show list of all submissions
        if (submissionId === 'all') {
          setShowAllSubmissions(true);
        } else {
          const submissionData = submissionsData.find(s => s.id === submissionId);
          
          if (submissionData) {
            setSubmission(submissionData);
            setScore(submissionData.score?.toString() || '');
            setFeedback(submissionData.feedback || '');
            setStudentName((submissionData as any).studentName || submissionData.studentId);
            setStudentNumber((submissionData as any).studentNumber || '');
          }
        }
      } catch (error) {
        console.error('Error loading submission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [assignmentId, submissionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId || !score || parseInt(score) < 0) {
      alert('Harap masukkan nilai yang valid');
      return;
    }

    setIsSubmitting(true);
    try {
      await assignmentService.gradeSubmission(submissionId, parseFloat(score), feedback || undefined);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Gagal memberikan nilai');
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

  // Show list of all submissions if submissionId is 'all'
  if (showAllSubmissions && assignment) {
    const ungradedSubmissions = submissions.filter(s => s.score === null || s.score === undefined);
    
    return (
      <DashboardLayout>
        <div className="grading-interface">
          <div className="grading-header">
            <h1>Penilaian: {assignment.title}</h1>
          </div>

          <Card title={`Pengumpulan (${submissions.length} total, ${ungradedSubmissions.length} belum dinilai)`} variant="elevated">
            {ungradedSubmissions.length === 0 ? (
              <EmptyState
                icon="checkCircle"
                title="Semua Sudah Dinilai"
                message="Semua pengumpulan untuk tugas ini sudah dinilai."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ungradedSubmissions.map((sub) => (
                  <Card key={sub.id} variant="elevated">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{sub.studentName || sub.studentId}</strong>
                        <div style={{ fontSize: '0.875rem', color: 'var(--ios-gray)', marginTop: '0.25rem' }}>
                          Submit: {formatDateTime(new Date(sub.submittedAt))}
                        </div>
                      </div>
                      <Button
                        size="small"
                        onClick={() => navigate(`/teacher/assignments/${assignmentId}/submissions/${sub.id}/grade`)}
                      >
                        Nilai
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!submission || !assignment) {
    return (
      <DashboardLayout>
        <EmptyState icon="assignment" title="Pengumpulan Tidak Ditemukan" message="Pengumpulan tugas yang Anda cari tidak ditemukan." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grading-interface">
        <div className="grading-header">
          <h1>Penilaian: {assignment.title}</h1>
        </div>

        <Card title={`Penilaian: ${assignment.title}`}>
          <div className="submission-info">
            <div className="info-row">
              <strong>Siswa:</strong> {studentName}
            </div>
            {studentNumber && (
              <div className="info-row">
                <strong>NIS:</strong> {studentNumber}
              </div>
            )}
            <div className="info-row">
              <strong>Waktu Submit:</strong> {formatDateTime(new Date(submission.submittedAt))}
            </div>
          </div>
        </Card>

        {assignment.description && (
          <Card title="Soal / Deskripsi Tugas" variant="elevated">
            <div className="assignment-question">
              <p>{assignment.description}</p>
            </div>
          </Card>
        )}

        <Card title="Jawaban Siswa" variant="elevated">
          <div className="submission-content">
            <p>{submission.content || 'Tidak ada konten'}</p>
            {submission.attachments && submission.attachments.length > 0 && (
              <div className="submission-attachments">
                <h4>Lampiran:</h4>
                <ul>
                  {submission.attachments.map((file: string, index: number) => (
                    <li key={index}>
                      <a href={file} download target="_blank" rel="noopener noreferrer">
                        📎 {file.split('/').pop() || file}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        <Card title="Penilaian">
          <form onSubmit={handleSubmit} className="grading-form">
            <FormInput
              label="Nilai"
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
              min="0"
              max={assignment.maxScore || 100}
              placeholder={`0-${assignment.maxScore || 100}`}
            />

            <FormTextarea
              label="Feedback (Opsional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              placeholder="Berikan feedback untuk siswa..."
            />

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.TEACHER_GRADING)}
              >
                Batal
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Simpan Nilai
              </Button>
            </div>
          </form>
        </Card>

        <Modal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            navigate(ROUTES.TEACHER_GRADING);
          }}
          title="Berhasil"
          size="small"
        >
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <p style={{ marginBottom: '1rem' }}>Nilai berhasil disimpan!</p>
            <Button onClick={() => {
              setShowSuccessModal(false);
              navigate(ROUTES.TEACHER_GRADING);
            }}>
              Kembali ke Penilaian
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

