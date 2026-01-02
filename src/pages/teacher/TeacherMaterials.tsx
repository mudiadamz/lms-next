import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, SearchBar } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import './TeacherMaterials.css';

const mockMaterials = [
  {
    id: '1',
    title: 'Pengenalan Aljabar',
    type: 'document',
    class: 'X IPA 1',
    subject: 'Matematika',
    createdAt: new Date('2024-01-15'),
  },
];

export const TeacherMaterials = () => {
  return (
    <DashboardLayout>
      <div className="teacher-materials">
        <div className="page-header">
          <h1>Materi Pembelajaran</h1>
          <Link to={ROUTES.TEACHER_MATERIALS_CREATE}>
            <Button>Upload Materi</Button>
          </Link>
        </div>

        <div className="page-filters">
          <SearchBar placeholder="Cari materi..." />
        </div>

        <div className="materials-grid">
          {mockMaterials.map((material) => (
            <Card key={material.id} title={material.title} variant="elevated">
              <div className="material-info">
                <Badge variant="primary">{material.type}</Badge>
                <p>Kelas: {material.class}</p>
                <p>Mata Pelajaran: {material.subject}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Dibuat: {formatDate(material.createdAt)}
                </p>
              </div>
              <div className="material-actions">
                <Button variant="outline" size="small">
                  Edit
                </Button>
                <Button variant="danger" size="small">
                  Hapus
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

