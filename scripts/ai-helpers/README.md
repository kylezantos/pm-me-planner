# AI Helper Scripts

This directory contains CLI helper scripts that AI assistants (Claude Code, Codex, etc.) can use to interact with the PM Me Planner database.

## Prerequisites

- Bun runtime installed
- Environment variables set in `.env.local`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Available Commands

### List Block Types

Get all available block types in the system.

```bash
bun run scripts/ai-helpers/list-block-types.ts
```

### Get Backlog Tasks

Query unassigned tasks (tasks not assigned to any block instance).

```bash
# Get all backlog tasks
bun run scripts/ai-helpers/get-backlog-tasks.ts

# Get backlog tasks for a specific block type
bun run scripts/ai-helpers/get-backlog-tasks.ts <block_type_id>
```

**Example:**
```bash
bun run scripts/ai-helpers/get-backlog-tasks.ts "123e4567-e89b-12d3-a456-426614174000"
```

### Get Today's Schedule

Get all block instances and their tasks for today.

```bash
bun run scripts/ai-helpers/get-today-schedule.ts
```

### Assign Task to Block

Assign a task from the backlog to a specific block instance.

```bash
bun run scripts/ai-helpers/assign-task-to-block.ts <task_id> <block_instance_id>
```

**Example:**
```bash
bun run scripts/ai-helpers/assign-task-to-block.ts "task-uuid" "block-instance-uuid"
```

### Create Block Instance

Create a new block instance for a specific date/time.

```bash
bun run scripts/ai-helpers/create-block-instance.ts <block_type_id> <start_time> <end_time>
```

**Example:**
```bash
bun run scripts/ai-helpers/create-block-instance.ts "block-type-uuid" "2025-10-27T09:00:00Z" "2025-10-27T11:00:00Z"
```

### Move Block Instance

Reschedule a block instance to a new date/time.

```bash
bun run scripts/ai-helpers/move-block-instance.ts <block_instance_id> <new_start_time> <new_end_time>
```

**Example:**
```bash
bun run scripts/ai-helpers/move-block-instance.ts "block-instance-uuid" "2025-10-27T14:00:00Z" "2025-10-27T16:00:00Z"
```

## Output Format

All scripts output JSON to stdout for easy parsing by AI assistants. Error messages go to stderr.

## Usage in Claude Code

When using these scripts with Claude Code, simply reference them by their path:

```
> Can you show me my backlog tasks?
Claude: bun run scripts/ai-helpers/get-backlog-tasks.ts

> Create a Client A block tomorrow at 9am
Claude: bun run scripts/ai-helpers/create-block-instance.ts "<id>" "2025-10-28T09:00:00Z" "2025-10-28T11:00:00Z"
```

## Adding New Helpers

To add a new helper script:

1. Create a new `.ts` file in this directory
2. Add the shebang: `#!/usr/bin/env bun`
3. Use the Supabase client to interact with the database
4. Output JSON to stdout
5. Document it in this README

## Security Note

These scripts use the anonymous Supabase key with Row Level Security (RLS) policies. They can only access data for the authenticated user.
