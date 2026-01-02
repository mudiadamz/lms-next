import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { FormSelect, Badge, Icon, EmptyState } from '../../components/common';
import { Schedule } from '../../types';
import { DAYS_OF_WEEK } from '../../constants';
import './StudentSchedule.css';

// Mock data untuk mata pelajaran
const MOCK_SUBJECTS: Record<string, string> = {
  subject1: 'Matematika',
  subject2: 'Fisika',
  subject3: 'Kimia',
  subject4: 'Biologi',
  subject5: 'Bahasa Indonesia',
  subject6: 'Bahasa Inggris',
  subject7: 'Sejarah',
  subject8: 'Pendidikan Jasmani',
};

// Mock data untuk guru
const MOCK_TEACHERS: Record<string, string> = {
  teacher1: 'Ibu Siti',
  teacher2: 'Bapak Budi',
  teacher3: 'Ibu Rina',
  teacher4: 'Bapak Andi',
  teacher5: 'Ibu Dewi',
  teacher6: 'Bapak Eko',
};

// Contoh data jadwal untuk siswa
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
    subjectId: 'subject5',
    teacherId: 'teacher3',
    dayOfWeek: 1, // Senin
    startTime: '08:30',
    endTime: '10:00',
    room: 'A102',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '3',
    classId: 'class1',
    subjectId: 'subject2',
    teacherId: 'teacher2',
    dayOfWeek: 1, // Senin
    startTime: '10:30',
    endTime: '12:00',
    room: 'Lab Fisika',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '4',
    classId: 'class1',
    subjectId: 'subject6',
    teacherId: 'teacher4',
    dayOfWeek: 2, // Selasa
    startTime: '07:00',
    endTime: '08:30',
    room: 'A103',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '5',
    classId: 'class1',
    subjectId: 'subject3',
    teacherId: 'teacher5',
    dayOfWeek: 2, // Selasa
    startTime: '08:30',
    endTime: '10:00',
    room: 'Lab Kimia',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '6',
    classId: 'class1',
    subjectId: 'subject4',
    teacherId: 'teacher6',
    dayOfWeek: 2, // Selasa
    startTime: '10:30',
    endTime: '12:00',
    room: 'Lab Biologi',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '7',
    classId: 'class1',
    subjectId: 'subject1',
    teacherId: 'teacher1',
    dayOfWeek: 3, // Rabu
    startTime: '07:00',
    endTime: '08:30',
    room: 'A101',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '8',
    classId: 'class1',
    subjectId: 'subject7',
    teacherId: 'teacher3',
    dayOfWeek: 3, // Rabu
    startTime: '08:30',
    endTime: '10:00',
    room: 'A104',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '9',
    classId: 'class1',
    subjectId: 'subject8',
    teacherId: 'teacher2',
    dayOfWeek: 3, // Rabu
    startTime: '10:30',
    endTime: '12:00',
    room: 'Lapangan',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '10',
    classId: 'class1',
    subjectId: 'subject2',
    teacherId: 'teacher2',
    dayOfWeek: 4, // Kamis
    startTime: '07:00',
    endTime: '08:30',
    room: 'A101',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '11',
    classId: 'class1',
    subjectId: 'subject5',
    teacherId: 'teacher3',
    dayOfWeek: 4, // Kamis
    startTime: '08:30',
    endTime: '10:00',
    room: 'A102',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '12',
    classId: 'class1',
    subjectId: 'subject3',
    teacherId: 'teacher5',
    dayOfWeek: 4, // Kamis
    startTime: '10:30',
    endTime: '12:00',
    room: 'Lab Kimia',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '13',
    classId: 'class1',
    subjectId: 'subject6',
    teacherId: 'teacher4',
    dayOfWeek: 5, // Jumat
    startTime: '07:00',
    endTime: '08:30',
    room: 'A103',
    academicYear: '2024-2025',
    semester: 1,
  },
  {
    id: '14',
    classId: 'class1',
    subjectId: 'subject4',
    teacherId: 'teacher6',
    dayOfWeek: 5, // Jumat
    startTime: '08:30',
    endTime: '10:00',
    room: 'Lab Biologi',
    academicYear: '2024-2025',
    semester: 1,
  },
];

const formatTime = (time: string) => {
  return time; // Already in HH:mm format
};

const getSubjectName = (subjectId: string) => {
  return MOCK_SUBJECTS[subjectId] || subjectId;
};

const getTeacherName = (teacherId: string) => {
  return MOCK_TEACHERS[teacherId] || teacherId;
};

export const StudentSchedule = () => {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState<'current' | 'next'>('current');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  // Filter schedules berdasarkan kelas siswa (dalam real app, ambil dari user.classId)
  const studentClassId = user?.classId || 'class1';
  const filteredSchedules = mockSchedules.filter(
    (schedule) => schedule.classId === studentClassId
  );

  // Group schedules by day
  const schedulesByDay = filteredSchedules.reduce((acc, schedule) => {
    const day = schedule.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, Schedule[]>);

  // Sort schedules by time within each day
  Object.keys(schedulesByDay).forEach((day) => {
    schedulesByDay[parseInt(day)].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
  });

  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const getCurrentDayOfWeek = () => {
    return new Date().getDay();
  };

  // Filter days based on selected day filter
  const getDaysToShow = () => {
    if (selectedDay === 'all') {
      return DAYS_OF_WEEK.slice(1, 6); // Monday to Friday
    }
    const dayIndex = parseInt(selectedDay);
    return [DAYS_OF_WEEK[dayIndex]];
  };

  const daysToShow = getDaysToShow();
  const hasAnySchedule = Object.keys(schedulesByDay).length > 0;

  return (
    <DashboardLayout>
      <div className="student-schedule">
        <div className="schedule-header">
          <h1>Jadwal Pelajaran</h1>
          <div className="schedule-filters">
            <FormSelect
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value as 'current' | 'next')}
              options={[
                { value: 'current', label: 'Minggu Ini' },
                { value: 'next', label: 'Minggu Depan' },
              ]}
            />
            <FormSelect
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              options={[
                { value: 'all', label: 'Semua Hari' },
                ...DAYS_OF_WEEK.slice(1, 6).map((day, index) => ({
                  value: (index + 1).toString(),
                  label: day,
                })),
              ]}
            />
          </div>
        </div>

        {!hasAnySchedule ? (
          <EmptyState
            icon="schedule"
            title="Tidak Ada Jadwal"
            message="Belum ada jadwal pelajaran yang tersedia untuk kelas Anda."
          />
        ) : (
          <div className="schedule-week">
            {daysToShow.map((day, index) => {
              const dayOfWeek = index + 1; // Monday = 1, Tuesday = 2, etc.
              const daySchedules = schedulesByDay[dayOfWeek] || [];
              const isToday = getCurrentDayOfWeek() === dayOfWeek && selectedWeek === 'current';

              return (
                <Card
                  key={day}
                  title={
                    <div className="day-header">
                      <span>{day}</span>
                      {isToday && (
                        <Badge variant="primary" size="small">
                          Hari Ini
                        </Badge>
                      )}
                    </div>
                  }
                  variant="elevated"
                  className={`schedule-day-card ${isToday ? 'schedule-day-card--today' : ''}`}
                >
                  {daySchedules.length > 0 ? (
                    <div className="schedule-items">
                      {daySchedules.map((schedule) => (
                        <div key={schedule.id} className="schedule-item">
                          <div className="schedule-time">
                            <Icon name="clock" size={18} style={{ marginRight: '0.5rem' }} />
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </div>
                          <div className="schedule-details">
                            <div className="schedule-subject">
                              <strong>{getSubjectName(schedule.subjectId)}</strong>
                            </div>
                            <div className="schedule-meta">
                              <div className="schedule-teacher">
                                <Icon name="user" size={14} style={{ marginRight: '0.25rem' }} />
                                {getTeacherName(schedule.teacherId)}
                              </div>
                              {schedule.room && (
                                <div className="schedule-room">
                                  <Icon name="officeBuilding" size={14} style={{ marginRight: '0.25rem' }} />
                                  {schedule.room}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-schedule">
                      <Icon name="calendar" size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                      <p>Tidak ada jadwal pelajaran</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary Card */}
        {hasAnySchedule && (
          <Card variant="elevated" className="schedule-summary">
            <div className="summary-content">
              <div className="summary-item">
                <Icon name="calendar" size={24} style={{ color: 'var(--ios-blue)' }} />
                <div>
                  <div className="summary-value">{filteredSchedules.length}</div>
                  <div className="summary-label">Total Mata Pelajaran</div>
                </div>
              </div>
              <div className="summary-item">
                <Icon name="clock" size={24} style={{ color: 'var(--ios-blue)' }} />
                <div>
                  <div className="summary-value">
                    {new Set(filteredSchedules.map((s) => s.dayOfWeek)).size}
                  </div>
                  <div className="summary-label">Hari Aktif</div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
