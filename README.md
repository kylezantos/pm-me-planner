# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Calendar Data Layer (PER-60)

Backend utilities for the daily/weekly calendar views are available without any UI wiring yet.

- Fetch a week of block instances with type metadata and transform to UI-ready events:

```ts
import { getWeekEvents, groupEventsByDay } from './src/lib/calendar/events';

const userId = '<current-user-id>';
const events = await getWeekEvents(userId); // returns { id, title, start, end, color, status, ... }
const byDay = groupEventsByDay(events);     // { 'YYYY-MM-DD': BlockCalendarEvent[] }
```

- Fetch a specific day:

```ts
import { getDayEvents } from './src/lib/calendar/events';

const events = await getDayEvents(userId, new Date());
```

These helpers power the future React Big Calendar integration by providing
stable event shapes and efficient Supabase queries (joined with `block_types`).

### React Hooks + Realtime

Hooks that fetch and auto-refresh events on Supabase changes are available:

```ts
import { useWeekCalendar, useDayCalendar } from './src/lib/calendar';

function WeekView({ userId }: { userId: string }) {
  const { date, range, events, loading, next, prev, today } = useWeekCalendar(userId, { weekStartsOn: 1 });
  // Render events in any calendar component
  return null;
}

function DayView({ userId }: { userId: string }) {
  const { date, range, events, loading, next, prev, today } = useDayCalendar(userId);
  return null;
}
```

Under the hood, these subscribe to `block_instances` and `block_types` changes for the current user and refresh the current range.

## Notifications (PER-76, PER-77)

Backend scheduling and delivery (no UI dependency) are implemented:

- Scheduling: `NotificationSchedulerRunner` enqueues upcoming notifications using joined block metadata and user preferences (standup included).
- Delivery: `NotificationRunner` polls the queue and delivers due notifications using Tauri’s notification plugin.
- Realtime pause: `subscribePauseNotifications({ userId })` sends an immediate notification when a block transitions to `paused`.

Initialization (gated)

```ts
import { startNotifications } from './src/lib/notifications';

const handle = startNotifications({
  userId: '<current-user-id>',
  deliveryIntervalMs: 30_000,
  scheduleIntervalMs: 60_000,
  lookaheadMinutes: 60,
  debounceMs: 3_000,
  minTickIntervalMs: 5_000,
  listenRealtime: true,
  snoozeMinutes: 5,
});

// later to stop
handle.stop();
```

Notes:
- Payloads now include `block_name` and `block_color` for better titles/bodies.
- Standup is scheduled for today or tomorrow depending on current time.
- Scheduler uses debounced realtime triggers and throttling to avoid update storms.
 - Interactive actions supported (Start/Snooze/Skip) with registered action types; Snooze minutes configurable.

### Basic Tests

Run minimal checks for `scheduleBlockNotifications` without a full test framework:

```bash
npm run test:notifications
```

This builds the project and runs `dist/scripts/test-notifications.js`, covering:
- Past blocks don’t schedule
- Upcoming blocks schedule upcoming/start
- Paused blocks schedule resumed
- Notifications disabled preference prevents scheduling
- Standup schedules today/tomorrow

## Block Management Backend (Phase 4)

Helpers to support Phase 4 without UI:

- Block type validation
  - `src/lib/blocks/validation.ts` → `validateBlockTypeInput(...)` ensures sane inputs (name, color, durations, recurring)

- Scheduling and conflicts
  - `src/lib/blocks/scheduling.ts`
    - `scheduleBlockInstance({ userId, blockTypeId, start, end? }, { strictConflictCheck, allowConflicts })`
    - `rescheduleBlockInstance({ userId, blockInstanceId, newStart, newEnd }, { strictConflictCheck, allowConflicts })`
    - Finds conflicts against other blocks (and calendar events when enabled)

- Pure utilities
  - `src/lib/blocks/conflicts.ts` → `isTimeRangeOverlapping`, `assertValidRange`

### Work Session Orchestration (Phase 4)

Backend helpers to start/stop/switch active work sessions without UI:

- `src/lib/workSessions/orchestrator.ts`
  - `startWorking(userId, taskId, { blockInstanceId?, notes?, endPreviousNotes?, setTaskStatusInProgress? })`
    - Ends any active session, flips previous task inactive, starts a new session, sets new task active
  - `stopWorking(userId, { notes? })`
    - Ends current active session and flips task inactive
  - `switchTask(userId, fromTaskId, toTaskId, { notesForPrevious?, notesForNew?, blockInstanceId?, setTaskStatusInProgress? })`
    - Ends current session (if any) then starts a new one on another task

Notes:
- Uses existing repositories for `work_sessions` and `tasks` updates.
- Ensures at most one active session per user.
- UI can wire these into "Start Working" / "Switch Task" controls later.

Dev script (manual exercise)

- `scripts/dev-work-sessions.ts` provides a basic CLI to exercise flows without UI.

Examples:
```bash
npm run build && node dist/scripts/dev-work-sessions.js start <userId> <taskId> [blockInstanceId]
npm run build && node dist/scripts/dev-work-sessions.js switch <userId> <fromTaskId> <toTaskId> [blockInstanceId]
npm run build && node dist/scripts/dev-work-sessions.js stop <userId>
```

Requires Supabase env (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) configured as in the app.

### Basic Tests

Run minimal checks for overlap/validation utilities:

```bash
npm run test:blocks
```

Notes:
- Scheduling helpers hit Supabase; the included tests cover only pure utilities.
- Conflict checks default to `blocks_and_calendar`; set `strictConflictCheck: 'blocks' | 'none'` to relax.
