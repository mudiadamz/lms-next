import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Table, Badge, Dropdown, Modal, FormInput, FormSelect, ConfirmDialog, Icon, EmptyState, Loading } from '../../components/common';
import { ROUTES, SCHOOL_LEVELS, DAYS_OF_WEEK } from '../../constants';
import { Schedule } from '../../types';
import { scheduleService, classService, subjectService, userService, academicYearService } from '../../services';
import './AdminSchedule.css';

// Mock data removed - now using API services

// Convert DAYS_OF_WEEK constant to form options format
const DAYS_OF_WEEK_OPTIONS = DAYS_OF_WEEK.map((day, index) => ({
  value: index.toString(),
  label: day,
}));

// Mock data removed - now using API services

// Helper functions will use data from state

const getDayName = (dayOfWeek: number) => {
  return DAYS_OF_WEEK[dayOfWeek] || `Hari ${dayOfWeek}`;
};

export const AdminSchedule = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<Array<{ value: string; label: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ value: string; label: string }>>([]);
  const [teachers, setTeachers] = useState<Array<{ value: string; label: string }>>([]);
  const [academicYears, setAcademicYears] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    room: '',
    academicYear: '',
    semester: '1',
  });
  // Editable table states
  const [editingMode, setEditingMode] = useState(false);
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [editingData, setEditingData] = useState<Record<string, Partial<Schedule>>>({});
  const [savingRows, setSavingRows] = useState<Set<string>>(new Set());
  const [savingAll, setSavingAll] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [schedulesData, classesData, subjectsData, teachersData, academicYearsData] = await Promise.all([
          scheduleService.getSchedules(),
          classService.getClasses(),
          subjectService.getSubjects(),
          userService.getUsers('teacher'),
          academicYearService.getAcademicYears(),
        ]);

        setSchedules(schedulesData);
        setClasses(classesData.map(c => ({ value: c.id, label: c.name })));
        setSubjects(subjectsData.map(s => ({ value: s.id, label: s.name })));
        setTeachers(teachersData.map(t => ({ value: t.id, label: t.fullName })));
        setAcademicYears(academicYearsData.map(ay => ({ value: ay.name, label: ay.name })));

        // Set default selected year if available
        if (academicYearsData.length > 0 && !selectedYear) {
          setSelectedYear(academicYearsData[0].name);
        }
      } catch (error) {
        console.error('Error loading schedule data:', error);
        alert('Gagal memuat data jadwal');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const matchesClass = selectedClass === 'all' || schedule.classId === selectedClass;
      const matchesDay = selectedDay === 'all' || schedule.dayOfWeek.toString() === selectedDay;
      const matchesYear = !selectedYear || schedule.academicYear === selectedYear;
      const matchesSearch = !searchTerm || 
        (schedule.classId && classes.find(c => c.value === schedule.classId)?.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (schedule.subjectId && subjects.find(s => s.value === schedule.subjectId)?.label.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesClass && matchesDay && matchesYear && matchesSearch;
    });
  }, [schedules, selectedClass, selectedDay, selectedYear, searchTerm, classes, subjects]);

  // Update editing data when filtered schedules change in edit mode
  useEffect(() => {
    if (editingMode && filteredSchedules.length > 0) {
      const newEditingData: Record<string, Partial<Schedule>> = {};
      filteredSchedules.forEach(schedule => {
        // Preserve existing edits if available, otherwise use current schedule data
        newEditingData[schedule.id] = editingData[schedule.id] || {
          classId: schedule.classId,
          subjectId: schedule.subjectId,
          teacherId: schedule.teacherId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room || '',
          academicYear: schedule.academicYear,
          semester: schedule.semester,
        };
      });
      setEditingData(newEditingData);
      setEditingRows(new Set(filteredSchedules.map(s => s.id)));
    } else if (!editingMode) {
      // Clear editing data when exiting edit mode
      setEditingRows(new Set());
      setEditingData({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMode, filteredSchedules]);

  // Group schedules by day for better display
  const schedulesByDay = useMemo(() => {
    return filteredSchedules.reduce((acc, schedule) => {
      const day = schedule.dayOfWeek;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(schedule);
      return acc;
    }, {} as Record<number, Schedule[]>);
  }, [filteredSchedules]);

  const handleCreate = () => {
    const defaultYear = academicYears.find(ay => ay.value === selectedYear)?.value || academicYears[0]?.value || '';
    setFormData({
      classId: '',
      subjectId: '',
      teacherId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      room: '',
      academicYear: defaultYear,
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
      setIsSubmitting(true);

      const scheduleData = {
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

      if (showEditModal && selectedSchedule) {
        // Update existing schedule
        await scheduleService.updateSchedule(selectedSchedule.id, scheduleData);
      } else {
        // Create new schedule
        await scheduleService.createSchedule(scheduleData);
      }

      // Reload schedules
      const filters: any = { academicYear: selectedYear };
      if (selectedClass !== 'all') filters.classId = selectedClass;
      if (selectedDay !== 'all') filters.dayOfWeek = parseInt(selectedDay);
      const updatedSchedules = await scheduleService.getSchedules(filters);
      setSchedules(updatedSchedules);

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
        academicYear: selectedYear || '2024-2025',
        semester: '1',
      });
      setSelectedSchedule(null);
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert(error instanceof Error ? error.message : 'Gagal menyimpan jadwal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedSchedule) return;
    try {
      setIsSubmitting(true);
      await scheduleService.deleteSchedule(selectedSchedule.id);
      
      // Reload schedules
      const filters: any = { academicYear: selectedYear };
      if (selectedClass !== 'all') filters.classId = selectedClass;
      if (selectedDay !== 'all') filters.dayOfWeek = parseInt(selectedDay);
      const updatedSchedules = await scheduleService.getSchedules(filters);
      setSchedules(updatedSchedules);
      
      setShowDeleteDialog(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert(error instanceof Error ? error.message : 'Gagal menghapus jadwal');
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleInlineSave = async (schedule: Schedule) => {
    const editData = editingData[schedule.id];
    if (!editData) return;

    try {
      setSavingRows(new Set([...savingRows, schedule.id]));
      
      const scheduleData = {
        classId: editData.classId || schedule.classId,
        subjectId: editData.subjectId || schedule.subjectId,
        teacherId: editData.teacherId || schedule.teacherId,
        dayOfWeek: editData.dayOfWeek !== undefined ? editData.dayOfWeek : schedule.dayOfWeek,
        startTime: editData.startTime || schedule.startTime,
        endTime: editData.endTime || schedule.endTime,
        room: editData.room !== undefined ? editData.room : schedule.room,
        academicYear: editData.academicYear || schedule.academicYear,
        semester: editData.semester !== undefined ? editData.semester : schedule.semester,
      };

      await scheduleService.updateSchedule(schedule.id, scheduleData);

      // Reload schedules
      const filters: any = { academicYear: selectedYear };
      if (selectedClass !== 'all') filters.classId = selectedClass;
      if (selectedDay !== 'all') filters.dayOfWeek = parseInt(selectedDay);
      const updatedSchedules = await scheduleService.getSchedules(filters);
      setSchedules(updatedSchedules);

      // Update editing data with saved values
      setEditingData({
        ...editingData,
        [schedule.id]: {
          ...editData,
          ...scheduleData,
        },
      });
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert(error instanceof Error ? error.message : 'Gagal menyimpan jadwal');
    } finally {
      const newSavingRows = new Set(savingRows);
      newSavingRows.delete(schedule.id);
      setSavingRows(newSavingRows);
    }
  };

  const updateEditingData = (scheduleId: string, field: keyof Schedule, value: any) => {
    setEditingData({
      ...editingData,
      [scheduleId]: {
        ...editingData[scheduleId],
        [field]: value,
      },
    });
  };

  const columns = [
    {
      key: 'day',
      header: 'Hari',
      render: (item: Schedule) => {
        const isEditing = editingMode;
        if (isEditing) {
          return (
            <select
              value={editingData[item.id]?.dayOfWeek?.toString() || item.dayOfWeek.toString()}
              onChange={(e) => updateEditingData(item.id, 'dayOfWeek', parseInt(e.target.value))}
              className="inline-edit-select"
            >
              {DAYS_OF_WEEK_OPTIONS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          );
        }
        return <Badge variant="primary">{getDayName(item.dayOfWeek)}</Badge>;
      },
    },
    {
      key: 'time',
      header: 'Waktu',
      render: (item: Schedule) => {
        const isEditing = editingMode;
        if (isEditing) {
          return (
            <div className="inline-edit-time">
              <input
                type="time"
                value={editingData[item.id]?.startTime || item.startTime}
                onChange={(e) => updateEditingData(item.id, 'startTime', e.target.value)}
                className="inline-edit-input"
              />
              <span> - </span>
              <input
                type="time"
                value={editingData[item.id]?.endTime || item.endTime}
                onChange={(e) => updateEditingData(item.id, 'endTime', e.target.value)}
                className="inline-edit-input"
              />
            </div>
          );
        }
        return (
          <div>
            <strong>{item.startTime} - {item.endTime}</strong>
          </div>
        );
      },
    },
    {
      key: 'class',
      header: 'Kelas',
      render: (item: Schedule) => {
        const isEditing = editingMode;
        if (isEditing) {
          return (
            <select
              value={editingData[item.id]?.classId || item.classId}
              onChange={(e) => updateEditingData(item.id, 'classId', e.target.value)}
              className="inline-edit-select"
            >
              {classes.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </select>
          );
        }
        const cls = classes.find(c => c.value === item.classId);
        return cls?.label || item.classId;
      },
    },
    {
      key: 'subject',
      header: 'Mata Pelajaran',
      render: (item: Schedule) => {
        const isEditing = editingMode;
        if (isEditing) {
          return (
            <select
              value={editingData[item.id]?.subjectId || item.subjectId}
              onChange={(e) => updateEditingData(item.id, 'subjectId', e.target.value)}
              className="inline-edit-select"
            >
              {subjects.map((subj) => (
                <option key={subj.value} value={subj.value}>
                  {subj.label}
                </option>
              ))}
            </select>
          );
        }
        const subject = subjects.find(s => s.value === item.subjectId);
        return subject?.label || item.subjectId;
      },
    },
    {
      key: 'teacher',
      header: 'Guru',
      render: (item: Schedule) => {
        const isEditing = editingMode;
        if (isEditing) {
          return (
            <select
              value={editingData[item.id]?.teacherId || item.teacherId}
              onChange={(e) => updateEditingData(item.id, 'teacherId', e.target.value)}
              className="inline-edit-select"
            >
              {teachers.map((teacher) => (
                <option key={teacher.value} value={teacher.value}>
                  {teacher.label}
                </option>
              ))}
            </select>
          );
        }
        const teacher = teachers.find(t => t.value === item.teacherId);
        return teacher?.label || item.teacherId;
      },
    },
    {
      key: 'room',
      header: 'Ruangan',
      render: (item: Schedule) => {
        const isEditing = editingMode;
        if (isEditing) {
          return (
            <input
              type="text"
              value={editingData[item.id]?.room !== undefined ? editingData[item.id].room : (item.room || '')}
              onChange={(e) => updateEditingData(item.id, 'room', e.target.value)}
              className="inline-edit-input"
              placeholder="Ruangan"
            />
          );
        }
        return item.room || '-';
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: Schedule) => {
        const isSaving = savingRows.has(item.id);
        
        if (editingMode) {
          return (
            <div className="inline-edit-actions">
              <Button
                size="small"
                onClick={() => handleInlineSave(item)}
                disabled={isSaving}
              >
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Dropdown
                trigger={<Button variant="outline" size="small">⋯</Button>}
                items={[
                  { label: 'Hapus', onClick: () => handleDelete(item) },
                ]}
                align="right"
              />
            </div>
          );
        }
        
        // Normal mode - show dropdown with edit and delete
        return (
          <Dropdown
            trigger={<Button variant="outline" size="small">Kelola</Button>}
            items={[
              { label: 'Edit', onClick: () => handleEdit(item) },
              { divider: true },
              { label: 'Hapus', onClick: () => handleDelete(item) },
            ]}
            align="right"
          />
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="admin-schedule">
        <div className="page-header">
          <h1>Manajemen Jadwal</h1>
          <div className="header-actions">
            {editingMode && (
              <Button
                variant="primary"
                onClick={async () => {
                  setSavingAll(true);
                  try {
                    // Save all edited rows
                    const savePromises = filteredSchedules.map(schedule => handleInlineSave(schedule));
                    await Promise.all(savePromises);
                    alert('Semua perubahan berhasil disimpan!');
                  } catch (error) {
                    console.error('Error saving all schedules:', error);
                    alert('Beberapa perubahan gagal disimpan. Silakan cek kembali.');
                  } finally {
                    setSavingAll(false);
                  }
                }}
                disabled={isLoading || savingAll}
              >
                <Icon name="save" size={16} style={{ marginRight: '0.5rem' }} />
                {savingAll ? 'Menyimpan Semua...' : 'Simpan Semua'}
              </Button>
            )}
            <Button
              variant={editingMode ? "primary" : "outline"}
              onClick={() => {
                const newEditingMode = !editingMode;
                setEditingMode(newEditingMode);
                
                if (newEditingMode) {
                  // Enable editing for all rows when entering edit mode
                  const allRowIds = new Set(filteredSchedules.map(s => s.id));
                  setEditingRows(allRowIds);
                  
                  // Initialize editing data for all rows
                  const initialEditingData: Record<string, Partial<Schedule>> = {};
                  filteredSchedules.forEach(schedule => {
                    initialEditingData[schedule.id] = {
                      classId: schedule.classId,
                      subjectId: schedule.subjectId,
                      teacherId: schedule.teacherId,
                      dayOfWeek: schedule.dayOfWeek,
                      startTime: schedule.startTime,
                      endTime: schedule.endTime,
                      room: schedule.room || '',
                      academicYear: schedule.academicYear,
                      semester: schedule.semester,
                    };
                  });
                  setEditingData(initialEditingData);
                } else {
                  // Cancel all editing when disabling edit mode
                  setEditingRows(new Set());
                  setEditingData({});
                }
              }}
              disabled={isLoading || savingAll}
            >
              <Icon name={editingMode ? "x" : "edit"} size={16} style={{ marginRight: '0.5rem' }} />
              {editingMode ? 'Tutup Edit' : 'Mode Edit'}
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              <Icon name="plus" size={16} style={{ marginRight: '0.5rem' }} />
              Tambah Jadwal
            </Button>
          </div>
        </div>

        <div className="page-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Cari jadwal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="filter-select"
            >
              <option value="all">Semua Kelas</option>
              {classes.map((cls) => (
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
              {academicYears.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : filteredSchedules.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Tidak Ada Jadwal"
            message={selectedClass !== 'all' || selectedDay !== 'all'
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
                                  <div className="schedule-subject">
                                    {(schedule as any).subjectName || subjects.find(s => s.value === schedule.subjectId)?.label || schedule.subjectId}
                                  </div>
                                  <div className="schedule-details">
                                    {(schedule as any).className || classes.find(c => c.value === schedule.classId)?.label || schedule.classId} • {(schedule as any).teacherName || teachers.find(t => t.value === schedule.teacherId)?.label || schedule.teacherId}
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
      const defaultYear = academicYears.find(ay => ay.value === selectedYear)?.value || academicYears[0]?.value || '';
      setFormData({
        classId: '',
        subjectId: '',
        teacherId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        room: '',
        academicYear: defaultYear,
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
                ...classes,
              ]}
              required
            />
            <FormSelect
              label="Mata Pelajaran"
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              options={[
                { value: '', label: 'Pilih mata pelajaran' },
                ...subjects,
              ]}
              required
            />
            <FormSelect
              label="Guru"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              options={[
                { value: '', label: 'Pilih guru' },
                ...teachers,
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
              options={academicYears}
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
              <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
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
                ...classes,
              ]}
              required
            />
            <FormSelect
              label="Mata Pelajaran"
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              options={[
                { value: '', label: 'Pilih mata pelajaran' },
                ...subjects,
              ]}
              required
            />
            <FormSelect
              label="Guru"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              options={[
                { value: '', label: 'Pilih guru' },
                ...teachers,
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
              options={academicYears}
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
