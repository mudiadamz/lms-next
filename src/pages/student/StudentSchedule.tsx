import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Icon, EmptyState, Loading } from '../../components/common';
import { Schedule } from '../../types';
import { DAYS_OF_WEEK } from '../../constants';
import { scheduleService, classService, subjectService, userService } from '../../services';
import './StudentSchedule.css';

export const StudentSchedule = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<Record<string, string>>({});
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Get student's class first
        const studentData = user?.id ? await userService.getUserById(user.id) : null;
        const classId = (studentData as any)?.classId;
        
        const [schedulesData, classesData, subjectsData] = await Promise.all([
          scheduleService.getSchedules(classId ? { classId } : {}),
          classService.getClasses(),
          subjectService.getSubjects(),
        ]);

        setSchedules(schedulesData);
        
        // Create lookup maps
        const classMap: Record<string, string> = {};
        classesData.forEach(c => { classMap[c.id] = c.name; });
        setClasses(classMap);

        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);

        // Extract teacher names from schedules (backend already includes teacherName via JOIN)
        const teacherMap: Record<string, string> = {};
        schedulesData.forEach((s: any) => {
          if (s.teacherId && s.teacherName) {
            teacherMap[s.teacherId] = s.teacherName;
          }
        });
        setTeachers(teacherMap);
      } catch (error) {
        console.error('Error loading schedule:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const formatTime = (time: string) => {
    return time; // Already in HH:mm format
  };

  // Filter schedules berdasarkan kelas siswa
  const studentClassId = (user as any)?.classId;
  const filteredSchedules = schedules.filter(
    (schedule) => !studentClassId || schedule.classId === studentClassId
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

  const daysToShow = DAYS_OF_WEEK.slice(1, 6); // Monday to Friday
  const hasAnySchedule = Object.keys(schedulesByDay).length > 0;

  return (
    <DashboardLayout>
      <div className="student-schedule">
        <div className="schedule-header">
          <h1>Jadwal Pelajaran</h1>
        </div>

        {isLoading ? (
          <Loading />
        ) : !hasAnySchedule ? (
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
              const isToday = getCurrentDayOfWeek() === dayOfWeek;

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
                            <Icon name="clock" size={16} />
                            <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                          </div>
                          <div className="schedule-details">
                            <div className="schedule-subject">
                              <strong>{subjects[schedule.subjectId] || schedule.subjectId}</strong>
                            </div>
                            <div className="schedule-meta">
                              <div className="schedule-teacher">
                                <Icon name="user" size={12} />
                                <span>{(schedule as any).teacherName || teachers[schedule.teacherId] || schedule.teacherId}</span>
                              </div>
                              {schedule.room && (
                                <div className="schedule-room">
                                  <Icon name="officeBuilding" size={12} />
                                  <span>{schedule.room}</span>
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
      </div>
    </DashboardLayout>
  );
};
