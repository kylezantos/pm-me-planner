# Calendar Components

This directory contains the react-big-calendar integration for PM Me Planner.

## Components

### CalendarView
The main calendar component configured with date-fns localizer.

**Features:**
- date-fns v4.1.0 localizer integration
- Automatic local timezone handling
- Configurable views (month, week, work_week, day, agenda)
- Event selection handling
- Slot selection for creating new events
- Fully typed with TypeScript

**Usage:**
```tsx
import { CalendarView, CalendarEvent } from '@/components/calendar';

const events: CalendarEvent[] = [
  {
    id: '1',
    title: 'Meeting',
    start: new Date(2025, 9, 20, 10, 0),
    end: new Date(2025, 9, 20, 11, 0),
  },
];

<CalendarView
  events={events}
  onSelectEvent={(event) => console.log(event)}
  onSelectSlot={(slot) => console.log(slot)}
  defaultView="week"
  height={600}
/>
```

### CalendarDemo
A demonstration component showing react-big-calendar with sample data.

**Test it:**
Navigate to `/calendar-test` to see the demo in action.

## Dependencies

- `react-big-calendar` v1.19.4
- `date-fns` v4.1.0 (already installed)

## Configuration

The calendar is configured to:
- Use en-US locale by default
- Respect the user's local timezone automatically
- Display week view by default
- Allow event and slot selection

## Styling

The calendar includes the default react-big-calendar CSS:
```tsx
import 'react-big-calendar/lib/css/react-big-calendar.css';
```

Additional custom styling can be added via Tailwind classes or CSS modules as needed.

## Integration with PM Me Planner

This calendar will be used to:
- Display block instances on the calendar
- Allow drag-and-drop of tasks to calendar blocks
- Support creating new blocks by clicking on time slots
- Sync with Google Calendar events (read-only in MVP)

See `PRD.md` and `implementation-plan.md` for full details on calendar integration requirements.
