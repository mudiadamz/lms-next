import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Loading, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import { materialService, classService, subjectService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherMaterials.css';

export const TeacherMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [classes, setClasses] = useState<Record<string, string>>({});
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [materialsData, classesData, subjectsData] = await Promise.all([
          materialService.getMaterials(),
          classService.getClasses(),
          subjectService.getSubjects(),
        ]);

        // Filter materials by teacher
        const teacherMaterials = materialsData.filter(m => m.teacherId === user?.id);
        setMaterials(teacherMaterials);
        const classMap: Record<string, string> = {};
        classesData.forEach(c => { classMap[c.id] = c.name; });
        setClasses(classMap);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);
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
      <div className="teacher-materials">
        <div className="page-header">
          <h1>Materi Pembelajaran</h1>
          <Link to={ROUTES.TEACHER_MATERIALS_CREATE}>
            <Button>Upload Materi</Button>
          </Link>
        </div>

        {isLoading ? (
          <Loading />
        ) : materials.length === 0 ? (
          <EmptyState
            icon="document"
            title="Tidak Ada Materi"
            message="Belum ada materi pembelajaran yang diupload."
          />
        ) : (
          <div className="materials-grid">
            {materials.map((material) => (
              <Card key={material.id} title={material.title} variant="elevated">
                <div className="material-info">
                  <Badge variant="primary">{material.type || 'document'}</Badge>
                  <p>Kelas: {classes[material.classId] || material.classId}</p>
                  <p>Mata Pelajaran: {subjects[material.subjectId] || material.subjectId}</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Dibuat: {formatDate(new Date(material.createdAt || material.date || Date.now()))}
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
        )}
      </div>
    </DashboardLayout>
  );
};

