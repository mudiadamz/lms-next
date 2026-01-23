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
  const [assignment, setAssignment] = useState<any>(null);
  const [studentName, setStudentName] = useState('');
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        const submissionData = submissionsData.find(s => s.id === submissionId);
        
        if (submissionData) {
          setSubmission(submissionData);
          setScore(submissionData.score?.toString() || '');
          setFeedback(submissionData.feedback || '');

          // Get student name
          const student = await userService.getUserById(submissionData.studentId);
          setStudentName(student.fullName);
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
        </div>

        <Card title={`Penilaian: ${assignment.title}`}>
          <div className="submission-info">
            <div className="info-row">
              <strong>Siswa:</strong> {studentName}
            </div>
            <div className="info-row">
              <strong>Waktu Submit:</strong> {formatDateTime(new Date(submission.submittedAt))}
            </div>
          </div>
        </Card>

        <Card title="Jawaban Siswa">
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
                onClick={() => navigate(`${ROUTES.TEACHER_ASSIGNMENTS}/${assignmentId}`)}
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
            navigate(`${ROUTES.TEACHER_ASSIGNMENTS}/${assignmentId}`);
          }}
          title="Berhasil"
          size="small"
        >
          <p>Nilai berhasil disimpan!</p>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

