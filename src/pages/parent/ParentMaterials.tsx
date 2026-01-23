import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Button, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import './ParentMaterials.css';

const mockMaterials = [
  {
    id: '1',
    title: 'Pengenalan Aljabar',
    type: 'document',
    subject: 'Matematika',
    teacher: 'Ibu Siti',
    createdAt: new Date('2024-01-15'),
    description: 'Materi pengenalan dasar aljabar untuk kelas X',
  },
  {
    id: '2',
    title: 'Video Pembelajaran: Persamaan Linear',
    type: 'video',
    subject: 'Matematika',
    teacher: 'Ibu Siti',
    createdAt: new Date('2024-01-16'),
    description: 'Video penjelasan tentang persamaan linear',
  },
];

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    document: '📄 Dokumen',
    video: '🎥 Video',
    presentation: '📊 Presentasi',
    link: '🔗 Link',
  };
  return labels[type] || '📎 File';
};

export const ParentMaterials = () => {
  const { user } = useAuth();
  // TODO: Filter materials berdasarkan studentId dari user.studentId
  // const studentId = user?.studentId;

  return (
    <DashboardLayout>
      <div className="parent-materials">
        <h1>Materi Pembelajaran Anak</h1>

        {mockMaterials.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Tidak Ada Materi"
            message="Belum ada materi pembelajaran yang tersedia untuk anak Anda."
          />
        ) : (
          <div className="materials-grid">
            {mockMaterials.map((material) => (
              <Card key={material.id} title={material.title} variant="elevated">
                <div className="material-info">
                  <Badge variant="primary">{getTypeLabel(material.type)}</Badge>
                  <p>
                    <strong>Mata Pelajaran:</strong> {material.subject}
                  </p>
                  <p>
                    <strong>Guru:</strong> {material.teacher}
                  </p>
                  <p>
                    <strong>Tanggal:</strong> {formatDate(material.createdAt)}
                  </p>
                  {material.description && (
                    <p className="material-description">{material.description}</p>
                  )}
                </div>
                <Link to={`${ROUTES.PARENT_MATERIALS}/${material.id}`}>
                  <Button variant="outline" className="material-action-button">
                    Lihat Materi
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

