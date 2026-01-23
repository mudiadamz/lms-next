import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Loading, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, formatDateTime, isPast } from '../../utils';
import { assignmentService, subjectService, userService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './ParentAssignmentDetail.css';

export const ParentAssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user?.id) return;
      
      try {
        setIsLoading(true);
        const parentData = await userService.getUserById(user.id);
        const studentIds = (parentData as any)?.studentIds || [];
        
        if (studentIds.length === 0) {
          setIsLoading(false);
          return;
        }

        const [assignmentData, submissionsData] = await Promise.all([
          assignmentService.getAssignmentById(id),
          assignmentService.getSubmissions(id).catch(() => []),
        ]);

        setAssignment(assignmentData);

        // Find submission for first child
        const childSubmission = submissionsData.find(s => studentIds.includes(s.studentId));
        setSubmission(childSubmission || null);

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
      <div className="parent-assignment-detail">
        <div className="detail-header">
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
                <strong>Nilai Anak:</strong>{' '}
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
              <h3>Lampiran Tugas</h3>
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

        {isSubmitted ? (
          <Card title="Tugas Anak">
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
              {submission.content && (
                <div className="submission-content">
                  <h4>Jawaban Anak:</h4>
                  <p>{submission.content}</p>
                </div>
              )}
              {submission.attachments && submission.attachments.length > 0 && (
                <div className="submission-attachments">
                  <h4>File Jawaban:</h4>
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

