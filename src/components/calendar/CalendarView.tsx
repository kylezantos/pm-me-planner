import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

// Event type definition
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

interface CalendarViewProps {
  events?: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; action: string }) => void;
  defaultView?: 'month' | 'week' | 'work_week' | 'day' | 'agenda';
  defaultDate?: Date;
  height?: number | string;
}

export function CalendarView({
  events = [],
  onSelectEvent,
  onSelectSlot,
  defaultView = 'week',
  defaultDate = new Date(),
  height = 600,
}: CalendarViewProps) {
  return (
    <div style={{ height }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={defaultView}
        defaultDate={defaultDate}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        style={{ height: '100%' }}
        culture="en-US"
      />
    </div>
  );
}

export default CalendarView;
