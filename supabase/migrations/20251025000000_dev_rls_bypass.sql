-- Migration: Development RLS Bypass for Test User
-- Created: 2025-10-25
-- Purpose: Allow unauthenticated access for test user during development
-- WARNING: This should be removed or disabled in production!

-- Development test user ID (hardcoded in App.tsx)
-- UUID: 00000000-0000-0000-0000-000000000001

-- Add development bypass policies for all tables
-- These policies allow access for the test user ID without authentication

-- Block Types
drop policy if exists block_types_dev_bypass on public.block_types;
create policy block_types_dev_bypass on public.block_types
    for all
    using (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    with check (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Block Instances
drop policy if exists block_instances_dev_bypass on public.block_instances;
create policy block_instances_dev_bypass on public.block_instances
    for all
    using (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    with check (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Tasks
drop policy if exists tasks_dev_bypass on public.tasks;
create policy tasks_dev_bypass on public.tasks
    for all
    using (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    with check (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- User Preferences
drop policy if exists user_preferences_dev_bypass on public.user_preferences;
create policy user_preferences_dev_bypass on public.user_preferences
    for all
    using (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    with check (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Calendar Connections
drop policy if exists calendar_connections_dev_bypass on public.calendar_connections;
create policy calendar_connections_dev_bypass on public.calendar_connections
    for all
    using (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    with check (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Calendar Events
drop policy if exists calendar_events_dev_bypass on public.calendar_events;
create policy calendar_events_dev_bypass on public.calendar_events
    for all
    using (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    with check (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Work Sessions
drop policy if exists work_sessions_dev_bypass on public.work_sessions;
create policy work_sessions_dev_bypass on public.work_sessions
    for all
    using (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    with check (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Notification Queue
drop policy if exists notification_queue_dev_bypass on public.notification_queue;
create policy notification_queue_dev_bypass on public.notification_queue
    for all
    using (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    with check (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Add comment explaining these policies
comment on policy block_types_dev_bypass on public.block_types is
    'DEV ONLY: Allows unauthenticated access for test user. Remove in production!';
comment on policy block_instances_dev_bypass on public.block_instances is
    'DEV ONLY: Allows unauthenticated access for test user. Remove in production!';
comment on policy tasks_dev_bypass on public.tasks is
    'DEV ONLY: Allows unauthenticated access for test user. Remove in production!';
comment on policy user_preferences_dev_bypass on public.user_preferences is
    'DEV ONLY: Allows unauthenticated access for test user. Remove in production!';
comment on policy calendar_connections_dev_bypass on public.calendar_connections is
    'DEV ONLY: Allows unauthenticated access for test user. Remove in production!';
comment on policy calendar_events_dev_bypass on public.calendar_events is
    'DEV ONLY: Allows unauthenticated access for test user. Remove in production!';
comment on policy work_sessions_dev_bypass on public.work_sessions is
    'DEV ONLY: Allows unauthenticated access for test user. Remove in production!';
comment on policy notification_queue_dev_bypass on public.notification_queue is
    'DEV ONLY: Allows unauthenticated access for test user. Remove in production!';
