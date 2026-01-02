import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { FormSelect, Badge } from '../../components/common';
import './TeacherAnalytics.css';

const mockClasses = [
  { value: '1', label: 'X IPA 1' },
  { value: '2', label: 'X IPA 2' },
];

const mockStats = {
  averageScore: 85,
  attendanceRate: 95,
  assignmentCompletion: 88,
  topPerformers: [
    { name: 'Siti Nurhaliza', score: 95 },
    { name: 'Budi Santoso', score: 90 },
    { name: 'Andi Pratama', score: 88 },
  ],
  subjectPerformance: [
    { subject: 'Tugas', average: 87 },
    { subject: 'Kuis', average: 83 },
    { subject: 'UTS', average: 85 },
  ],
};

export const TeacherAnalytics = () => {
  const [selectedClass, setSelectedClass] = useState('1');

  return (
    <DashboardLayout>
      <div className="teacher-analytics">
        <div className="analytics-header">
          <h1>Analitik Performa Siswa</h1>
          <FormSelect
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={mockClasses}
          />
        </div>

        <div className="analytics-stats">
          <Card variant="elevated" className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{mockStats.averageScore}</div>
            <div className="stat-label">Rata-rata Nilai</div>
          </Card>

          <Card variant="elevated" className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{mockStats.attendanceRate}%</div>
            <div className="stat-label">Tingkat Kehadiran</div>
          </Card>

          <Card variant="elevated" className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{mockStats.assignmentCompletion}%</div>
            <div className="stat-label">Penyelesaian Tugas</div>
          </Card>
        </div>

        <div className="analytics-grid">
          <Card title="Top Performers" variant="elevated">
            <div className="top-performers">
              {mockStats.topPerformers.map((student, index) => (
                <div key={index} className="performer-item">
                  <div className="performer-rank">#{index + 1}</div>
                  <div className="performer-info">
                    <strong>{student.name}</strong>
                    <Badge variant="success">{student.score}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Performa per Tipe Penilaian" variant="elevated">
            <div className="subject-performance">
              {mockStats.subjectPerformance.map((item, index) => (
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
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

