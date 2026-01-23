import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon, Table } from '../../components/common';
import { ROUTES } from '../../constants';
import { ReportCard, Grade } from '../../types';
import { formatDate } from '../../utils';
import './TeacherReports.css';

// Mock data untuk rapor detail
const mockReportCard: ReportCard & { studentName: string; studentNumber: string; className: string } = {
  id: '1',
  studentId: 'student1',
  studentName: 'Budi Santoso',
  studentNumber: '2024001',
  classId: 'class1',
  className: 'X IPA 1',
  academicYear: '2024-2025',
  semester: 1,
  averageScore: 85.5,
  rank: 5,
  teacherNotes: 'Siswa menunjukkan kemajuan yang baik dalam pembelajaran. Perlu lebih aktif dalam diskusi kelas. Pertahankan semangat belajar!',
  grades: [
    {
      id: 'g1',
      studentId: 'student1',
      subjectId: 'subject1',
      score: 88,
      maxScore: 100,
      type: 'assignment',
      teacherId: 'teacher1',
      notes: 'Kerja bagus',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 'g2',
      studentId: 'student1',
      subjectId: 'subject1',
      score: 85,
      maxScore: 100,
      type: 'quiz',
      teacherId: 'teacher1',
      createdAt: new Date('2024-01-20'),
    },
    {
      id: 'g3',
      studentId: 'student1',
      subjectId: 'subject2',
      score: 90,
      maxScore: 100,
      type: 'assignment',
      teacherId: 'teacher1',
      createdAt: new Date('2024-01-18'),
    },
    {
      id: 'g4',
      studentId: 'student1',
      subjectId: 'subject2',
      score: 82,
      maxScore: 100,
      type: 'quiz',
      teacherId: 'teacher1',
      createdAt: new Date('2024-01-22'),
    },
    {
      id: 'g5',
      studentId: 'student1',
      subjectId: 'subject1',
      score: 87,
      maxScore: 100,
      type: 'midterm',
      teacherId: 'teacher1',
      createdAt: new Date('2024-01-25'),
    },
  ],
  createdAt: new Date('2024-01-30'),
};

const MOCK_SUBJECTS: Record<string, string> = {
  subject1: 'Matematika',
  subject2: 'Fisika',
  subject3: 'Kimia',
  subject4: 'Biologi',
  subject5: 'Bahasa Indonesia',
};

const GRADE_TYPE_LABELS: Record<string, string> = {
  assignment: 'Tugas',
  quiz: 'Kuis',
  midterm: 'UTS',
  final: 'UAS',
  other: 'Lainnya',
};

export const TeacherReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState(mockReportCard);

  useEffect(() => {
    // TODO: Fetch report from API based on id
    // For now, using mock data
  }, [id]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 75) return 'primary';
    if (score >= 65) return 'warning';
    return 'danger';
  };

  const getSubjectName = (subjectId: string) => {
    return MOCK_SUBJECTS[subjectId] || subjectId;
  };

  // Group grades by subject
  const gradesBySubject = report.grades.reduce((acc, grade) => {
    if (!acc[grade.subjectId]) {
      acc[grade.subjectId] = [];
    }
    acc[grade.subjectId].push(grade);
    return acc;
  }, {} as Record<string, Grade[]>);

  // Calculate average per subject
  const subjectAverages = Object.entries(gradesBySubject).map(([subjectId, grades]) => {
    const totalScore = grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0);
    const average = totalScore / grades.length;
    return {
      subjectId,
      subjectName: getSubjectName(subjectId),
      average,
      grades,
    };
  });

  const columns = [
    {
      key: 'subject',
      header: 'Mata Pelajaran',
      render: (item: typeof subjectAverages[0]) => <strong>{item.subjectName}</strong>,
    },
    {
      key: 'average',
      header: 'Rata-rata',
      render: (item: typeof subjectAverages[0]) => (
        <Badge variant={getScoreColor(item.average)}>
          {item.average.toFixed(1)}
        </Badge>
      ),
    },
    {
      key: 'count',
      header: 'Jumlah Nilai',
      render: (item: typeof subjectAverages[0]) => `${item.grades.length} nilai`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="report-detail">
        <div className="detail-header">
          <Button variant="primary">
            <Icon name="download" size={16} style={{ marginRight: '0.5rem' }} />
            Unduh PDF
          </Button>
        </div>

        {/* Report Header */}
        <Card variant="elevated" className="report-header-card">
          <div className="report-header">
            <div className="report-header-left">
              <h1>Rapor Siswa</h1>
              <div className="report-student-info">
                <div className="info-item">
                  <strong>Nama:</strong> {report.studentName}
                </div>
                <div className="info-item">
                  <strong>NIS:</strong> {report.studentNumber}
                </div>
                <div className="info-item">
                  <strong>Kelas:</strong> {report.className}
                </div>
                <div className="info-item">
                  <strong>Tahun Ajaran:</strong> {report.academicYear}
                </div>
                <div className="info-item">
                  <strong>Semester:</strong> Semester {report.semester}
                </div>
              </div>
            </div>
            <div className="report-header-right">
              <div className="report-summary">
                <div className="summary-item">
                  <div className="summary-label">Rata-rata Nilai</div>
                  <div className={`summary-value summary-value--${getScoreColor(report.averageScore)}`}>
                    {report.averageScore.toFixed(1)}
                  </div>
                </div>
                {report.rank && (
                  <div className="summary-item">
                    <div className="summary-label">Ranking</div>
                    <div className="summary-value">#{report.rank}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Subject Averages */}
        <Card title="Rata-rata per Mata Pelajaran" variant="elevated">
          <Table columns={columns} data={subjectAverages} />
        </Card>

        {/* Detailed Grades by Subject */}
        {subjectAverages.map((subject) => (
          <Card key={subject.subjectId} title={subject.subjectName} variant="elevated">
            <div className="grades-list">
              {subject.grades.map((grade) => (
                <div key={grade.id} className="grade-item">
                  <div className="grade-info">
                    <div className="grade-type">
                      <Badge variant="info" size="small">
                        {GRADE_TYPE_LABELS[grade.type] || grade.type}
                      </Badge>
                    </div>
                    <div className="grade-date">{formatDate(grade.createdAt)}</div>
                  </div>
                  <div className="grade-score">
                    <div className="score-value">
                      <Badge variant={getScoreColor((grade.score / grade.maxScore) * 100)}>
                        {grade.score} / {grade.maxScore}
                      </Badge>
                    </div>
                    <div className="score-percentage">
                      {((grade.score / grade.maxScore) * 100).toFixed(1)}%
                    </div>
                  </div>
                  {grade.notes && (
                    <div className="grade-notes">
                      <strong>Catatan:</strong> {grade.notes}
                    </div>
                  )}
                </div>
              ))}
              <div className="subject-average-summary">
                <strong>Rata-rata {subject.subjectName}:</strong>{' '}
                <Badge variant={getScoreColor(subject.average)}>
                  {subject.average.toFixed(1)}
                </Badge>
              </div>
            </div>
          </Card>
        ))}

        {/* Teacher Notes */}
        {report.teacherNotes && (
          <Card title="Catatan Guru" variant="elevated">
            <div className="teacher-notes">
              <p>{report.teacherNotes}</p>
            </div>
          </Card>
        )}

        {/* Report Footer */}
        <Card variant="outlined" className="report-footer">
          <div className="report-footer-content">
            <div>
              <strong>Tanggal Generate:</strong> {formatDate(report.createdAt)}
            </div>
            <div className="report-signature">
              <div className="signature-item">
                <div className="signature-line"></div>
                <div>Guru Wali Kelas</div>
              </div>
              <div className="signature-item">
                <div className="signature-line"></div>
                <div>Kepala Sekolah</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

