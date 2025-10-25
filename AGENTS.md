# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PM Me Planner** is a macOS desktop application for calendar-based time block management with integrated AI accountability. Built with Tauri 2.0, React, TypeScript, and Supabase, it helps solo developers organize work through 2-3 hour sprint blocks with task management, Google Calendar integration, and embedded Claude Code terminal for AI-driven schedule manipulation.

Note: This is an early-stage project. Requirements are evolving and not all end-product needs are documented yet; expect component inventory and architecture docs to change as features mature.

**Current Status:**
- ✅ Prerequisites setup (Part 1) complete: Xcode CLI tools, Rust, Node.js, Supabase project, Google Calendar API configured
- ✅ Phase 1 (Foundation & Project Setup) complete: Tauri 2.0 + React + TypeScript + Vite app running with Supabase connection
- Ready to begin Phase 2: Database Schema & Models
- Linear epics and issues created for parallel agent execution

## Proactive Agent Usage

**IMPORTANT: Claude Code should proactively invoke specialized agents for code quality and architectural review. Do NOT wait for explicit user requests.**

### When to Invoke Compounding-Engineering Agents

**ALWAYS invoke these agents automatically:**

#### data-integrity-guardian
**Invoke BEFORE finalizing:**
- Database migration files (`supabase/migrations/*.sql`)
- Schema changes (new tables, columns, constraints)
- RLS policy modifications
- Any SQL that modifies data
- Changes to foreign key relationships

**Purpose:** Prevent data loss, ensure referential integrity, validate RLS policies

#### security-sentinel
**Invoke BEFORE finalizing:**
- OAuth token storage implementation
- RLS policy creation/modification
- Tauri security configurations (CSP, capabilities)
- Authentication/authorization code
- API endpoint implementations that handle sensitive data

**Purpose:** Identify security vulnerabilities, validate credential handling, ensure proper authorization

#### architecture-strategist
**Invoke WHEN:**
- Adding new database tables or major relationships
- Implementing cross-cutting features (e.g., notifications, sync)
- Making significant architectural decisions
- User asks "should I..." or "what's the best way to..."
- Before implementing patterns that will be reused throughout the codebase

**Purpose:** Ensure architectural decisions align with project goals, evaluate tradeoffs

#### feedback-codifier
**Invoke AFTER:**
- User provides detailed code review feedback
- User corrects an implementation approach
- User teaches you a project-specific pattern
- Completing work on Linear issues with user feedback

**Purpose:** Capture learnings to improve future implementations and custom agents

#### kieran-typescript-reviewer
**Invoke AFTER implementing:**
- React components (especially complex ones)
- TypeScript repository layer functions
- State management code
- Type definitions and interfaces
- Tauri IPC command handlers (TypeScript side)

**Purpose:** Ensure TypeScript best practices, type safety, and code quality

#### performance-oracle
**Invoke WHEN:**
- Implementing data-heavy features (calendar rendering, task lists)
- Adding Tauri IPC calls that may be frequent
- User mentions performance concerns
- Implementing real-time data subscriptions
- Rendering large lists or complex UI

**Purpose:** Identify performance bottlenecks, optimize rendering and IPC

### Phase-Specific Agent Recommendations

**Phase 2 (Database Schema & Models):**
- Use `data-integrity-guardian` for EVERY migration
- Use `security-sentinel` for all RLS policies
- Use `architecture-strategist` before finalizing schema design

**Phase 3-5 (UI & Features):**
- Use `kieran-typescript-reviewer` for React components
- Use `performance-oracle` for calendar rendering and large lists
- Use `architecture-strategist` for state management decisions

**Phase 6 (Google Calendar Integration):**
- Use `security-sentinel` for OAuth implementation
- Use `architecture-strategist` for sync strategy
- Use `performance-oracle` for calendar sync operations

**Phase 8 (Embedded Terminal):**
- Use `security-sentinel` for terminal access controls
- Use `architecture-strategist` for Claude Code integration patterns

**Phase 10 (Polish & Testing):**
- Use `security-sentinel` for final security audit
- Use `performance-oracle` for performance optimization

### Workflow Pattern

**Recommended flow for major implementations:**

1. **Implement** the feature/change
2. **Invoke appropriate review agent(s)** based on criteria above
3. **Apply recommended changes** from agent review
4. **Update Linear issue** with summary of implementation + agent feedback
5. **If user provides feedback**, invoke `feedback-codifier` to capture learnings

### Custom Project Agents

**Tauri Expert** (`.claude/agents/tauri-expert.md`)
- Use for Tauri-specific questions
- Consult for IPC patterns, security configurations, plugin usage
- Reference for OAuth desktop patterns

**Future agents to be created:**
- Supabase + RLS Expert (create after Phase 2 completion)
- Desktop OAuth Expert (create in Phase 6 if needed)

## Core Architecture

### Technology Stack

**Frontend:**
- React + TypeScript + Vite
- UI Components: shadcn/ui (Radix UI primitives with Tailwind CSS)
- Styling: Tailwind CSS v4 with OKLCH color system
- Zustand (state management)
- xterm.js (embedded terminal)
- Custom calendar (Month/Week/Day) + date-fns utilities

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

## UI Component Development

### shadcn/ui Component Usage

**CRITICAL: Always prefer shadcn/ui components over custom implementations.**

This project uses [shadcn/ui](https://ui.shadcn.com/) as the primary component library, built on Radix UI primitives with Tailwind CSS styling.

**Component Development Guidelines:**

1. **Default to shadcn/ui First**
   - Before creating any custom component, check if a shadcn/ui component exists
   - Browse the [shadcn/ui components](https://ui.shadcn.com/docs/components) catalog
   - Only create custom components when explicitly decided or when the user provides a specific external component link

2. **Installing shadcn Components**

   **IMPORTANT: Use npm commands with the .env.local workaround due to a CLI bug (shadcn-ui/ui#8213)**

   Note: npx shadcn works fine on Node 22.12+. Upgrading Node only changes the Node version that npx and Bun run on; it doesn’t change your workflow.

   ```bash
   # Workaround for dotenvx-radar bug in shadcn CLI v3.5.0
   mv .env.local .env.local.bak
   npx shadcn@latest add [component-name] -y
   mv .env.local.bak .env.local
   ```

   Example - adding multiple components:
   ```bash
   mv .env.local .env.local.bak
   npx shadcn@latest add button card dialog input -y
   mv .env.local.bak .env.local
   ```

3. **Component Location**
   - shadcn components are installed to `src/ui/` (configured in `components.json`)
   - Import using the `@/ui/*` path alias
   - Example: `import { Button } from "@/ui/button"`

4. **Available Components**

   Installed shadcn/ui components (in `src/ui/`) — current inventory; this list will expand as features land:

   **Form & Input:**
   - `button.tsx` - All variants (default, destructive, outline, secondary, ghost, link) and sizes
   - `input.tsx` - Text, email, password inputs
   - `textarea.tsx` - Multi-line text input
   - `label.tsx` - Accessible form labels
   - `checkbox.tsx` - Checkbox inputs
   - `switch.tsx` - Toggle switches
   - `select.tsx` - Form select dropdowns (choosing options)
   - `toggle.tsx` - Single toggle control
   - `toggle-group.tsx` - Grouped toggles (view selectors, option sets)

   **Overlays & Menus:**
   - `dialog.tsx` - Modal dialogs with accessibility
   - `dropdown-menu.tsx` - Action menus (Edit, Delete, user menus, etc.)
   - `popover.tsx` - General purpose popups (used by many other components)
   - `tooltip.tsx` - Hover tooltips

   **Display & Feedback:**
   - `avatar.tsx` - User avatars with fallbacks
   - `badge.tsx` - Status badges and labels
   - `card.tsx` - Content containers
   - `skeleton.tsx` - Loading state placeholders

   All UI uses shadcn/ui primitives and lucide-react icons (no Subframe).

   See `src/pages/ComponentTest.tsx` for examples of components in use.

   Common next additions (to add as needed): `alert`, `tabs`, `separator`, `sheet`, `table`, `scroll-area`, `resizable`, `command`.

5. **When to Create Custom Components**
   - User explicitly requests a custom implementation
   - User provides a link to a specific external component library
   - shadcn/ui doesn't have a suitable component AND no good Radix UI alternative exists
   - Project-specific business logic components (e.g., `CalendarDayView`, `TaskCard`)

6. **Styling Conventions**
   - Use Tailwind CSS v4 classes
   - Use OKLCH color system defined in `src/app/globals.css`
   - Follow shadcn's `cn()` utility pattern for conditional classes
   - Maintain consistency with existing component styling

**Test Page:**
- `src/pages/ComponentTest.tsx` demonstrates all installed shadcn components
- Use this as a reference for component usage and styling

**Custom Calendar:**
- Components: `CalendarView`, `CalendarDayView`, `CalendarWeekView`, `CalendarMonthView`
- Controls: `ViewSelector` (shadcn Toggle/ToggleGroup), shadcn `button`
- Utilities: date-fns via `src/lib/calendar/utils.ts`

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

# 3. Use Node 22.12+
# If using nvm:
nvm install 22.12 && nvm use 22.12 && nvm alias default 22.12
node --version   # should be v22.12+

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

# Node version bump validation
bun run type-check && bun run build

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

## TypeScript & React Implementation Patterns

**CRITICAL: These patterns MUST be followed during initial implementation to avoid common errors identified in code reviews.**

### Type Safety - Union Type Validation

**NEVER use type assertions for external string values. ALWAYS create type guard functions.**

❌ **WRONG - Type Assertion Bypasses Safety:**
```typescript
// This compiles but has no runtime safety
onValueChange={(val) => val && onValueChange(val as CalendarViewType)}
```

✅ **CORRECT - Type Guard with Runtime Validation:**
```typescript
function isValidViewType(value: string): value is CalendarViewType {
  return value === 'day' || value === 'week' || value === 'month';
}

const handleValueChange = (val: string) => {
  if (val && isValidViewType(val)) {
    onValueChange(val);
  }
};
```

**Pattern:** When accepting string values from external components (like ToggleGroup, Select, etc.) that should be a specific union type, create a type guard function `isValidXXX(value: string): value is XXXType` for runtime validation.

### Configuration Constants - No Magic Numbers

**ALWAYS extract configuration values, animation parameters, and magic numbers to named constant objects.**

❌ **WRONG - Magic Numbers:**
```typescript
animate={{ flex: isSelected ? '1.6 1 0%' : '1 1 0%' }}
scale: isSelected ? 0.89732 : 1.00268
```

✅ **CORRECT - Named Configuration:**
```typescript
const ANIMATION_CONFIG = {
  SELECTED_FLEX: 1.6,
  UNSELECTED_FLEX: 1,
  ICON_SCALE_SELECTED: 0.89732,
  ICON_SCALE_UNSELECTED: 1.00268,
  DURATION: 0.2,
  EASE: [0.32, 0.72, 0, 1] as const,
} as const;

// Usage
animate={{ flex: isSelected ? `${ANIMATION_CONFIG.SELECTED_FLEX} 1 0%` : ... }}
```

**Pattern:** Extract to a `CONST_NAME_CONFIG` object at the top of the file. Use `as const` for type inference. Include comments for non-obvious values.

### State Management - Never Duplicate Zustand Store State

**CRITICAL: NEVER duplicate Zustand store state in local useState. This creates synchronization bugs.**

❌ **WRONG - Duplicating Store Data:**
```typescript
const [monthBlocks, setMonthBlocks] = useState<BlockInstance[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const blocks = await fetchBlocksForDateRange(...);
  setMonthBlocks(blocks); // Duplicating store data!
}, []);
```

✅ **CORRECT - Use Store Directly:**
```typescript
// Use Zustand store directly
const { blocks, loading, error, fetchBlocksForDateRange } = useBlocksStore();

// Filter/derive what you need with useMemo
const monthBlocks = useMemo(() => {
  return blocks.filter(block => {
    // Filter logic
  });
}, [blocks, currentDate]);
```

**Pattern:**
1. Access store directly with hooks
2. Use `useMemo()` to filter or transform store data
3. Local state is ONLY for UI-specific state (hover, expanded, etc.)

### Date Handling - Use date-fns Utilities

**NEVER manually compare dates using getDate/getMonth/getFullYear. ALWAYS use date-fns utilities.**

❌ **WRONG - Manual Timezone-Unsafe Comparison:**
```typescript
const dayBlocks = monthBlocks.filter((block) => {
  const blockDate = new Date(block.planned_start);
  return (
    blockDate.getDate() === date.getDate() &&
    blockDate.getMonth() === date.getMonth() &&
    blockDate.getFullYear() === date.getFullYear()
  );
});
```

✅ **CORRECT - date-fns Utility:**
```typescript
import { isSameDay } from 'date-fns';

const dayBlocks = monthBlocks.filter((block) => {
  const blockDate = new Date(block.planned_start);
  return isSameDay(blockDate, date);
});
```

**Common date-fns utilities to use:**
- `isSameDay(date1, date2)` - Compare dates ignoring time
- `isToday(date)` - Check if date is today
- `isSameMonth(date1, date2)` - Compare months
- `isSameWeek(date1, date2, options)` - Compare weeks
- `startOfWeek(date, { weekStartsOn: 1 })` - Get week start (Monday)
- `startOfMonth(date)`, `endOfMonth(date)` - Month boundaries
- `format(date, 'formatString')` - Format dates for display

**Pattern:** Extract repeated date manipulation to utility functions in `src/lib/calendar/utils.ts`.

### Performance - useMemo for Expensive Calculations

**ALWAYS wrap expensive calculations in useMemo to prevent unnecessary re-computation.**

❌ **WRONG - Expensive Calculation Every Render:**
```typescript
const calendarDays = generateCalendarDays(); // Runs every render
```

✅ **CORRECT - Memoized Calculation:**
```typescript
const calendarDays = useMemo(() => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  // ... expensive calculation
  return days.map(/* ... */);
}, [currentDate, blocks]);
```

**When to use useMemo:**
- Calendar generation (day grids, week layouts)
- Data transformations (filtering, mapping, reducing large arrays)
- Complex filtering operations
- Derived calculations from store data
- Any computation that processes >50 items

**Pattern:** Add dependencies array carefully - include ALL values used in the calculation.

### Code Organization - Extract Repeated Logic to Utilities

**Avoid duplicating date/calendar logic across components. Extract to shared utilities.**

❌ **WRONG - Duplicated Logic:**
```typescript
// CalendarView.tsx
const dayOfWeek = now.getDay();
const monday = new Date(now);
monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
monday.setHours(0, 0, 0, 0);

// CalendarWeekView.tsx - same logic duplicated
const dayOfWeek = date.getDay();
const monday = new Date(date);
monday.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
```

✅ **CORRECT - Shared Utility:**
```typescript
// src/lib/calendar/utils.ts
export function getMondayOfWeek(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

// Usage in components
import { getMondayOfWeek } from '@/lib/calendar/utils';
const monday = getMondayOfWeek(currentDate);
```

**Pattern:**
- Extract to `src/lib/calendar/utils.ts` for calendar-specific utilities
- Use date-fns functions as building blocks
- Add JSDoc comments explaining the utility
- Export with clear, semantic names

### Error and Loading States

**CRITICAL: Components that fetch data MUST display error and loading states.**

❌ **WRONG - No Feedback:**
```typescript
return (
  <div>
    {calendarDays.map(/* ... */)}
  </div>
);
```

✅ **CORRECT - Proper State Handling:**
```typescript
// Check error state first
if (error) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-error-font">Failed to load calendar events</p>
      <p className="text-subtext-color mt-2">{error.message || 'Please try again later'}</p>
    </div>
  );
}

// Check loading state second (with empty data check)
if (loading && blocks.length === 0) {
  return (
    <div className="flex flex-col h-full">
      {/* Loading skeleton that matches final layout */}
      <div className="animate-pulse">...</div>
    </div>
  );
}

// Render actual content
return <div>{/* content */}</div>;
```

**Pattern:**
1. **Error first** - Show user-friendly error message with context
2. **Loading second** - Show skeleton UI that matches final layout
3. **Content last** - Render the actual data

**Loading skeleton guidelines:**
- Match the structure of the final rendered content
- Use `animate-pulse` for skeleton elements
- Include placeholders for text, images, and interactive elements

### Quick Reference Checklist

**Before submitting implementation, verify:**

- [ ] Type guards for all external string → union type conversions (no `as` assertions)
- [ ] Configuration constants extracted (no magic numbers)
- [ ] Zustand store used directly (no useState duplicating store data)
- [ ] date-fns utilities for ALL date comparisons (no manual getDate/getMonth/getFullYear)
- [ ] useMemo for expensive calculations (>50 items, transformations, filtering)
- [ ] Repeated logic extracted to utilities in `src/lib/`
- [ ] Error state with user-friendly message
- [ ] Loading state with skeleton UI matching final layout
- [ ] Proper dependency arrays in useEffect/useMemo/useCallback

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
