import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Table, EmptyState, Pagination } from '../../components/common';
import { Attendance, AttendanceStatus } from '../../types';
import { ATTENDANCE_STATUS_LABELS } from '../../constants';
import { formatDate, getRelativeTime } from '../../utils';
import './StudentAttendance.css';

const MOCK_SUBJECTS: Record<string, string> = {
  subject1: 'Matematika',
  subject2: 'Fisika',
  subject3: 'Kimia',
  subject4: 'Biologi',
  subject5: 'Bahasa Indonesia',
};

// Contoh data absensi
const mockAttendances: Attendance[] = [
  {
    id: '1',
    studentId: 'student1',
    classId: 'class1',
    subjectId: 'subject1',
    date: new Date('2024-01-15'),
    status: 'present',
    recordedBy: 'teacher1',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    studentId: 'student1',
    classId: 'class1',
    subjectId: 'subject1',
    date: new Date('2024-01-16'),
    status: 'present',
    recordedBy: 'teacher1',
    createdAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    studentId: 'student1',
    classId: 'class1',
    subjectId: 'subject2',
    date: new Date('2024-01-17'),
    status: 'late',
    notes: 'Terlambat 10 menit',
    recordedBy: 'teacher1',
    createdAt: new Date('2024-01-17'),
  },
  {
    id: '4',
    studentId: 'student1',
    classId: 'class1',
    subjectId: 'subject3',
    date: new Date('2024-01-18'),
    status: 'present',
    recordedBy: 'teacher1',
    createdAt: new Date('2024-01-18'),
  },
  {
    id: '5',
    studentId: 'student1',
    classId: 'class1',
    subjectId: 'subject1',
    date: new Date('2024-01-19'),
    status: 'absent',
    notes: 'Sakit',
    recordedBy: 'teacher1',
    createdAt: new Date('2024-01-19'),
  },
  {
    id: '6',
    studentId: 'student1',
    classId: 'class1',
    subjectId: 'subject4',
    date: new Date('2024-01-20'),
    status: 'present',
    recordedBy: 'teacher1',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '7',
    studentId: 'student1',
    classId: 'class1',
    subjectId: 'subject5',
    date: new Date('2024-01-21'),
    status: 'excused',
    notes: 'Izin keperluan keluarga',
    recordedBy: 'teacher1',
    createdAt: new Date('2024-01-21'),
  },
];

const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, 'success' | 'danger' | 'warning' | 'info'> = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
  excused: 'info',
};

export const StudentAttendance = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Sort by date (newest first)
  const sortedAttendances = [...mockAttendances].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const totalPages = Math.ceil(sortedAttendances.length / itemsPerPage);
  const paginatedAttendances = sortedAttendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSubjectName = (subjectId: string) => {
    return MOCK_SUBJECTS[subjectId] || subjectId;
  };

  const columns = [
    {
      key: 'date',
      header: 'Tanggal',
      render: (item: Attendance) => (
        <div>
          <strong>{formatDate(item.date)}</strong>
          <div style={{ fontSize: '0.85rem', color: 'var(--ios-gray)', marginTop: '0.25rem' }}>
            {getRelativeTime(item.date)}
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Mata Pelajaran',
      render: (item: Attendance) => <strong>{getSubjectName(item.subjectId)}</strong>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Attendance) => (
        <Badge variant={ATTENDANCE_STATUS_COLORS[item.status]}>
          {ATTENDANCE_STATUS_LABELS[item.status] as string}
        </Badge>
      ),
    },
    {
      key: 'notes',
      header: 'Catatan',
      render: (item: Attendance) => item.notes || '-',
    },
  ];

  return (
    <DashboardLayout>
      <div className="student-attendance">
        <div className="page-header">
          <h1>Absensi</h1>
        </div>

        {/* Attendance Table */}
        {paginatedAttendances.length === 0 ? (
          <EmptyState
            icon="userGroup"
            title="Tidak Ada Data Absensi"
            message="Belum ada data absensi yang tersedia."
          />
        ) : (
          <Card title={`Riwayat Absensi (${sortedAttendances.length})`} variant="elevated">
            <Table columns={columns} data={paginatedAttendances} />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
