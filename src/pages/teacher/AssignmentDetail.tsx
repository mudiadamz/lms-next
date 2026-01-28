import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Table, ConfirmDialog, Loading, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, formatDateTime, getFileUrl, getFileName } from '../../utils';
import { assignmentService, classService, subjectService, userService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './AssignmentDetail.css';

export const AssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<Record<string, string>>({});
  const [className, setClassName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [assignmentData, submissionsData] = await Promise.all([
          assignmentService.getAssignmentById(id),
          assignmentService.getSubmissions(id).catch(() => []), // Submissions might not exist yet
        ]);

        setAssignment(assignmentData);
        setSubmissions(submissionsData);

        // Get class and subject names
        const [classInfo, subjectInfo] = await Promise.all([
          classService.getClassById(assignmentData.classId),
          subjectService.getSubjectById(assignmentData.subjectId),
        ]);

        setClassName(classInfo.name);
        setSubjectName(subjectInfo.name);

        // Get student names
        const studentIds = [...new Set(submissionsData.map(s => s.studentId))];
        const studentsData = await Promise.all(
          studentIds.map((studentId: string) => userService.getUserById(studentId))
        );
        const studentMap: Record<string, string> = {};
        studentsData.forEach(s => { studentMap[s.id] = s.fullName; });
        setStudents(studentMap);
      } catch (error) {
        console.error('Error loading assignment detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await assignmentService.deleteAssignment(id);
      navigate(ROUTES.TEACHER_ASSIGNMENTS);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Gagal menghapus tugas');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const submissionColumns = [
    {
      key: 'studentName',
      header: 'Nama Siswa',
      render: (item: any) => students[item.studentId] || item.studentId,
    },
    {
      key: 'submittedAt',
      header: 'Waktu Submit',
      render: (item: any) =>
        item.submittedAt ? formatDateTime(new Date(item.submittedAt)) : '-',
    },
    {
      key: 'attachments',
      header: 'Lampiran',
      render: (item: any) => {
        const attachments = item.attachments || [];
        return attachments.length > 0 ? (
          <Badge variant="info">{attachments.length} file</Badge>
        ) : (
          <span style={{ color: 'var(--ios-gray)', fontSize: '0.85rem' }}>-</span>
        );
      },
    },
    {
      key: 'score',
      header: 'Nilai',
      render: (item: any) =>
        item.score !== null && item.score !== undefined ? (
          <Badge variant="success">{item.score}/{assignment?.maxScore || 100}</Badge>
        ) : (
          <Badge variant="warning">Belum dinilai</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: any) => (
        <Link to={`${ROUTES.TEACHER_ASSIGNMENTS}/${id}/submissions/${item.id}/grade`}>
          <Button variant="outline" size="small">
            {item.score !== null && item.score !== undefined ? 'Lihat' : 'Nilai'}
          </Button>
        </Link>
      ),
    },
  ];

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

  const totalStudents = 30; // TODO: Get from class data
  const gradedCount = submissions.filter(s => s.score !== null && s.score !== undefined).length;

  return (
    <DashboardLayout>
      <div className="assignment-detail">
        <div className="detail-header">
          <div className="detail-actions">
            <Link to={`${ROUTES.TEACHER_ASSIGNMENTS}/${id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <Button variant="danger" onClick={() => setShowDeleteDialog(true)}>
              Hapus
            </Button>
          </div>
        </div>

        <Card title={assignment.title}>
          <div className="assignment-info">
            <div className="info-item">
              <strong>Mata Pelajaran:</strong> {subjectName}
            </div>
            <div className="info-item">
              <strong>Kelas:</strong> {className}
            </div>
            <div className="info-item">
              <strong>Waktu Mulai:</strong> {formatDateTime(new Date(assignment.startDate || assignment.createdAt))}
            </div>
            <div className="info-item">
              <strong>Deadline:</strong>{' '}
              <Badge variant={new Date() > new Date(assignment.dueDate) ? 'danger' : 'warning'}>
                {formatDateTime(new Date(assignment.dueDate))}
              </Badge>
            </div>
            <div className="info-item">
              <strong>Nilai Maksimal:</strong> {assignment.maxScore}
            </div>
            <div className="info-item">
              <strong>Dibuat:</strong> {formatDate(new Date(assignment.createdAt))}
            </div>
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
                    <a href={getFileUrl(file)} download target="_blank" rel="noopener noreferrer">
                      📎 {getFileName(file)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card title="Pengumpulan Tugas">
          <div className="submissions-stats">
            <div className="stat-item">
              <span className="stat-label">Total Siswa:</span>
              <span className="stat-value">{totalStudents}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sudah Submit:</span>
              <span className="stat-value">{submissions.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sudah Dinilai:</span>
              <span className="stat-value">{gradedCount}</span>
            </div>
          </div>

          {submissions.length === 0 ? (
            <EmptyState icon="assignment" title="Belum Ada Pengumpulan" message="Belum ada siswa yang mengumpulkan tugas ini." />
          ) : (
            <Table columns={submissionColumns} data={submissions} />
          )}
        </Card>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Hapus Tugas"
          message="Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan."
          confirmLabel="Hapus"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
};

