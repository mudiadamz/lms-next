import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, FormSelect, EmptyState, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate, isPast } from '../../utils';
import { assignmentService, subjectService, userService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './StudentAssignments.css';

interface StudentAssignmentsProps {
  readOnly?: boolean;
}

export const StudentAssignments = ({ readOnly = false }: StudentAssignmentsProps = {} as StudentAssignmentsProps) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const studentData = user?.id ? await userService.getUserById(user.id) : null;
        const classId = (studentData as any)?.classId;

        const [assignmentsData, subjectsData] = await Promise.all([
          assignmentService.getAssignments(classId ? { classId } : {}),
          subjectService.getSubjects(),
        ]);

        setAssignments(assignmentsData);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);
        
        // Extract teacher names from assignments (backend already includes teacherName via JOIN)
        const teacherMap: Record<string, string> = {};
        assignmentsData.forEach((a: any) => {
          if (a.teacherId && a.teacherName) {
            teacherMap[a.teacherId] = a.teacherName;
          }
        });
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

  const uniqueSubjects = Array.from(new Set(assignments.map(a => a.subjectId).filter(Boolean)));
  const subjectOptions = [
    { value: 'all', label: 'Semua Mata Pelajaran' },
    ...uniqueSubjects.map((subjectId) => ({ value: subjectId, label: subjects[subjectId] || subjectId })),
  ];

  const filteredAssignments =
    selectedSubject === 'all'
      ? assignments
      : assignments.filter((assignment) => assignment.subjectId === selectedSubject);

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
      <div className="student-assignments">
        <h1>Tugas</h1>

        <div className="page-filters">
          <FormSelect
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            options={subjectOptions}
          />
        </div>

        {isLoading ? (
          <Loading />
        ) : filteredAssignments.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Tidak Ada Tugas"
            message={
              selectedSubject !== 'all'
                ? `Tidak ada tugas untuk mata pelajaran ${subjects[selectedSubject] || selectedSubject}.`
                : 'Belum ada tugas yang diberikan untuk Anda saat ini.'
            }
          />
        ) : (
          <div className="assignments-list">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id} variant="elevated" className="assignment-card">
                <div className="assignment-header">
                  <div>
                    <h3 className="assignment-title">{assignment.title}</h3>
                    <div className="assignment-meta">
                      <span>{subjects[assignment.subjectId] || assignment.subjectId}</span>
                      <span>•</span>
                      <span>{(assignment as any).teacherName || teachers[assignment.teacherId] || assignment.teacherId}</span>
                      <span>•</span>
                      <span>Deadline: {formatDate(new Date(assignment.dueDate))}</span>
                    </div>
                  </div>
                  {getStatusBadge(assignment)}
                </div>
                {assignment.description && (
                  <p className="assignment-description">{assignment.description}</p>
                )}
                <div className="assignment-footer">
                  <Link
                    to={readOnly
                      ? ROUTES.PARENT_ASSIGNMENT_DETAIL.replace(':id', assignment.id)
                      : ROUTES.STUDENT_ASSIGNMENT_DETAIL.replace(':id', assignment.id)}
                  >
                    <Button variant="outline" size="small">
                      {assignment.status === 'submitted' || assignment.score !== null ? 'Lihat Detail' : 'Kerjakan Tugas'}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

