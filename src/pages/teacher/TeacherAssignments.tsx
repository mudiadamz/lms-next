import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Table, Loading, EmptyState } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import { assignmentService, classService, subjectService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherAssignments.css';

export const TeacherAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<Record<string, string>>({});
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [assignmentsData, classesData, subjectsData] = await Promise.all([
          assignmentService.getAssignments({ teacherId: user?.id }),
          classService.getClasses(),
          subjectService.getSubjects(),
        ]);

        setAssignments(assignmentsData);
        const classMap: Record<string, string> = {};
        classesData.forEach(c => { classMap[c.id] = c.name; });
        setClasses(classMap);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);
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

  const columns = [
    {
      key: 'title',
      header: 'Judul',
      render: (item: any) => (
        <div>
          <strong>{item.title}</strong>
          <br />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {subjects[item.subjectId] || item.subjectId} - {classes[item.classId] || item.classId}
          </span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Deadline',
      render: (item: any) => formatDate(new Date(item.dueDate)),
    },
    {
      key: 'submissions',
      header: 'Pengumpulan',
      render: (item: any) => {
        const submissions = (item as any).submissionCount || 0;
        const totalStudents = (item as any).totalStudents || 0;
        return (
          <Badge variant={submissions === totalStudents ? 'success' : 'warning'}>
            {submissions}/{totalStudents}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: any) => (
        <Link to={`${ROUTES.TEACHER_ASSIGNMENTS}/${item.id}`}>
          <Button variant="outline" size="small">
            Detail
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="teacher-assignments">
        <div className="page-header">
          <h1>Tugas</h1>
          <Link to={ROUTES.TEACHER_ASSIGNMENTS_CREATE}>
            <Button>Buat Tugas Baru</Button>
          </Link>
        </div>

        {isLoading ? (
          <Loading />
        ) : assignments.length === 0 ? (
          <EmptyState
            icon="assignment"
            title="Tidak Ada Tugas"
            message="Belum ada tugas yang dibuat."
          />
        ) : (
          <Card>
            <Table columns={columns} data={assignments} />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

