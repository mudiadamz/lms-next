import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, SearchBar, FormSelect, Table, Icon, EmptyState, Pagination } from '../../components/common';
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
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Get current month as default
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [activeMonth, setActiveMonth] = useState<string>(currentMonth);

  // Filter attendances
  const filteredAttendances = mockAttendances.filter((att) => {
    const matchesSearch = true; // Can be enhanced
    const matchesSubject = selectedSubject === 'all' || att.subjectId === selectedSubject;
    const matchesMonth = !selectedMonth || att.date.toISOString().slice(0, 7) === selectedMonth;
    const matchesStatus = selectedStatus === 'all' || att.status === selectedStatus;
    return matchesSearch && matchesSubject && matchesMonth && matchesStatus;
  });

  // Sort by date (newest first)
  const sortedAttendances = [...filteredAttendances].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const totalPages = Math.ceil(sortedAttendances.length / itemsPerPage);
  const paginatedAttendances = sortedAttendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate statistics
  const totalAttendances = mockAttendances.length;
  const presentCount = mockAttendances.filter((att) => att.status === 'present').length;
  const absentCount = mockAttendances.filter((att) => att.status === 'absent').length;
  const lateCount = mockAttendances.filter((att) => att.status === 'late').length;
  const excusedCount = mockAttendances.filter((att) => att.status === 'excused').length;
  const attendanceRate = totalAttendances > 0 ? ((presentCount / totalAttendances) * 100).toFixed(1) : '0';

  // Get current month statistics
  const currentMonthAttendances = mockAttendances.filter(
    (att) => att.date.toISOString().slice(0, 7) === currentMonth
  );
  const currentMonthPresent = currentMonthAttendances.filter((att) => att.status === 'present').length;
  const currentMonthTotal = currentMonthAttendances.length;
  const currentMonthRate =
    currentMonthTotal > 0 ? ((currentMonthPresent / currentMonthTotal) * 100).toFixed(1) : '0';

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

  // Generate month options (last 6 months)
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    return options;
  };

  return (
    <DashboardLayout>
      <div className="student-attendance">
        <div className="page-header">
          <h1>Absensi</h1>
        </div>

        {/* Statistics Cards */}
        <div className="attendance-stats">
          <Card variant="elevated" className="stat-card stat-card--primary">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)' }}>
              <Icon name="checkCircle" size={24} style={{ color: '#34c759' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{attendanceRate}%</div>
              <div className="stat-label">Tingkat Kehadiran</div>
              <div className="stat-detail">
                {presentCount} dari {totalAttendances} hari
              </div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)' }}>
              <Icon name="checkCircle" size={20} style={{ color: '#34c759' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{presentCount}</div>
              <div className="stat-label">Hadir</div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)' }}>
              <Icon name="xCircle" size={20} style={{ color: '#ff3b30' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{absentCount}</div>
              <div className="stat-label">Tidak Hadir</div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 149, 0, 0.1)' }}>
              <Icon name="clock" size={20} style={{ color: '#ff9500' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{lateCount}</div>
              <div className="stat-label">Terlambat</div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
              <Icon name="info" size={20} style={{ color: '#007aff' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{excusedCount}</div>
              <div className="stat-label">Izin</div>
            </div>
          </Card>
        </div>

        {/* Current Month Summary */}
        <Card variant="elevated" className="month-summary">
          <div className="month-summary-header">
            <div>
              <h3>Bulan Ini</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ios-gray)' }}>
                {new Date(currentMonth + '-01').toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
            <div className="month-rate">
              <div className="month-rate-value">{currentMonthRate}%</div>
              <div className="month-rate-label">Kehadiran</div>
            </div>
          </div>
          <div className="month-summary-details">
            <div className="month-detail-item">
              <span>Hadir:</span>
              <strong>{currentMonthPresent}</strong>
            </div>
            <div className="month-detail-item">
              <span>Total:</span>
              <strong>{currentMonthTotal}</strong>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <div className="page-filters">
          <SearchBar
            placeholder="Cari absensi..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="filter-group">
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {Object.entries(MOCK_SUBJECTS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="">Semua Bulan</option>
              {getMonthOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">Semua Status</option>
              {Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label as string}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance Table */}
        {paginatedAttendances.length === 0 ? (
          <EmptyState
            icon="userGroup"
            title="Tidak Ada Data Absensi"
            message={selectedSubject !== 'all' || selectedMonth || selectedStatus !== 'all'
              ? 'Tidak ada absensi yang sesuai dengan filter yang dipilih.'
              : 'Belum ada data absensi yang tersedia.'}
          />
        ) : (
          <Card title={`Riwayat Absensi (${filteredAttendances.length})`} variant="elevated">
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
