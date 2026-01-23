import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button, Badge, Icon, Modal, EmptyState, Loading } from '../../components/common';
import { ROUTES } from '../../constants';
import { formatDate } from '../../utils';
import { assignmentService, quizService, announcementService, scheduleService, userService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import './ParentCalendar.css';

interface CalendarEvent {
  id: string;
  type: 'assignment' | 'quiz' | 'announcement' | 'exam' | 'schedule';
  title: string;
  date: Date | string;
  endDate?: Date | string;
  subject?: string;
  description?: string;
  color: string;
  route?: string;
}

const TYPE_LABELS = {
  assignment: 'Tugas',
  quiz: 'Kuis',
  announcement: 'Pengumuman',
  exam: 'Ujian',
  schedule: 'Jadwal',
};

const TYPE_ICONS = {
  assignment: 'assignment',
  quiz: 'quiz',
  announcement: 'announcement',
  exam: 'grade',
  schedule: 'schedule',
};

export const ParentCalendar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const parentData = user?.id ? await userService.getUserById(user.id) : null;
        const studentIds = (parentData as any)?.studentIds || [];
        
        if (studentIds.length === 0) {
          setIsLoading(false);
          return;
        }

        const firstChild = await userService.getUserById(studentIds[0]);
        const classId = (firstChild as any)?.classId;

        const [assignmentsData, quizzesData, announcementsData, schedulesData] = await Promise.all([
          assignmentService.getAssignments(classId ? { classId } : {}),
          quizService.getQuizzes(classId ? { classId } : {}),
          announcementService.getAnnouncements({ targetAudience: 'parent' }),
          scheduleService.getSchedules(classId ? { classId } : {}),
        ]);

        const calendarEvents: CalendarEvent[] = [];

        // Add assignments
        assignmentsData.forEach(assignment => {
          calendarEvents.push({
            id: `assignment-${assignment.id}`,
            type: 'assignment',
            title: assignment.title,
            date: assignment.dueDate,
            subject: assignment.subjectId,
            description: assignment.description,
            color: '#ff3b30',
            route: ROUTES.PARENT_ASSIGNMENTS,
          });
        });

        // Add quizzes
        quizzesData.forEach(quiz => {
          calendarEvents.push({
            id: `quiz-${quiz.id}`,
            type: 'quiz',
            title: quiz.title,
            date: quiz.startDate || quiz.startTime || Date.now(),
            endDate: quiz.endDate || quiz.endTime,
            subject: quiz.subjectId,
            description: quiz.description,
            color: '#007aff',
            route: ROUTES.PARENT_QUIZZES,
          });
        });

        // Add announcements
        announcementsData.forEach(announcement => {
          calendarEvents.push({
            id: `announcement-${announcement.id}`,
            type: 'announcement',
            title: announcement.title,
            date: announcement.createdAt,
            endDate: announcement.endDate,
            description: announcement.content,
            color: '#ff9500',
          });
        });

        // Add schedules
        schedulesData.forEach(schedule => {
          const today = new Date();
          const scheduleDate = new Date(today.getFullYear(), today.getMonth(), schedule.dayOfWeek === 0 ? 7 : schedule.dayOfWeek);
          calendarEvents.push({
            id: `schedule-${schedule.id}`,
            type: 'schedule',
            title: `Jadwal - ${schedule.subjectId}`,
            date: scheduleDate,
            subject: schedule.subjectId,
            description: `${schedule.startTime} - ${schedule.endTime}`,
            color: '#5856d6',
            route: ROUTES.PARENT_SCHEDULE,
          });
        });

        setEvents(calendarEvents);
      } catch (error) {
        console.error('Error loading calendar events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadEvents();
    }
  }, [user?.id, currentMonth, currentYear]);


  const year = currentYear;
  const month = currentMonth;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const filteredEvents = events.filter((event) => {
    if (filterType !== 'all' && event.type !== filterType) return false;
    
    const eventDate = new Date(event.date);
    const eventEndDate = event.endDate ? new Date(event.endDate) : eventDate;
    
    return (
      (eventDate.getMonth() === month && eventDate.getFullYear() === year) ||
      (eventEndDate.getMonth() === month && eventEndDate.getFullYear() === year) ||
      (eventDate <= new Date(year, month + 1, 0) && eventEndDate >= new Date(year, month, 1))
    );
  });

  const eventsByDate: Record<string, CalendarEvent[]> = {};
  filteredEvents.forEach((event) => {
    const eventDate = new Date(event.date);
    const eventEndDate = event.endDate ? new Date(event.endDate) : eventDate;
    
    const start = new Date(Math.max(eventDate, new Date(year, month, 1)));
    const end = new Date(Math.min(eventEndDate, new Date(year, month + 1, 0)));
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    }
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateKey = date.toISOString().split('T')[0];
    const dayEvents = eventsByDate[dateKey] || [];
    if (dayEvents.length > 0) {
      setSelectedEvent(dayEvents[0]);
      setShowEventModal(true);
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const calendarDays: (Date | null)[] = [];
  
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push(new Date(year, month - 1, daysInPrevMonth - i));
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i));
  }
  
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push(new Date(year, month + 1, i));
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return (
    <DashboardLayout>
      <div className="parent-calendar">
        <div className="calendar-header">
          <h1>Kalender Akademik Anak</h1>
          <div className="calendar-controls">
            <Button variant="outline" onClick={() => navigateMonth('prev')}>
              <Icon name="chevronLeft" size={20} />
            </Button>
            <div className="current-month">
              {monthNames[month]} {year}
            </div>
            <Button variant="outline" onClick={() => navigateMonth('next')}>
              <Icon name="chevronRight" size={20} />
            </Button>
            <Button variant="outline" onClick={() => {
              const today = new Date();
              setCurrentMonth(today.getMonth());
              setCurrentYear(today.getFullYear());
            }}>
              Hari Ini
            </Button>
          </div>
        </div>

        <div className="calendar-filters">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Semua Event</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {isLoading && <Loading />}

        <div className="calendar-content-wrapper">
          <Card variant="elevated" className="calendar-card">
            <div className="calendar-grid">
              {dayNames.map((day) => (
                <div key={day} className="calendar-day-header">
                  {day}
                </div>
              ))}

              {calendarDays.map((date, index) => {
                if (!date) return null;
                
                const dateKey = date.toISOString().split('T')[0];
                const dayEvents = eventsByDate[dateKey] || [];
                const isCurrentMonth = date.getMonth() === month;
                const isTodayDate = isToday(date);
                const isSelectedDate = isSelected(date);

                return (
                  <div
                    key={index}
                    className={`calendar-day ${!isCurrentMonth ? 'calendar-day--other-month' : ''} ${
                      isTodayDate ? 'calendar-day--today' : ''
                    } ${isSelectedDate ? 'calendar-day--selected' : ''}`}
                    onClick={() => isCurrentMonth && handleDateClick(date)}
                  >
                    <div className="day-number">{date.getDate()}</div>
                    {isCurrentMonth && dayEvents.length > 0 && (
                      <div className="day-events">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="day-event"
                            style={{ backgroundColor: event.color }}
                            onClick={(e) => handleEventClick(event, e)}
                            title={event.title}
                          >
                            <Icon name={TYPE_ICONS[event.type] as any} size={12} />
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="day-event-more">+{dayEvents.length - 3}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {filteredEvents.length > 0 ? (
            <Card title="Event Bulan Ini" variant="elevated" className="events-card">
              <div className="events-list">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="event-item"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventModal(true);
                    }}
                  >
                    <div
                      className="event-color-bar"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="event-content">
                      <div className="event-header">
                        <Badge variant="info" size="small">
                          {TYPE_LABELS[event.type]}
                        </Badge>
                        {event.subject && (
                          <Badge variant="secondary" size="small">
                            {event.subject}
                          </Badge>
                        )}
                      </div>
                      <h4 className="event-title">{event.title}</h4>
                      <div className="event-date">
                        <Icon name="calendar" size={14} style={{ marginRight: '0.25rem' }} />
                        {formatDate(event.date)}
                        {event.endDate && ` - ${formatDate(event.endDate)}`}
                      </div>
                      {event.description && (
                        <p className="event-description">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card variant="elevated" className="events-card">
              <EmptyState
                icon="calendar"
                title="Tidak Ada Event"
                message="Tidak ada event akademik untuk bulan ini."
              />
            </Card>
          )}
        </div>

        <Modal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          title={selectedEvent?.title || 'Detail Event'}
          size="medium"
        >
          {selectedEvent && (
            <div className="event-detail">
              <div className="detail-badges">
                <Badge variant="info">{TYPE_LABELS[selectedEvent.type]}</Badge>
                {selectedEvent.subject && (
                  <Badge variant="secondary">{selectedEvent.subject}</Badge>
                )}
              </div>
              <div className="detail-info">
                <div className="info-row">
                  <Icon name="calendar" size={18} style={{ marginRight: '0.5rem' }} />
                  <div>
                    <strong>Tanggal:</strong> {formatDate(new Date(selectedEvent.date))}
                    {selectedEvent.endDate && ` - ${formatDate(new Date(selectedEvent.endDate))}`}
                  </div>
                </div>
                {selectedEvent.description && (
                  <div className="info-row">
                    <Icon name="document" size={18} style={{ marginRight: '0.5rem' }} />
                    <div>
                      <strong>Deskripsi:</strong> {selectedEvent.description}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                >
                  Tutup
                </Button>
                {selectedEvent.route && (
                  <Button
                    onClick={() => {
                      navigate(selectedEvent.route!);
                      setShowEventModal(false);
                    }}
                  >
                    Lihat Detail
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

