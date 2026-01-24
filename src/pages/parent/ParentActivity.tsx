import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Loading, EmptyState, Badge } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { userService, assignmentService, quizService, gradeService } from '../../services';
import { formatDateTime } from '../../utils';
import './ParentActivity.css';

export const ParentActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
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

        const [assignmentsData, quizzesData, gradesData] = await Promise.all([
          assignmentService.getAssignments(classId),
          quizService.getQuizzes(classId),
          gradeService.getGrades(),
        ]);

        // Get submissions for assignments
        const submissions = await Promise.all(
          assignmentsData.map(async (assignment) => {
            try {
              const subs = await assignmentService.getSubmissions(assignment.id);
              return subs.find(s => studentIds.includes(s.studentId));
            } catch {
              return null;
            }
          })
        );

        // Build activity list
        const activityList: any[] = [];

        // Add assignment submissions
        submissions.forEach((submission, index) => {
          if (submission) {
            activityList.push({
              id: `assignment-${submission.id}`,
              type: 'assignment',
              title: assignmentsData[index].title,
              date: submission.submittedAt,
              description: `Submit tugas ${assignmentsData[index].title}`,
            });
          }
        });

        // Add quiz submissions
        const quizSubmissions = await Promise.all(
          quizzesData.map(async (quiz) => {
            try {
              const subs = await quizService.getQuizSubmissions(quiz.id);
              return subs.find(s => studentIds.includes(s.studentId));
            } catch {
              return null;
            }
          })
        );

        quizSubmissions.forEach((submission, index) => {
          if (submission) {
            activityList.push({
              id: `quiz-${submission.id}`,
              type: 'quiz',
              title: quizzesData[index].title,
              date: submission.submittedAt,
              description: `Mengikuti kuis ${quizzesData[index].title}`,
            });
          }
        });

        // Sort by date (newest first)
        activityList.sort((a, b) => {
          const aDate = new Date(a.date);
          const bDate = new Date(b.date);
          if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) return 0;
          return bDate.getTime() - aDate.getTime();
        });

        setActivities(activityList.slice(0, 20)); // Limit to 20 most recent
      } catch (error) {
        console.error('Error loading activities:', error);
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
      <div className="parent-activity">
        <h1>Riwayat Aktivitas Anak</h1>
        <Card title="Aktivitas Terbaru" variant="elevated">
          {activities.length === 0 ? (
            <EmptyState icon="activity" title="Tidak Ada Aktivitas" message="Belum ada aktivitas yang tercatat." />
          ) : (
            <div className="activity-list">
              {activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <Badge variant={activity.type === 'assignment' ? 'primary' : 'info'}>
                    {activity.type === 'assignment' ? 'Tugas' : 'Kuis'}
                  </Badge>
                  <div className="activity-content">
                    <p><strong>{activity.description}</strong></p>
                    <p className="activity-date">{formatDateTime(new Date(activity.date))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

