import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, SearchBar, Table, Badge, Dropdown, Modal, FormInput, FormSelect, ConfirmDialog, Icon, EmptyState } from '../../components/common';
import { ROUTES, SCHOOL_LEVELS, DAYS_OF_WEEK } from '../../constants';
import { Schedule } from '../../types';
import './AdminSchedule.css';

// Mock data
const MOCK_CLASSES = [
  { value: 'class1', label: 'X IPA 1' },
  { value: 'class2', label: 'X IPA 2' },
  { value: 'class3', label: 'XI IPA 1' },
  { value: 'class4', label: 'XI IPA 2' },
  { value: 'class5', label: 'XII IPA 1' },
];

const MOCK_SUBJECTS = [
  { value: 'subject1', label: 'Matematika' },
  { value: 'subject2', label: 'Fisika' },
  { value: 'subject3', label: 'Kimia' },
  { value: 'subject4', label: 'Bahasa Indonesia' },
  { value: 'subject5', label: 'Bahasa Inggris' },
];

const MOCK_TEACHERS = [
  { value: 'teacher1', label: 'Ibu Siti' },
  { value: 'teacher2', label: 'Bapak Budi' },
  { value: 'teacher3', label: 'Ibu Rina' },
  { value: 'teacher4', label: 'Bapak Andi' },
];

const MOCK_ACADEMIC_YEARS = [
  { value: '2024-2025', label: '2024-2025' },
  { value: '2023-2024', label: '2023-2024' },
];

// Convert DAYS_OF_WEEK constant to form options format
const DAYS_OF_WEEK_OPTIONS = DAYS_OF_WEEK.map((day, index) => ({
  value: index.toString(),
  label: day,
}));

// Contoh data jadwal
const mockSchedules: Schedule[] = [
  {
    id: '1',
    classId: 'class1',
    subjectId: 'subject1',
    teacherId: 'teacher1',
    dayOfWeek: 1, // Senin
    startTime: '07:00',
    endTime: '08:30',
    room: 'A101',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '2',
    classId: 'class1',
    subjectId: 'subject2',
    teacherId: 'teacher2',
    dayOfWeek: 1, // Senin
    startTime: '08:30',
    endTime: '10:00',
    room: 'Lab Fisika',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '3',
    classId: 'class1',
    subjectId: 'subject3',
    teacherId: 'teacher3',
    dayOfWeek: 1, // Senin
    startTime: '10:30',
    endTime: '12:00',
    room: 'Lab Kimia',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '4',
    classId: 'class1',
    subjectId: 'subject4',
    teacherId: 'teacher4',
    dayOfWeek: 2, // Selasa
    startTime: '07:00',
    endTime: '08:30',
    room: 'A101',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '5',
    classId: 'class2',
    subjectId: 'subject1',
    teacherId: 'teacher1',
    dayOfWeek: 1, // Senin
    startTime: '13:00',
    endTime: '14:30',
    room: 'A102',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '6',
    classId: 'class2',
    subjectId: 'subject5',
    teacherId: 'teacher4',
    dayOfWeek: 2, // Selasa
    startTime: '08:30',
    endTime: '10:00',
    room: 'A102',
    academicYear: '2024-2025',
    semester: 1,
  },
];

// Helper function untuk mendapatkan nama kelas, mata pelajaran, dan guru
const getClassName = (classId: string) => {
  return MOCK_CLASSES.find((c) => c.value === classId)?.label || classId;
};

const getSubjectName = (subjectId: string) => {
  return MOCK_SUBJECTS.find((s) => s.value === subjectId)?.label || subjectId;
};

const getTeacherName = (teacherId: string) => {
  return MOCK_TEACHERS.find((t) => t.value === teacherId)?.label || teacherId;
};

const getDayName = (dayOfWeek: number) => {
  return DAYS_OF_WEEK[dayOfWeek] || `Hari ${dayOfWeek}`;
};

export const AdminSchedule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2024-2025');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    room: '',
    academicYear: '2024-2025',
    semester: '1',
  });

  const filteredSchedules = schedules.filter((schedule) => {
    const className = getClassName(schedule.classId).toLowerCase();
    const subjectName = getSubjectName(schedule.subjectId).toLowerCase();
    const teacherName = getTeacherName(schedule.teacherId).toLowerCase();
    const matchesSearch =
      className.includes(searchTerm.toLowerCase()) ||
      subjectName.includes(searchTerm.toLowerCase()) ||
      teacherName.includes(searchTerm.toLowerCase()) ||
      schedule.room?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || schedule.classId === selectedClass;
    const matchesDay = selectedDay === 'all' || schedule.dayOfWeek.toString() === selectedDay;
    const matchesYear = schedule.academicYear === selectedYear;
    return matchesSearch && matchesClass && matchesDay && matchesYear;
  });

  // Group schedules by day for better display
  const schedulesByDay = filteredSchedules.reduce((acc, schedule) => {
    const day = schedule.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, Schedule[]>);

  const handleCreate = () => {
    setFormData({
      classId: '',
      subjectId: '',
      teacherId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      room: '',
      academicYear: '2024-2025',
      semester: '1',
    });
    setShowCreateModal(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      classId: schedule.classId,
      subjectId: schedule.subjectId,
      teacherId: schedule.teacherId,
      dayOfWeek: schedule.dayOfWeek.toString(),
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room || '',
      academicYear: schedule.academicYear,
      semester: schedule.semester.toString(),
    });
    setShowEditModal(true);
  };

  const handleDelete = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowDeleteDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (showEditModal && selectedSchedule) {
        // Update existing schedule
        const updatedSchedule: Schedule = {
          ...selectedSchedule,
          classId: formData.classId,
          subjectId: formData.subjectId,
          teacherId: formData.teacherId,
          dayOfWeek: parseInt(formData.dayOfWeek),
          startTime: formData.startTime,
          endTime: formData.endTime,
          room: formData.room || undefined,
          academicYear: formData.academicYear,
          semester: parseInt(formData.semester),
        };
        setSchedules(schedules.map((s) => (s.id === selectedSchedule.id ? updatedSchedule : s)));
      } else {
        // Create new schedule
        const newSchedule: Schedule = {
          id: Date.now().toString(),
          classId: formData.classId,
          subjectId: formData.subjectId,
          teacherId: formData.teacherId,
          dayOfWeek: parseInt(formData.dayOfWeek),
          startTime: formData.startTime,
          endTime: formData.endTime,
          room: formData.room || undefined,
          academicYear: formData.academicYear,
          semester: parseInt(formData.semester),
        };
        setSchedules([...schedules, newSchedule]);
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setFormData({
        classId: '',
        subjectId: '',
        teacherId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        room: '',
        academicYear: '2024-2025',
        semester: '1',
      });
      setSelectedSchedule(null);
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Gagal menyimpan jadwal');
    }
  };

  const confirmDelete = async () => {
    if (!selectedSchedule) return;
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSchedules(schedules.filter((s) => s.id !== selectedSchedule.id));
      setShowDeleteDialog(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Gagal menghapus jadwal');
    }
  };

  const columns = [
    {
      key: 'day',
      header: 'Hari',
      render: (item: Schedule) => (
        <Badge variant="primary">{getDayName(item.dayOfWeek)}</Badge>
      ),
    },
    {
      key: 'time',
      header: 'Waktu',
      render: (item: Schedule) => (
        <div>
          <strong>{item.startTime} - {item.endTime}</strong>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Kelas',
      render: (item: Schedule) => getClassName(item.classId),
    },
    {
      key: 'subject',
      header: 'Mata Pelajaran',
      render: (item: Schedule) => getSubjectName(item.subjectId),
    },
    {
      key: 'teacher',
      header: 'Guru',
      render: (item: Schedule) => getTeacherName(item.teacherId),
    },
    {
      key: 'room',
      header: 'Ruangan',
      render: (item: Schedule) => item.room || '-',
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: Schedule) => (
        <Dropdown
          trigger={<Button variant="outline" size="small">Kelola</Button>}
          items={[
            { label: 'Edit', onClick: () => handleEdit(item) },
            { divider: true },
            { label: 'Hapus', onClick: () => handleDelete(item) },
          ]}
          align="right"
        />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="admin-schedule">
        <div className="page-header">
          <h1>Manajemen Jadwal</h1>
          <Button onClick={handleCreate}>
            <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
            Tambah Jadwal
          </Button>
        </div>

        <div className="page-filters">
          <SearchBar
            placeholder="Cari jadwal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="filter-group">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="filter-select"
            >
              <option value="all">Semua Kelas</option>
              {MOCK_CLASSES.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="filter-select"
            >
              <option value="all">Semua Hari</option>
              {DAYS_OF_WEEK_OPTIONS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="filter-select"
            >
              {MOCK_ACADEMIC_YEARS.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredSchedules.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Tidak Ada Jadwal"
            message={searchTerm || selectedClass !== 'all' || selectedDay !== 'all'
              ? 'Tidak ada jadwal yang sesuai dengan filter yang dipilih.'
              : 'Belum ada jadwal yang terdaftar.'}
            action={{
              label: 'Tambah Jadwal',
              onClick: handleCreate,
            }}
          />
        ) : (
          <>
            {/* Table View */}
            <Card title={`Daftar Jadwal (${filteredSchedules.length})`} variant="elevated">
              <Table columns={columns} data={filteredSchedules} />
            </Card>

            {/* Weekly View */}
            <Card title="Jadwal Mingguan" variant="elevated" style={{ marginTop: '1.5rem' }}>
              <div className="schedule-weekly-view">
                {[1, 2, 3, 4, 5].map((day) => {
                  const daySchedules = schedulesByDay[day] || [];
                  return (
                    <div key={day} className="schedule-day-card">
                      <h3 className="schedule-day-title">{getDayName(day)}</h3>
                      {daySchedules.length === 0 ? (
                        <div className="schedule-empty-day">Tidak ada jadwal</div>
                      ) : (
                        <div className="schedule-day-items">
                          {daySchedules
                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                            .map((schedule) => (
                              <div key={schedule.id} className="schedule-item">
                                <div className="schedule-time">
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                                <div className="schedule-content">
                                  <div className="schedule-subject">{getSubjectName(schedule.subjectId)}</div>
                                  <div className="schedule-details">
                                    {getClassName(schedule.classId)} • {getTeacherName(schedule.teacherId)}
                                    {schedule.room && ` • ${schedule.room}`}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setFormData({
              classId: '',
              subjectId: '',
              teacherId: '',
              dayOfWeek: '',
              startTime: '',
              endTime: '',
              room: '',
              academicYear: '2024-2025',
              semester: '1',
            });
          }}
          title="Tambah Jadwal"
          size="medium"
        >
          <form onSubmit={handleSubmit} className="schedule-form">
            <FormSelect
              label="Kelas"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              options={[
                { value: '', label: 'Pilih kelas' },
                ...MOCK_CLASSES,
              ]}
              required
            />
            <FormSelect
              label="Mata Pelajaran"
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              options={[
                { value: '', label: 'Pilih mata pelajaran' },
                ...MOCK_SUBJECTS,
              ]}
              required
            />
            <FormSelect
              label="Guru"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              options={[
                { value: '', label: 'Pilih guru' },
                ...MOCK_TEACHERS,
              ]}
              required
            />
            <FormSelect
              label="Hari"
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
              options={[
                { value: '', label: 'Pilih hari' },
                ...DAYS_OF_WEEK_OPTIONS,
              ]}
              required
            />
            <div className="form-row">
              <FormInput
                label="Waktu Mulai"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
              <FormInput
                label="Waktu Selesai"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
            <FormInput
              label="Ruangan"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="Contoh: A101, Lab Fisika"
            />
            <FormSelect
              label="Tahun Ajaran"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              options={MOCK_ACADEMIC_YEARS}
              required
            />
            <FormSelect
              label="Semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              options={[
                { value: '1', label: 'Semester 1' },
                { value: '2', label: 'Semester 2' },
              ]}
              required
            />
            <div className="modal-footer">
              <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSchedule(null);
          }}
          title="Edit Jadwal"
          size="medium"
        >
          <form onSubmit={handleSubmit} className="schedule-form">
            <FormSelect
              label="Kelas"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              options={[
                { value: '', label: 'Pilih kelas' },
                ...MOCK_CLASSES,
              ]}
              required
            />
            <FormSelect
              label="Mata Pelajaran"
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              options={[
                { value: '', label: 'Pilih mata pelajaran' },
                ...MOCK_SUBJECTS,
              ]}
              required
            />
            <FormSelect
              label="Guru"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              options={[
                { value: '', label: 'Pilih guru' },
                ...MOCK_TEACHERS,
              ]}
              required
            />
            <FormSelect
              label="Hari"
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
              options={[
                { value: '', label: 'Pilih hari' },
                ...DAYS_OF_WEEK_OPTIONS,
              ]}
              required
            />
            <div className="form-row">
              <FormInput
                label="Waktu Mulai"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
              <FormInput
                label="Waktu Selesai"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
            <FormInput
              label="Ruangan"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="Contoh: A101, Lab Fisika"
            />
            <FormSelect
              label="Tahun Ajaran"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              options={MOCK_ACADEMIC_YEARS}
              required
            />
            <FormSelect
              label="Semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              options={[
                { value: '1', label: 'Semester 1' },
                { value: '2', label: 'Semester 2' },
              ]}
              required
            />
            <div className="modal-footer">
              <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Perubahan</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedSchedule(null);
          }}
          onConfirm={confirmDelete}
          title="Hapus Jadwal"
          message={`Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
};
