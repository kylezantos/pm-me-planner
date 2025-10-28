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

## Notifications (PER-76, PER-77, PER-161)

Backend scheduling and delivery (no UI dependency) are implemented:

- Scheduling: `NotificationSchedulerRunner` enqueues upcoming notifications using joined block metadata and user preferences (standup included).
- Delivery: `NotificationRunner` polls the queue and delivers due notifications using Tauri's notification plugin.
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

### Default Notification Preferences (PER-161)

On first run, the app automatically initializes default notification preferences for each user:

```ts
import { initializeUserPreferences } from './src/lib/repositories';

const result = await initializeUserPreferences(userId);
// Returns existing preferences or creates defaults if none exist
```

**Default values:**
- `notifications_enabled`: `true`
- `notification_sound_enabled`: `true`
- `notification_lead_time_minutes`: `10` (10 minutes before block starts)
- `standup_time`: `"09:00"` (9:00 AM)
- `workday_start`: `"08:00"` (8:00 AM)
- `workday_end`: `"18:00"` (6:00 PM)
- `default_focus_minutes`: `25` (standard Pomodoro)
- `default_short_break_minutes`: `5`
- `default_long_break_minutes`: `15`
- `default_sessions_before_long_break`: `4`

**Behavior:**
- Called automatically on app startup in `App.tsx`
- If preferences already exist, the existing values are returned unchanged
- Uses `upsert` with `user_id` conflict resolution to prevent duplicates
- Validation ensures time formats are `HH:MM` and numeric values are positive
- Failed validation returns an error without modifying the database

### Preference Enforcement (PER-162)

The notification system respects user preferences at every step:

**1. Global notification toggle (`notifications_enabled`):**
- When `false`, ALL notifications are suppressed (block notifications + standup)
- When `true` or preferences are not set, notifications are enabled with defaults

**2. Custom lead time (`notification_lead_time_minutes`):**
- Controls how many minutes before a block start the "upcoming" notification fires
- When set (e.g., `15`), overrides the default 10-minute warning
- When `null`, falls back to the default `upcomingWarningMinutes` parameter (10 minutes)
- Supports edge cases: `0` schedules notification at block start, large values (e.g., 120 minutes) work correctly

**3. Standup scheduling (`standup_time`):**
- When set (e.g., `"09:00"`), a daily standup notification is scheduled
- Automatically schedules for today if time hasn't passed, otherwise tomorrow
- When `null`, no standup notification is generated
- Respects `notifications_enabled` - disabled notifications prevent standup even if `standup_time` is set

**4. Implementation flow:**
```ts
// NotificationQueueService.scheduleBlocks():
// 1. Fetches user preferences from database
const preferences = await getUserPreferences(userId);

// 2. Passes preferences to scheduler
const scheduled = scheduleBlockNotifications({
  userId,
  blocks,
  now,
  upcomingWarningMinutes: 10, // fallback default
  standupTime: preferences?.standup_time ?? null,
  preferences, // includes notifications_enabled, notification_lead_time_minutes, etc.
  blockTypeMeta,
});

// 3. Filters and enqueues notifications
```

**5. Testing:**

Run comprehensive preference enforcement tests:

```bash
npm run test:notifications
```

The test suite (18 test cases) verifies:
- Past blocks don't schedule notifications
- Upcoming blocks schedule both "upcoming" and "start" notifications
- Paused blocks schedule "resumed" notifications
- `notifications_enabled=false` prevents ALL notifications (blocks + standup)
- Custom `notification_lead_time_minutes` is used when set
- Default `upcomingWarningMinutes` is used when `notification_lead_time_minutes` is null
- Standup is scheduled when `standup_time` is present
- Standup is NOT scheduled when `standup_time` is null
- Edge cases: zero lead time, very large lead time, null preferences object

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
