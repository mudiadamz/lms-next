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
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

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

  const uniqueSubjects = Array.from(new Set(grades.map(g => g.subjectId).filter(Boolean)));
  const subjectOptions = [
    { value: 'all', label: 'Semua Mata Pelajaran' },
    ...uniqueSubjects.map((subjectId) => ({ value: subjectId, label: subjects[subjectId] || subjectId })),
  ];

  const uniqueSemesters = Array.from(new Set(grades.map(g => g.semester).filter(Boolean)));
  const semesterOptions = [
    { value: 'all', label: 'Semua Semester' },
    ...uniqueSemesters.map((sem) => ({ value: sem.toString(), label: `Semester ${sem}` })),
  ];

  const uniqueYears = Array.from(new Set(grades.map(g => g.academicYear).filter(Boolean)));
  const yearOptions = [
    { value: 'all', label: 'Semua Tahun Ajaran' },
    ...uniqueYears.map((year) => ({ value: year, label: year })),
  ];

  const getGradeBadge = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return <Badge variant="success">Sangat Baik</Badge>;
    if (percentage >= 75) return <Badge variant="primary">Baik</Badge>;
    if (percentage >= 65) return <Badge variant="warning">Cukup</Badge>;
    return <Badge variant="danger">Perlu Perbaikan</Badge>;
  };

  const filteredGrades = grades.filter((grade) => {
    const matchesSubject = selectedSubject === 'all' || grade.subjectId === selectedSubject;
    const matchesSemester = selectedSemester === 'all' || grade.semester?.toString() === selectedSemester;
    const matchesYear = selectedYear === 'all' || grade.academicYear === selectedYear;
    return matchesSubject && matchesSemester && matchesYear;
  });

  const columns = [
    {
      key: 'subject',
      header: 'Mata Pelajaran',
      render: (item: any) => <strong>{subjects[item.subjectId] || item.subjectId}</strong>,
    },
    {
      key: 'assignment',
      header: 'Tugas/Evaluasi',
      render: (item: any) => item.assignmentName || item.assignment || '-',
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
    {
      key: 'type',
      header: 'Jenis',
      render: (item: any) => {
        const typeLabels: Record<string, string> = {
          assignment: 'Tugas',
          quiz: 'Kuis',
          midterm: 'UTS',
          final: 'UAS',
        };
        return typeLabels[item.type] || item.type || '-';
      },
    },
    {
      key: 'date',
      header: 'Tanggal',
      render: (item: any) => {
        const date = item.date || item.createdAt;
        return date ? new Date(date).toLocaleDateString('id-ID') : '-';
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="student-grades">
        <div className="page-header">
          <h1>Nilai</h1>
        </div>

        <div className="page-filters">
          <FormSelect
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            options={subjectOptions}
          />
          <FormSelect
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            options={semesterOptions}
          />
          <FormSelect
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={yearOptions}
          />
        </div>

        {isLoading ? (
          <Loading />
        ) : filteredGrades.length === 0 ? (
          <EmptyState
            icon="grade"
            title="Tidak Ada Nilai"
            message="Belum ada nilai yang tersedia."
          />
        ) : (
          <Card title={`Daftar Nilai (${filteredGrades.length})`} variant="elevated">
            <Table columns={columns} data={filteredGrades} />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
