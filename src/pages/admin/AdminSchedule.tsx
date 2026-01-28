import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { EmptyState, Loading } from '../../components/common';
import { DAYS_OF_WEEK } from '../../constants';
import { Schedule } from '../../types';
import { scheduleService, classService, subjectService, academicYearService, userService } from '../../services';
import './AdminSchedule.css';

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
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [savingSlots, setSavingSlots] = useState<Set<string>>(new Set());
  const [slotData, setSlotData] = useState<Record<string, { subjectId: string; teacherId: string }>>({});

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [schedulesData, classesData, subjectsData, academicYearsData, teachersData] = await Promise.all([
          scheduleService.getSchedules(),
          classService.getClasses(),
          subjectService.getSubjects(),
          academicYearService.getAcademicYears(),
          userService.getUsers('teacher'),
        ]);

        setSchedules(schedulesData);
        setClasses(classesData.map(c => ({ value: c.id, label: c.name })));
        setSubjects(subjectsData.map(s => ({ value: s.id, label: s.name })));
        setTeachers(teachersData.map(t => ({ value: t.id, label: t.fullName })));
        setAcademicYears(academicYearsData.map(ay => ({ value: ay.name, label: ay.name })));

        // Initialize slotData from existing schedules
        const initialSlotData: Record<string, { subjectId: string; teacherId: string }> = {};
        schedulesData.forEach(schedule => {
          const key = `${schedule.dayOfWeek}-${schedule.startTime}-${schedule.endTime}`;
          initialSlotData[key] = {
            subjectId: schedule.subjectId,
            teacherId: schedule.teacherId
          };
        });
        setSlotData(initialSlotData);

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
      const matchesYear = !selectedYear || schedule.academicYear === selectedYear;
      const matchesSemester = schedule.semester.toString() === selectedSemester;
      const matchesClass = selectedClass !== 'all' && schedule.classId === selectedClass;
      return matchesYear && matchesSemester && matchesClass;
    });
  }, [schedules, selectedYear, selectedSemester, selectedClass]);

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

  const timeSlots = useMemo(
    () => [
      { start: '07:00', end: '08:00' },
      { start: '08:00', end: '09:00' },
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '13:00', end: '14:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
    ],
    [],
  );

  const handleSlotChange = (day: number, slot: { start: string; end: string }, field: 'subjectId' | 'teacherId', value: string) => {
    const slotKey = `${day}-${slot.start}-${slot.end}`;
    setSlotData(prev => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        [field]: value
      }
    }));
  };

  const handleSaveSlot = async (day: number, slot: { start: string; end: string }) => {
    if (selectedClass === 'all') {
      alert('Pilih kelas terlebih dahulu.');
      return;
    }

    const slotKey = `${day}-${slot.start}-${slot.end}`;
    if (savingSlots.has(slotKey)) return;

    const data = slotData[slotKey];
    if (!data?.subjectId || !data?.teacherId) {
      alert('Pilih mata pelajaran dan guru terlebih dahulu.');
      return;
    }

    const existingSchedule = (schedulesByDay[day] || []).find(
      (schedule) => schedule.startTime === slot.start && schedule.endTime === slot.end,
    );

    try {
      setSavingSlots(new Set([...savingSlots, slotKey]));

      if (existingSchedule) {
        await scheduleService.updateSchedule(existingSchedule.id, {
          subjectId: data.subjectId,
          teacherId: data.teacherId,
        });
      } else {
        await scheduleService.createSchedule({
          classId: selectedClass,
          subjectId: data.subjectId,
          teacherId: data.teacherId,
          dayOfWeek: day,
          startTime: slot.start,
          endTime: slot.end,
          academicYear: selectedYear,
          semester: parseInt(selectedSemester),
        });
      }

      const filters: any = { academicYear: selectedYear, semester: parseInt(selectedSemester) };
      if (selectedClass !== 'all') filters.classId = selectedClass;
      const updatedSchedules = await scheduleService.getSchedules(filters);
      setSchedules(updatedSchedules);
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert(error instanceof Error ? error.message : 'Gagal menyimpan jadwal');
    } finally {
      const nextSaving = new Set(savingSlots);
      nextSaving.delete(slotKey);
      setSavingSlots(nextSaving);
    }
  };

  const handleDeleteSlot = async (day: number, slot: { start: string; end: string }) => {
    const slotKey = `${day}-${slot.start}-${slot.end}`;
    const existingSchedule = (schedulesByDay[day] || []).find(
      (schedule) => schedule.startTime === slot.start && schedule.endTime === slot.end,
    );

    if (!existingSchedule) return;

    try {
      setSavingSlots(new Set([...savingSlots, slotKey]));
      await scheduleService.deleteSchedule(existingSchedule.id);
      
      // Clear slot data
      setSlotData(prev => {
        const next = { ...prev };
        delete next[slotKey];
        return next;
      });

      const filters: any = { academicYear: selectedYear, semester: parseInt(selectedSemester) };
      if (selectedClass !== 'all') filters.classId = selectedClass;
      const updatedSchedules = await scheduleService.getSchedules(filters);
      setSchedules(updatedSchedules);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Gagal menghapus jadwal');
    } finally {
      const nextSaving = new Set(savingSlots);
      nextSaving.delete(slotKey);
      setSavingSlots(nextSaving);
    }
  };



  return (
    <DashboardLayout>
      <div className="admin-schedule">
        <div className="page-header">
          <h1>Manajemen Jadwal</h1>
        </div>

        <div className="page-filters">
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
          <div className="filter-group">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="filter-select"
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="filter-select"
            >
              <option value="all">Pilih Kelas</option>
              {classes.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : selectedClass === 'all' ? (
          <EmptyState
            icon="calendar"
            title="Pilih Kelas"
            message="Silakan pilih kelas terlebih dahulu untuk menampilkan jadwal."
          />
        ) : (
          <Card title="Jadwal Mingguan" variant="elevated">
            <div className="schedule-table-wrapper">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th className="schedule-time-col">Jam</th>
                    {[1, 2, 3, 4, 5, 6].map((day) => (
                      <th key={day}>{getDayName(day)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={`${slot.start}-${slot.end}`}>
                      <td className="schedule-time-cell">{slot.start} - {slot.end}</td>
                      {[1, 2, 3, 4, 5, 6].map((day) => {
                        const daySchedules = schedulesByDay[day] || [];
                        const slotSchedule = daySchedules.find(
                          (schedule) => schedule.startTime === slot.start && schedule.endTime === slot.end,
                        );
                        const slotKey = `${day}-${slot.start}-${slot.end}`;
                        const currentData = slotData[slotKey] || { subjectId: slotSchedule?.subjectId || '', teacherId: slotSchedule?.teacherId || '' };
                        const isDisabled = savingSlots.has(slotKey);
                        
                        return (
                          <td key={slotKey} className="schedule-slot-cell">
                            <div className="slot-controls">
                              <select
                                className="schedule-slot-select"
                                value={currentData.subjectId}
                                onChange={(e) => handleSlotChange(day, slot, 'subjectId', e.target.value)}
                                disabled={isDisabled}
                              >
                                <option value="">Pilih mapel</option>
                                {subjects.map((subject) => (
                                  <option key={subject.value} value={subject.value}>
                                    {subject.label}
                                  </option>
                                ))}
                              </select>
                              <select
                                className="schedule-slot-select"
                                value={currentData.teacherId}
                                onChange={(e) => handleSlotChange(day, slot, 'teacherId', e.target.value)}
                                disabled={isDisabled}
                              >
                                <option value="">Pilih guru</option>
                                {teachers.map((teacher) => (
                                  <option key={teacher.value} value={teacher.value}>
                                    {teacher.label}
                                  </option>
                                ))}
                              </select>
                              <div className="slot-actions">
                                <button
                                  className="btn-save-slot"
                                  onClick={() => handleSaveSlot(day, slot)}
                                  disabled={isDisabled || !currentData.subjectId || !currentData.teacherId}
                                  title="Simpan"
                                >
                                  ✓
                                </button>
                                {slotSchedule && (
                                  <button
                                    className="btn-delete-slot"
                                    onClick={() => handleDeleteSlot(day, slot)}
                                    disabled={isDisabled}
                                    title="Hapus"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
};
