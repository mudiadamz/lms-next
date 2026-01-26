import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { EmptyState, Loading } from '../../components/common';
import { DAYS_OF_WEEK } from '../../constants';
import { Schedule } from '../../types';
import { scheduleService, classService, subjectService, academicYearService } from '../../services';
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
  const [subjectsRaw, setSubjectsRaw] = useState<Array<{ id: string; name: string; teacherId: string | null }>>([]);
  const [academicYears, setAcademicYears] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [savingSlots, setSavingSlots] = useState<Set<string>>(new Set());

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [schedulesData, classesData, subjectsData, academicYearsData] = await Promise.all([
          scheduleService.getSchedules(),
          classService.getClasses(),
          subjectService.getSubjects(),
          academicYearService.getAcademicYears(),
        ]);

        setSchedules(schedulesData);
        setClasses(classesData.map(c => ({ value: c.id, label: c.name })));
        setSubjectsRaw(subjectsData.map(s => ({ id: s.id, name: s.name, teacherId: s.teacherId })));
        setSubjects(subjectsData.map(s => ({ value: s.id, label: s.name })));
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

  const handleSlotSubjectChange = async (day: number, slot: { start: string; end: string }, subjectId: string) => {
    if (selectedClass === 'all') {
      alert('Pilih kelas terlebih dahulu.');
      return;
    }

    const slotKey = `${day}-${slot.start}-${slot.end}`;
    if (savingSlots.has(slotKey)) return;

    const existingSchedule = (schedulesByDay[day] || []).find(
      (schedule) => schedule.startTime === slot.start && schedule.endTime === slot.end,
    );

    try {
      setSavingSlots(new Set([...savingSlots, slotKey]));

      if (!subjectId) {
        if (existingSchedule) {
          await scheduleService.deleteSchedule(existingSchedule.id);
        }
      } else {
        const subject = subjectsRaw.find((item) => item.id === subjectId);
        if (!subject?.teacherId) {
          alert('Mata pelajaran belum memiliki guru.');
          return;
        }

        if (existingSchedule) {
          await scheduleService.updateSchedule(existingSchedule.id, {
            subjectId,
            teacherId: subject.teacherId,
          });
        } else {
          await scheduleService.createSchedule({
            classId: selectedClass,
            subjectId,
            teacherId: subject.teacherId,
            dayOfWeek: day,
            startTime: slot.start,
            endTime: slot.end,
            academicYear: selectedYear,
            semester: parseInt(selectedSemester),
          });
        }
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
                        return (
                          <td key={slotKey}>
                            <select
                              className="schedule-slot-select"
                              value={slotSchedule?.subjectId || ''}
                              onChange={(e) => handleSlotSubjectChange(day, slot, e.target.value)}
                              disabled={savingSlots.has(slotKey)}
                            >
                              <option value="">Pilih mata pelajaran</option>
                              {subjects.map((subject) => (
                                <option key={subject.value} value={subject.value}>
                                  {subject.label}
                                </option>
                              ))}
                            </select>
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
