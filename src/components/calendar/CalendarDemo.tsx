import { useState } from 'react';
import { CalendarView, CalendarEvent } from './CalendarView';
import { addHours, startOfWeek, addDays } from 'date-fns';

/**
 * CalendarDemo - A demonstration component for react-big-calendar integration
 * This component shows the calendar with sample events and proper timezone handling
 */
export function CalendarDemo() {
  // Sample events for demonstration
  const [events] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Client Work Block',
      start: addHours(new Date(), 1),
      end: addHours(new Date(), 3),
    },
    {
      id: '2',
      title: 'Team Meeting',
      start: addHours(new Date(), 5),
      end: addHours(new Date(), 6),
    },
    {
      id: '3',
      title: 'Deep Work Session',
      start: addDays(new Date(), 1),
      end: addHours(addDays(new Date(), 1), 2),
    },
    {
      id: '4',
      title: 'Code Review',
      start: addDays(addHours(new Date(), 3), 2),
      end: addDays(addHours(new Date(), 4), 2),
    },
  ]);

  const handleSelectEvent = (event: CalendarEvent) => {
    console.log('Selected event:', event);
    alert(`Selected: ${event.title}`);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date; action: string }) => {
    console.log('Selected slot:', slotInfo);
    alert(`Selected time slot: ${slotInfo.start.toLocaleString()} - ${slotInfo.end.toLocaleString()}`);
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">React Big Calendar Demo</h1>
        <p className="text-gray-600">
          Testing react-big-calendar with date-fns localizer. Local timezone is automatically respected.
        </p>
        <div className="flex gap-4 text-sm">
          <div>
            <strong>Current Time:</strong> {new Date().toLocaleString()}
          </div>
          <div>
            <strong>Timezone:</strong> {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-lg">
        <CalendarView
          events={events}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          defaultView="week"
          defaultDate={new Date()}
          height={600}
        />
      </div>

      <div className="flex flex-col gap-2 text-sm text-gray-600">
        <p><strong>Features demonstrated:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>date-fns localizer integration</li>
          <li>Sample events with proper Date objects</li>
          <li>Week view as default (can switch between month, week, day, agenda)</li>
          <li>Event selection handling</li>
          <li>Slot selection for creating new events</li>
          <li>Automatic local timezone handling</li>
        </ul>
      </div>
    </div>
  );
}

export default CalendarDemo;
