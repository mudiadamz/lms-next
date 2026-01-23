import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Table, EmptyState, Loading, FormSelect } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { gradeService, subjectService, userService } from '../../services';
import './ParentGrades.css';

export const ParentGrades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

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

        const [gradesData, subjectsData] = await Promise.all([
          Promise.all(studentIds.map((studentId: string) => gradeService.getGrades({ studentId }))).then(results => results.flat()),
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

  const filteredGrades = grades.filter((grade) => {
    const matchesSemester = selectedSemester === 'all' || grade.semester?.toString() === selectedSemester;
    const matchesYear = selectedYear === 'all' || grade.academicYear === selectedYear;
    return matchesSemester && matchesYear;
  });

  // Group by subject and calculate average
  const gradesBySubject: Record<string, { scores: number[]; subjectName: string }> = {};
  filteredGrades.forEach(grade => {
    const subjectId = grade.subjectId;
    if (!gradesBySubject[subjectId]) {
      gradesBySubject[subjectId] = { scores: [], subjectName: subjects[subjectId] || subjectId };
    }
    if (grade.score !== null && grade.score !== undefined) {
      gradesBySubject[subjectId].scores.push(grade.score);
    }
  });

  const subjectGrades = Object.entries(gradesBySubject).map(([subjectId, data]) => {
    const average = data.scores.length > 0 
      ? Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length)
      : 0;
    return {
      subjectId,
      subjectName: data.subjectName,
      average,
      grade: average >= 85 ? 'A' : average >= 75 ? 'B' : average >= 65 ? 'C' : 'D',
    };
  });

  const columns = [
    {
      key: 'subject',
      header: 'Mata Pelajaran',
      render: (item: any) => <strong>{item.subjectName}</strong>,
    },
    {
      key: 'average',
      header: 'Nilai Rata-rata',
      render: (item: any) => (
        <div>
          <strong>{item.average}</strong>
          <Badge variant={item.average >= 85 ? 'success' : item.average >= 75 ? 'primary' : item.average >= 65 ? 'warning' : 'danger'} style={{ marginLeft: '0.5rem' }}>
            {item.grade}
          </Badge>
        </div>
      ),
    },
    {
      key: 'keterangan',
      header: 'Keterangan',
      render: (item: any) => {
        if (item.average >= 85) return 'Sangat Baik';
        if (item.average >= 75) return 'Baik';
        if (item.average >= 65) return 'Cukup';
        return 'Perlu Perbaikan';
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="parent-grades">
        <h1>Nilai Anak</h1>

        <div className="page-filters">
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
        ) : subjectGrades.length === 0 ? (
          <EmptyState
            icon="grade"
            title="Tidak Ada Nilai"
            message="Belum ada nilai yang tersedia."
          />
        ) : (
          <Card title={`Nilai ${selectedSemester !== 'all' ? `Semester ${selectedSemester}` : ''} ${selectedYear !== 'all' ? selectedYear : ''}`.trim() || 'Nilai'} variant="elevated">
            <Table columns={columns} data={subjectGrades} />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

