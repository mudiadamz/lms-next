import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, FormInput, FormTextarea, FileUpload, Badge, Modal } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDateTime } from '../../utils';
import './GradingInterface.css';

const mockSubmission = {
  id: '1',
  assignmentTitle: 'Tugas Matematika - Aljabar',
  studentName: 'Budi Santoso',
  studentId: '1',
  submittedAt: new Date('2024-01-18T10:30:00'),
  content: 'Jawaban tugas matematika...',
  attachments: ['jawaban-aljabar.pdf'],
  currentScore: null as number | null,
  feedback: '',
};

export const GradingInterface = () => {
  const { assignmentId, submissionId } = useParams<{ assignmentId: string; submissionId: string }>();
  const navigate = useNavigate();
  const [score, setScore] = useState(mockSubmission.currentScore?.toString() || '');
  const [feedback, setFeedback] = useState(mockSubmission.feedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score || parseInt(score) < 0) {
      alert('Harap masukkan nilai yang valid');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call assignmentService.gradeSubmission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Gagal memberikan nilai');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="grading-interface">
        <div className="grading-header">
        </div>

        <Card title={`Penilaian: ${mockSubmission.assignmentTitle}`}>
          <div className="submission-info">
            <div className="info-row">
              <strong>Siswa:</strong> {mockSubmission.studentName}
            </div>
            <div className="info-row">
              <strong>Waktu Submit:</strong> {formatDateTime(mockSubmission.submittedAt)}
            </div>
          </div>
        </Card>

        <Card title="Jawaban Siswa">
          <div className="submission-content">
            <p>{mockSubmission.content}</p>
            {mockSubmission.attachments && mockSubmission.attachments.length > 0 && (
              <div className="submission-attachments">
                <h4>Lampiran:</h4>
                <ul>
                  {mockSubmission.attachments.map((file, index) => (
                    <li key={index}>
                      <a href="#" download>
                        📎 {file}
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
              max="100"
              placeholder="0-100"
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

