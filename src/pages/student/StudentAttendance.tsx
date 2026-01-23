import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Table, EmptyState, Pagination, Loading } from '../../components/common';
import { Attendance, AttendanceStatus } from '../../types';
import { ATTENDANCE_STATUS_LABELS } from '../../constants';
import { formatDate, getRelativeTime } from '../../utils';
import { attendanceService, subjectService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './StudentAttendance.css';

const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, 'success' | 'danger' | 'warning' | 'info'> = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
  excused: 'info',
};

export const StudentAttendance = () => {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [attendancesData, subjectsData] = await Promise.all([
          attendanceService.getAttendance(user?.id ? { studentId: user.id } : {}),
          subjectService.getSubjects(),
        ]);
        setAttendances(attendancesData);
        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);
      } catch (error) {
        console.error('Error loading attendance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);
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
  // Sort by date (newest first)
  const sortedAttendances = [...attendances].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalPages = Math.ceil(sortedAttendances.length / itemsPerPage);
  const paginatedAttendances = sortedAttendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSubjectName = (subjectId: string) => {
    return subjects[subjectId] || subjectId;
  };

  const columns = [
    {
      key: 'date',
      header: 'Tanggal',
      render: (item: Attendance) => (
        <div>
          <strong>{formatDate(new Date(item.date))}</strong>
          <div style={{ fontSize: '0.85rem', color: 'var(--ios-gray)', marginTop: '0.25rem' }}>
            {getRelativeTime(new Date(item.date))}
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
        {isLoading ? (
          <Loading />
        ) : paginatedAttendances.length === 0 ? (
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
