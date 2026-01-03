import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, Badge, Dropdown, Modal, FormSelect, FormInput, FormTextarea, Icon, EmptyState, Pagination } from '../../components/common';
import { AttendanceStatus, Attendance } from '../../types';
import { ATTENDANCE_STATUS_LABELS } from '../../constants';
import { formatDate } from '../../utils';
import './TeacherAttendance.css';

// Mock data untuk dropdowns
const MOCK_CLASSES = [
  { value: 'class1', label: 'X IPA 1' },
  { value: 'class2', label: 'X IPA 2' },
  { value: 'class3', label: 'XI IPA 1' },
];

const MOCK_SUBJECTS = [
  { value: 'subject1', label: 'Matematika' },
  { value: 'subject2', label: 'Fisika' },
  { value: 'subject3', label: 'Kimia' },
];

const MOCK_STUDENTS = [
  { id: 'student1', studentNumber: '2024001', fullName: 'Budi Santoso' },
  { id: 'student2', studentNumber: '2024002', fullName: 'Siti Nurhaliza' },
  { id: 'student3', studentNumber: '2024003', fullName: 'Andi Pratama' },
  { id: 'student4', studentNumber: '2024004', fullName: 'Rina Wijaya' },
  { id: 'student5', studentNumber: '2024005', fullName: 'Dedi Kurniawan' },
];

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
    studentId: 'student2',
    classId: 'class1',
    subjectId: 'subject1',
    date: new Date('2024-01-15'),
    status: 'present',
    recordedBy: 'teacher1',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    studentId: 'student3',
    classId: 'class1',
    subjectId: 'subject1',
    date: new Date('2024-01-15'),
    status: 'late',
    notes: 'Terlambat 10 menit',
    recordedBy: 'teacher1',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '4',
    studentId: 'student4',
    classId: 'class1',
    subjectId: 'subject1',
    date: new Date('2024-01-15'),
    status: 'absent',
    notes: 'Sakit',
    recordedBy: 'teacher1',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '5',
    studentId: 'student1',
    classId: 'class1',
    subjectId: 'subject2',
    date: new Date('2024-01-16'),
    status: 'present',
    recordedBy: 'teacher1',
    createdAt: new Date('2024-01-16'),
  },
];


const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, 'success' | 'danger' | 'warning' | 'info'> = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
  excused: 'info',
};

export const TeacherAttendance = () => {
  const [activeTab, setActiveTab] = useState<'input' | 'history'>('input');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>(mockAttendances);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>({});
  const itemsPerPage = 10;

  // Group attendances by date, class, and subject for history view
  const groupedAttendances = attendances.reduce((acc, att) => {
    const key = `${att.date.toISOString().split('T')[0]}_${att.classId}_${att.subjectId}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(att);
    return acc;
  }, {} as Record<string, Attendance[]>);

  const filteredAttendances = Object.values(groupedAttendances)
    .flat()
    .filter((att) => {
      const matchesClass = selectedClass === '' || att.classId === selectedClass;
      const matchesSubject = selectedSubject === '' || att.subjectId === selectedSubject;
      return matchesClass && matchesSubject;
    });

  const filteredHistory = filteredAttendances.filter((att) => {
    if (selectedDate) {
      const attDate = att.date.toISOString().split('T')[0];
      return attDate === selectedDate;
    }
    return true;
  });

  const currentData = activeTab === 'input' ? [] : filteredHistory;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenInputModal = () => {
    if (!selectedClass || !selectedSubject) {
      alert('Pilih kelas dan mata pelajaran terlebih dahulu');
      return;
    }
    // Initialize attendance data for all students
    const initialData: Record<string, AttendanceStatus> = {};
    MOCK_STUDENTS.forEach((student) => {
      initialData[student.id] = 'present'; // Default to present
    });
    setAttendanceData(initialData);
    setAttendanceNotes({});
    setShowInputModal(true);
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newAttendances: Attendance[] = MOCK_STUDENTS.map((student) => ({
        id: Date.now().toString() + student.id,
        studentId: student.id,
        classId: selectedClass,
        subjectId: selectedSubject,
        date: new Date(selectedDate),
        status: attendanceData[student.id] || 'present',
        notes: attendanceNotes[student.id] || undefined,
        recordedBy: 'teacher1', // In real app, get from auth context
        createdAt: new Date(),
      }));

      setAttendances([...attendances, ...newAttendances]);
      setShowInputModal(false);
      setAttendanceData({});
      setAttendanceNotes({});
      alert('Absensi berhasil disimpan');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Gagal menyimpan absensi');
    }
  };

  const handleEditAttendance = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setShowEditModal(true);
  };

  const handleUpdateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttendance) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In real app, update via API
      console.log('Updating attendance:', selectedAttendance.id);

      setShowEditModal(false);
      setSelectedAttendance(null);
      alert('Absensi berhasil diupdate');
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Gagal mengupdate absensi');
    }
  };

  const getClassName = (classId: string) => {
    return MOCK_CLASSES.find((c) => c.value === classId)?.label || classId;
  };

  const getSubjectName = (subjectId: string) => {
    return MOCK_SUBJECTS.find((s) => s.value === subjectId)?.label || subjectId;
  };

  const getStudentName = (studentId: string) => {
    return MOCK_STUDENTS.find((s) => s.id === studentId)?.fullName || studentId;
  };

  const getStudentNumber = (studentId: string) => {
    return MOCK_STUDENTS.find((s) => s.id === studentId)?.studentNumber || '-';
  };

  // Calculate statistics
  const todayAttendances = attendances.filter(
    (att) => att.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
  );
  const presentCount = todayAttendances.filter((att) => att.status === 'present').length;
  const absentCount = todayAttendances.filter((att) => att.status === 'absent').length;
  const lateCount = todayAttendances.filter((att) => att.status === 'late').length;

  const historyColumns = [
    {
      key: 'date',
      header: 'Tanggal',
      render: (item: Attendance) => formatDate(item.date),
    },
    {
      key: 'class',
      header: 'Kelas',
      render: (item: Attendance) => getClassName(item.classId),
    },
    {
      key: 'subject',
      header: 'Mata Pelajaran',
      render: (item: Attendance) => getSubjectName(item.subjectId),
    },
    {
      key: 'student',
      header: 'Siswa',
      render: (item: Attendance) => (
        <div>
          <strong>{getStudentName(item.studentId)}</strong>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            NIS: {getStudentNumber(item.studentId)}
          </div>
        </div>
      ),
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
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: Attendance) => (
        <Button variant="outline" size="small" onClick={() => handleEditAttendance(item)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="teacher-attendance">
        <div className="page-header">
          <h1>Absensi Siswa</h1>
        </div>

        {/* Statistics Cards */}
        <div className="attendance-stats">
          <Card variant="elevated" className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)' }}>
              <Icon name="checkCircle" size={24} style={{ color: '#34c759' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{presentCount}</div>
              <div className="stat-label">Hadir Hari Ini</div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)' }}>
              <Icon name="xCircle" size={24} style={{ color: '#ff3b30' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{absentCount}</div>
              <div className="stat-label">Tidak Hadir</div>
            </div>
          </Card>
          <Card variant="elevated" className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 149, 0, 0.1)' }}>
              <Icon name="clock" size={24} style={{ color: '#ff9500' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{lateCount}</div>
              <div className="stat-label">Terlambat</div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="attendance-tabs">
          <button
            className={`attendance-tab ${activeTab === 'input' ? 'attendance-tab--active' : ''}`}
            onClick={() => setActiveTab('input')}
          >
            <Icon name="plus" size={18} style={{ marginRight: '0.5rem' }} />
            Input Absensi
          </button>
          <button
            className={`attendance-tab ${activeTab === 'history' ? 'attendance-tab--active' : ''}`}
            onClick={() => {
              setActiveTab('history');
              setCurrentPage(1);
            }}
          >
            <Icon name="clock" size={18} style={{ marginRight: '0.5rem' }} />
            Riwayat Absensi
          </button>
        </div>

        {activeTab === 'input' && (
          <Card title="Input Absensi Baru" variant="elevated">
            <div className="input-attendance-form">
              <div className="form-row">
                <FormSelect
                  label="Kelas"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  options={[
                    { value: '', label: 'Pilih kelas' },
                    ...MOCK_CLASSES,
                  ]}
                  required
                />
                <FormSelect
                  label="Mata Pelajaran"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  options={[
                    { value: '', label: 'Pilih mata pelajaran' },
                    ...MOCK_SUBJECTS,
                  ]}
                  required
                />
                <FormInput
                  label="Tanggal"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </div>
              <Button
                onClick={handleOpenInputModal}
                disabled={!selectedClass || !selectedSubject}
                style={{ marginTop: '1rem' }}
              >
                <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
                Input Absensi
              </Button>
            </div>
          </Card>
        )}

        {activeTab === 'history' && (
          <>
            {/* Filters */}
            <div className="page-filters">
              <div className="filter-group">
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select"
                >
                  <option value="">Semua Kelas</option>
                  {MOCK_CLASSES.map((cls) => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select"
                >
                  <option value="">Semua Mata Pelajaran</option>
                  {MOCK_SUBJECTS.map((subj) => (
                    <option key={subj.value} value={subj.value}>
                      {subj.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <FormInput
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ minHeight: '44px' }}
                />
              </div>
            </div>

            {/* Table */}
            {paginatedData.length === 0 ? (
              <EmptyState
                icon="userGroup"
                title="Tidak Ada Riwayat Absensi"
                message={selectedClass || selectedSubject || selectedDate
                  ? 'Tidak ada absensi yang sesuai dengan filter yang dipilih.'
                  : 'Belum ada absensi yang diinput.'}
              />
            ) : (
              <Card title={`Riwayat Absensi (${currentData.length})`} variant="elevated">
                <Table columns={historyColumns} data={paginatedData} />
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </Card>
            )}
          </>
        )}

        {/* Input Attendance Modal */}
        <Modal
          isOpen={showInputModal}
          onClose={() => {
            setShowInputModal(false);
            setAttendanceData({});
            setAttendanceNotes({});
          }}
          title={`Input Absensi - ${getClassName(selectedClass)} - ${getSubjectName(selectedSubject)}`}
          size="large"
        >
          <form onSubmit={handleSubmitAttendance} className="attendance-input-form">
            <div className="attendance-date-info">
              <strong>Tanggal:</strong> {formatDate(new Date(selectedDate))}
            </div>
            <div className="students-attendance-list">
              {MOCK_STUDENTS.map((student) => (
                <div key={student.id} className="student-attendance-item">
                  <div className="student-info">
                    <strong>{student.fullName}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--ios-gray)' }}>
                      NIS: {student.studentNumber}
                    </span>
                  </div>
                  <div className="attendance-controls">
                    <select
                      value={attendanceData[student.id] || 'present'}
                      onChange={(e) =>
                        setAttendanceData({
                          ...attendanceData,
                          [student.id]: e.target.value as AttendanceStatus,
                        })
                      }
                      className="status-select"
                    >
                      <option value="present">Hadir</option>
                      <option value="absent">Tidak Hadir</option>
                      <option value="late">Terlambat</option>
                      <option value="excused">Izin</option>
                    </select>
                    {(attendanceData[student.id] === 'absent' ||
                      attendanceData[student.id] === 'late' ||
                      attendanceData[student.id] === 'excused') && (
                      <input
                        type="text"
                        placeholder="Catatan (opsional)"
                        value={attendanceNotes[student.id] || ''}
                        onChange={(e) =>
                          setAttendanceNotes({
                            ...attendanceNotes,
                            [student.id]: e.target.value,
                          })
                        }
                        className="notes-input"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowInputModal(false);
                  setAttendanceData({});
                  setAttendanceNotes({});
                }}
              >
                Batal
              </Button>
              <Button type="submit">Simpan Absensi</Button>
            </div>
          </form>
        </Modal>

        {/* Edit Attendance Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAttendance(null);
          }}
          title="Edit Absensi"
          size="medium"
        >
          {selectedAttendance && (
            <form onSubmit={handleUpdateAttendance} className="attendance-edit-form">
              <div className="form-group">
                <label>Siswa</label>
                <div>{getStudentName(selectedAttendance.studentId)}</div>
              </div>
              <div className="form-group">
                <label>Kelas</label>
                <div>{getClassName(selectedAttendance.classId)}</div>
              </div>
              <div className="form-group">
                <label>Mata Pelajaran</label>
                <div>{getSubjectName(selectedAttendance.subjectId)}</div>
              </div>
              <div className="form-group">
                <label>Tanggal</label>
                <div>{formatDate(selectedAttendance.date)}</div>
              </div>
              <FormSelect
                label="Status"
                value={selectedAttendance.status}
                onChange={(e) =>
                  setSelectedAttendance({
                    ...selectedAttendance,
                    status: e.target.value as AttendanceStatus,
                  })
                }
                options={Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => ({
                  value,
                  label: label as string,
                }))}
                required
              />
              <FormTextarea
                label="Catatan"
                value={selectedAttendance.notes || ''}
                onChange={(e) =>
                  setSelectedAttendance({
                    ...selectedAttendance,
                    notes: e.target.value,
                  })
                }
                rows={3}
              />
              <div className="modal-footer">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAttendance(null);
                  }}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan Perubahan</Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};
