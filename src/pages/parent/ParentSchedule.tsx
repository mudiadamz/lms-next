import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, Icon, EmptyState, Loading } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { scheduleService, classService, subjectService, userService } from '../../services';
import { Schedule } from '../../types';
import { DAYS_OF_WEEK } from '../../constants';
import './ParentSchedule.css';

export const ParentSchedule = () => {
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
        
        // Get parent's children (students)
        const parentData = user?.id ? await userService.getUserById(user.id) : null;
        const studentIds = (parentData as any)?.studentIds || [];
        
        if (studentIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // Get first student's class
        const firstStudent = await userService.getUserById(studentIds[0]);
        const classId = (firstStudent as any)?.classId;
        
        if (!classId) {
          setIsLoading(false);
          return;
        }

        const [schedulesData, classesData, subjectsData, teachersData] = await Promise.all([
          scheduleService.getSchedules({ classId }),
          classService.getClasses(),
          subjectService.getSubjects(),
          userService.getUsers('teacher'),
        ]);

        setSchedules(schedulesData);
        
        // Create lookup maps
        const classMap: Record<string, string> = {};
        classesData.forEach(c => { classMap[c.id] = c.name; });
        setClasses(classMap);

        const subjectMap: Record<string, string> = {};
        subjectsData.forEach(s => { subjectMap[s.id] = s.name; });
        setSubjects(subjectMap);

        const teacherMap: Record<string, string> = {};
        teachersData.forEach(t => { teacherMap[t.id] = t.fullName; });
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

  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
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

  const daysToShow = DAYS_OF_WEEK.slice(1, 6); // Monday to Friday
  const hasAnySchedule = Object.keys(schedulesByDay).length > 0;

  return (
    <DashboardLayout>
      <div className="parent-schedule">
        <h1>Jadwal Pelajaran Anak</h1>
        
        {isLoading ? (
          <Loading />
        ) : !hasAnySchedule ? (
          <EmptyState
            icon="schedule"
            title="Tidak Ada Jadwal"
            message="Belum ada jadwal pelajaran yang tersedia."
          />
        ) : (
          <div className="schedule-week">
            {daysToShow.map((day, index) => {
              const dayOfWeek = index + 1;
              const daySchedules = schedulesByDay[dayOfWeek] || [];

              return (
                <Card key={day} title={day} variant="elevated" className="schedule-day-card">
                  {daySchedules.length > 0 ? (
                    <div className="schedule-items">
                      {daySchedules.map((schedule) => (
                        <div key={schedule.id} className="schedule-item">
                          <div className="schedule-time">
                            <Icon name="clock" size={16} />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          <div className="schedule-details">
                            <div className="schedule-subject">
                              <strong>{subjects[schedule.subjectId] || schedule.subjectId}</strong>
                            </div>
                            <div className="schedule-meta">
                              <div className="schedule-teacher">
                                <Icon name="user" size={12} />
                                <span>{teachers[schedule.teacherId] || schedule.teacherId}</span>
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

