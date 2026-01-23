import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, Badge, Dropdown, Modal, FormSelect, FormInput, FormTextarea, Icon, EmptyState, Pagination, Loading } from '../../components/common';
import { AttendanceStatus, Attendance } from '../../types';
import { ATTENDANCE_STATUS_LABELS } from '../../constants';
import { formatDate } from '../../utils';
import { attendanceService, classService, subjectService, userService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherAttendance.css';

const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, 'success' | 'danger' | 'warning' | 'info'> = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
  excused: 'info',
};

export const TeacherAttendance = () => {
  const { user } = useAuth();
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
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ value: string; label: string }>>([]);
  const [students, setStudents] = useState<Array<{ id: string; studentNumber: string; fullName: string }>>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [classesData, subjectsData, studentsData] = await Promise.all([
          classService.getClasses(),
          subjectService.getSubjects(),
          userService.getUsers('student'),
        ]);

        // Get attendances for this teacher
        const allAttendances = await attendanceService.getAttendance();

        // Filter classes and subjects taught by this teacher
        const teacherClasses = classesData.filter(c => {
          const teacherIds = (c as any).teacherIds || [];
          return teacherIds.includes(user?.id);
        });

        setClasses(teacherClasses.map(c => ({ value: c.id, label: c.name })));
        setSubjects(subjectsData.map(s => ({ value: s.id, label: s.name })));
        setStudents(studentsData.map(s => ({ 
          id: s.id, 
          studentNumber: (s as any).studentNumber || '', 
          fullName: s.fullName 
        })));

        // Filter attendances by teacher
        const teacherAttendances = allAttendances.filter(a => a.recordedBy === user?.id);
        setAttendances(teacherAttendances);
      } catch (error) {
        console.error('Error loading attendance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // Group attendances by date, class, and subject for history view
  const groupedAttendances = attendances.reduce((acc, att) => {
    const dateStr = typeof att.date === 'string' ? att.date : att.date.toISOString().split('T')[0];
    const key = `${dateStr}_${att.classId}_${att.subjectId}`;
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
      const dateStr = typeof att.date === 'string' ? att.date : att.date.toISOString().split('T')[0];
      return dateStr === selectedDate;
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
    
    // Get students for selected class (students already have classId from useEffect)
    const classStudents = students.filter(s => (s as any).classId === selectedClass);

    // Initialize attendance data for all students
    const initialData: Record<string, AttendanceStatus> = {};
    classStudents.forEach((student) => {
      initialData[student.id] = 'present'; // Default to present
    });
    setAttendanceData(initialData);
    setAttendanceNotes({});
    setShowInputModal(true);
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Get students for selected class (students already have classId from useEffect)
      const classStudents = students.filter(s => (s as any).classId === selectedClass);

      const attendancesToCreate = classStudents.map((student) => ({
        studentId: student.id,
        status: attendanceData[student.id] || 'present',
        notes: attendanceNotes[student.id] || undefined,
      }));

      await attendanceService.bulkCreateAttendance(
        selectedClass,
        new Date(selectedDate),
        attendancesToCreate.map(a => ({ studentId: a.studentId, status: a.status }))
      );

      // Reload attendances
      const updatedAttendances = await attendanceService.getAttendance();
      const teacherAttendances = updatedAttendances.filter(a => a.recordedBy === user?.id);
      setAttendances(teacherAttendances);

      setShowInputModal(false);
      setAttendanceData({});
      setAttendanceNotes({});
      alert('Absensi berhasil disimpan');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Gagal menyimpan absensi');
    } finally {
      setIsSubmitting(false);
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
      setIsSubmitting(true);
      await attendanceService.updateAttendance(
        selectedAttendance.id,
        selectedAttendance.status,
        selectedAttendance.notes
      );

      // Reload attendances
      const updatedAttendances = await attendanceService.getAttendance();
      const teacherAttendances = updatedAttendances.filter(a => a.recordedBy === user?.id);
      setAttendances(teacherAttendances);

      setShowEditModal(false);
      setSelectedAttendance(null);
      alert('Absensi berhasil diupdate');
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Gagal mengupdate absensi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getClassName = (classId: string) => {
    return classes.find((c) => c.value === classId)?.label || classId;
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.value === subjectId)?.label || subjectId;
  };

  const getStudentName = (studentId: string) => {
    return students.find((s) => s.id === studentId)?.fullName || studentId;
  };

  const getStudentNumber = (studentId: string) => {
    return students.find((s) => s.id === studentId)?.studentNumber || '-';
  };

  // Calculate statistics
  const todayAttendances = attendances.filter((att) => {
    const dateStr = typeof att.date === 'string' ? att.date : att.date.toISOString().split('T')[0];
    return dateStr === new Date().toISOString().split('T')[0];
  });
  const presentCount = todayAttendances.filter((att) => att.status === 'present').length;
  const absentCount = todayAttendances.filter((att) => att.status === 'absent').length;
  const lateCount = todayAttendances.filter((att) => att.status === 'late').length;

  const historyColumns = [
    {
      key: 'date',
      header: 'Tanggal',
      render: (item: Attendance) => formatDate(new Date(item.date)),
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

        <div className="attendance-tabs">
          <button
            className={activeTab === 'input' ? 'active' : ''}
            onClick={() => setActiveTab('input')}
          >
            Input Absensi
          </button>
          <button
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            Riwayat Absensi
          </button>
        </div>

        {activeTab === 'input' ? (
          <Card variant="elevated">
            <div className="input-filters">
              <FormSelect
                label="Kelas"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                options={[
                  { value: '', label: 'Pilih kelas' },
                  ...classes,
                ]}
                required
              />
              <FormSelect
                label="Mata Pelajaran"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                options={[
                  { value: '', label: 'Pilih mata pelajaran' },
                  ...subjects,
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
              <Button onClick={handleOpenInputModal} disabled={!selectedClass || !selectedSubject}>
                Input Absensi
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <Card variant="elevated">
              <div className="history-filters">
                <FormSelect
                  label="Kelas"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  options={[
                    { value: '', label: 'Semua Kelas' },
                    ...classes,
                  ]}
                />
                <FormSelect
                  label="Mata Pelajaran"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  options={[
                    { value: '', label: 'Semua Mata Pelajaran' },
                    ...subjects,
                  ]}
                />
                <FormInput
                  label="Tanggal"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </Card>

            {isLoading ? (
              <Loading />
            ) : paginatedData.length === 0 ? (
              <EmptyState
                icon="userGroup"
                title="Tidak Ada Data Absensi"
                message="Belum ada data absensi yang tersedia."
              />
            ) : (
              <Card title={`Riwayat Absensi (${filteredHistory.length})`} variant="elevated">
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

        {/* Input Modal */}
        <Modal
          isOpen={showInputModal}
          onClose={() => setShowInputModal(false)}
          title="Input Absensi"
          size="large"
        >
          <form onSubmit={handleSubmitAttendance}>
            <div className="attendance-input-list">
              {students.filter(s => (s as any).classId === selectedClass).map((student) => (
                <div key={student.id} className="attendance-input-item">
                  <div className="student-info">
                    <strong>{student.fullName}</strong>
                    <span>NIS: {student.studentNumber}</span>
                  </div>
                  <FormSelect
                    value={attendanceData[student.id] || 'present'}
                    onChange={(e) =>
                      setAttendanceData({ ...attendanceData, [student.id]: e.target.value as AttendanceStatus })
                    }
                    options={[
                      { value: 'present', label: 'Hadir' },
                      { value: 'absent', label: 'Tidak Hadir' },
                      { value: 'late', label: 'Terlambat' },
                      { value: 'excused', label: 'Izin' },
                    ]}
                  />
                  <FormInput
                    placeholder="Catatan (opsional)"
                    value={attendanceNotes[student.id] || ''}
                    onChange={(e) =>
                      setAttendanceNotes({ ...attendanceNotes, [student.id]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <Button variant="outline" type="button" onClick={() => setShowInputModal(false)}>
                Batal
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Simpan Absensi
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
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
            <form onSubmit={handleUpdateAttendance}>
              <FormSelect
                label="Status"
                value={selectedAttendance.status}
                onChange={(e) =>
                  setSelectedAttendance({ ...selectedAttendance, status: e.target.value as AttendanceStatus })
                }
                options={[
                  { value: 'present', label: 'Hadir' },
                  { value: 'absent', label: 'Tidak Hadir' },
                  { value: 'late', label: 'Terlambat' },
                  { value: 'excused', label: 'Izin' },
                ]}
              />
              <FormTextarea
                label="Catatan"
                value={selectedAttendance.notes || ''}
                onChange={(e) =>
                  setSelectedAttendance({ ...selectedAttendance, notes: e.target.value })
                }
                rows={3}
              />
              <div className="modal-footer">
                <Button variant="outline" type="button" onClick={() => {
                  setShowEditModal(false);
                  setSelectedAttendance(null);
                }}>
                  Batal
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};
