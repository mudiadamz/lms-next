import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, FormSelect, Table, EmptyState, Loading } from '../../components/common';
import { gradeService, subjectService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './StudentGrades.css';

export const StudentGrades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [gradesData, subjectsData] = await Promise.all([
          gradeService.getGrades(user?.id ? { studentId: user.id } : {}),
          subjectService.getSubjects(),
        ]);

        setGrades(gradesData);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);
      } catch (error) {
        console.error('Error loading grades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // Sort grades by date (newest first)
  const sortedGrades = [...grades].sort((a, b) => {
    const aDate = new Date(a.date || a.createdAt);
    const bDate = new Date(b.date || b.createdAt);
    if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) return 0;
    return bDate.getTime() - aDate.getTime();
  });

  const getGradeBadge = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return <Badge variant="success">Sangat Baik</Badge>;
    if (percentage >= 75) return <Badge variant="primary">Baik</Badge>;
    if (percentage >= 65) return <Badge variant="warning">Cukup</Badge>;
    return <Badge variant="danger">Perlu Perbaikan</Badge>;
  };

  const columns = [
    {
      key: 'subject',
      header: 'Mata Pelajaran',
      render: (item: any) => <strong>{subjects[item.subjectId] || item.subjectId}</strong>,
    },
    {
      key: 'type',
      header: 'Jenis',
      render: (item: any) => {
        const typeLabels: Record<string, { label: string; icon: string }> = {
          assignment: { label: 'Tugas', icon: '📝' },
          quiz: { label: 'Kuis', icon: '📋' },
          midterm: { label: 'UTS', icon: '📊' },
          final: { label: 'UAS', icon: '📈' },
        };
        const typeInfo = typeLabels[item.type] || { label: item.type || '-', icon: '📎' };
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{typeInfo.icon}</span>
            <span>{typeInfo.label}</span>
          </div>
        );
      },
    },
    {
      key: 'title',
      header: 'Judul',
      render: (item: any) => (
        <div>
          <strong>{item.assignmentName || item.quizName || item.title || '-'}</strong>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'Nilai',
      render: (item: any) => (
        <div>
          <strong>{item.score}/{item.maxScore || 100}</strong>
          <div style={{ marginTop: '0.25rem' }}>{getGradeBadge(item.score, item.maxScore || 100)}</div>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="student-grades">
        <div className="page-header">
          <h1>Nilai</h1>
        </div>

        {isLoading ? (
          <Loading />
        ) : sortedGrades.length === 0 ? (
          <EmptyState
            icon="grade"
            title="Tidak Ada Nilai"
            message="Belum ada nilai yang tersedia."
          />
        ) : (
          <Card title={`Daftar Nilai (${sortedGrades.length})`} variant="elevated">
            <Table columns={columns} data={sortedGrades} />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
