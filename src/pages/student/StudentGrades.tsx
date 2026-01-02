import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, FormSelect, Table, EmptyState } from '../../components/common';
import './StudentGrades.css';

const mockGrades = [
  {
    id: '1',
    subject: 'Matematika',
    assignment: 'Tugas Aljabar',
    score: 85,
    maxScore: 100,
    type: 'assignment',
    date: new Date('2024-01-18'),
  },
  {
    id: '2',
    subject: 'Bahasa Indonesia',
    assignment: 'Kuis Menulis Esai',
    score: 90,
    maxScore: 100,
    type: 'quiz',
    date: new Date('2024-01-19'),
  },
  {
    id: '3',
    subject: 'Matematika',
    assignment: 'UTS Semester 1',
    score: 88,
    maxScore: 100,
    type: 'midterm',
    date: new Date('2024-01-20'),
  },
];

const getGradeBadge = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 85) return <Badge variant="success">Sangat Baik</Badge>;
  if (percentage >= 75) return <Badge variant="primary">Baik</Badge>;
  if (percentage >= 65) return <Badge variant="warning">Cukup</Badge>;
  return <Badge variant="danger">Perlu Perbaikan</Badge>;
};

export const StudentGrades = () => {
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const filteredGrades = mockGrades.filter((grade) => {
    if (selectedSubject !== 'all' && grade.subject !== selectedSubject) {
      return false;
    }
    return true;
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

  const averageScore =
    filteredGrades.reduce((sum, grade) => sum + (grade.score / grade.maxScore) * 100, 0) /
    filteredGrades.length;

  return (
    <DashboardLayout>
      <div className="student-grades">
        <h1>Nilai</h1>

        <div className="grades-filters">
          <FormSelect
            label="Semester"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            options={[
              { value: '1', label: 'Semester 1' },
              { value: '2', label: 'Semester 2' },
            ]}
          />
          <FormSelect
            label="Mata Pelajaran"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Mata Pelajaran' },
              { value: 'Matematika', label: 'Matematika' },
              { value: 'Bahasa Indonesia', label: 'Bahasa Indonesia' },
            ]}
          />
        </div>

        {filteredGrades.length === 0 ? (
          <EmptyState
            icon="📊"
            title="Tidak Ada Nilai"
            message="Belum ada nilai yang tersedia untuk semester ini."
          />
        ) : (
          <>
            <Card title={`Nilai Semester ${selectedSemester}`} variant="elevated">
              <div className="grades-summary">
                <div className="summary-item">
                  <span className="summary-label">Rata-rata Nilai:</span>
                  <span className="summary-value">{averageScore.toFixed(1)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Tugas/Kuis:</span>
                  <span className="summary-value">{filteredGrades.length}</span>
                </div>
              </div>
            </Card>

            <Card title="Detail Nilai" variant="elevated">
              <Table columns={columns} data={filteredGrades} />
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

