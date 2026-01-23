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
  // Semester 1 - Tahun Ajaran 2023-2024
  {
    id: '1',
    subject: 'Matematika',
    assignment: 'Tugas Aljabar',
    score: 85,
    maxScore: 100,
    type: 'assignment',
    date: new Date('2024-01-10'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '2',
    subject: 'Matematika',
    assignment: 'Kuis Persamaan Linear',
    score: 88,
    maxScore: 100,
    type: 'quiz',
    date: new Date('2024-01-15'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '3',
    subject: 'Matematika',
    assignment: 'UTS Semester 1',
    score: 87,
    maxScore: 100,
    type: 'midterm',
    date: new Date('2024-01-25'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '4',
    subject: 'Bahasa Indonesia',
    assignment: 'Kuis Menulis Esai',
    score: 90,
    maxScore: 100,
    type: 'quiz',
    date: new Date('2024-01-12'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '5',
    subject: 'Bahasa Indonesia',
    assignment: 'Tugas Resensi Buku',
    score: 92,
    maxScore: 100,
    type: 'assignment',
    date: new Date('2024-01-18'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '6',
    subject: 'Bahasa Indonesia',
    assignment: 'UTS Semester 1',
    score: 89,
    maxScore: 100,
    type: 'midterm',
    date: new Date('2024-01-26'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '7',
    subject: 'Fisika',
    assignment: 'Tugas Hukum Newton',
    score: 82,
    maxScore: 100,
    type: 'assignment',
    date: new Date('2024-01-11'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '8',
    subject: 'Fisika',
    assignment: 'Kuis Gerak Lurus',
    score: 85,
    maxScore: 100,
    type: 'quiz',
    date: new Date('2024-01-16'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '9',
    subject: 'Fisika',
    assignment: 'UTS Semester 1',
    score: 84,
    maxScore: 100,
    type: 'midterm',
    date: new Date('2024-01-27'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '10',
    subject: 'Kimia',
    assignment: 'Tugas Struktur Atom',
    score: 87,
    maxScore: 100,
    type: 'assignment',
    date: new Date('2024-01-13'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '11',
    subject: 'Kimia',
    assignment: 'Kuis Ikatan Kimia',
    score: 90,
    maxScore: 100,
    type: 'quiz',
    date: new Date('2024-01-17'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '12',
    subject: 'Kimia',
    assignment: 'UTS Semester 1',
    score: 88,
    maxScore: 100,
    type: 'midterm',
    date: new Date('2024-01-28'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '13',
    subject: 'Biologi',
    assignment: 'Tugas Sistem Pencernaan',
    score: 86,
    maxScore: 100,
    type: 'assignment',
    date: new Date('2024-01-14'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '14',
    subject: 'Biologi',
    assignment: 'Kuis Sel',
    score: 88,
    maxScore: 100,
    type: 'quiz',
    date: new Date('2024-01-19'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '15',
    subject: 'Biologi',
    assignment: 'UTS Semester 1',
    score: 87,
    maxScore: 100,
    type: 'midterm',
    date: new Date('2024-01-29'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '16',
    subject: 'Bahasa Inggris',
    assignment: 'Tugas Writing',
    score: 85,
    maxScore: 100,
    type: 'assignment',
    date: new Date('2024-01-15'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '17',
    subject: 'Bahasa Inggris',
    assignment: 'Kuis Grammar',
    score: 83,
    maxScore: 100,
    type: 'quiz',
    date: new Date('2024-01-20'),
    academicYear: '2023-2024',
    semester: 1,
  },
  {
    id: '18',
    subject: 'Bahasa Inggris',
    assignment: 'UTS Semester 1',
    score: 86,
    maxScore: 100,
    type: 'midterm',
    date: new Date('2024-01-30'),
    academicYear: '2023-2024',
    semester: 1,
  },
  // Semester 2 - Tahun Ajaran 2023-2024
  {
    id: '19',
    subject: 'Matematika',
    assignment: 'Tugas Trigonometri',
    score: 88,
    maxScore: 100,
    type: 'assignment',
    date: new Date('2024-07-10'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '20',
    subject: 'Matematika',
    assignment: 'Kuis Kalkulus Dasar',
    score: 85,
    maxScore: 100,
    type: 'quiz',
    date: new Date('2024-07-15'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '21',
    subject: 'Matematika',
    assignment: 'UAS Semester 2',
    score: 89,
    maxScore: 100,
    type: 'final',
    date: new Date('2024-07-25'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '22',
    subject: 'Fisika',
    assignment: 'Tugas Mekanika',
    score: 82,
    maxScore: 100,
    type: 'assignment',
    date: new Date('2024-07-11'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '23',
    subject: 'Fisika',
    assignment: 'Kuis Termodinamika',
    score: 84,
    maxScore: 100,
    type: 'quiz',
    date: new Date('2024-07-16'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '24',
    subject: 'Fisika',
    assignment: 'UAS Semester 2',
    score: 83,
    maxScore: 100,
    type: 'final',
    date: new Date('2024-07-26'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '25',
    subject: 'Kimia',
    assignment: 'Kuis Struktur Atom',
    score: 87,
    maxScore: 100,
    type: 'quiz',
    date: new Date('2024-07-12'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '26',
    subject: 'Kimia',
    assignment: 'Tugas Reaksi Kimia',
    score: 89,
    maxScore: 100,
    type: 'assignment',
    date: new Date('2024-07-17'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '27',
    subject: 'Kimia',
    assignment: 'UAS Semester 2',
    score: 88,
    maxScore: 100,
    type: 'final',
    date: new Date('2024-07-27'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '28',
    subject: 'Biologi',
    assignment: 'Tugas Sistem Pernapasan',
    score: 86,
    maxScore: 100,
    type: 'assignment',
    date: new Date('2024-07-13'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '29',
    subject: 'Biologi',
    assignment: 'Kuis Genetika',
    score: 87,
    maxScore: 100,
    type: 'quiz',
    date: new Date('2024-07-18'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '30',
    subject: 'Biologi',
    assignment: 'UAS Semester 2',
    score: 88,
    maxScore: 100,
    type: 'final',
    date: new Date('2024-07-28'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '31',
    subject: 'Bahasa Indonesia',
    assignment: 'Tugas Drama',
    score: 91,
    maxScore: 100,
    type: 'assignment',
    date: new Date('2024-07-14'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '32',
    subject: 'Bahasa Indonesia',
    assignment: 'Kuis Puisi',
    score: 89,
    maxScore: 100,
    type: 'quiz',
    date: new Date('2024-07-19'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '33',
    subject: 'Bahasa Indonesia',
    assignment: 'UAS Semester 2',
    score: 90,
    maxScore: 100,
    type: 'final',
    date: new Date('2024-07-29'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '34',
    subject: 'Bahasa Inggris',
    assignment: 'Tugas Speaking',
    score: 84,
    maxScore: 100,
    type: 'assignment',
    date: new Date('2024-07-15'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '35',
    subject: 'Bahasa Inggris',
    assignment: 'Kuis Reading Comprehension',
    score: 86,
    maxScore: 100,
    type: 'quiz',
    date: new Date('2024-07-20'),
    academicYear: '2023-2024',
    semester: 2,
  },
  {
    id: '36',
    subject: 'Bahasa Inggris',
    assignment: 'UAS Semester 2',
    score: 85,
    maxScore: 100,
    type: 'final',
    date: new Date('2024-07-30'),
    academicYear: '2023-2024',
    semester: 2,
  },
];

