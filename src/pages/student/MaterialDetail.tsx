import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import './MaterialDetail.css';

const mockMaterial = {
  id: '1',
  title: 'Pengenalan Aljabar',
  type: 'document',
  description: 'Materi pembelajaran tentang pengenalan dasar aljabar untuk kelas X. Materi ini mencakup konsep dasar variabel, konstanta, dan operasi aljabar.',
  subject: 'Matematika',
  teacher: 'Ibu Siti',
  createdAt: new Date('2024-01-15'),
  fileUrl: '/materials/aljabar.pdf',
  attachments: ['soal-latihan.pdf', 'video-penjelasan.mp4'],
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, { icon: string; label: string }> = {
    document: { icon: '📄', label: 'Dokumen' },
    video: { icon: '🎥', label: 'Video' },
    presentation: { icon: '📊', label: 'Presentasi' },
    link: { icon: '🔗', label: 'Link' },
  };
  return labels[type] || { icon: '📎', label: 'File' };
};

export const StudentMaterialDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const typeInfo = getTypeLabel(mockMaterial.type);

  return (
    <DashboardLayout>
      <div className="material-detail">

        <Card>
          <div className="material-header">
            <div>
              <h1>{mockMaterial.title}</h1>
              <div className="material-meta">
                <Badge variant="primary">
                  {typeInfo.icon} {typeInfo.label}
                </Badge>
                <span>{mockMaterial.subject}</span>
                <span>Oleh: {mockMaterial.teacher}</span>
                <span>{formatDate(mockMaterial.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="material-description">
            <h3>Deskripsi</h3>
            <p>{mockMaterial.description}</p>
          </div>

          <div className="material-content">
            {mockMaterial.type === 'video' ? (
              <div className="video-container">
                <video controls width="100%">
                  <source src={mockMaterial.fileUrl} type="video/mp4" />
                  Browser Anda tidak mendukung video tag.
                </video>
              </div>
            ) : mockMaterial.type === 'link' ? (
              <div className="link-container">
                <a
                  href={mockMaterial.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  <Button variant="primary">Buka Link Eksternal →</Button>
                </a>
              </div>
            ) : (
              <div className="document-container">
                <div className="document-preview">
                  <iframe
                    src={mockMaterial.fileUrl}
                    title={mockMaterial.title}
                    className="document-iframe"
                  />
                </div>
                <div className="document-actions">
                  <a href={mockMaterial.fileUrl} download>
                    <Button variant="primary">📥 Download</Button>
                  </a>
                </div>
              </div>
            )}
          </div>

          {mockMaterial.attachments && mockMaterial.attachments.length > 0 && (
            <div className="material-attachments">
              <h3>Lampiran</h3>
              <ul>
                {mockMaterial.attachments.map((file, index) => (
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
      </div>
    </DashboardLayout>
  );
};

