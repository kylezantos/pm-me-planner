import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDayCalendar } from '@/lib/calendar/hooks';
import type { BlockCalendarEvent } from '@/lib/calendar/events';

// Configure the date-fns localizer
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface CalendarDayViewProps {
  userId: string;
  initialDate?: Date;
  onSelectEvent?: (event: BlockCalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; action: string }) => void;
  height?: number | string;
}

export function CalendarDayView({
  userId,
  initialDate,
  onSelectEvent,
  onSelectSlot,
  height = 600,
}: CalendarDayViewProps) {
  const { date, events, loading, error, next, prev, today, setDate } = useDayCalendar(userId, initialDate);

  // Event style getter - use block type color
  const eventStyleGetter = (event: BlockCalendarEvent) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  };

  if (error) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <p style={{ color: '#ef4444', fontWeight: 500 }}>Error loading calendar events</p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>{error.message}</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            color: '#6b7280',
          }}
        >
          Loading events...
        </div>
      )}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        date={date}
        onNavigate={setDate}
        view="day"
        onView={() => {}} // Prevent view changes
        views={['day']}
        toolbar={false}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        style={{ height: '100%' }}
        culture="en-US"
        eventPropGetter={eventStyleGetter}
        // Set time range to work hours (can be customized)
        min={new Date(new Date().setHours(6, 0, 0, 0))}
        max={new Date(new Date().setHours(22, 0, 0, 0))}
      />
    </div>
  );
}

export default CalendarDayView;
