import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { FormSelect, Badge, Loading, EmptyState } from '../../components/common';
import { classService, gradeService, attendanceService, assignmentService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherAnalytics.css';

export const TeacherAnalytics = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [stats, setStats] = useState({
    averageScore: 0,
    attendanceRate: 0,
    assignmentCompletion: 0,
    topPerformers: [] as Array<{ name: string; score: number }>,
    subjectPerformance: [] as Array<{ subject: string; average: number }>,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const classesData = await classService.getClasses();
        
        // Filter classes taught by this teacher
        const teacherClasses = classesData.filter(c => {
          const teacherIds = (c as any).teacherIds || [];
          return teacherIds.includes(user?.id);
        });

        setClasses(teacherClasses.map(c => ({ value: c.id, label: c.name })));
        
        if (teacherClasses.length > 0 && !selectedClass) {
          setSelectedClass(teacherClasses[0].id);
        }
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!selectedClass) return;

      try {
        setIsLoading(true);
        // Get students in the class
        const classData = await classService.getClassById(selectedClass);
        const studentIds = (classData as any).studentIds || [];

        // Get grades, attendance, and assignments for analytics
        const [allGrades, allAttendances, assignmentsData] = await Promise.all([
          Promise.all(studentIds.map((studentId: string) => gradeService.getGrades(studentId))).then(results => results.flat()),
          Promise.all(studentIds.map((studentId: string) => attendanceService.getAttendance(studentId))).then(results => results.flat()),
          assignmentService.getAssignments({ classId: selectedClass }),
        ]);

        // Calculate average score
        const scores = allGrades.map(g => (g.score / (g.maxScore || 100)) * 100);
        const averageScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;

        // Calculate attendance rate
        const presentCount = allAttendances.filter(a => a.status === 'present').length;
        const attendanceRate = allAttendances.length > 0 ? Math.round((presentCount / allAttendances.length) * 100) : 0;

        // Calculate assignment completion
        const totalAssignments = assignmentsData.length;
        const completedAssignments = allGrades.filter(g => g.assignmentId).length;
        const assignmentCompletion = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

        // Get top performers (students with highest average scores)
        const studentScores: Record<string, number[]> = {};
        allGrades.forEach(grade => {
          if (!studentScores[grade.studentId]) {
            studentScores[grade.studentId] = [];
          }
          studentScores[grade.studentId].push((grade.score / (grade.maxScore || 100)) * 100);
        });

        const topPerformers = Object.entries(studentScores)
          .map(([studentId, scores]) => ({
            studentId,
            average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
          }))
          .sort((a, b) => b.average - a.average)
          .slice(0, 3)
          .map(item => ({
            name: `Student ${item.studentId.substring(0, 8)}`, // Placeholder - would need userService to get names
            score: Math.round(item.average),
          }));

        // Calculate performance by type
        const typePerformance: Record<string, number[]> = {};
        allGrades.forEach(grade => {
          const type = grade.type === 'assignment' ? 'Tugas' : grade.type === 'quiz' ? 'Kuis' : 'Lainnya';
          if (!typePerformance[type]) {
            typePerformance[type] = [];
          }
          typePerformance[type].push((grade.score / (grade.maxScore || 100)) * 100);
        });

        const subjectPerformance = Object.entries(typePerformance).map(([subject, scores]) => ({
          subject,
          average: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
        }));

        setStats({
          averageScore,
          attendanceRate,
          assignmentCompletion,
          topPerformers,
          subjectPerformance,
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedClass) {
      loadAnalytics();
    }
  }, [selectedClass]);

  return (
    <DashboardLayout>
      <div className="teacher-analytics">
        <div className="analytics-header">
          <h1>Analitik Performa Siswa</h1>
          {classes.length > 0 && (
            <FormSelect
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={[
                { value: '', label: 'Pilih kelas' },
                ...classes,
              ]}
            />
          )}
        </div>

        {isLoading ? (
          <Loading />
        ) : !selectedClass ? (
          <EmptyState
            icon="chart"
            title="Pilih Kelas"
            message="Pilih kelas untuk melihat analitik performa siswa."
          />
        ) : (
          <>
            <div className="analytics-stats">
              <Card variant="elevated" className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{stats.averageScore}</div>
                <div className="stat-label">Rata-rata Nilai</div>
              </Card>

              <Card variant="elevated" className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{stats.attendanceRate}%</div>
                <div className="stat-label">Tingkat Kehadiran</div>
              </Card>

              <Card variant="elevated" className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-value">{stats.assignmentCompletion}%</div>
                <div className="stat-label">Penyelesaian Tugas</div>
              </Card>
            </div>

            <div className="analytics-grid">
              <Card title="Top Performers" variant="elevated">
                {stats.topPerformers.length === 0 ? (
                  <EmptyState icon="user" title="Tidak Ada Data" message="Belum ada data performa siswa." />
                ) : (
                  <div className="top-performers">
                    {stats.topPerformers.map((student, index) => (
                      <div key={index} className="performer-item">
                        <div className="performer-rank">#{index + 1}</div>
                        <div className="performer-info">
                          <strong>{student.name}</strong>
                          <Badge variant="success">{student.score}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Performa per Tipe Penilaian" variant="elevated">
                {stats.subjectPerformance.length === 0 ? (
                  <EmptyState icon="chart" title="Tidak Ada Data" message="Belum ada data performa per tipe penilaian." />
                ) : (
                  <div className="subject-performance">
                    {stats.subjectPerformance.map((item, index) => (
                      <div key={index} className="performance-item">
                        <div className="performance-label">{item.subject}</div>
                        <div className="performance-bar">
                          <div
                            className="performance-fill"
                            style={{ width: `${item.average}%` }}
                          />
                          <span className="performance-value">{item.average}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

