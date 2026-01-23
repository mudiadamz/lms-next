import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, EmptyState, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, isPast } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { assignmentService, subjectService, userService } from '../../services';
import './ParentAssignments.css';

export const ParentAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
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

        const [assignmentsData, subjectsData, teachersData] = await Promise.all([
          assignmentService.getAssignments(classId ? { classId } : {}),
          subjectService.getSubjects(),
          userService.getUsers('teacher'),
        ]);

        setAssignments(assignmentsData);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);
        const teacherMap: Record<string, string> = {};
        teachersData.forEach(t => { teacherMap[t.id] = t.fullName; });
        setTeachers(teacherMap);
      } catch (error) {
        console.error('Error loading assignments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const getStatusBadge = (assignment: any) => {
    if (assignment.score !== null && assignment.score !== undefined) {
      return <Badge variant="success">Sudah Dinilai</Badge>;
    }
    if (assignment.status === 'submitted') {
      return <Badge variant="warning">Menunggu Penilaian</Badge>;
    }
    if (isPast(new Date(assignment.dueDate))) {
      return <Badge variant="danger">Terlambat</Badge>;
    }
    return <Badge variant="secondary">Belum Dikerjakan</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="parent-assignments">
        <h1>Tugas Anak</h1>

        {isLoading ? (
          <Loading />
        ) : assignments.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Tidak Ada Tugas"
            message="Belum ada tugas yang diberikan untuk anak Anda saat ini."
          />
        ) : (
          <div className="assignments-grid">
            {assignments.map((assignment) => (
              <Card key={assignment.id} title={assignment.title} variant="elevated">
                <div className="assignment-card-info">
                  <p>
                    <strong>Mata Pelajaran:</strong> {subjects[assignment.subjectId] || assignment.subjectId}
                  </p>
                  <p>
                    <strong>Guru:</strong> {teachers[assignment.teacherId] || assignment.teacherId}
                  </p>
                  <p>
                    <strong>Deadline:</strong> {formatDate(new Date(assignment.dueDate))}
                  </p>
                  <div className="assignment-status">
                    <strong>Status:</strong> {getStatusBadge(assignment)}
                  </div>
                  {assignment.score !== null && (
                    <p>
                      <strong>Nilai:</strong> {assignment.score}/100
                    </p>
                  )}
                </div>
                <Link to={`${ROUTES.PARENT_ASSIGNMENTS}/${assignment.id}`}>
                  <Button variant="outline" className="assignment-action-button">
                    Lihat Detail
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


