# UI Component Implementation Roadmap

**Status:** Living Document
**Last Updated:** 2025-10-26
**Purpose:** Track missing UI components and states identified during codebase analysis

This document outlines the UI components and states that need to be implemented across the project's 11 phases. It serves as a reference for agents working on UI features.

---

## What's Already Implemented ✅

### Calendar Views
- **Components:** CalendarView, CalendarDayView, CalendarWeekView, CalendarMonthView
- **Controls:** ViewSelector (animated toggle with shadcn ToggleGroup)
- **Navigation:** Date navigation, view switching (Cmd+D keyboard shortcut)
- **Current time indicator:** Live updating in day/week views
- **Data:** Displays block instances from Zustand store

**Location:** `src/components/calendar/*`

### Block Management
- **Components:** CreateBlockTypeModal, CreateBlockModal, CreateBlockInstanceModal, SimpleCreateBlockModal
- **Features:** Conflict detection, suggested times, recurring schedule configuration
- **Validation:** Time validation, overlap warnings

**Location:** `src/components/blocks/*`

### Task Management
- **Components:** TaskBacklog, DraggableTaskCard, DraggableTaskList, CreateTaskModal, SimpleCreateTaskModal, EditTaskModal
- **Features:** Search, drag-and-drop, task assignment to blocks
- **States:** pending, in_progress, completed

**Location:** `src/components/tasks/*`

### Settings & Configuration
- **Pages:** Settings.tsx, OAuthCallback.tsx
- **Components:** NotificationSettings, Connections (Google Calendar OAuth)
- **Features:** Notification toggles, calendar connection status, OAuth flow

**Location:** `src/pages/Settings.tsx`, `src/components/settings/*`

### Notifications
- **System:** Scheduling, send pipeline, action handlers (start/snooze/skip)
- **Types:** Block transitions, meeting reminders, standup prompts
- **Implementation:** Background notification manager

**Location:** `src/lib/notifications/*`

### Core State Management
- **Stores:** Blocks, Tasks, Sessions, Recurring generation
- **Repositories:** Database access layer with Supabase integration
- **Orchestrator:** Work sessions orchestrator (logic only, no UI yet)

**Location:** `src/lib/store/*`, `src/lib/repositories.ts`, `src/lib/workSessions/*`, `src/lib/recurringBlocks.ts`

### UI Primitives (shadcn/ui)
- Button, Input, Textarea, Label
- Dialog, Dropdown Menu, Popover, Tooltip
- Checkbox, Switch, Select, Toggle, Toggle Group
- Avatar, Badge, Card, Skeleton

**Location:** `src/ui/*`

### Error & Empty States
- **Components:** ErrorBoundary, InlineError, EmptyBacklog, EmptySearch, EmptyBlock, EmptyCalendar
- **Features:** User-friendly error messages, loading skeletons

**Location:** `src/components/error/*`, `src/components/empty/*`

---

## Missing Components by Phase

### Phase 2: Database Schema & Models
**No UI work** - Database migrations, RLS policies, and data models only.

**Next Phase Gate:** Schema complete → enables Phase 3 UI work

---

### Phase 3-4: Core UI Components & Block Management

#### High-Impact Missing Components

**1. Block Execution Controls**
- **Component:** BlockControlPanel
- **Features:** Start, Pause, Resume, Skip, Complete buttons
- **Location:** Block details side panel (currently shows status only)
- **Integrates with:** Block instances, notification system
- **Required shadcn:** `alert-dialog` (for destructive actions)

**Current Gap:** Side panel at `src/pages/Dashboard.tsx:479` shows status but has TODO for editing.

**2. EditBlockModal**
- **Component:** EditBlockModal
- **Features:** Move/resize times, edit notes, change status, reassign tasks
- **Validation:** Conflict detection, time validation
- **Required shadcn:** None (reuse existing Dialog)

**Current Gap:** Block details panel notes "TODO: Add ability to edit block here"

**3. Block Types Management UI**
- **Component:** BlockTypesList
- **Features:** List all block types, edit, delete, color legend, usage count
- **Navigation:** Link to recurring schedule settings
- **Required shadcn:** `table`, `dropdown-menu` (already installed), `alert-dialog`

**Current Gap:** Only "New Block Type" modal exists; no list/management interface.

**4. Drag-and-Drop to Calendar Grid**
- **Component:** CalendarDropZone integration
- **Features:** Droppable day/time slots, droppable events for task assignment
- **Context:** DnD context already set up in Dashboard, calendar grid isn't droppable yet

**Current Gap:** `CalendarDropZone.tsx` exists but unused; calendar views need droppable zones.

**Required shadcn:** None (visual states with skeleton, tooltip already installed)

---

### Phase 5: Task Management & Backlog

#### Work Sessions (Informal Mode)

**1. WorkSessionBar**
- **Component:** WorkSessionBar (persistent UI element)
- **Features:** Start/pause/stop controls, elapsed time display, current task indicator
- **States:** idle → running → paused → auto-paused (meeting) → resumed → stopped
- **Required shadcn:** `badge`, `progress`

**Current Gap:** Orchestrator exists (`src/lib/workSessions/orchestrator.ts`) but no UI.

**2. Task Card Work Controls**
- **Feature:** "Start Working" button on TaskCard
- **Behavior:** Begin informal work session (no calendar block)
- **Integration:** Updates WorkSessionBar when clicked

**Current Gap:** TaskCard only shows drag handle and status badge.

**3. WorkHistory Modal**
- **Component:** WorkHistoryModal
- **Features:** Table of all work sessions for a task, start/end times, duration, formal vs informal
- **Required shadcn:** `table`, `dialog` (already installed)

**Current Gap:** No UI to view work session history.

#### Task Assignment Flows

**1. Assign/Unassign Task UI**
- **Feature:** Move tasks back to backlog from a block
- **Feature:** Reassign tasks between blocks
- **UI:** Dropdown menu on TaskCard or drag-and-drop
- **Required shadcn:** `dropdown-menu` (already installed)

**Current Gap:** Can assign from backlog to block (DnD), but no UI to unassign or reassign.

#### Backlog Improvements

**1. EmptySearch Integration**
- **Fix:** Use EmptySearch component when search yields no results
- **Current:** Shows EmptyBacklog even when filtering (misleading)

**File:** `src/components/tasks/TaskBacklog.tsx`

---

### Phase 6: Google Calendar Integration

#### Calendar Overlay & Conflicts

**1. Google Calendar Event Overlay**
- **Component:** CalendarEventOverlay (or integrate into existing views)
- **Features:** Display GCal events alongside blocks, visual differentiation (color, opacity)
- **Required:** Fetch GCal events in calendar hooks

**Current Gap:** Calendar only fetches block instances (`src/lib/calendar/hooks.ts`).

**2. Meeting Conflict Indicators**
- **Component:** ConflictMarker (inline on blocks)
- **Features:** Stripe/pill showing "paused by meeting", hover tooltip with event details
- **Required shadcn:** `tooltip` (already installed), `badge` (already installed)

**Current Gap:** Meeting detection utils exist, but no UI to show conflicts.

**3. Conflict Detection UI Polish**
- **Feature:** "Force create anyway" button when conflicts exist
- **Current:** Only surfaced in create modal; add to calendar grid interaction
- **Required shadcn:** `alert` or `alert-dialog`

---

### Phase 7: macOS Notifications

**No additional UI components needed** - Backend notification system already implemented.

**Calendar UX Polish** (can be done in Phase 7 or Phase 10):
- Go-to-date control (date picker)
- Working hours preference (customize grid range beyond 6am-10pm)
- 12/24h time format preference
- Loading skeletons for Day/Week views (Month already has skeleton)

**Required shadcn:** `calendar` or custom date picker, `scroll-area`

---

### Phase 8: Embedded Terminal + Claude Integration

#### Embedded Terminal

**1. TerminalDrawer**
- **Component:** TerminalDrawer (slide-in panel)
- **Technology:** xterm.js for terminal emulation
- **Features:** Open/close, resize, detachable (nice-to-have), command input, streaming output
- **States:** collapsed → expanded → detached (optional)
- **Required shadcn:** `sheet` (slide-in panel), `resizable`

**Current Gap:** Bottom input bar stub exists (`src/pages/Dashboard.tsx:570`), no terminal.

**2. Command Palette (Optional)**
- **Component:** CommandPalette
- **Features:** Quick access to Claude commands ("Ask Claude...", "Show schedule...")
- **Trigger:** Keyboard shortcut (Cmd+K)
- **Required shadcn:** `command`

**Nice-to-have:** Can defer to Phase 10 or beyond.

#### AI Features UI

**1. Task-Level AI Prompts**
- **Feature:** Toggle AI accountability per task
- **Feature:** Configure prompt timing (after X minutes of work)
- **Feature:** Focus mode toggle (disable interrupts)
- **UI:** Checkbox or switch in EditTaskModal

**Current Gap:** No UI for AI features on tasks.

---

### Phase 9: Daily Standup Flow

#### Standup UI

**1. StandupModal or StandupPanel**
- **Component:** StandupModal (or side panel)
- **Features:** Wizard/stepper-like chat interface, suggestion summary with "Apply Plan" CTA
- **Flow:** 5-minute conversation with Claude → review plan → apply or modify
- **Required shadcn:** `dialog`, `tabs` (for multi-step wizard), `alert`

**Current Gap:** Notifications schedule standup, but no UI for conversation or plan approval.

**2. Daily Plan View**
- **Component:** DailyPlanView
- **Features:** Today-focused view without calendar rigidity
- **Sections:**
  - Today's scheduled blocks (read from BlocksStore)
  - Google Calendar commitments (read-only overlay)
  - Unscheduled tasks with time estimates
  - Currently active informal work session
- **Toggle:** Switch between Calendar and Daily Plan views (Cmd+D)
- **Required shadcn:** `tabs` (view toggle), `separator`, `scroll-area`

**Current Gap:** No daily plan view; only calendar views exist.

---

### Phase 10: Polish & Testing

#### Onboarding

**1. OnboardingWizard**
- **Component:** OnboardingWizard (first-run flow)
- **Steps:**
  - Connect Google Calendar (optional)
  - Set standup time
  - Create first block types (or use defaults)
  - Schedule first blocks
- **Required shadcn:** `dialog`, `tabs`, `progress`

**Current Gap:** No onboarding flow; app assumes user knows how to configure.

#### UX Polish

**1. Block Recurrence Preview**
- **Feature:** Show upcoming instances when editing a block type with recurring enabled
- **UI:** Read-only list or mini-calendar preview
- **Required shadcn:** `table` or custom mini-calendar

**2. "No Block Types" Guardrail**
- **Feature:** When opening create block modal with no block types, show inline CTA to create a block type first
- **Required shadcn:** `alert`

**3. Settings Improvements**
- **Feature:** Disconnect Google Calendar flow (currently disabled)
- **Feature:** Choose primary calendar if multiple connections
- **Feature:** Permission mismatch warning
- **Required shadcn:** `alert-dialog`

---

## shadcn/ui Components to Add

**Install as needed during implementation:**

- ✅ `toggle`, `toggle-group` - Already installed (PER-197)
- ⬜ `tabs` - Daily Plan toggle, block detail tabs, standup wizard
- ⬜ `sheet` - Terminal drawer
- ⬜ `separator` - Section dividers across dashboards
- ⬜ `scroll-area` - Constrained scrollable lists/panels
- ⬜ `resizable` - Adjustable sidebars/terminal height
- ⬜ `alert` - Inline warnings (conflicts, no block types)
- ⬜ `alert-dialog` - Destructive actions (delete, disconnect)
- ⬜ `table` - Work session history, block types list
- ⬜ `command` - Quick command palette ("Ask Claude...")
- ⬜ `progress` - Pomodoro/session progress (Phase 11)
- ⬜ `hover-card` - Inline details (conflicts, event metadata) (nice-to-have)
- ⬜ `calendar` - Go-to-date picker (Phase 10 polish)

---

## Component States Needing Implementation

### Terminal States
- Collapsed/expanded/detached
- Streaming output
- Command error state
- Retry on failure

### Work Session States
- idle → running → paused → auto-paused (meeting) → resumed → stopped
- Error when session end fails
- Session history (list of past sessions per task)

### Block States (UI-level)
- "Up next" banner (block starting soon)
- In-progress with timer
- Paused (meeting) indicator
- Completed/skipped styling
- Overdue state

### Calendar Conflict States
- Inline conflict indicators on blocks
- Hover details showing overlapped GCal event
- "Force create anyway" surfaced outside create modal

### Task States (Additional)
- AI accountability active (icon or badge)
- Focus mode active (do not disturb)
- Work session running (elapsed time badge)

---

## Quick Wins / Prioritized Next Steps

**After Phase 2 (Database Schema) is complete:**

1. **Phase 3-4 Quick Wins:**
   - Add EditBlockModal and block action buttons (start/pause/complete/skip) from right sidebar
   - Add BlockTypesList for managing block types
   - Integrate CalendarDropZone into Day/Week/Month to support drag-to-schedule
   - Hook up EmptySearch for backlog search results

2. **Phase 5 Quick Wins:**
   - Add WorkSessionBar (start/pause/stop) to Dashboard
   - Add "Start Working" button to TaskCard
   - Add WorkHistoryModal (table of sessions per task)

3. **Phase 6 Quick Wins:**
   - Overlay Google events in calendar views
   - Add conflict indicators using meeting detection utils

4. **Phase 8-9 Quick Wins:**
   - Implement TerminalDrawer with xterm.js (sheet)
   - Wire bottom bar input to terminal
   - Add Daily Plan View with tabs

5. **Phase 10 Quick Wins:**
   - Add OnboardingWizard for first-run setup
   - Add "no block types" CTA inside create block modal

---

## References

- **PRD.md** - Product requirements with detailed feature descriptions
- **implementation-plan.md** - 11-phase development roadmap
- **CLAUDE.md** - Component development guidelines and patterns
- **Original Gap Analysis** - Codex assessment (2025-10-26)

---

## Changelog

### 2025-10-26
- Initial document created from Codex gap analysis
- Organized by PRD phases (2-10)
- Added "What's Already Implemented" section
- Prioritized quick wins by phase
