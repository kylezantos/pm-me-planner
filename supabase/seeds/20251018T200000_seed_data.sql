-- Seed data for PM Me Planner core tables

-- NOTE: RLS is enabled on all tables, so seeding must be run with the service role
-- or with a valid user id. Set the user id before running:
--   select set_config('request.jwt.claim.sub', '<user-uuid>', true);
-- Alternatively, replace `:user_id` manually when running outside Supabase CLI.

-- Replace :user_id with a valid UUID for the target environment before executing.
with seed_user as (
    select ':user_id'::uuid as user_id
)
insert into public.block_types (
    user_id,
    name,
    color,
    default_duration_minutes,
    pomodoro_focus_minutes,
    pomodoro_short_break_minutes,
    pomodoro_long_break_minutes,
    pomodoro_sessions_before_long_break,
    recurring_enabled,
    recurring_days_of_week,
    recurring_time_of_day,
    recurring_auto_create,
    recurring_weeks_in_advance
)
select
    user_id,
    name,
    color,
    default_duration_minutes,
    pomodoro_focus_minutes,
    pomodoro_short_break_minutes,
    pomodoro_long_break_minutes,
    pomodoro_sessions_before_long_break,
    recurring_enabled,
    recurring_days_of_week,
    recurring_time_of_day,
    recurring_auto_create,
    recurring_weeks_in_advance
from seed_user
cross join lateral (
    values
        ('Client Work', '#2563EB', 120, 50, 10, 20, 3, true, array[1,3,5], time '09:00', true, 2),
        ('Education', '#16A34A', 90, 45, 10, 15, 3, true, array[2,4], time '13:00', true, 1)
) as block_seed (
    name,
    color,
    default_duration_minutes,
    pomodoro_focus_minutes,
    pomodoro_short_break_minutes,
    pomodoro_long_break_minutes,
    pomodoro_sessions_before_long_break,
    recurring_enabled,
    recurring_days_of_week,
    recurring_time_of_day,
    recurring_auto_create,
    recurring_weeks_in_advance
);

with inserted as (
    select id, user_id from public.block_types where user_id = ':user_id'::uuid
)
insert into public.block_instances (
    user_id,
    block_type_id,
    planned_start,
    planned_end,
    status
)
select
    user_id,
    id,
    timezone('utc', now()) + interval '1 day' as planned_start,
    timezone('utc', now()) + interval '1 day' + interval '2 hours' as planned_end,
    'scheduled'::block_status
from inserted;

with inserted as (
    select id, user_id from public.block_types where user_id = ':user_id'::uuid
)
insert into public.tasks (
    user_id,
    block_type_id,
    title,
    description,
    notes,
    priority,
    status,
    is_currently_active,
    ai_prompt_enabled,
    focus_mode
)
select
    user_id,
    id,
    title,
    description,
    notes,
    priority,
    status,
    false,
    true,
    false
from inserted
cross join lateral (
    values
        ('Prepare client status report', 'Gather updates and prepare slides', null, 'high'::task_priority, 'pending'::task_status),
        ('Review AI research paper', 'Read through latest paper on LLM scheduling', null, 'medium'::task_priority, 'pending'::task_status)
) as task_seed (
    title,
    description,
    notes,
    priority,
    status
);

insert into public.user_preferences (
    user_id,
    default_focus_minutes,
    default_short_break_minutes,
    default_long_break_minutes,
    default_sessions_before_long_break,
    standup_time,
    workday_start,
    workday_end,
    notifications_enabled
)
values (
    ':user_id'::uuid,
    45,
    10,
    20,
    3,
    time '08:30',
    time '08:00',
    time '18:00',
    true
)
on conflict (user_id) do nothing;

-- Sample work session tied to first task
with task_sample as (
    select t.id as task_id, t.user_id
    from public.tasks t
    where t.user_id = ':user_id'::uuid
    order by t.created_at asc
    limit 1
)
insert into public.work_sessions (
    user_id,
    task_id,
    block_instance_id,
    started_at,
    ended_at,
    duration_minutes,
    notes
)
select
    user_id,
    task_id,
    null,
    timezone('utc', now()) - interval '2 hours',
    timezone('utc', now()) - interval '1 hour',
    60,
    'Ad-hoc focus session without block'
from task_sample;

-- Optional sample calendar event (requires existing calendar connection)
-- Uncomment the block below if a calendar connection has been created for the seed user.
-- insert into public.calendar_events (
--     user_id,
--     calendar_connection_id,
--     external_event_id,
--     title,
--     description,
--     start_time,
--     end_time,
--     location,
--     status,
--     attendees,
--     is_all_day,
--     last_synced_at
-- )
-- select
--     ':user_id'::uuid,
--     cc.id,
--     'sample-google-event',
--     'Sample Synced Meeting',
--     'Demonstrates syncing calendar events into the app',
--     timezone('utc', now()) + interval '3 hours',
--     timezone('utc', now()) + interval '4 hours',
--     'Zoom',
--     'confirmed',
--     jsonb_build_array(jsonb_build_object('email', 'teammate@example.com', 'responseStatus', 'accepted')),
--     false,
--     timezone('utc', now())
-- from public.calendar_connections cc
-- where cc.user_id = ':user_id'::uuid
-- limit 1
-- on conflict (calendar_connection_id, external_event_id) do nothing;
