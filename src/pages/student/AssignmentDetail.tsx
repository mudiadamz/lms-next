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

        // Get subject and teacher names
        const [subjectInfo, teacherInfo] = await Promise.all([
          subjectService.getSubjectById(assignmentData.subjectId),
          userService.getUserById(assignmentData.teacherId),
        ]);

        setSubjectName(subjectInfo.name);
        setTeacherName(teacherInfo.fullName);
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

    setIsSubmitting(true);
    try {
      await assignmentService.submitAssignment(id, {
        content,
        attachments: [], // TODO: Handle file uploads
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Gagal mengumpulkan tugas');
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
        ) : !isSubmitted ? (
          <Card title="Kerjakan Tugas">
            <form onSubmit={handleSubmit} className="submission-form">
              <FormTextarea
                label="Jawaban"
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
                <strong>Waktu Submit:</strong> {formatDateTime(new Date(submission.submittedAt))}
              </p>
              {submission.score !== null && submission.score !== undefined && (
                <p>
                  <strong>Nilai:</strong> {submission.score}/{assignment.maxScore}
                </p>
              )}
              {submission.feedback && (
                <div className="feedback-section">
                  <h4>Feedback Guru:</h4>
                  <p>{submission.feedback}</p>
                </div>
              )}
            </div>
          </Card>
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
          <p>Tugas berhasil dikumpulkan!</p>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

