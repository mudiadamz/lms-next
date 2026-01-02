import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge, FormSelect } from '../../components/common';
import { DAYS_OF_WEEK } from '../../constants';
import { formatTime } from '../../utils/dateUtils';
import './TeacherSchedule.css';

const mockSchedule = [
  {
    id: '1',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:30',
    subject: 'Matematika',
    class: 'X IPA 1',
    room: 'A101',
  },
  {
    id: '2',
    dayOfWeek: 1,
    startTime: '10:00',
    endTime: '11:30',
    subject: 'Matematika',
    class: 'X IPA 2',
    room: 'A102',
  },
  {
    id: '3',
    dayOfWeek: 3,
    startTime: '08:00',
    endTime: '09:30',
    subject: 'Matematika',
    class: 'XI IPA 1',
    room: 'A101',
  },
];

export const TeacherSchedule = () => {
  const [selectedWeek, setSelectedWeek] = useState('current');

  const scheduleByDay = mockSchedule.reduce((acc, schedule) => {
    const day = DAYS_OF_WEEK[schedule.dayOfWeek];
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as Record<string, typeof mockSchedule>);

  return (
    <DashboardLayout>
      <div className="teacher-schedule">
        <div className="schedule-header">
          <h1>Jadwal Mengajar</h1>
          <FormSelect
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
              {scheduleByDay[day] && scheduleByDay[day].length > 0 ? (
                <div className="schedule-items">
                  {scheduleByDay[day].map((item) => (
                    <div key={item.id} className="schedule-item">
                      <div className="schedule-time">
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                      </div>
                      <div className="schedule-details">
                        <strong>{item.subject}</strong>
                        <div className="schedule-meta">
                          <Badge variant="primary">{item.class}</Badge>
                          <span>{item.room}</span>
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

