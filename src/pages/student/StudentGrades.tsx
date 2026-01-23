import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, FormSelect, Table, EmptyState } from '../../components/common';
import './StudentGrades.css';

const mockGrades = [
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

const getGradeBadge = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 85) return <Badge variant="success">Sangat Baik</Badge>;
  if (percentage >= 75) return <Badge variant="primary">Baik</Badge>;
  if (percentage >= 65) return <Badge variant="warning">Cukup</Badge>;
  return <Badge variant="danger">Perlu Perbaikan</Badge>;
};

// Get unique academic years from grades
const getUniqueAcademicYears = () => {
  const years = new Set(mockGrades.map((g) => g.academicYear));
  return Array.from(years).sort().reverse();
};

export const StudentGrades = () => {
  const uniqueAcademicYears = getUniqueAcademicYears();
  // Use the first available academic year as default
  const defaultAcademicYear = uniqueAcademicYears.length > 0 ? uniqueAcademicYears[0] : '2023-2024';
  
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(defaultAcademicYear);
  const [selectedSemester, setSelectedSemester] = useState<string>('1');

  const academicYearOptions = uniqueAcademicYears.map((year) => ({
    value: year,
    label: `Tahun Ajaran ${year}`,
  }));

  const filteredGrades = mockGrades.filter((grade) => {
    return (
      grade.academicYear === selectedAcademicYear &&
      grade.semester.toString() === selectedSemester
    );
  });

  const columns = [
    {
      key: 'subject',
      header: 'Mata Pelajaran',
    },
    {
      key: 'assignment',
      header: 'Tugas/Kuis',
    },
    {
      key: 'score',
      header: 'Nilai',
      render: (item: typeof mockGrades[0]) => (
        <div>
          <strong>{item.score}/{item.maxScore}</strong>
          <div style={{ marginTop: '0.25rem' }}>{getGradeBadge(item.score, item.maxScore)}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipe',
      render: (item: typeof mockGrades[0]) => {
        const typeLabels: Record<string, string> = {
          assignment: 'Tugas',
          quiz: 'Kuis',
          midterm: 'UTS',
          final: 'UAS',
        };
        return typeLabels[item.type] || item.type;
      },
    },
    {
      key: 'date',
      header: 'Tanggal',
      render: (item: typeof mockGrades[0]) =>
        item.date.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
    },
  ];

  return (
    <DashboardLayout>
      <div className="student-grades">
        <h1>Nilai</h1>

        <div className="grades-filters">
          <FormSelect
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            options={academicYearOptions}
          />
          <FormSelect
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            options={[
              { value: '1', label: 'Semester 1' },
              { value: '2', label: 'Semester 2' },
            ]}
          />
        </div>

        {filteredGrades.length === 0 ? (
          <EmptyState
            icon="📊"
            title="Tidak Ada Nilai"
            message={`Belum ada nilai yang tersedia untuk Tahun Ajaran ${selectedAcademicYear} Semester ${selectedSemester}.`}
          />
        ) : (
          <Card title={`Nilai Tahun Ajaran ${selectedAcademicYear} Semester ${selectedSemester}`} variant="elevated">
            <Table columns={columns} data={filteredGrades} />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

