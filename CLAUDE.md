# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PM Me Planner** is a macOS desktop application for calendar-based time block management with integrated AI accountability. Built with Tauri 2.0, React, TypeScript, and Supabase, it helps solo developers organize work through 2-3 hour sprint blocks with task management, Google Calendar integration, and embedded Claude Code terminal for AI-driven schedule manipulation.

**Current Status:**
- ✅ Prerequisites setup (Part 1) complete: Xcode CLI tools, Rust, Node.js, Supabase project, Google Calendar API configured
- ✅ Phase 1 (Foundation & Project Setup) complete: Tauri 2.0 + React + TypeScript + Vite app running with Supabase connection
- Ready to begin Phase 2: Database Schema & Models
- Linear epics and issues created for parallel agent execution

## Core Architecture

### Technology Stack

**Frontend:**
- React + TypeScript + Vite
- UI Components: TBD (considering alternatives to shadcn/ui)
- Styling: TBD (may or may not use Tailwind CSS)
- Zustand or Jotai (state management)
- xterm.js (embedded terminal)
- React Big Calendar (calendar display)

**Desktop Platform:**
- Tauri 2.0 (Rust backend)
- macOS primary target (cross-platform capable)
- Native notifications via tauri-plugin-notification
- Shell access via tauri-plugin-shell

**Data Layer:**
- Supabase (PostgreSQL) for primary storage
- Google Calendar API v3 (read-only sync in MVP)
- IndexedDB or SQLite for local caching

### Key Data Models

The database schema is designed for AI manipulation via natural language:

**BlockType** - Templates for work blocks (e.g., "Client A", "Education")
```typescript
interface BlockType {
  id: string
  name: string                      // Semantic name for AI understanding
  color: string
  defaultDuration: number           // Minutes
  defaultPomodoroConfig: PomodoroConfig
  recurringSchedule?: RecurringSchedule
  userId: string
}
```

**BlockInstance** - Scheduled occurrences of blocks
```typescript
interface BlockInstance {
  id: string
  blockTypeId: string
  date: string                      // ISO 8601
  startTime: string                 // ISO 8601 datetime
  endTime: string                   // ISO 8601 datetime
  tasks: Task[]
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped'
  userId: string
}
```

**Task** - Work items in blocks or backlog
```typescript
interface Task {
  id: string
  title: string
  description?: string
  notes?: string                    // Progress tracking
  blockTypeId: string               // Category
  blockInstanceId?: string          // null = backlog
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  estimatedDuration?: number        // Minutes
  userId: string
}
```

**Design Principle:** Simple, semantic field names and relationships for easy AI querying and manipulation via SQL.

## Before Implementation - Required Documentation Review

**CRITICAL: All agents MUST reference the framework documentation in `docs/` before implementing any integration code or configuration.**

The `docs/` directory contains comprehensive reference material extracted from official documentation. Agents working on scaffolding, setup, or feature implementation should consult the relevant documentation files BEFORE writing code to ensure:
- Configuration files follow framework best practices and latest API conventions
- Integration patterns match current framework recommendations
- All required dependencies and setup steps are included
- Type definitions and API usage are accurate

**Required Reading by Phase:**

**Phase 1 (Foundation & Project Setup):**
- `docs/tauri.md` - MUST read before creating `tauri.conf.json`, `Cargo.toml`, or any Rust backend code
- `docs/supabase-js.md` - MUST read before implementing database client initialization

**Phase 2-5 (Core Features):**
- `docs/supabase-js.md` - Reference for all database queries, RLS policies, and real-time subscriptions
- `docs/tauri-plugins.md` - Consult before adding notification, shell, dialog, or filesystem integrations

**Phase 6 (Google Calendar Integration):**
- `docs/google-calendar-api.md` - MUST read before implementing OAuth flow or calendar sync logic

**Phase 7 (macOS Notifications):**
- `docs/tauri-plugins.md` - Reference the notification plugin section

**Phase 8 (Embedded Terminal):**
- `docs/xterm-js.md` - MUST read before implementing terminal embedding
- `docs/tauri-plugins.md` - Reference the shell plugin section

**Documentation Precedence:**
When conflicts arise between implementation-plan.md suggestions and official framework docs in `docs/`, the official documentation in `docs/` takes precedence. The implementation plan provides high-level guidance, but specific API usage, configuration syntax, and best practices should follow the framework documentation.

## Development Commands

### Prerequisites Setup

**First-time setup (in order):**
```bash
# 1. Install Xcode Command Line Tools
xcode-select --install

# 2. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 3. Verify Node.js (requires v20+)
node --version

# 4. Install Bun (recommended) or pnpm
curl -fsSL https://bun.sh/install | bash
# OR
npm install -g pnpm

# 5. Create Supabase project at https://supabase.com
# 6. Set up Google Calendar API at https://console.cloud.google.com
# (See implementation-plan.md Part 1 for detailed steps)
```

### Project Not Yet Initialized

**When implementing Phase 1, these commands will be created:**
```bash
# Install dependencies
bun install
# OR
pnpm install

# Development
bun run tauri dev        # Start Tauri dev server
bun run dev              # Frontend only (Vite)

# Build
bun run tauri build      # Production build

# Database
bun run db:migrate       # Run Supabase migrations
bun run db:seed          # Seed test data
bun run db:reset         # Reset local database

# Testing (to be implemented in Phase 10)
bun run test             # Run tests
bun run test:watch       # Watch mode
```

## Environment Configuration

### Required Environment Variables

Create `.env.local` (git-ignored) with:

```bash
# Supabase (get from https://supabase.com/dashboard/project/_/settings/api)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Google Calendar (get from https://console.cloud.google.com)
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:1420/oauth/callback

# Optional: Claude Code API access (if using HTTP API instead of embedded terminal)
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Security:**
- NEVER commit credentials to git
- Each developer uses their own Supabase project
- Each developer creates their own Google Cloud project
- See `SECURITY_AND_PORTABILITY.md` for full details

### Validation

Environment variables should be validated on app startup (to be implemented in Phase 1):

```typescript
// src/lib/env.ts
const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_GOOGLE_CLIENT_ID',
];

const missing = required.filter(key => !import.meta.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}
```

## Implementation Phases

The project is planned in 11 phases (see `implementation-plan.md` for details):

1. **Phase 1** - Foundation & Project Setup ← **CURRENT PHASE**
2. **Phase 2** - Database Schema & Models
3. **Phase 3** - Core UI Components
4. **Phase 4** - Block Management
5. **Phase 5** - Task Management & Backlog
6. **Phase 6** - Google Calendar Integration
7. **Phase 7** - macOS Notifications
8. **Phase 8** - Embedded Terminal + Claude Integration
9. **Phase 9** - Daily Standup Flow
10. **Phase 10** - Polish & Testing
11. **Phase 11** - Future Enhancements (post-MVP)

**Current Phase:** Phase 1 - Foundation & Project Setup
- Prerequisites (Part 1) completed ✓
- Ready to execute Part 2 implementation steps
- Linear epics and issues created for task tracking and parallel agent execution

**Estimated Timeline:** 6-11 days with parallel Claude Code/Codex agents

## AI Integration Architecture

### Embedded Terminal Approach

The app embeds a terminal running Claude Code/Codex using xterm.js and tauri-plugin-shell. This gives Claude direct SQL access to Supabase for schedule manipulation.

**Key Design Decisions:**
- Embedded terminal preferred over HTTP API (simpler, uses existing credentials)
- Claude can execute SQL queries directly against Supabase
- Helper functions provided for common operations
- AI has full read/write access to user's schedule data

**Helper Functions to Implement (Phase 8):**
```typescript
// Examples of SQL helpers Claude will use
SELECT * FROM tasks WHERE status = 'pending' AND block_instance_id IS NULL  -- Get backlog
UPDATE tasks SET block_instance_id = '...' WHERE id = '...'                -- Assign task
INSERT INTO block_instances (block_type_id, date, start_time, end_time)    -- Create block
```

### Daily Standup Flow (Phase 9)

AI-powered morning routine:
1. Review yesterday's completed/incomplete tasks
2. Suggest task prioritization for today
3. Auto-schedule recurring blocks
4. Detect conflicts with Google Calendar meetings
5. Present recommended schedule for approval

## Critical Files & Locations

**Documentation:**
- `PRD.md` - Product requirements (v0.3)
- `implementation-plan.md` - 11-phase development roadmap
- `SECURITY_AND_PORTABILITY.md` - Credential management strategy
- `docs/` - Framework documentation (Tauri, Supabase, xterm.js, Google Calendar API)

**Configuration (to be created in Phase 1):**
- `src-tauri/tauri.conf.json` - Tauri app configuration
- `src-tauri/Cargo.toml` - Rust dependencies
- `package.json` - Frontend dependencies and scripts
- `.env.example` - Template for environment variables
- `supabase/migrations/` - Database schema migrations

**Source Code (to be created):**
- `src-tauri/src/lib.rs` - Tauri backend entry point
- `src-tauri/src/main.rs` - Desktop executable entry point
- `src/` - React frontend source
- `src/lib/` - Shared utilities and API clients
- `src/components/` - React components (shadcn/ui)

## Database Schema

**To be created in Phase 2.** Schema will include:

**Core Tables:**
- `block_types` - Template definitions for work blocks
- `block_instances` - Scheduled block occurrences
- `tasks` - Work items (in blocks or backlog)
- `pomodoro_configs` - Focus/break settings per block type
- `recurring_schedules` - Auto-create rules for blocks
- `google_calendar_events` - Synced calendar data (read-only cache)
- `user_preferences` - App settings per user

**Security:**
- Row Level Security (RLS) policies on all tables
- Users can only access their own data
- Service role key kept in Rust backend (not exposed to frontend)

## Testing Strategy

**Phase 10 - Testing Implementation:**
- Integration tests for critical flows
- Screen size compatibility testing
- Performance optimization
- Error handling and logging
- No specific test commands yet defined

## Common Patterns

### Tauri Commands (Rust ↔ TypeScript)

```rust
// src-tauri/src/lib.rs
#[tauri::command]
async fn get_supabase_key() -> String {
    std::env::var("SUPABASE_SERVICE_ROLE_KEY").unwrap()
}
```

```typescript
// src/lib/tauri.ts
import { invoke } from '@tauri-apps/api/tauri';
const key = await invoke<string>('get_supabase_key');
```

### Supabase Queries

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Query example
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('status', 'pending')
  .is('block_instance_id', null);
```

### Google Calendar Integration

```typescript
// OAuth flow using @google-cloud/local-auth
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';

const auth = await authenticate({
  scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  keyfilePath: './credentials.json',
});

const calendar = google.calendar({ version: 'v3', auth });
```

## Important Constraints

1. **macOS Primary Target** - Focus on macOS experience first, ensure cross-platform compatibility
2. **Read-Only Calendar Sync (MVP)** - Two-way sync deferred to Phase 11
3. **No Credentials in Code** - All secrets in `.env.local` or OS keychain
4. **AI-Friendly Schema** - Simple, semantic data models for LLM manipulation
5. **Embedded Terminal** - Claude Code integration via xterm.js, not HTTP API

## Related Documentation

- **PRD.md** - Full product requirements
- **implementation-plan.md** - Detailed phase-by-phase plan with setup instructions
- **SECURITY_AND_PORTABILITY.md** - Credential management and multi-user scenarios
- **docs/** - Framework reference documentation
  - `tauri.md` - Tauri framework guide
  - `tauri-plugins.md` - Notification, shell, dialog, filesystem plugins
  - `supabase-js.md` - Database client API
  - `xterm-js.md` - Terminal library reference
  - `google-calendar-api.md` - Calendar API v3 reference

## MCP Server Configuration

Active MCP servers (`.mcp.json` and `.claude/settings.local.json`):
- **Context7** - Documentation lookup for frameworks
- **Linear** - Issue tracking integration (epics and issues set up for parallel agent work)
- **Supabase** - Database management tools

## Linear Issue Tracking

The project uses Linear for task management with epics and issues structured to enable parallel agent execution:
- Issues are scoped for independent work streams
- Agents should check Linear for assigned issues before starting work
- Update issue status as work progresses (In Progress → In Review → Completed)
- Use Linear MCP integration to query and update issues programmatically

## Next Steps for Implementation

**Prerequisites Complete (Part 1) ✓**
- Xcode Command Line Tools installed
- Rust toolchain installed
- Node.js v20+ verified
- Supabase project created and configured
- Google Calendar API project set up with OAuth credentials
- Bun package manager installed

**Ready to Execute Part 2 (Phase 1 Implementation):**
1. Create Tauri project template
2. Set up React + TypeScript + Vite
3. Configure Supabase connection
4. Create `.env.example` template
5. Initialize git repository with proper `.gitignore`
6. Test clean project setup from scratch

**Linear Issues Available:**
- Check Linear for assigned implementation tasks
- Multiple agents can work in parallel on independent issues
- Update issue status as work progresses

See `implementation-plan.md` Part 2 (Phase 1) for detailed implementation steps.
- Remember that all of our frameworks have documentation in @docs/ -- be sure to check in there when you're not totally sure how to properly implement something or fix a bug related to that framework