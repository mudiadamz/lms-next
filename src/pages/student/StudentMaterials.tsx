import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, FormSelect, Button, EmptyState, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import { materialService, subjectService, userService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './StudentMaterials.css';

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
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const materialsRoute = readOnly ? ROUTES.PARENT_MATERIALS : ROUTES.STUDENT_MATERIALS;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const studentData = user?.id ? await userService.getUserById(user.id) : null;
        const classId = (studentData as any)?.classId;

        const [materialsData, subjectsData] = await Promise.all([
          materialService.getMaterials(classId),
          subjectService.getSubjects(),
        ]);

        setMaterials(materialsData);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);
        
        // Extract teacher names from materials (backend already includes teacherName via JOIN)
        const teacherMap: Record<string, string> = {};
        materialsData.forEach((m: any) => {
          if (m.teacherId && m.teacherName) {
            teacherMap[m.teacherId] = m.teacherName;
          }
        });
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

  const uniqueSubjects = Array.from(new Set(materials.map(m => m.subjectId).filter(Boolean)));
  const subjectOptions = [
    { value: 'all', label: 'Semua Mata Pelajaran' },
    ...uniqueSubjects.map((subjectId) => ({ value: subjectId, label: subjects[subjectId] || subjectId })),
  ];

  const filteredMaterials =
    selectedSubject === 'all'
      ? materials
      : materials.filter((material) => material.subjectId === selectedSubject);

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

        {isLoading ? (
          <Loading />
        ) : filteredMaterials.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Tidak Ada Materi"
            message={
              selectedSubject !== 'all'
                ? `Tidak ada materi untuk mata pelajaran ${subjects[selectedSubject] || selectedSubject}.`
                : 'Belum ada materi pembelajaran yang tersedia.'
            }
          />
        ) : (
          <div className="materials-grid">
            {filteredMaterials.map((material) => (
              <Card key={material.id} title={material.title} variant="elevated">
                <div className="material-info">
                  <Badge variant="primary">{getTypeLabel(material.type || 'document')}</Badge>
                  <p>
                    <strong>Mata Pelajaran:</strong> {subjects[material.subjectId] || material.subjectId}
                  </p>
                  <p>
                    <strong>Guru:</strong> {(material as any).teacherName || teachers[material.teacherId] || material.teacherId}
                  </p>
                  <p>
                    <strong>Tanggal:</strong> {formatDate(new Date(material.createdAt || material.date || Date.now()))}
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

