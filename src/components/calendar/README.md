# Calendar Components

This directory contains the custom calendar implementation for PM Me Planner (no react-big-calendar).

## Components

### CalendarView
The top-level calendar container that renders the active view and navigation.

**Features:**
- Month, Week, and Day views (`CalendarMonthView`, `CalendarWeekView`, `CalendarDayView`)
- View selector (`ViewSelector`) using shadcn/ui ToggleGroup
- Next/Previous/Today navigation
- Event selection and slot selection callbacks
- Fully typed with TypeScript

**Usage:**
```tsx
import { CalendarView } from '@/components/calendar';

<CalendarView
  userId={userId}
  onSelectEvent={(event) => console.log(event)}
  onSelectSlot={(slot) => console.log(slot)}
/>;
```

### Views
- `CalendarMonthView` — Month grid with block counts and quick creation.
- `CalendarWeekView` — Week time-grid starting Monday (configurable).
- `CalendarDayView` — Single-day time-grid.

### Utilities
- `@/lib/calendar/utils` — helpers like `getMondayOfWeek`, `formatWeekRange`, etc.
- `date-fns` — for all date math/formatting.

## Styling
- Tailwind CSS v4 utility classes with OKLCH color tokens (see `src/app/globals.css`).
- shadcn/ui primitives for controls (buttons, toggles, tooltips).
- Icons via `lucide-react`.

## Integration
The calendar is used to:
- Display and interact with Block instances
- Create blocks via slot selection or DnD from backlog
- Respect Google Calendar events (read-only cache in MVP)

See `PRD.md` and `implementation-plan.md` for full details.
