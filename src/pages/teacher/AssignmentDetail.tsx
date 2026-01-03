import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Table, ConfirmDialog } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, formatDateTime } from '../../utils';
import './AssignmentDetail.css';

const mockAssignment = {
  id: '1',
  title: 'Tugas Matematika - Aljabar',
  description: 'Kerjakan soal-soal aljabar berikut dengan benar. Upload jawaban dalam format PDF.',
  subject: 'Matematika',
  class: 'X IPA 1',
  dueDate: new Date('2024-01-20T23:59:59'),
  maxScore: 100,
  createdAt: new Date('2024-01-15'),
  attachments: ['soal-aljabar.pdf'],
};

const mockSubmissions = [
  {
    id: '1',
    studentName: 'Budi Santoso',
    submittedAt: new Date('2024-01-18T10:30:00'),
    score: 85,
    status: 'graded',
  },
  {
    id: '2',
    studentName: 'Siti Nurhaliza',
    submittedAt: new Date('2024-01-19T14:20:00'),
    status: 'submitted',
  },
];

export const AssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // TODO: Call assignmentService.deleteAssignment
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
    },
    {
      key: 'submittedAt',
      header: 'Waktu Submit',
      render: (item: typeof mockSubmissions[0]) =>
        item.submittedAt ? formatDateTime(item.submittedAt) : '-',
    },
    {
      key: 'score',
      header: 'Nilai',
      render: (item: typeof mockSubmissions[0]) =>
        item.score ? (
          <Badge variant="success">{item.score}/{mockAssignment.maxScore}</Badge>
        ) : (
          <Badge variant="warning">Belum dinilai</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: typeof mockSubmissions[0]) => (
        <Link to={`${ROUTES.TEACHER_ASSIGNMENTS}/${mockAssignment.id}/submissions/${item.id}/grade`}>
          <Button variant="outline" size="small">
            {item.score ? 'Lihat' : 'Nilai'}
          </Button>
        </Link>
      ),
    },
  ];

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

        <Card title={mockAssignment.title}>
          <div className="assignment-info">
            <div className="info-item">
              <strong>Mata Pelajaran:</strong> {mockAssignment.subject}
            </div>
            <div className="info-item">
              <strong>Kelas:</strong> {mockAssignment.class}
            </div>
            <div className="info-item">
              <strong>Deadline:</strong>{' '}
              <Badge variant={new Date() > mockAssignment.dueDate ? 'danger' : 'warning'}>
                {formatDateTime(mockAssignment.dueDate)}
              </Badge>
            </div>
            <div className="info-item">
              <strong>Nilai Maksimal:</strong> {mockAssignment.maxScore}
            </div>
            <div className="info-item">
              <strong>Dibuat:</strong> {formatDate(mockAssignment.createdAt)}
            </div>
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

        <Card title="Pengumpulan Tugas">
          <div className="submissions-stats">
            <div className="stat-item">
              <span className="stat-label">Total Siswa:</span>
              <span className="stat-value">30</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sudah Submit:</span>
              <span className="stat-value">{mockSubmissions.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sudah Dinilai:</span>
              <span className="stat-value">
                {mockSubmissions.filter((s) => s.score).length}
              </span>
            </div>
          </div>

          <Table columns={submissionColumns} data={mockSubmissions} />
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

