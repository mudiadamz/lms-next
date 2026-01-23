import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Button, EmptyState, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { materialService, subjectService, userService } from '../../services';
import './ParentMaterials.css';

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
  const [materials, setMaterials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const parentData = user?.id ? await userService.getUserById(user.id) : null;
        const studentIds = (parentData as any)?.studentIds || [];
        
        if (studentIds.length === 0) {
          setIsLoading(false);
          return;
        }

        const firstChild = await userService.getUserById(studentIds[0]);
        const classId = (firstChild as any)?.classId;

        const [materialsData, subjectsData, teachersData] = await Promise.all([
          materialService.getMaterials(classId),
          subjectService.getSubjects(),
          userService.getUsers('teacher'),
        ]);

        setMaterials(materialsData);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);
        const teacherMap: Record<string, string> = {};
        teachersData.forEach(t => { teacherMap[t.id] = t.fullName; });
        setTeachers(teacherMap);
      } catch (error) {
        console.error('Error loading materials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  return (
    <DashboardLayout>
      <div className="parent-materials">
        <h1>Materi Pembelajaran Anak</h1>

        {isLoading ? (
          <Loading />
        ) : materials.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Tidak Ada Materi"
            message="Belum ada materi pembelajaran yang tersedia untuk anak Anda."
          />
        ) : (
          <div className="materials-grid">
            {materials.map((material) => (
              <Card key={material.id} title={material.title} variant="elevated">
                <div className="material-info">
                  <Badge variant="primary">{getTypeLabel(material.type || 'document')}</Badge>
                  <p>
                    <strong>Mata Pelajaran:</strong> {subjects[material.subjectId] || material.subjectId}
                  </p>
                  <p>
                    <strong>Guru:</strong> {teachers[material.teacherId] || material.teacherId}
                  </p>
                  <p>
                    <strong>Tanggal:</strong> {formatDate(new Date(material.createdAt || material.date || Date.now()))}
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


