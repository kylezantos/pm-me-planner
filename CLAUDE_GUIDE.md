# Claude Code Guide for PM Me Planner

This guide explains how to interact with PM Me Planner as an AI assistant. You can help users manage their schedule, tasks, and work blocks through natural language commands.

## Overview

PM Me Planner is a desktop app for time-block scheduling with AI assistance. As Claude Code/Codex, you can:

- Query the user's schedule, tasks, and blocks
- Create and reschedule blocks
- Assign tasks to blocks
- Help prioritize work
- Provide daily standup assistance

## Architecture

**Data Storage:** PostgreSQL via Supabase
**Your Access Method:** CLI helper scripts (Bun/TypeScript)
**Communication:** Chat interface with command execution
**Security:** Row Level Security (RLS) - you can only access the authenticated user's data

## Database Schema

### Core Tables

**block_types** - Templates for work blocks
- `id` (uuid): Unique identifier
- `name` (text): Block name (e.g., "Client A", "Education")
- `color` (text): Visual color
- `default_duration` (integer): Default duration in minutes
- `user_id` (uuid): Owner

**block_instances** - Scheduled occurrences of blocks
- `id` (uuid): Unique identifier
- `block_type_id` (uuid): References block_types
- `planned_start` (timestamptz): Start time (ISO 8601)
- `planned_end` (timestamptz): End time (ISO 8601)
- `status` (text): 'scheduled', 'in_progress', 'completed', 'skipped'
- `actual_start` (timestamptz): Actual start time
- `actual_end` (timestamptz): Actual end time
- `user_id` (uuid): Owner

**tasks** - Work items
- `id` (uuid): Unique identifier
- `title` (text): Task title
- `description` (text): Optional details
- `notes` (text): Progress tracking notes
- `block_type_id` (uuid): Category/block type
- `block_instance_id` (uuid): Assigned block (null = backlog)
- `priority` (text): 'low', 'medium', 'high'
- `status` (text): 'pending', 'in_progress', 'completed'
- `estimated_duration` (integer): Minutes
- `created_at` (timestamptz): Creation timestamp
- `updated_at` (timestamptz): Last update
- `completed_at` (timestamptz): Completion time
- `user_id` (uuid): Owner

## Available Helper Scripts

All scripts are in `scripts/ai-helpers/` and use Bun runtime.

### 1. List Block Types

Get all available block types.

```bash
bun run scripts/ai-helpers/list-block-types.ts
```

**Output:** JSON array of block types

### 2. Get Backlog Tasks

Query unassigned tasks (not in any block).

```bash
# All backlog tasks
bun run scripts/ai-helpers/get-backlog-tasks.ts

# Backlog for specific block type
bun run scripts/ai-helpers/get-backlog-tasks.ts <block_type_id>
```

**Output:** JSON array of tasks

### 3. Get Today's Schedule

Get all blocks and tasks for today.

```bash
bun run scripts/ai-helpers/get-today-schedule.ts
```

**Output:** JSON array of block instances with nested tasks and block_type

### 4. Create Block Instance

Create a new scheduled block.

```bash
bun run scripts/ai-helpers/create-block-instance.ts <block_type_id> <start_time> <end_time>
```

**Example:**
```bash
bun run scripts/ai-helpers/create-block-instance.ts "uuid-here" "2025-10-28T09:00:00Z" "2025-10-28T11:00:00Z"
```

**Output:** JSON object of created block instance

### 5. Move Block Instance

Reschedule an existing block.

```bash
bun run scripts/ai-helpers/move-block-instance.ts <block_instance_id> <new_start> <new_end>
```

**Example:**
```bash
bun run scripts/ai-helpers/move-block-instance.ts "uuid-here" "2025-10-28T14:00:00Z" "2025-10-28T16:00:00Z"
```

**Output:** JSON object of updated block instance

### 6. Assign Task to Block

Move a task from backlog to a specific block.

```bash
bun run scripts/ai-helpers/assign-task-to-block.ts <task_id> <block_instance_id>
```

**Output:** JSON object of updated task

## Common Workflows

### Morning Standup

**User asks:** "What's on my schedule today?"

**Your workflow:**
1. Run `get-today-schedule.ts` to see all blocks
2. Parse and summarize in natural language
3. Highlight any gaps or conflicts
4. Ask if they want to adjust anything

**Example response:**
```
Here's your schedule for today:

9:00-11:00 AM: Client A Block
  - No tasks assigned yet

2:00-4:00 PM: Education Block
  - 2 tasks: "Watch AI course video", "Read newsletter"

You have a 3-hour gap from 11am-2pm. Would you like to schedule something?
```

### Task Prioritization

**User asks:** "What should I work on for Client A?"

**Your workflow:**
1. Run `list-block-types.ts` to find Client A's block_type_id
2. Run `get-backlog-tasks.ts <client-a-block-type-id>`
3. Sort by priority and suggest top items

### Creating Blocks

**User asks:** "Add a Client A block tomorrow at 9am"

**Your workflow:**
1. Calculate tomorrow's date at 9am in ISO 8601 format
2. Determine end time (ask user or use block type's default duration)
3. Get Client A's block_type_id from `list-block-types.ts`
4. Run `create-block-instance.ts` with the parameters
5. Confirm creation with user

### Rescheduling

**User asks:** "Move today's Client B block to Thursday at 3pm"

**Your workflow:**
1. Run `get-today-schedule.ts` to find the block instance
2. Calculate Thursday at 3pm in ISO 8601
3. Determine duration and calculate new end time
4. Run `move-block-instance.ts` with new times
5. Confirm the change

### Assigning Tasks

**User asks:** "Assign the auth refactor to tomorrow's Client A block"

**Your workflow:**
1. Search backlog for "auth refactor" task
2. Find tomorrow's Client A block instance
3. Run `assign-task-to-block.ts` with both IDs
4. Confirm assignment

## Best Practices

### 1. Always Verify Before Modifying

Before creating or moving blocks:
- Check for conflicts with existing blocks
- Confirm the time with the user
- Make sure the block type exists

### 2. Use Natural Language

Parse JSON output but respond in conversational English:
- ❌ "block_instances: [{planned_start: '2025-10-28T09:00:00Z'}]"
- ✅ "You have a Client A block tomorrow at 9am"

### 3. Handle Timezones Carefully

- All times in database are UTC (ISO 8601 with 'Z')
- When user says "tomorrow at 9am", convert to their timezone
- Use libraries like date-fns for date manipulation

### 4. Provide Context

When showing schedule:
- Include block names and times
- Show how many tasks are in each block
- Highlight empty blocks or gaps
- Note any conflicts

### 5. Be Proactive

Suggest improvements:
- "You have 3 unassigned Client A tasks. Want to schedule them?"
- "Your Education block is empty. Should I find some tasks?"
- "You have back-to-back blocks with no break. Want to adjust?"

### 6. Error Handling

If a script fails:
- Explain what went wrong in plain English
- Suggest fixes or alternatives
- Don't expose raw error messages to user

## Date/Time Format

**ISO 8601 with UTC timezone:**
```
2025-10-28T09:00:00Z
```

**Components:**
- `2025-10-28`: Date (YYYY-MM-DD)
- `T`: Separator
- `09:00:00`: Time (HH:MM:SS)
- `Z`: UTC timezone

**Converting user input:**
- "tomorrow at 9am" → Get user's timezone, calculate ISO string
- "next Monday at 2pm" → Calculate date, create ISO string
- "in 2 hours" → Add to current time, create ISO string

## Example Conversations

### Example 1: Daily Planning

**User:** What's my day look like?

**You:**
```bash
bun run scripts/ai-helpers/get-today-schedule.ts
```

**Response:**
```
You have 2 blocks scheduled today:

1. Client A Block (9:00-11:00 AM)
   - 3 tasks including "API integration" and "Code review"

2. Education Block (2:00-3:30 PM)
   - 1 task: "Watch React course"

You're free from 11am-2pm. Want to add anything?
```

### Example 2: Creating a Block

**User:** Schedule a Client B block for Thursday afternoon

**You:**
```bash
# First, get block types
bun run scripts/ai-helpers/list-block-types.ts
# Find Client B's ID: "abc-123-..."

# Create block (assuming 2pm-4pm)
bun run scripts/ai-helpers/create-block-instance.ts "abc-123-..." "2025-10-31T14:00:00Z" "2025-10-31T16:00:00Z"
```

**Response:**
```
✓ Created Client B block for Thursday, Oct 31 from 2:00-4:00 PM

Would you like to assign any tasks to this block?
```

### Example 3: Task Management

**User:** Show me my Client A backlog

**You:**
```bash
# Get block types
bun run scripts/ai-helpers/list-block-types.ts
# Find Client A ID

# Get backlog
bun run scripts/ai-helpers/get-backlog-tasks.ts "<client-a-id>"
```

**Response:**
```
You have 5 unassigned Client A tasks:

High Priority:
- Authentication refactor (est. 2 hours)
- Database migration (est. 1 hour)

Medium Priority:
- Update API docs (est. 30 min)
- Code review (est. 45 min)

Low Priority:
- Refactor CSS (est. 1 hour)

Want me to schedule these into your upcoming Client A blocks?
```

## Tips for Success

1. **Keep it conversational** - You're a helpful assistant, not a database query tool
2. **Anticipate needs** - Suggest next steps and improvements
3. **Confirm changes** - Always summarize what you did after modifying data
4. **Be efficient** - Batch operations when possible
5. **Learn patterns** - Notice the user's preferences and adapt

## Limitations

**You cannot:**
- Access files outside the project
- Modify database schema
- Execute arbitrary SQL (only via helper scripts)
- Access Google Calendar directly (read-only sync happens separately)
- See the UI (you work with data only)

**You can:**
- Query and modify user's schedule
- Assign and organize tasks
- Create and reschedule blocks
- Provide insights and suggestions
- Help with daily planning

## Getting Started

When first interacting with a user:
1. Run `list-block-types.ts` to see their work categories
2. Run `get-today-schedule.ts` to understand their current schedule
3. Run `get-backlog-tasks.ts` to see pending work
4. Introduce yourself and offer to help organize their day

**Example greeting:**
```
Hi! I can help you manage your PM Me Planner schedule. I can see you have 3 block types set up: Client A, Client B, and Education.

You have 2 blocks scheduled today and 8 tasks in your backlog. Want me to help organize your day?
```

## Environment

All scripts require these environment variables (automatically loaded from `.env.local`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

You don't need to worry about these - they're configured in the user's environment.

---

**Remember:** You're here to make scheduling effortless. Be helpful, proactive, and conversational. The user should feel like they have a personal assistant, not a command-line tool.
