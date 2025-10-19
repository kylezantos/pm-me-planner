# Product Requirements Document: PM Me Planner

## Overview

A macOS desktop application for calendar-based time block management with integrated AI accountability partner. Designed to help organize work time through dedicated sprint blocks with Pomodoro-style focus sessions, task management, and intelligent notifications.

## Problem Statement

The user needs better organization of daily work time through:
- Structured 2-3 hour sprint blocks for different types of work
- Clear task visibility within each time block
- Transition notifications between blocks
- AI-powered task prioritization and planning assistance
- Daily accountability check-ins

## Target User

Solo developer/professional managing multiple clients and personal projects who:
- Works primarily on Mac desktop
- Already uses Claude Code/Codex for development
- Wants to implement time blocking methodology
- Needs accountability without manual planning overhead

## Core Features

### 1. Time Block Management

**Block Types:**
- Education blocks (newsletters, videos, articles about AI and app development)
- Client A blocks
- Client B blocks
- Personal project blocks
- Custom blocks (user-defined)

**Block Properties:**
- Duration (typically 1-3 hours)
- Associated tasks
- Pomodoro settings (focus time + break intervals)
- Recurring schedule configuration (optional)
  - Days of week
  - Time of day
  - Auto-create instances
- Manual one-time creation also supported

### 2. Task Management

**Task Organization:**
- Task backlog/bucket for unassigned tasks (organized by block type)
- Assign tasks from backlog to specific day's block instance
- View tasks when entering a block
- Task status tracking (pending, in progress, completed)
- Quick add/edit/remove tasks
- Tasks include notes field for context and progress tracking

**Dual-Mode Task Execution (NEW):**
- **Formal Mode**: Tasks assigned to scheduled blocks, shows in calendar
- **Informal Mode**: Work on tasks ad-hoc without creating calendar blocks
- "Start Working" button to begin informal work session
- Tracks elapsed time and work history per task
- Switch between tasks without formal scheduling
- Does NOT pollute Google Calendar with work intentions

**Work Session Tracking:**
- Each work session recorded with start/end times
- Sessions can be formal (within a block) or informal (ad-hoc)
- View work history: see all past sessions for a task
- AI accountability: tracks time spent vs. estimated duration
- Optional AI prompts based on time elapsed (configurable per task)
- Focus mode: disable all interrupts for deep work

**Unfinished Task Handling:**
- Tasks not completed during a block automatically return to the backlog
- User can add notes about where they left off
- AI can suggest rescheduling during next standup

**Task Sources:**
- Manual entry
- AI-suggested based on priorities
- Synced from external sources (future consideration)

### 3. Pomodoro Integration

**Focus Sessions:**
- Configurable focus duration (default: 25 min)
- Configurable break duration (default: 5 min)
- Visual timer display
- Automatic progression through focus/break cycles
- Pause/resume capability

**Notifications:**
- Focus session start
- Break time alerts
- Session completion

### 4. Calendar Integration

**Google Calendar Sync:**
- Read calendar events (MVP: read-only, two-way sync in Phase 11)
- Display calendar events alongside blocks
- Block creation from calendar events (optional)
- Conflict detection and warnings
- **Formal blocks can sync to calendar** (future: two-way)
- **Informal work sessions do NOT sync** (keeps calendar clean)

**Meeting Overlap Behavior:**
- Calendar meetings can overlap with focus blocks
- When a meeting is active during a block:
  - Block timers are paused/deactivated
  - Block notifications are suppressed
  - Block resumes after meeting ends (or user manually resumes)
  - Time spent in meeting doesn't count against block duration

**Views:**
- **Calendar View**: Daily/weekly calendar showing formal blocks and Google Calendar events
- **Daily Plan View (NEW)**: Lightweight today-focused view without calendar rigidity
  - Shows today's scheduled blocks
  - Shows Google Calendar commitments (read-only)
  - Lists unscheduled tasks with time estimates
  - Displays currently active informal work session
  - Toggle between Calendar and Daily Plan views (Cmd+D)
- Block timeline visualization

### 5. Notification System

**macOS Native Notifications for:**
- Block transition alerts ("Time to start Client A block")
- Meeting reminders
- Focus session transitions
- Break reminders
- Daily standup prompts

**Notification Features:**
- Configurable lead time (5, 10, 15 min before)
- Action buttons (Start block, Snooze, Skip)
- Persistent until acknowledged (configurable)

### 6. AI Accountability Partner

**Embedded Terminal Interface:**
- Terminal emulator within the app
- Runs Claude Code/Codex commands
- Uses existing user credentials (no API costs)
- Persistent chat history within session
- Direct database access for schedule manipulation

**AI-Friendly Architecture:**
- Simple, semantic data models designed for AI manipulation
- Clear relationship between blocks, tasks, and schedules
- Predictable naming conventions and data structures
- API/command layer for Claude to execute schedule operations
- Database schema optimized for natural language queries

**AI Features:**
- Daily 5-minute standup conversations
- Task prioritization queries
  - "What are high priority tasks for Client A this week?"
- Task scheduling assistance
  - "Divvy up these tasks into Client A blocks this week"
- Direct schedule manipulation
  - "Move Tuesday's Client B block to Thursday at 2pm"
  - "Add these 3 tasks to Monday's Education block"
  - "Show me all unassigned Client A tasks"
  - "Create a Client A block every Monday and Wednesday at 9am"
- Progress tracking and accountability
- Work pattern insights (future)

**Example Interactions:**
```
> What should I focus on for Client B today?
> Add the authentication refactor to tomorrow's Client B block
> Show me all tasks in the backlog for Client A
> Move tomorrow's Education block to start at 10am instead of 9am
> Create a recurring Personal Projects block every Friday afternoon
> Which tasks didn't get done this week?
> How am I tracking on this week's goals?
```

### 7. Daily Standup Flow

**Morning Routine:**
- Notification at configured time
- Quick standup chat with AI
- Review today's blocks and tasks
- AI suggests adjustments based on priorities
- Confirm/modify daily plan
- Begin first block

## Technical Stack

### Frontend
- **Framework:** React with TypeScript + Vite
- **UI Components:** TBD (considering alternatives to shadcn/ui)
- **Styling:** TBD (may or may not use Tailwind CSS)
- **State Management:** Zustand or Jotai (lightweight)
- **Calendar Display:** React Big Calendar or similar
- **Terminal:** xterm.js

### Desktop Framework
- **Platform:** Tauri 2.0
- **Backend:** Rust (minimal, primarily for system APIs)
- **Notifications:** Tauri native notification API
- **System Integration:** Menu bar, dock, macOS notification center

### Data Layer
- **Primary Database:** Supabase (PostgreSQL)
- **Local Cache:** IndexedDB or similar for offline support
- **External APIs:** Google Calendar API

### AI Integration
- **Method:** Embedded terminal running Claude Code/Codex
- **Authentication:** User's existing credentials
- **Context:** Points to Supabase database with full read/write access
- **Interface:** Direct SQL access + helper functions for common operations
- **Design Philosophy:** Data models optimized for AI understanding and manipulation

## Data Models (Preliminary)

**Design Principles for AI-Friendly Models:**
- Use clear, semantic field names that reflect their purpose
- Maintain simple, predictable relationships between entities
- Avoid deep nesting or complex joins where possible
- Use consistent date/time formats (ISO 8601)
- Include helpful metadata fields (createdAt, updatedAt) for context
- Design tables to be easily queryable with natural language intent

## Data Models (Preliminary)

### Block Types
```typescript
interface BlockType {
  id: string
  name: string // "Client A", "Education", etc.
  color: string // for visual distinction
  defaultDuration: number // minutes
  defaultPomodoroConfig: PomodoroConfig
  recurringSchedule?: RecurringSchedule
  userId: string
}

interface RecurringSchedule {
  enabled: boolean
  daysOfWeek: number[] // 0-6, Sunday = 0
  timeOfDay: string // "09:00"
  autoCreate: boolean // automatically create instances
  weeksInAdvance: number // how far ahead to create instances
}
```

### Block Instances
```typescript
interface BlockInstance {
  id: string
  blockTypeId: string
  date: string // ISO date
  startTime: string // ISO datetime
  endTime: string // ISO datetime
  tasks: Task[]
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped'
  actualStartTime?: string
  actualEndTime?: string
  userId: string
}
```

### Tasks
```typescript
interface Task {
  id: string
  title: string
  description?: string
  notes?: string // for tracking progress, where user left off, etc.
  blockTypeId: string // which type of block this belongs to
  blockInstanceId?: string // assigned to specific day's block (null = in backlog)
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  estimatedDuration?: number // minutes
  createdAt: string
  updatedAt: string
  completedAt?: string
  userId: string
}
```

### Pomodoro Configuration
```typescript
interface PomodoroConfig {
  focusDuration: number // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number // minutes
  sessionsBeforeLongBreak: number
}
```

### User Preferences
```typescript
interface UserPreferences {
  userId: string
  defaultPomodoroConfig: PomodoroConfig
  notificationSettings: NotificationSettings
  standupTime: string // "09:00"
  workingHours: {
    start: string // "08:00"
    end: string // "18:00"
  }
  googleCalendarConnected: boolean
}
```

## User Flows

### First Time Setup
1. Launch app
2. Connect Google Calendar (optional)
3. Configure default Pomodoro settings
4. Set standup time
5. Create block types (or use defaults)
6. Schedule first blocks

### Daily Flow
1. Receive morning standup notification
2. Open app → Terminal opens with AI
3. 5-minute standup conversation
4. Review/adjust today's blocks
5. Start first block
6. Work through Pomodoro sessions
7. Receive transition notifications
8. Move between blocks throughout day
9. End-of-day review (optional)

### Task Management Flow
1. Capture task in appropriate block type (goes to backlog)
2. AI helps prioritize during standup
3. AI assigns tasks from backlog to specific day's blocks
4. User sees assigned tasks when starting block
5. Work on tasks during block, add notes about progress
6. Completed tasks are marked done
7. Unfinished tasks return to backlog with notes about where user left off
8. AI can suggest rescheduling incomplete tasks during next standup

### Block Execution Flow
1. Receive "block starting soon" notification
2. Click notification or manually start block
3. See block details: tasks, duration, timer
4. Start first Pomodoro session
5. Work during focus time
6. **If calendar meeting starts during block:**
   - Timer pauses automatically
   - Notifications suppressed
   - Resume after meeting or manually
7. Receive break notification
8. Take break
9. Repeat until block time ends
10. Add notes to unfinished tasks
11. Receive next block notification

## Success Metrics

**Primary:**
- Daily blocks completed vs planned
- Tasks completed per block
- User completes daily standup consistently
- Notifications acknowledged vs dismissed

**Secondary:**
- Time from notification to block start
- Pomodoro sessions completed
- Task completion rate by block type
- Week-over-week consistency

## MVP Scope (Phase 1)

**Must Have:**
- Create and manage block types (with recurring schedule support)
- Schedule block instances on calendar (manual and auto-recurring)
- Task backlog management (add/edit/complete tasks)
- Task notes for tracking progress
- Assign tasks from backlog to specific blocks
- Return unfinished tasks to backlog
- macOS notifications for block transitions
- Meeting detection and block pause behavior
- Embedded terminal with Claude Code
- **AI-driven schedule manipulation via natural language**
- **Helper functions/API for common Claude operations:**
  - Add/move/delete block instances
  - Assign/unassign tasks
  - Query backlog by various filters
  - Create recurring schedules
  - Reschedule blocks
- Basic daily standup flow
- Google Calendar read-only sync

**Nice to Have (post-MVP):**
- Pomodoro timer integration
- Two-way Google Calendar sync
- Advanced AI insights
- Weekly review features
- Mobile companion app
- Task time tracking
- Historical analytics

## Open Questions

1. ✅ ~~Should blocks be created manually or automatically recurring?~~ **ANSWERED: Both - support auto-recurring AND manual creation**
2. ✅ ~~How should unfinished tasks be handled?~~ **ANSWERED: Return to backlog with notes, AI suggests rescheduling**
3. ✅ ~~What happens if blocks overlap with calendar meetings?~~ **ANSWERED: Meetings pause block timers and suppress notifications**
4. Should the app support multiple workspaces/profiles?
5. What level of customization for notification sounds/styles?
6. Should there be a "quick capture" global hotkey?
7. Integration with other task management systems (Linear, Notion)?
8. Should blocks be strictly timed or flexible with warnings?
9. Should the task backlog have views/filters (by priority, by block type, etc.)?
10. How should recurring block instances handle tasks? (Each instance independent, or shared pool?)
11. Should we create a dedicated API/helper library for Claude to interact with the database, or direct SQL access?
12. What specific commands/functions should be available to Claude for schedule manipulation?
13. Should Claude have permissions/guardrails, or full database access?

## Future Considerations

- Team collaboration features
- Block templates and sharing
- Integration with time tracking tools
- Advanced analytics and insights
- AI-powered pattern recognition
  - Suggest optimal block scheduling based on historical performance
  - Identify productivity patterns
  - Recommend task time estimates based on similar past tasks
- Voice input for task capture
- iOS/iPadOS companion app
- Block performance scoring
- Gamification elements
- Export/reporting features
- Natural language query interface (beyond just commands)
  - "When was the last time I worked on the email system?"
  - "What percentage of my Education blocks do I actually complete?"
- AI-generated weekly/monthly summaries

## Non-Goals

- Full calendar replacement (supplement, not replace)
- Complex project management (use existing PM tools)
- Team chat/communication
- File storage/management
- Billing/invoicing features

---

**Document Version:** 0.3
**Last Updated:** 2025-10-17
**Status:** Initial Draft

## Changelog

### v0.3 (2025-10-17)
- **Major emphasis on AI-friendly architecture**
- Added design principles for AI-friendly data models
- Expanded AI schedule manipulation capabilities
- Added more example interactions for Claude Code terminal
- Added helper functions/API requirement for common Claude operations
- Expanded future considerations for AI-powered features
- Added new open questions about Claude's API/database access approach
- Updated MVP scope to include AI-driven schedule manipulation as must-have

### v0.2 (2025-10-17)
- Added support for both auto-recurring and manual block creation
- Added recurring schedule configuration to BlockType model
- Clarified task backlog system for unassigned tasks
- Added notes field to Task model for progress tracking
- Defined meeting overlap behavior (pause timers, suppress notifications)
- Updated Task Management and Block Execution flows
- Resolved Open Questions #1, #2, #8
- Added new open questions about backlog views and recurring task handling

### v0.1 (2025-10-17)
- Initial draft
