import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, formatDateTime, isPast } from '../../utils';
import './ParentAssignmentDetail.css';

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
  content: 'Saya sudah mengerjakan tugas ini dengan baik. Berikut adalah jawaban saya...',
  submittedAt: new Date('2024-01-19T14:30:00'),
  score: 85,
  feedback: 'Kerja bagus! Perlu lebih teliti dalam perhitungan.',
  attachments: ['jawaban-aljabar.pdf'],
};

export const ParentAssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isOverdue = isPast(mockAssignment.dueDate);
  const isSubmitted = mockSubmission.submittedAt !== null;

  return (
    <DashboardLayout>
      <div className="parent-assignment-detail">
        <div className="detail-header">
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
            {mockSubmission.score !== null && (
              <div className="info-item">
                <strong>Nilai Anak:</strong>{' '}
                <Badge variant="success">{mockSubmission.score}/{mockAssignment.maxScore}</Badge>
              </div>
            )}
          </div>

          <div className="assignment-description">
            <h3>Deskripsi</h3>
            <p>{mockAssignment.description}</p>
          </div>

          {mockAssignment.attachments && mockAssignment.attachments.length > 0 && (
            <div className="assignment-attachments">
              <h3>Lampiran Tugas</h3>
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

        {isSubmitted ? (
          <Card title="Tugas Anak">
            <div className="submission-info">
              <p>
                <strong>Status:</strong> <Badge variant="success">Sudah Dikumpulkan</Badge>
              </p>
              <p>
                <strong>Waktu Submit:</strong> {formatDateTime(mockSubmission.submittedAt!)}
              </p>
              {mockSubmission.score !== null && (
                <p>
                  <strong>Nilai:</strong> {mockSubmission.score}/{mockAssignment.maxScore}
                </p>
              )}
              {mockSubmission.feedback && (
                <div className="feedback-section">
                  <h4>Feedback Guru:</h4>
                  <p>{mockSubmission.feedback}</p>
                </div>
              )}
              {mockSubmission.content && (
                <div className="submission-content">
                  <h4>Jawaban Anak:</h4>
                  <p>{mockSubmission.content}</p>
                </div>
              )}
              {mockSubmission.attachments && mockSubmission.attachments.length > 0 && (
                <div className="submission-attachments">
                  <h4>File Jawaban:</h4>
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
        ) : (
          <Card title="Status Tugas">
            <div className="submission-info">
              <p>
                <strong>Status:</strong>{' '}
                <Badge variant={isOverdue ? 'danger' : 'secondary'}>
                  {isOverdue ? 'Belum Dikumpulkan (Terlambat)' : 'Belum Dikumpulkan'}
                </Badge>
              </p>
              <p className="info-note">
                Anak Anda belum mengumpulkan tugas ini. Silakan ingatkan untuk mengerjakan tugas.
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

