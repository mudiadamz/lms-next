import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, FormSelect, Button, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import './StudentMaterials.css';

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
  {
    id: '3',
    title: 'Hukum Newton',
    type: 'document',
    subject: 'Fisika',
    teacher: 'Bapak Budi',
    createdAt: new Date('2024-01-17'),
    description: 'Materi tentang hukum Newton',
  },
  {
    id: '4',
    title: 'Struktur Atom',
    type: 'presentation',
    subject: 'Kimia',
    teacher: 'Ibu Rina',
    createdAt: new Date('2024-01-18'),
    description: 'Presentasi tentang struktur atom',
  },
];

// Get unique subjects from materials
const getUniqueSubjects = () => {
  const subjects = new Set(mockMaterials.map((m) => m.subject));
  return Array.from(subjects).sort();
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    document: '📄 Dokumen',
    video: '🎥 Video',
    presentation: '📊 Presentasi',
    link: '🔗 Link',
  };
  return labels[type] || '📎 File';
};

interface StudentMaterialsProps {
  readOnly?: boolean;
}

export const StudentMaterials = ({ readOnly = false }: StudentMaterialsProps = {} as StudentMaterialsProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const materialsRoute = readOnly ? ROUTES.PARENT_MATERIALS : ROUTES.STUDENT_MATERIALS;

  const uniqueSubjects = getUniqueSubjects();
  const subjectOptions = [
    { value: 'all', label: 'Semua Mata Pelajaran' },
    ...uniqueSubjects.map((subject) => ({ value: subject, label: subject })),
  ];

  const filteredMaterials =
    selectedSubject === 'all'
      ? mockMaterials
      : mockMaterials.filter((material) => material.subject === selectedSubject);

  return (
    <DashboardLayout>
      <div className="student-materials">
        <h1>Materi Pembelajaran</h1>

        <div className="page-filters">
          <FormSelect
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            options={subjectOptions}
          />
        </div>

        {filteredMaterials.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Tidak Ada Materi"
            message={
              selectedSubject !== 'all'
                ? `Tidak ada materi untuk mata pelajaran ${selectedSubject}.`
                : 'Belum ada materi pembelajaran yang tersedia.'
            }
          />
        ) : (
          <div className="materials-grid">
            {filteredMaterials.map((material) => (
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
                <Link to={`${materialsRoute}/${material.id}`}>
                  <Button variant="primary" className="material-action-button">
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

