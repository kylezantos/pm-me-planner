# Database Schema

## Overview

Core entities are designed for AI-friendly manipulation and strong data integrity:

### block_types
Defines templates for user planning blocks.
- `id` (uuid, pk)
- `user_id` (uuid, fk → auth.users)
- `name` (text)
- `color` (text)
- `default_duration_minutes` (int)
- Pomodoro config fields
- Recurring schedule settings
- `created_at` / `updated_at`

### block_instances
Scheduled occurrences of block types.
- `id` (uuid, pk)
- `user_id` (uuid)
- `block_type_id` (uuid, fk → block_types)
- `planned_start` / `planned_end` (timestamptz)
- `status` (enum: scheduled/in_progress/completed/skipped)
- Actual start/end, notes
- Timestamps

### tasks
Work items tied to block types or instances. **Supports dual-mode execution**: tasks can be formally scheduled in blocks OR worked on informally without blocking calendar time.
- `id` (uuid, pk)
- `user_id` (uuid)
- `block_type_id` (uuid, fk → block_types)
- `block_instance_id` (uuid, nullable fk → block_instances)
- `title`, `description`, `notes`
- `priority` (enum: low/medium/high)
- `status` (enum: pending/in_progress/completed)
- `estimated_duration_minutes`, `completed_at`
- `actual_start` / `actual_end` (timestamptz, nullable) - Track informal work sessions
- `is_currently_active` (bool) - Is user actively working on this task right now?
- `ai_prompt_enabled` (bool) - Should AI interrupt with time-based prompts?
- `focus_mode` (bool) - Disable all AI interrupts for deep work
- Timestamps

**Note**: Tasks can exist in multiple states:
1. **Backlog** (`block_instance_id` IS NULL, `is_currently_active` = false)
2. **Scheduled** (assigned to `block_instance_id`, not started)
3. **Active Informal Work** (`is_currently_active` = true, may or may not have `block_instance_id`)
4. **Completed** (`status` = 'completed')

### user_preferences
Per-user defaults and scheduling preferences.
- `user_id` (uuid, pk)
- Pomodoro defaults, standup time, workday bounds
- `notifications_enabled`
- Timestamps

### calendar_connections
Encrypted external calendar credentials.
- `id` (uuid, pk)
- `user_id` (uuid)
- `provider` (text, default google)
- `account_email` (text)
- `access_token_encrypted` (bytea)
- `refresh_token_encrypted` (bytea nullable)
- `token_expiry` (timestamptz)
- `scopes` (text[])
- `is_primary` (bool)
- Timestamps

### calendar_events
Cached external calendar events.
- `id` (uuid, pk)
- `user_id` (uuid)
- `calendar_connection_id` (uuid, fk → calendar_connections)
- `external_event_id` (text)
- `title`, `description`, `location`
- `start_time`, `end_time` (timestamptz)
- `status` (text)
- `attendees` (jsonb array of objects)
- `is_all_day` (bool)
- `last_synced_at`
- Timestamps

### work_sessions
Tracks individual work sessions on tasks, supporting both formal (block-based) and informal (ad-hoc) work.
- `id` (uuid, pk)
- `user_id` (uuid)
- `task_id` (uuid, fk → tasks)
- `block_instance_id` (uuid, nullable fk → block_instances) - NULL = informal session
- `started_at` (timestamptz)
- `ended_at` (timestamptz, nullable) - NULL = session in progress
- `duration_minutes` (int, nullable)
- `notes` (text) - Session notes, blockers, progress
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Purpose**: Enables historical tracking of work patterns, multiple work sessions per task, and distinction between formal block work vs informal ad-hoc work.

## Constraints & Indexes

- Unique constraints: `calendar_events(calendar_connection_id, external_event_id)`.
- Time span checks ensure `planned_end > planned_start` and `end_time > start_time`.
- Indexes on `user_id` for all tables; time-based indexes on block instances and calendar events.

## Row Level Security

- Enabled on every table.
- Policies enforce `user_id = current_auth_uid()` for read/write, with `WITH CHECK` on mutations.
- Supabase function `current_auth_uid()` exposes the JWT subject.

## Token Handling

- AES-256 encryption via `pgcrypto` for calendar tokens.
- Helpers `encrypt_calendar_token` / `decrypt_calendar_token` guard missing secrets.
- `upsert_calendar_connection` uses security definer to store tokens.
- `get_calendar_connection_tokens` returns decrypted values to authorized user.

## Seeding

- Seed script requires supplying a real `:user_id` and running with service-role context.
- Re-entrant inserts using `ON CONFLICT DO NOTHING` for user preferences.
- Includes sample work session demonstrating informal tracking.

## Usage Patterns

### Formal Block-Based Work
- Create `block_types`, then schedule `block_instances`
- Assign tasks via `tasks.block_instance_id`
- Work sessions automatically linked to block via `work_sessions.block_instance_id`
- Shows up in Google Calendar (when two-way sync enabled)

### Informal Ad-Hoc Work
- User says "I'm working on Task X now"
- Create `work_session` with `block_instance_id` = NULL
- Set `tasks.is_currently_active` = true
- AI tracks elapsed time, can prompt based on `estimated_duration_minutes`
- Does NOT create calendar events (keeps calendar clean)

### Task State Queries
- **Backlog**: `block_instance_id IS NULL AND is_currently_active = false`
- **Currently Active**: `is_currently_active = true`
- **Scheduled**: `block_instance_id IS NOT NULL AND status != 'completed'`
- **Work History**: Join `tasks` with `work_sessions` to see all sessions

### Calendar Integration
- Store OAuth tokens through backend command invoking `upsert_calendar_connection` with encryption secret
- Only formal `block_instances` sync to calendar (not informal work sessions)
