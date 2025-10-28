# PM Me Planner API Reference

Technical reference for AI assistants interacting with PM Me Planner.

## CLI Helper Scripts

All scripts are located in `scripts/ai-helpers/` and run with Bun.

---

## list-block-types.ts

Get all block types configured by the user.

**Usage:**
```bash
bun run scripts/ai-helpers/list-block-types.ts
```

**Parameters:** None

**Output Format:**
```json
[
  {
    "id": "uuid",
    "name": "Client A",
    "color": "#3b82f6",
    "default_duration": 120,
    "user_id": "uuid",
    "created_at": "2025-10-27T10:00:00Z",
    "updated_at": "2025-10-27T10:00:00Z"
  }
]
```

**Exit Codes:**
- `0`: Success
- `1`: Error (missing env vars or database error)

---

## get-backlog-tasks.ts

Query unassigned tasks (tasks with `block_instance_id = null`).

**Usage:**
```bash
# All backlog tasks
bun run scripts/ai-helpers/get-backlog-tasks.ts

# Backlog for specific block type
bun run scripts/ai-helpers/get-backlog-tasks.ts <block_type_id>
```

**Parameters:**
- `block_type_id` (optional): UUID of block type to filter by

**Output Format:**
```json
[
  {
    "id": "uuid",
    "title": "Implement authentication",
    "description": "Add JWT auth to API",
    "notes": "Started research on best practices",
    "block_type_id": "uuid",
    "block_instance_id": null,
    "priority": "high",
    "status": "pending",
    "estimated_duration": 120,
    "created_at": "2025-10-27T10:00:00Z",
    "updated_at": "2025-10-27T10:00:00Z",
    "completed_at": null,
    "user_id": "uuid"
  }
]
```

**Ordering:**
- Primary: Priority (high → low)
- Secondary: Created date (newest first)

**Exit Codes:**
- `0`: Success
- `1`: Error

---

## get-today-schedule.ts

Get all block instances and their tasks for today.

**Usage:**
```bash
bun run scripts/ai-helpers/get-today-schedule.ts
```

**Parameters:** None

**Output Format:**
```json
[
  {
    "id": "uuid",
    "block_type_id": "uuid",
    "planned_start": "2025-10-27T09:00:00Z",
    "planned_end": "2025-10-27T11:00:00Z",
    "status": "scheduled",
    "actual_start": null,
    "actual_end": null,
    "user_id": "uuid",
    "created_at": "2025-10-27T08:00:00Z",
    "updated_at": "2025-10-27T08:00:00Z",
    "block_type": {
      "id": "uuid",
      "name": "Client A",
      "color": "#3b82f6",
      "default_duration": 120
    },
    "tasks": [
      {
        "id": "uuid",
        "title": "Code review",
        "status": "pending",
        "priority": "high"
      }
    ]
  }
]
```

**Date Range:**
- Includes blocks with `planned_start >= start of today (00:00:00)`
- Excludes blocks with `planned_start >= start of tomorrow (00:00:00)`
- Times are in UTC

**Ordering:**
- By `planned_start` (ascending)

**Exit Codes:**
- `0`: Success
- `1`: Error

---

## create-block-instance.ts

Create a new scheduled block instance.

**Usage:**
```bash
bun run scripts/ai-helpers/create-block-instance.ts <block_type_id> <start_time> <end_time>
```

**Parameters:**
- `block_type_id` (required): UUID of the block type
- `start_time` (required): ISO 8601 datetime with timezone (e.g., "2025-10-28T09:00:00Z")
- `end_time` (required): ISO 8601 datetime with timezone

**Example:**
```bash
bun run scripts/ai-helpers/create-block-instance.ts \
  "550e8400-e29b-41d4-a716-446655440000" \
  "2025-10-28T09:00:00Z" \
  "2025-10-28T11:00:00Z"
```

**Output Format:**
```json
{
  "id": "uuid",
  "block_type_id": "uuid",
  "planned_start": "2025-10-28T09:00:00Z",
  "planned_end": "2025-10-28T11:00:00Z",
  "status": "scheduled",
  "actual_start": null,
  "actual_end": null,
  "user_id": "uuid",
  "created_at": "2025-10-27T10:00:00Z",
  "updated_at": "2025-10-27T10:00:00Z",
  "block_type": {
    "id": "uuid",
    "name": "Client A",
    "color": "#3b82f6",
    "default_duration": 120
  }
}
```

**Validation:**
- `block_type_id` must exist and belong to user
- `start_time` must be before `end_time`
- Times must be valid ISO 8601

**Exit Codes:**
- `0`: Success
- `1`: Error (invalid params, database error, or block type not found)

---

## move-block-instance.ts

Reschedule an existing block instance.

**Usage:**
```bash
bun run scripts/ai-helpers/move-block-instance.ts <block_instance_id> <new_start> <new_end>
```

**Parameters:**
- `block_instance_id` (required): UUID of the block instance to move
- `new_start` (required): New start time (ISO 8601)
- `new_end` (required): New end time (ISO 8601)

**Example:**
```bash
bun run scripts/ai-helpers/move-block-instance.ts \
  "550e8400-e29b-41d4-a716-446655440000" \
  "2025-10-28T14:00:00Z" \
  "2025-10-28T16:00:00Z"
```

**Output Format:**
```json
{
  "id": "uuid",
  "block_type_id": "uuid",
  "planned_start": "2025-10-28T14:00:00Z",
  "planned_end": "2025-10-28T16:00:00Z",
  "status": "scheduled",
  "actual_start": null,
  "actual_end": null,
  "user_id": "uuid",
  "created_at": "2025-10-27T08:00:00Z",
  "updated_at": "2025-10-27T10:00:00Z",
  "block_type": {
    "id": "uuid",
    "name": "Client A",
    "color": "#3b82f6"
  }
}
```

**Validation:**
- `block_instance_id` must exist and belong to user
- `new_start` must be before `new_end`
- Times must be valid ISO 8601

**Exit Codes:**
- `0`: Success
- `1`: Error (invalid params, database error, or block not found)

---

## assign-task-to-block.ts

Assign a task from the backlog to a specific block instance.

**Usage:**
```bash
bun run scripts/ai-helpers/assign-task-to-block.ts <task_id> <block_instance_id>
```

**Parameters:**
- `task_id` (required): UUID of the task
- `block_instance_id` (required): UUID of the block instance

**Example:**
```bash
bun run scripts/ai-helpers/assign-task-to-block.ts \
  "550e8400-e29b-41d4-a716-446655440000" \
  "7c9e6679-7425-40de-944b-e07fc1f90ae7"
```

**Output Format:**
```json
{
  "id": "uuid",
  "title": "Implement authentication",
  "description": "Add JWT auth to API",
  "notes": null,
  "block_type_id": "uuid",
  "block_instance_id": "uuid",
  "priority": "high",
  "status": "pending",
  "estimated_duration": 120,
  "created_at": "2025-10-27T10:00:00Z",
  "updated_at": "2025-10-27T10:05:00Z",
  "completed_at": null,
  "user_id": "uuid"
}
```

**Validation:**
- `task_id` must exist and belong to user
- `block_instance_id` must exist and belong to user
- Task's `block_type_id` should match block instance's type (optional validation)

**Exit Codes:**
- `0`: Success
- `1`: Error (invalid params, database error, or resource not found)

---

## Data Types

### Task Priority
```typescript
type TaskPriority = 'low' | 'medium' | 'high';
```

### Task Status
```typescript
type TaskStatus = 'pending' | 'in_progress' | 'completed';
```

### Block Instance Status
```typescript
type BlockInstanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'skipped';
```

### ISO 8601 DateTime Format
```
YYYY-MM-DDTHH:MM:SSZ
```

**Examples:**
- `2025-10-27T09:00:00Z` - Oct 27, 2025 at 9:00 AM UTC
- `2025-10-28T14:30:00Z` - Oct 28, 2025 at 2:30 PM UTC

**Important:** Always use UTC timezone (Z suffix) for consistency.

---

## Environment Variables

Scripts require these environment variables (loaded from `.env.local`):

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |

**Note:** Scripts will exit with code 1 if env vars are missing.

---

## Error Handling

All scripts output errors to stderr and exit with code 1 on failure.

**Common error patterns:**

**Missing environment variables:**
```
Error: Missing Supabase environment variables
Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
```

**Database errors:**
```
Error fetching backlog tasks: { message: "...", details: "...", hint: "..." }
```

**Invalid parameters:**
```
Usage: bun run scripts/ai-helpers/create-block-instance.ts <block_type_id> <start_time> <end_time>
Example: bun run scripts/ai-helpers/create-block-instance.ts "uuid" "2025-10-27T09:00:00Z" "2025-10-27T11:00:00Z"
```

---

## Security

**Row Level Security (RLS):**
- All scripts use Supabase anonymous key with RLS enabled
- Users can only access their own data
- Foreign key constraints prevent invalid relationships

**Permissions:**
- Read: All authenticated users can read their own data
- Write: All authenticated users can modify their own data
- No cross-user access

---

## Performance Considerations

**Query Optimization:**
- All queries are indexed on `user_id`
- Block instances indexed on `planned_start`
- Tasks indexed on `block_instance_id` and `block_type_id`

**Caching:**
- No caching implemented in scripts
- Consider caching block types (rarely change)
- Real-time updates handled by Supabase subscriptions

---

## Future Enhancements

**Planned helper scripts:**
- `create-task.ts` - Add new task to backlog
- `update-task-status.ts` - Mark task as in progress or completed
- `get-upcoming-meetings.ts` - Query Google Calendar events
- `create-recurring-schedule.ts` - Set up auto-recurring blocks
- `get-week-schedule.ts` - Get schedule for entire week

**Planned features:**
- Bulk operations (assign multiple tasks)
- Conflict detection (overlapping blocks)
- Time zone conversion helpers
- Task duration estimation

---

## Testing

**Manual testing:**
```bash
# Test list block types
bun run scripts/ai-helpers/list-block-types.ts

# Test get today's schedule
bun run scripts/ai-helpers/get-today-schedule.ts

# Test get backlog (will be empty if no tasks)
bun run scripts/ai-helpers/get-backlog-tasks.ts
```

**Expected behavior:**
- Scripts should output valid JSON to stdout
- Errors should go to stderr
- Exit code 0 on success, 1 on error

---

## Support

For issues or questions:
1. Check `scripts/ai-helpers/README.md` for usage examples
2. Verify environment variables are set
3. Check Supabase dashboard for data
4. Review `CLAUDE_GUIDE.md` for workflow examples
