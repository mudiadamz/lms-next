import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Loading, EmptyState } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { userService, assignmentService, quizService, gradeService, attendanceService } from '../../services';
import './ParentProgress.css';

export const ParentProgress = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    averageGrade: 0,
    attendanceRate: 0,
    assignmentsCompleted: 0,
    totalAssignments: 0,
  });
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
        const studentId = studentIds[0];

        const [assignmentsData, gradesData, attendanceData] = await Promise.all([
          assignmentService.getAssignments(classId),
          gradeService.getGrades(),
          attendanceService.getAttendance(studentId, classId),
        ]);

        // Calculate average grade
        const studentGrades = gradesData.filter(g => g.studentId === studentId);
        const averageGrade = studentGrades.length > 0
          ? Math.round((studentGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / studentGrades.length))
          : 0;

        // Calculate attendance rate
        const totalAttendance = attendanceData.length;
        const presentCount = attendanceData.filter(a => a.status === 'present').length;
        const attendanceRate = totalAttendance > 0
          ? Math.round((presentCount / totalAttendance) * 100)
          : 0;

        // Calculate assignments completed
        const submissions = await Promise.all(
          assignmentsData.map(async (assignment) => {
            try {
              const subs = await assignmentService.getSubmissions(assignment.id);
              return subs.find(s => s.studentId === studentId);
            } catch {
              return null;
            }
          })
        );
        const assignmentsCompleted = submissions.filter(s => s !== null).length;

        setStats({
          averageGrade,
          attendanceRate,
          assignmentsCompleted,
          totalAssignments: assignmentsData.length,
        });
      } catch (error) {
        console.error('Error loading progress:', error);
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
      <div className="parent-progress">
        <h1>Progress Belajar Anak</h1>
        <Card title="Statistik" variant="elevated">
          <div className="progress-stats">
            <div className="stat-item">
              <span className="stat-label">Rata-rata nilai:</span>
              <span className="stat-value">{stats.averageGrade}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tingkat kehadiran:</span>
              <span className="stat-value">{stats.attendanceRate}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Jumlah tugas selesai:</span>
              <span className="stat-value">{stats.assignmentsCompleted}/{stats.totalAssignments}</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

