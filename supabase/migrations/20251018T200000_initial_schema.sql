-- Migration: Initial schema for PM Me Planner core tables
-- Created: 2025-10-18

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enum types for block and task status
do $$
begin
    if not exists (select 1 from pg_type where typname = 'block_status') then
        create type block_status as enum ('scheduled', 'in_progress', 'paused', 'completed', 'skipped');
    end if;

    if not exists (select 1 from pg_type where typname = 'task_status') then
        create type task_status as enum ('pending', 'in_progress', 'completed');
    end if;

    if not exists (select 1 from pg_type where typname = 'task_priority') then
        create type task_priority as enum ('low', 'medium', 'high');
    end if;
end $$;

-- Core table: block_types
create table if not exists public.block_types (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    name text not null,
    color text not null,
    default_duration_minutes integer not null check (default_duration_minutes > 0),
    pomodoro_focus_minutes integer not null default 25,
    pomodoro_short_break_minutes integer not null default 5,
    pomodoro_long_break_minutes integer not null default 15,
    pomodoro_sessions_before_long_break integer not null default 4,
    recurring_enabled boolean not null default false,
    recurring_days_of_week integer[] not null default '{}',
    recurring_time_of_day time,
    recurring_auto_create boolean not null default false,
    recurring_weeks_in_advance integer not null default 1,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists block_types_user_id_idx on public.block_types (user_id);

-- Core table: block_instances
create table if not exists public.block_instances (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    block_type_id uuid not null references public.block_types(id) on delete cascade,
    planned_start timestamptz not null,
    planned_end timestamptz not null,
    status block_status not null default 'scheduled',
    actual_start timestamptz,
    actual_end timestamptz,
    notes text,
    paused_until timestamptz,
    pause_reason text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint block_instances_period_chk check (planned_end > planned_start)
);

create index if not exists block_instances_user_id_idx on public.block_instances (user_id);
create index if not exists block_instances_block_type_id_idx on public.block_instances (block_type_id);
create index if not exists block_instances_planned_start_idx on public.block_instances (planned_start);

-- Core table: tasks
create table if not exists public.tasks (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    block_type_id uuid not null references public.block_types(id) on delete cascade,
    block_instance_id uuid references public.block_instances(id) on delete set null,
    title text not null,
    description text,
    notes text,
    priority task_priority not null default 'medium',
    status task_status not null default 'pending',
    estimated_duration_minutes integer,
    completed_at timestamptz,
    actual_start timestamptz,
    actual_end timestamptz,
    is_currently_active boolean not null default false,
    ai_prompt_enabled boolean not null default true,
    focus_mode boolean not null default false,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_block_type_id_idx on public.tasks (block_type_id);
create index if not exists tasks_block_instance_id_idx on public.tasks (block_instance_id);
create index if not exists tasks_status_idx on public.tasks (status);

-- Table: work_sessions
create table if not exists public.work_sessions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    task_id uuid not null references public.tasks(id) on delete cascade,
    block_instance_id uuid references public.block_instances(id) on delete set null,
    started_at timestamptz not null default timezone('utc', now()),
    ended_at timestamptz,
    duration_minutes integer,
    notes text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint work_sessions_time_chk check (ended_at is null or ended_at > started_at)
);

create index if not exists work_sessions_user_id_idx on public.work_sessions (user_id);
create index if not exists work_sessions_task_id_idx on public.work_sessions (task_id);
create index if not exists work_sessions_started_idx on public.work_sessions (started_at);
create index if not exists work_sessions_block_instance_id_idx on public.work_sessions (block_instance_id);

-- Table: user_preferences
create table if not exists public.user_preferences (
    user_id uuid primary key,
    default_focus_minutes integer not null default 25,
    default_short_break_minutes integer not null default 5,
    default_long_break_minutes integer not null default 15,
    default_sessions_before_long_break integer not null default 4,
    standup_time time,
    workday_start time,
    workday_end time,
    notifications_enabled boolean not null default true,
    notification_lead_time_minutes integer,
    notification_sound_enabled boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

-- Table: calendar_connections
create table if not exists public.calendar_connections (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    provider text not null default 'google',
    account_email text not null,
    access_token_encrypted bytea not null,
    refresh_token_encrypted bytea,
    token_expiry timestamptz,
    scopes text[] not null,
    is_primary boolean not null default false,
    sync_token text,
    last_synced_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists calendar_connections_user_id_idx on public.calendar_connections (user_id);
create index if not exists calendar_connections_account_email_idx on public.calendar_connections (account_email);

-- Table: calendar_events
create table if not exists public.calendar_events (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    calendar_connection_id uuid not null references public.calendar_connections(id) on delete cascade,
    external_event_id text not null,
    title text not null,
    description text,
    start_time timestamptz not null,
    end_time timestamptz not null,
    location text,
    status text,
    attendees jsonb,
    is_all_day boolean not null default false,
    last_synced_at timestamptz not null default timezone('utc', now()),
    last_sync_token text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint calendar_events_period_chk check (end_time > start_time)
);

create unique index if not exists calendar_events_unique_external_idx
    on public.calendar_events (calendar_connection_id, external_event_id);

create index if not exists calendar_events_user_id_idx on public.calendar_events (user_id);
create index if not exists calendar_events_time_range_idx on public.calendar_events (start_time, end_time);

-- Notification queue
create table if not exists public.notification_queue (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    type text not null,
    target_time timestamptz not null,
    payload jsonb,
    sent_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists notification_queue_user_id_idx on public.notification_queue (user_id);
create index if not exists notification_queue_target_time_idx on public.notification_queue (target_time);


-- Ensure timestamps auto-update on modification
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$ language plpgsql;

create trigger set_block_types_updated_at
    before update on public.block_types
    for each row execute function public.set_updated_at();

create trigger set_block_instances_updated_at
    before update on public.block_instances
    for each row execute function public.set_updated_at();

create trigger set_tasks_updated_at
    before update on public.tasks
    for each row execute function public.set_updated_at();

create trigger set_work_sessions_updated_at
    before update on public.work_sessions
    for each row execute function public.set_updated_at();

create trigger set_user_preferences_updated_at
    before update on public.user_preferences
    for each row execute function public.set_updated_at();

create trigger set_calendar_connections_updated_at
    before update on public.calendar_connections
    for each row execute function public.set_updated_at();

create trigger set_calendar_events_updated_at
    before update on public.calendar_events
    for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.block_types enable row level security;
alter table public.block_instances enable row level security;
alter table public.tasks enable row level security;
alter table public.user_preferences enable row level security;
alter table public.calendar_connections enable row level security;
alter table public.calendar_events enable row level security;
alter table public.work_sessions enable row level security;

-- Helper function to extract auth uid from request context
create or replace function public.current_auth_uid()
returns uuid as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ language sql stable;

-- RLS Policies

-- Block types policies
create policy if not exists block_types_select_self on public.block_types
    for select using (user_id = public.current_auth_uid());

create policy if not exists block_types_modify_self on public.block_types
    for all
    using (user_id = public.current_auth_uid())
    with check (user_id = public.current_auth_uid());

-- Block instances policies
create policy if not exists block_instances_select_self on public.block_instances
    for select using (user_id = public.current_auth_uid());

create policy if not exists block_instances_modify_self on public.block_instances
    for all
    using (user_id = public.current_auth_uid())
    with check (user_id = public.current_auth_uid());

-- Tasks policies
create policy if not exists tasks_select_self on public.tasks
    for select using (user_id = public.current_auth_uid());

create policy if not exists tasks_modify_self on public.tasks
    for all
    using (user_id = public.current_auth_uid())
    with check (user_id = public.current_auth_uid());

-- User preferences policies
create policy if not exists user_preferences_select_self on public.user_preferences
    for select using (user_id = public.current_auth_uid());

create policy if not exists user_preferences_modify_self on public.user_preferences
    for all
    using (user_id = public.current_auth_uid())
    with check (user_id = public.current_auth_uid());

-- Calendar connections policies
create policy if not exists calendar_connections_select_self on public.calendar_connections
    for select using (user_id = public.current_auth_uid());

create policy if not exists calendar_connections_modify_self on public.calendar_connections
    for all
    using (user_id = public.current_auth_uid())
    with check (user_id = public.current_auth_uid());

-- Calendar events policies
create policy if not exists calendar_events_select_self on public.calendar_events
    for select using (user_id = public.current_auth_uid());

create policy if not exists calendar_events_modify_self on public.calendar_events
    for all
    using (user_id = public.current_auth_uid())
    with check (user_id = public.current_auth_uid());

-- Work sessions policies
create policy if not exists work_sessions_select_self on public.work_sessions
    for select using (user_id = public.current_auth_uid());

create policy if not exists work_sessions_modify_self on public.work_sessions
    for all
    using (user_id = public.current_auth_uid())
    with check (user_id = public.current_auth_uid());

-- Helper: encrypt and decrypt calendar tokens
create or replace function public.encrypt_calendar_token(token text, secret text)
returns bytea as $$
begin
    if secret is null or length(secret) = 0 then
        raise exception 'Encryption secret must be provided via app.calendar_token_secret';
    end if;
    return pgp_sym_encrypt(token, secret, 'cipher-algo=aes256');
end;
$$ language plpgsql strict;

create or replace function public.decrypt_calendar_token(token_encrypted bytea, secret text)
returns text as $$
begin
    if secret is null or length(secret) = 0 then
        raise exception 'Encryption secret must be provided via app.calendar_token_secret';
    end if;
    if token_encrypted is null then
        return null;
    end if;
    return pgp_sym_decrypt(token_encrypted, secret);
end;
$$ language plpgsql strict;

create or replace function public.upsert_calendar_connection(
    p_user_id uuid,
    p_provider text,
    p_account_email text,
    p_access_token text,
    p_refresh_token text,
    p_token_expiry timestamptz,
    p_scopes text[],
    p_is_primary boolean,
    p_secret text,
    p_connection_id uuid default null
)
returns public.calendar_connections
language plpgsql
security definer
set search_path = public
as $$
declare
    v_connection public.calendar_connections;
    v_id uuid := coalesce(p_connection_id, uuid_generate_v4());
begin
    if p_user_id is null then
        raise exception 'user_id required';
    end if;
    if p_secret is null or length(p_secret) = 0 then
        raise exception 'Encryption secret required';
    end if;

    insert into public.calendar_connections (
        id,
        user_id,
        provider,
        account_email,
        access_token_encrypted,
        refresh_token_encrypted,
        token_expiry,
        scopes,
        is_primary
    )
    values (
        v_id,
        p_user_id,
        coalesce(p_provider, 'google'),
        p_account_email,
        public.encrypt_calendar_token(p_access_token, p_secret),
        case when p_refresh_token is null then null else public.encrypt_calendar_token(p_refresh_token, p_secret) end,
        p_token_expiry,
        coalesce(p_scopes, array[]::text[]),
        coalesce(p_is_primary, false)
    )
    on conflict (id) do update
        set provider = excluded.provider,
            account_email = excluded.account_email,
            access_token_encrypted = excluded.access_token_encrypted,
            refresh_token_encrypted = excluded.refresh_token_encrypted,
            token_expiry = excluded.token_expiry,
            scopes = excluded.scopes,
            is_primary = excluded.is_primary,
            updated_at = timezone('utc', now())
    returning * into v_connection;

    if v_connection.user_id <> p_user_id then
        delete from public.calendar_connections where id = v_connection.id;
        raise exception 'Not authorized to modify this calendar connection';
    end if;

    return v_connection;
end;
$$;

revoke all on function public.upsert_calendar_connection from public;

create or replace function public.get_calendar_connection_tokens(
    p_connection_id uuid,
    p_secret text
)
returns table (
    access_token text,
    refresh_token text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_connection public.calendar_connections;
    v_user_id uuid := public.current_auth_uid();
begin
    if p_secret is null or length(p_secret) = 0 then
        raise exception 'Encryption secret required';
    end if;

    select * into v_connection
    from public.calendar_connections
    where id = p_connection_id;

    if not found then
        raise exception 'Calendar connection not found';
    end if;

    if v_connection.user_id <> v_user_id then
        raise exception 'Not authorized to access this calendar connection';
    end if;

    access_token := public.decrypt_calendar_token(v_connection.access_token_encrypted, p_secret);
    refresh_token := public.decrypt_calendar_token(v_connection.refresh_token_encrypted, p_secret);
    return next;
end;
$$;

revoke all on function public.get_calendar_connection_tokens from public;
