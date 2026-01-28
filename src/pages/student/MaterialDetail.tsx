import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Loading, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, getFileUrl, getFileName } from '../../utils';
import { materialService, subjectService, userService } from '../../services';
import './MaterialDetail.css';

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
  const [material, setMaterial] = useState<any>(null);
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const materialData = await materialService.getMaterialById(id);
        const subjectInfo = await subjectService.getSubjectById(materialData.subjectId);

        setMaterial(materialData);
        setSubjectName(subjectInfo.name);
        setTeacherName((materialData as any).teacherName || 'Unknown');
      } catch (error) {
        console.error('Error loading material detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  if (!material) {
    return (
      <DashboardLayout>
        <EmptyState icon="book" title="Materi Tidak Ditemukan" message="Materi yang Anda cari tidak ditemukan." />
      </DashboardLayout>
    );
  }

  const typeInfo = getTypeLabel(material.type);

  return (
    <DashboardLayout>
      <div className="material-detail">

        <Card>
          <div className="material-header">
            <div>
              <h1>{material.title}</h1>
              <div className="material-meta">
                <Badge variant="primary">
                  {typeInfo.icon} {typeInfo.label}
                </Badge>
                <span>{subjectName}</span>
                <span>Oleh: {teacherName}</span>
                <span>{formatDate(new Date(material.createdAt))}</span>
              </div>
            </div>
          </div>

          <div className="material-description">
            <h3>Deskripsi</h3>
            <p>{material.description}</p>
          </div>

          <div className="material-content">
            {material.type === 'video' ? (
              <div className="video-container">
                <video controls width="100%">
                  <source src={material.fileUrl} type="video/mp4" />
                  Browser Anda tidak mendukung video tag.
                </video>
              </div>
            ) : material.type === 'link' ? (
              <div className="link-container">
                <a
                  href={material.type === 'link' ? material.fileUrl : getFileUrl(material.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  <Button variant="primary">Buka Link Eksternal →</Button>
                </a>
              </div>
            ) : (
              <div className="document-container">
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center',
                  backgroundColor: 'var(--ios-secondary-background)',
                  borderRadius: '12px',
                  border: '0.5px solid var(--ios-separator)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {typeInfo.icon}
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                    {material.title}
                  </h3>
                  <p style={{ color: 'var(--ios-gray)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    File siap untuk diunduh
                  </p>
                  <a href={getFileUrl(material.fileUrl)} download target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" size="large">
                      📥 Download Materi
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>

          {material.attachments && material.attachments.length > 0 && (
            <div className="material-attachments">
              <h3>Lampiran</h3>
              <ul>
                {material.attachments.map((file: string, index: number) => (
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
      </div>
    </DashboardLayout>
  );
};

