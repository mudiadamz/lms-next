import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon, EmptyState, Loading } from '../../components/common';
import { ROUTES, SCHOOL_LEVELS } from '../../constants';
import { classService, subjectService } from '../../services';
import './TeacherClasses.css';

export const TeacherClasses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [classesData, subjectsData] = await Promise.all([
          classService.getClasses(),
          subjectService.getSubjects(undefined, user?.id),
        ]);

        const classIds = new Set<string>();
        const classSubjectsMap: Record<string, string[]> = {};
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach((subject) => {
          subjectMap[subject.id] = subject.name;
          (subject.classIds || []).forEach((classId) => {
            classIds.add(classId);
            if (!classSubjectsMap[classId]) {
              classSubjectsMap[classId] = [];
            }
            classSubjectsMap[classId].push(subject.id);
          });
        });

        const teacherClasses = classesData
          .filter((cls) => classIds.has(cls.id))
          .map((cls) => ({
            ...cls,
            subjects: classSubjectsMap[cls.id] || [],
          }));

        setClasses(teacherClasses);
        setSubjects(subjectMap);
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const handleViewClass = (classId: string) => {
    navigate(`${ROUTES.TEACHER_CLASSES_DETAIL.replace(':id', classId)}`);
  };

  return (
    <DashboardLayout>
      <div className="teacher-classes">
        <div className="page-header">
          <div>
            <h1>Kelas yang Diajar</h1>
            <p className="page-subtitle">
              Kelola kelas dan mata pelajaran yang Anda ajar
            </p>
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : classes.length === 0 ? (
          <EmptyState
            icon="userGroup"
            title="Tidak Ada Kelas"
            message="Anda belum memiliki kelas yang diajar."
          />
        ) : (
          <div className="classes-grid">
            {classes.map((classItem) => (
              <Card key={classItem.id} variant="elevated" className="class-card">
                <div className="class-card-header">
                  <div>
                    <h3 className="class-name">{classItem.name}</h3>
                    <Badge variant="secondary" style={{ marginTop: '0.25rem' }}>
                      {SCHOOL_LEVELS[classItem.schoolLevel]}
                    </Badge>
                  </div>
                  {(() => {
                    const studentCount = (classItem as any).studentCount ?? 0;
                    const maxStudents = (classItem as any).maxStudents ?? 36;
                    const isFull = maxStudents > 0 && studentCount >= maxStudents;
                    return (
                      <Badge variant={isFull ? 'danger' : 'primary'}>
                        {studentCount}/{maxStudents}
                      </Badge>
                    );
                  })()}
                </div>

                <div className="class-info">
                  <div className="info-item">
                    <Icon name="users" size={18} />
                    <span>{(classItem as any).studentCount || 0} siswa</span>
                  </div>
                  <div className="info-item">
                    <Icon name="book" size={18} />
                    <span>{(classItem as any).subjects?.length || 0} mata pelajaran</span>
                  </div>
                  {(classItem as any).academicYear && (
                    <div className="info-item">
                      <Icon name="calendar" size={18} />
                      <span>{(classItem as any).academicYear} - Semester {(classItem as any).semester || 1}</span>
                    </div>
                  )}
                </div>

                {(classItem as any).subjects && (classItem as any).subjects.length > 0 && (
                  <div className="class-subjects">
                    <strong>Mata Pelajaran:</strong>
                    <div className="subjects-list">
                      {(classItem as any).subjects.map((subjectId: string, index: number) => (
                        <Badge key={index} variant="secondary" size="small">
                          {subjects[subjectId] || subjectId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="class-actions">
                  <Button
                    variant="outline"
                    onClick={() => handleViewClass(classItem.id)}
                    style={{ flex: 1 }}
                  >
                    <Icon name="eye" size={16} style={{ marginRight: '0.5rem' }} />
                    Detail
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
