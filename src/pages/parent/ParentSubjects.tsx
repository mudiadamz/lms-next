import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Loading, EmptyState } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { userService, subjectService, classService } from '../../services';
import './ParentSubjects.css';

export const ParentSubjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [className, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const parentData = await userService.getUserById(user.id);
        const studentIds = (parentData as any)?.studentIds || [];
        
        if (studentIds.length === 0) {
          setIsLoading(false);
          return;
        }

        const firstChild = await userService.getUserById(studentIds[0]);
        const classId = (firstChild as any)?.classId;

        if (classId) {
          const [classInfo, subjectsData, teachersData] = await Promise.all([
            classService.getClassById(classId),
            subjectService.getSubjects(),
            userService.getUsers('teacher'),
          ]);

          setClassName(classInfo.name);

          // Get subjects for this class
          const subjectIds = (classInfo as any).subjectIds || [];
          const classSubjects = subjectsData.filter(s => subjectIds.includes(s.id));
          setSubjects(classSubjects);

          // Create teacher map
          const teacherMap: Record<string, string> = {};
          teachersData.forEach(t => { teacherMap[t.id] = t.fullName; });
          setTeachers(teacherMap);
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="parent-subjects">
        <h1>Mata Pelajaran Anak</h1>
        {subjects.length === 0 ? (
          <EmptyState icon="book" title="Tidak Ada Mata Pelajaran" message="Belum ada mata pelajaran yang terdaftar untuk kelas ini." />
        ) : (
          <div className="subjects-grid">
            {subjects.map((subject) => (
              <Card key={subject.id} title={subject.name} variant="elevated">
                <p>Guru: {teachers[subject.teacherId] || '-'}</p>
                <p>Kelas: {className}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

