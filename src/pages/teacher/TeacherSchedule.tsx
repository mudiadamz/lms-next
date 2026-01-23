import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, FormSelect, Loading, EmptyState } from '../../components/common';
import { DAYS_OF_WEEK } from '../../constants';
import { formatTime } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';
import { scheduleService, classService, subjectService } from '../../services';
import { Schedule } from '../../types';
import './TeacherSchedule.css';

export const TeacherSchedule = () => {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<Record<string, string>>({});
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [schedulesData, classesData, subjectsData] = await Promise.all([
          scheduleService.getSchedules({ teacherId: user?.id }),
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

  const scheduleByDay = schedules.reduce((acc, schedule) => {
    const day = DAYS_OF_WEEK[schedule.dayOfWeek];
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  return (
    <DashboardLayout>
      <div className="teacher-schedule">
        <div className="schedule-header">
          <h1>Jadwal Mengajar</h1>
          <FormSelect
            label="Pilih Minggu"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            options={[
              { value: 'current', label: 'Minggu Ini' },
              { value: 'next', label: 'Minggu Depan' },
            ]}
          />
        </div>

        <div className="schedule-week">
          {DAYS_OF_WEEK.slice(1, 6).map((day) => (
            <Card key={day} title={day} variant="elevated" className="schedule-day-card">
              {isLoading ? (
                <Loading />
              ) : scheduleByDay[day] && scheduleByDay[day].length > 0 ? (
                <div className="schedule-items">
                  {scheduleByDay[day]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((item) => (
                      <div key={item.id} className="schedule-item">
                        <div className="schedule-time">
                          {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </div>
                        <div className="schedule-details">
                          <strong>{subjects[item.subjectId] || item.subjectId}</strong>
                          <div className="schedule-meta">
                            <Badge variant="primary">{classes[item.classId] || item.classId}</Badge>
                            {item.room && <span>{item.room}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="no-schedule">Tidak ada jadwal</p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

