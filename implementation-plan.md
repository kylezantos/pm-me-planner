# PM Me Planner - Implementation Plan

## Part 1: Prerequisites Setup Checklist

### 1.1 Install Xcode Command Line Tools
**What it's for:** Required for Tauri to compile native macOS code

**Steps:**
1. Open Terminal
2. Run: `xcode-select --install`
3. Click "Install" in the popup dialog
4. Wait for installation to complete (takes 5-10 minutes)
5. Verify installation: `xcode-select -p` (should output `/Library/Developer/CommandLineTools`)

### 1.2 Install Rust
**What it's for:** Tauri's backend is written in Rust

**Steps:**
1. In Terminal, run: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. Press Enter to proceed with default installation
3. Wait for installation to complete
4. Close and reopen Terminal (or run `source ~/.cargo/env`)
5. Verify installation: `rustc --version` and `cargo --version`

### 1.3 Install Node.js (if not already installed)
**What it's for:** React frontend development

**Steps:**
1. Check if installed: `node --version` and `npm --version`
2. If not installed, visit https://nodejs.org and download the LTS version
3. Run the installer
4. Verify: `node --version` (should be v20.x or higher)

### 1.4 Create Supabase Account & Project
**What it's for:** PostgreSQL database for storing blocks, tasks, schedules

**Steps:**
1. Go to https://supabase.com
2. Click "Start your project" and sign up (can use GitHub)
3. Click "New Project"
4. Fill in:
   - Project name: `pm-me-planner`
   - Database password: (generate a strong password - save it!)
   - Region: Choose closest to you
5. Click "Create new project" and wait for setup (~2 minutes)
6. Once ready, go to Project Settings → API
7. Save these values (you'll need them later):
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key (for Claude Code access)

### 1.5 Set Up Google Calendar API
**What it's for:** Syncing with Google Calendar, detecting meetings

**Steps:**
1. Go to https://console.cloud.google.com
2. Sign in with your Google account
3. Click "Select a project" → "New Project"
4. Project name: `PM Me Planner`, click "Create"
5. Wait for project creation, then select it
6. In the search bar, type "Google Calendar API" and select it
7. Click "Enable"
8. In the left sidebar, click "Credentials"
9. Click "Configure Consent Screen"
   - Choose "External" (recommended for open source projects that others will self-host)
   - If you have Google Workspace and only want to use this yourself, you can choose "Internal"
   - Click "Next"
10. Fill in App Information (Step 1 of 4):
    - App name: `PM Me Planner`
    - User support email: select your email from dropdown
    - Developer contact: your email
    - Click "Next"
11. On Audience screen (Step 2 of 4):
    - Click "Save and Continue"
12. On Contact Information screen (Step 3 of 4):
    - Click "Save and Continue"
13. On Finish screen (Step 4 of 4):
    - Review and click "Create" or "Finish"
14. You'll be taken back to the OAuth Overview page
15. In the left sidebar, click "Data Access"
16. Click "Add or Remove Scopes"
    - Search for "calendar"
    - Check the box for `https://www.googleapis.com/auth/calendar` (full access)
    - Click "Update" then "Save"
17. In the left sidebar, click "Clients"
18. Click "Create Client" button
19. Application type: select "Desktop app"
20. Name: `PM Me Planner Desktop`
21. Click "Create"
22. Download the JSON file and save it securely (you'll need it later)

### 1.6 Install Bun (recommended) or pnpm
**What it's for:** Fast package manager for JavaScript dependencies

**Steps:**
1. Run: `curl -fsSL https://bun.sh/install | bash`
2. Close and reopen Terminal
3. Verify: `bun --version`

**Alternative (pnpm):** `npm install -g pnpm`

---

## Part 2: Implementation Plan (Phases)

### Phase 1: Foundation & Project Setup
**Goal:** Create working Tauri + React app with database connection

**Tasks:**
1. Create Tauri project with React + TypeScript template
2. Set up project structure and configuration
3. Install shadcn/ui and configure Tailwind
4. Set up Supabase client connection (React side)
5. Create environment variable management
6. Test basic app launch and database connection

**Deliverable:** Empty app that launches and can ping Supabase

---

### Phase 2: Database Schema & Models
**Goal:** Design and implement AI-friendly database schema

**Tasks:**
1. Design Supabase database schema (tables, relationships)
2. Create migration scripts for:
   - `block_types` table
   - `block_instances` table
   - `tasks` table
   - `user_preferences` table
   - `calendar_connections` table (for multiple Google Calendar OAuth tokens)
   - `calendar_events` table (cached events from Google Calendar)
3. Set up Row Level Security (RLS) policies
4. Create TypeScript types matching database schema
5. Build basic CRUD functions for each entity
6. Create seed data for testing

**Deliverable:** Fully functional database with test data

**Related Documentation:** DATABASE_SCHEMA.md

---

### Phase 3: Core UI Components
**Goal:** Build reusable UI components with shadcn/ui

**Tasks:**
1. Install and configure shadcn/ui components
2. Set up color theme for block types
3. Create components:
   - `BlockTypeCard` - display block type info
   - `BlockInstanceCard` - display scheduled block
   - `TaskCard` - display task with notes
   - `TaskBacklog` - list of unassigned tasks
   - `CalendarView` - daily/weekly calendar display
4. Build layout shell (sidebar, main content area)
5. Implement routing (if needed)

**Deliverable:** Component library with Storybook-style preview

---

### Phase 4: Block Management
**Goal:** Create, edit, and schedule blocks

**Tasks:**
1. Build "Create Block Type" form
   - Name, color, duration, pomodoro settings
   - Recurring schedule configuration
2. Build "Schedule Block Instance" interface
   - Date/time picker
   - Block type selector
   - Manual vs auto-recurring toggle
3. Implement recurring block generation logic
4. Create daily/weekly calendar view showing blocks
5. Add edit/delete functionality for blocks
6. Implement drag-and-drop rescheduling (nice-to-have)

**Deliverable:** Fully functional block scheduling system

---

### Phase 5: Task Management & Backlog
**Goal:** Create, organize, and assign tasks

**Tasks:**
1. Build "Create Task" form with notes field
2. Implement task backlog view
   - Filter by block type
   - Filter by priority
   - Sort options
3. Build task assignment interface
   - Drag tasks from backlog to blocks
   - Assign multiple tasks at once
4. Implement task status updates
5. Build "unfinished task return to backlog" logic
6. Create task detail view/edit modal

**Deliverable:** Working task management system

---

### Phase 6: Google Calendar Integration
**Goal:** Sync with multiple Google Calendars, detect meetings

**Tasks:**
1. Implement Google OAuth flow (using credentials from setup)
   - Support connecting multiple Google accounts
   - Store OAuth tokens in `calendar_connections` table
2. Build calendar sync service:
   - Fetch events from ALL connected calendars
   - Store events in `calendar_events` table with calendar_id reference
   - Display events alongside blocks
   - Detect meeting overlaps with blocks
3. Build calendar management UI:
   - Add/remove calendar connections
   - Enable/disable specific calendars for meeting detection
   - Configure per-calendar settings (color coding, sync frequency)
4. Implement meeting detection logic:
   - Monitor active meetings across all enabled calendars
   - Trigger block pause when meeting starts
   - Resume block when meeting ends
5. Add manual sync button (syncs all enabled calendars)
6. Set up periodic auto-sync (every 5-10 minutes) for all enabled calendars

**Deliverable:** Working multi-calendar integration with meeting detection

---

### Phase 7: macOS Notifications System
**Goal:** Native notifications for block transitions

**Tasks:**
1. Set up Tauri notification plugin
2. Implement notification scheduling system
3. Create notifications for:
   - Block starting soon (5-15 min warning)
   - Block starting now
   - Meeting detected (block paused)
   - Block resumed after meeting
   - Daily standup time
4. Add notification actions (Start, Snooze, Skip)
5. Implement notification preferences/settings
6. Test notification behavior when app is minimized

**Deliverable:** Working notification system

---

### Phase 8: Embedded Terminal + Claude Integration
**Goal:** Terminal interface for Claude Code interaction

**Tasks:**
1. Install xterm.js and tauri-plugin-pty
2. Set up terminal component in React
3. Configure PTY to spawn macOS shell
4. Build terminal UI (tab in sidebar or separate panel)
5. Create helper functions for Claude:
   - `get_backlog_tasks(block_type_id)` - query tasks
   - `assign_task_to_block(task_id, block_instance_id)`
   - `create_block_instance(data)` - create new block
   - `move_block_instance(id, new_datetime)`
   - `create_recurring_schedule(block_type_id, config)`
6. Document database schema for Claude context
7. Create example prompt file for Claude Code
8. Test Claude Code running commands and querying database

**Deliverable:** Working terminal with Claude Code integration

**Related Documentation:** CLAUDE_GUIDE.md, API_REFERENCE.md

---

### Phase 9: Daily Standup Flow
**Goal:** AI-powered morning standup routine

**Tasks:**
1. Build standup notification (scheduled time)
2. Create standup UI flow:
   - Open app automatically (optional)
   - Focus terminal
   - Display today's blocks
3. Create standup prompt template for Claude
4. Implement standup completion tracking
5. Build "skip standup" option
6. Add standup history (optional)

**Deliverable:** Working daily standup system

---

### Phase 10: Polish & Testing
**Goal:** Refine UI/UX, fix bugs, optimize performance

**Tasks:**
1. UI/UX polish pass:
   - Consistent spacing, typography
   - Smooth transitions/animations
   - Loading states
   - Error states
2. Add keyboard shortcuts for common actions
3. Implement app settings panel:
   - Notification preferences
   - Standup time
   - Working hours
   - Theme (light/dark mode)
   - Calendar management (add/remove/enable/disable calendars)
   - Calendar sync preferences
4. Write integration tests for critical flows
5. Test on different screen sizes
6. Performance optimization:
   - Database query optimization
   - React re-render optimization
7. Add error handling and logging
8. Create user onboarding flow

**Deliverable:** Production-ready MVP

---

### Phase 11: Future Enhancements (Post-MVP)
**Nice-to-have features for later:**

**Tasks:**
1. Pomodoro timer integration (in-block focus sessions)
2. Two-way Google Calendar sync (create blocks → calendar events)
3. Historical analytics dashboard
4. Task time tracking
5. Weekly review interface
6. Menu bar quick-access widget
7. Export/reporting features
8. Voice input for tasks
9. AI pattern recognition and suggestions

---

## Documentation to Create

1. **ARCHITECTURE.md** - Technical architecture overview
2. **DATABASE_SCHEMA.md** - Complete database schema with relationships
3. **CLAUDE_GUIDE.md** - Guide for Claude Code to interact with the app
4. **API_REFERENCE.md** - Helper functions for Claude
5. **DEVELOPMENT.md** - Local development setup instructions

---

## Estimated Timeline

**With multiple Claude Code/Codex subagents working in parallel:**
- **Phases 1-2:** 1-2 days (foundation + database)
- **Phases 3-5:** 2-3 days (UI + core features)
- **Phases 6-7:** 1-2 days (calendar + notifications)
- **Phases 8-9:** 1-2 days (Claude integration + standup)
- **Phase 10:** 1-2 days (polish)

**Total: 6-11 days of development** (with parallelization)

---

## Phase Status Tracking

- [ ] Phase 1: Foundation & Project Setup
- [ ] Phase 2: Database Schema & Models
- [ ] Phase 3: Core UI Components
- [ ] Phase 4: Block Management
- [ ] Phase 5: Task Management & Backlog
- [ ] Phase 6: Google Calendar Integration
- [ ] Phase 7: macOS Notifications System
- [ ] Phase 8: Embedded Terminal + Claude Integration
- [ ] Phase 9: Daily Standup Flow
- [ ] Phase 10: Polish & Testing
- [ ] Phase 11: Future Enhancements

---

**Document Version:** 1.0
**Last Updated:** 2025-10-17
**Status:** Initial Plan
