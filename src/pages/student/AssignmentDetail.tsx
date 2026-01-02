import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, FileUpload, FormTextarea, Modal } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, formatDateTime, isPast } from '../../utils';
import './AssignmentDetail.css';

const mockAssignment = {
  id: '1',
  title: 'Tugas Matematika - Aljabar',
  description: 'Kerjakan soal-soal aljabar berikut dengan benar. Upload jawaban dalam format PDF.',
  subject: 'Matematika',
  teacher: 'Ibu Siti',
  dueDate: new Date('2024-01-20T23:59:59'),
  maxScore: 100,
  attachments: ['soal-aljabar.pdf'],
};

const mockSubmission = {
  id: '1',
  content: '',
  submittedAt: null as Date | null,
  score: null as number | null,
};

export const StudentAssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(mockSubmission);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission.content.trim() && files.length === 0) {
      alert('Harap isi jawaban atau upload file');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call assignmentService.submitAssignment
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Gagal mengumpulkan tugas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverdue = isPast(mockAssignment.dueDate);
  const isSubmitted = submission.submittedAt !== null;

  return (
    <DashboardLayout>
      <div className="assignment-detail">
        <div className="detail-header">
          <Button variant="outline" onClick={() => navigate(ROUTES.STUDENT_ASSIGNMENTS)}>
            ← Kembali
          </Button>
        </div>

        <Card title={mockAssignment.title}>
          <div className="assignment-info">
            <div className="info-item">
              <strong>Mata Pelajaran:</strong> {mockAssignment.subject}
            </div>
            <div className="info-item">
              <strong>Guru:</strong> {mockAssignment.teacher}
            </div>
            <div className="info-item">
              <strong>Deadline:</strong>{' '}
              <Badge variant={isOverdue ? 'danger' : 'warning'}>
                {formatDateTime(mockAssignment.dueDate)}
              </Badge>
            </div>
            <div className="info-item">
              <strong>Nilai Maksimal:</strong> {mockAssignment.maxScore}
            </div>
            {submission.score !== null && (
              <div className="info-item">
                <strong>Nilai Anda:</strong>{' '}
                <Badge variant="success">{submission.score}/{mockAssignment.maxScore}</Badge>
              </div>
            )}
          </div>

          <div className="assignment-description">
            <h3>Deskripsi</h3>
            <p>{mockAssignment.description}</p>
          </div>

          {mockAssignment.attachments && mockAssignment.attachments.length > 0 && (
            <div className="assignment-attachments">
              <h3>Lampiran</h3>
              <ul>
                {mockAssignment.attachments.map((file, index) => (
                  <li key={index}>
                    <a href="#" download>
                      📎 {file}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {!isSubmitted ? (
          <Card title="Kerjakan Tugas">
            <form onSubmit={handleSubmit} className="submission-form">
              <FormTextarea
                label="Jawaban"
                value={submission.content}
                onChange={(e) => setSubmission({ ...submission, content: e.target.value })}
                rows={10}
                placeholder="Tulis jawaban Anda di sini..."
              />

              <FileUpload
                label="Upload File Jawaban (Opsional)"
                onFileSelect={setFiles}
                multiple={false}
                maxSize={10}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />

              <div className="form-actions">
                <Button type="submit" isLoading={isSubmitting} disabled={isOverdue}>
                  {isOverdue ? 'Deadline Sudah Lewat' : 'Kumpulkan Tugas'}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card title="Tugas Anda">
            <div className="submission-info">
              <p>
                <strong>Status:</strong> <Badge variant="success">Sudah Dikumpulkan</Badge>
              </p>
              <p>
                <strong>Waktu Submit:</strong> {formatDateTime(submission.submittedAt!)}
              </p>
              {submission.score !== null && (
                <p>
                  <strong>Nilai:</strong> {submission.score}/{mockAssignment.maxScore}
                </p>
              )}
            </div>
          </Card>
        )}

        <Modal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            navigate(ROUTES.STUDENT_ASSIGNMENTS);
          }}
          title="Berhasil"
          size="small"
        >
          <p>Tugas berhasil dikumpulkan!</p>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

