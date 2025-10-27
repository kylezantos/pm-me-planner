import { supabase } from './supabase';
import type {
  BlockInstance,
  BlockStatus,
  BlockType,
  CalendarConnection,
  CalendarEvent,
  Task,
  TaskPriority,
  TaskStatus,
  UserPreferences,
  WorkSession,
} from './types';

type Result<T> = { data: T | null; error: Error | null };

const toResult = <T>(
  data: T | T[] | null,
  error: { message: string } | null
): Result<T> => ({
  data: data as T | null,
  error: error ? new Error(error.message) : null,
});

export async function listBlockTypes(): Promise<Result<BlockType[]>> {
  const { data, error } = await supabase
    .from('block_types')
    .select('*')
    .order('created_at', { ascending: true });

  return toResult<BlockType[]>(data, error);
}

export async function createBlockType(
  values: Omit<BlockType, 'id' | 'created_at' | 'updated_at'>
): Promise<Result<BlockType>> {
  const { data, error } = await supabase
    .from('block_types')
    .insert(values)
    .select()
    .single();

  return toResult<BlockType>(data, error);
}

export async function updateBlockType(
  id: string,
  values: Partial<Omit<BlockType, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Result<BlockType>> {
  const { data, error } = await supabase
    .from('block_types')
    .update(values)
    .eq('id', id)
    .select()
    .single();

  return toResult<BlockType>(data, error);
}

/**
 * Deletes a block type and all associated data.
 *
 * CASCADE rules will remove:
 * - All block instances linked to this type
 * - All tasks that reference this block type
 *
 * WARNING: This operation cannot be undone.
 */
export async function deleteBlockType(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('block_types')
    .delete()
    .eq('id', id);
  return !error;
}

export async function getBlockTypeById(id: string): Promise<Result<BlockType>> {
  const { data, error } = await supabase
    .from('block_types')
    .select('*')
    .eq('id', id)
    .single();

  return toResult<BlockType>(data, error);
}

export async function listBlockInstances(
  filters: Partial<{
    block_type_id: string;
    status: BlockStatus;
    start_gte: string;
    start_lt: string;
  }> = {}
): Promise<Result<BlockInstance[]>> {
  let query = supabase.from('block_instances').select('*');

  if (filters.block_type_id) {
    query = query.eq('block_type_id', filters.block_type_id);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.start_gte) {
    query = query.gte('planned_start', filters.start_gte);
  }
  if (filters.start_lt) {
    query = query.lt('planned_start', filters.start_lt);
  }

  const { data, error } = await query.order('planned_start', {
    ascending: true,
  });

  return toResult<BlockInstance[]>(data, error);
}

// Joined shape for calendar/event use-cases
export type BlockInstanceWithType = BlockInstance & {
  // Supabase nested select returns the related table name as the key
  block_types: Pick<BlockType, 'id' | 'name' | 'color'> | null;
};

/**
 * Lists block instances within a time range and includes their Block Type
 * metadata (name, color) for calendar rendering. Results are ordered by
 * planned_start ascending.
 */
export async function listBlockInstancesWithType(
  filters: Partial<{
    user_id: string;
    block_type_id: string;
    status: BlockStatus;
    start_gte: string;
    start_lt: string;
  }> = {}
): Promise<Result<BlockInstanceWithType[]>> {
  let query = supabase
    .from('block_instances')
    .select('*, block_types(id, name, color)');

  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  if (filters.block_type_id) {
    query = query.eq('block_type_id', filters.block_type_id);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.start_gte) {
    query = query.gte('planned_start', filters.start_gte);
  }
  if (filters.start_lt) {
    query = query.lt('planned_start', filters.start_lt);
  }

  const { data, error } = await query.order('planned_start', {
    ascending: true,
  });

  return toResult<BlockInstanceWithType[]>(data as BlockInstanceWithType[] | null, error);
}

export async function createBlockInstance(
  values: Omit<BlockInstance, 'id' | 'created_at' | 'updated_at'>
): Promise<Result<BlockInstance>> {
  const { data, error } = await supabase
    .from('block_instances')
    .insert(values)
    .select()
    .single();

  return toResult<BlockInstance>(data, error);
}

export async function updateBlockInstance(
  id: string,
  values: Partial<
    Omit<
      BlockInstance,
      'id' | 'user_id' | 'block_type_id' | 'created_at' | 'updated_at'
    >
  >
): Promise<Result<BlockInstance>> {
  const { data, error } = await supabase
    .from('block_instances')
    .update(values)
    .eq('id', id)
    .select()
    .single();

  return toResult<BlockInstance>(data, error);
}

/**
 * Deletes a single block instance. Tasks assigned to the block
 * will be moved back to the backlog (block_instance_id set to NULL).
 */
export async function deleteBlockInstance(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('block_instances')
    .delete()
    .eq('id', id);
  return !error;
}

export async function getBlockInstanceById(
  id: string
): Promise<Result<BlockInstance>> {
  const { data, error } = await supabase
    .from('block_instances')
    .select('*')
    .eq('id', id)
    .single();

  return toResult<BlockInstance>(data, error);
}

export async function listBacklogTasks(
  blockTypeId?: string
): Promise<Result<Task[]>> {
  let query = supabase
    .from('tasks')
    .select('*')
    .is('block_instance_id', null)
    .order('created_at', { ascending: true });

  if (blockTypeId) {
    query = query.eq('block_type_id', blockTypeId);
  }

  const { data, error } = await query;
  return toResult<Task[]>(data, error);
}

export async function createTask(
  values: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<Result<Task>> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(values)
    .select()
    .single();

  return toResult<Task>(data, error);
}

export async function updateTask(
  id: string,
  values: Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Result<Task>> {
  const { data, error } = await supabase
    .from('tasks')
    .update(values)
    .eq('id', id)
    .select()
    .single();

  return toResult<Task>(data, error);
}

export async function assignTaskToBlock(
  taskId: string,
  blockInstanceId: string | null
): Promise<Result<Task>> {
  return updateTask(taskId, { block_instance_id: blockInstanceId });
}

export async function listTasksForBlock(
  blockInstanceId: string
): Promise<Result<Task[]>> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('block_instance_id', blockInstanceId)
    .order('created_at', { ascending: true });

  return toResult<Task[]>(data, error);
}

export async function listCalendarConnections(): Promise<
  Result<CalendarConnection[]>
> {
  const { data, error } = await supabase
    .from('calendar_connections')
    .select(
      'id, user_id, provider, account_email, token_expiry, scopes, is_primary, sync_token, last_synced_at, created_at, updated_at'
    )
    .order('created_at', { ascending: true });

  return toResult<CalendarConnection[]>(data as CalendarConnection[], error);
}

export async function listCalendarEvents(
  filters: Partial<{ start_gte: string; end_lte: string; connection_id: string }> = {}
): Promise<Result<CalendarEvent[]>> {
  let query = supabase.from('calendar_events').select('*');

  if (filters.start_gte) {
    query = query.gte('start_time', filters.start_gte);
  }
  if (filters.end_lte) {
    query = query.lte('end_time', filters.end_lte);
  }
  if (filters.connection_id) {
    query = query.eq('calendar_connection_id', filters.connection_id);
  }

  const { data, error } = await query.order('start_time', {
    ascending: true,
  });

  return toResult<CalendarEvent[]>(data, error);
}

export async function getUserPreferences(
  userId: string
): Promise<Result<UserPreferences | null>> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return toResult<UserPreferences | null>(data, error);
}

/**
 * Validates user preference values before saving.
 * Throws an error if any value is invalid.
 */
function validateUserPreferences(values: Partial<UserPreferences>): void {
  if (values.default_focus_minutes !== undefined && values.default_focus_minutes <= 0) {
    throw new Error('default_focus_minutes must be greater than 0');
  }
  if (values.default_short_break_minutes !== undefined && values.default_short_break_minutes < 0) {
    throw new Error('default_short_break_minutes cannot be negative');
  }
  if (values.default_long_break_minutes !== undefined && values.default_long_break_minutes < 0) {
    throw new Error('default_long_break_minutes cannot be negative');
  }
  if (values.default_sessions_before_long_break !== undefined && values.default_sessions_before_long_break <= 0) {
    throw new Error('default_sessions_before_long_break must be greater than 0');
  }
  if (values.notification_lead_time_minutes !== undefined && values.notification_lead_time_minutes !== null) {
    if (values.notification_lead_time_minutes < 1 || values.notification_lead_time_minutes > 60) {
      throw new Error('notification_lead_time_minutes must be between 1 and 60');
    }
  }
  if (values.standup_time !== undefined && values.standup_time !== null && !/^\d{2}:\d{2}$/.test(values.standup_time)) {
    throw new Error('standup_time must be in HH:MM format');
  }
  if (values.workday_start !== undefined && values.workday_start !== null && !/^\d{2}:\d{2}$/.test(values.workday_start)) {
    throw new Error('workday_start must be in HH:MM format');
  }
  if (values.workday_end !== undefined && values.workday_end !== null && !/^\d{2}:\d{2}$/.test(values.workday_end)) {
    throw new Error('workday_end must be in HH:MM format');
  }
}

export async function upsertUserPreferences(
  values: UserPreferences
): Promise<Result<UserPreferences>> {
  try {
    validateUserPreferences(values);
  } catch (validationError) {
    return {
      data: null,
      error: validationError instanceof Error ? validationError : new Error(String(validationError))
    };
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(values, { onConflict: 'user_id' })
    .select()
    .single();

  return toResult<UserPreferences>(data, error);
}

export async function getTaskById(id: string): Promise<Result<Task>> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  return toResult<Task>(data, error);
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  return !error;
}

export async function startWorkSession(
  taskId: string,
  userId: string,
  options: { blockInstanceId?: string | null; notes?: string | null } = {}
): Promise<Result<WorkSession>> {
  const payload = {
    user_id: userId,
    task_id: taskId,
    block_instance_id: options.blockInstanceId ?? null,
    notes: options.notes ?? null,
  };

  const { data, error } = await supabase
    .from('work_sessions')
    .insert(payload)
    .select()
    .single();

  return toResult<WorkSession>(data, error);
}

export async function endWorkSession(
  sessionId: string,
  options: { notes?: string | null; endedAt?: string | null } = {}
): Promise<Result<WorkSession>> {
  const endedAt = options.endedAt ?? new Date().toISOString();

  const { data: existingSession, error: fetchError } = await supabase
    .from('work_sessions')
    .select('started_at')
    .eq('id', sessionId)
    .single();

  if (fetchError) {
    return { data: null, error: new Error(fetchError.message) };
  }

  if (!existingSession?.started_at) {
    return { data: null, error: new Error('Work session not found') };
  }

  const durationMinutes = Math.max(
    0,
    Math.round(
      (new Date(endedAt).getTime() -
        new Date(existingSession.started_at).getTime()) /
        60_000
    )
  );

  const updates: Partial<WorkSession> = {
    ended_at: endedAt,
    duration_minutes: durationMinutes,
    notes: options.notes ?? null,
  };

  const { data, error } = await supabase
    .from('work_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  return toResult<WorkSession>(data, error);
}

export async function listWorkSessionsForTask(
  taskId: string
): Promise<Result<WorkSession[]>> {
  const { data, error } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('task_id', taskId)
    .order('started_at', { ascending: false });

  return toResult<WorkSession[]>(data, error);
}

export async function getCurrentActiveSession(
  userId: string
): Promise<Result<WorkSession | null>> {
  const { data, error } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return toResult<WorkSession | null>(data, error);
}

export async function getCalendarConnectionById(
  id: string
): Promise<Result<CalendarConnection>> {
  const { data, error } = await supabase
    .from('calendar_connections')
    .select(
      'id, user_id, provider, account_email, token_expiry, scopes, is_primary, sync_token, last_synced_at, created_at, updated_at'
    )
    .eq('id', id)
    .single();

  return toResult<CalendarConnection>(data as CalendarConnection, error);
}

export async function getCalendarEventById(
  id: string
): Promise<Result<CalendarEvent>> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', id)
    .single();

  return toResult<CalendarEvent>(data, error);
}


/**
 * Initializes default notification preferences for a user if they don't exist.
 * This should be called once on app start to ensure every user has sane defaults.
 *
 * Default values:
 * - notifications_enabled: true
 * - notification_sound_enabled: true
 * - notification_lead_time_minutes: 10
 * - standup_time: 09:00
 * - workday_start: 08:00
 * - workday_end: 18:00
 * - default_focus_minutes: 25 (standard Pomodoro)
 * - default_short_break_minutes: 5
 * - default_long_break_minutes: 15
 * - default_sessions_before_long_break: 4
 *
 * @param userId The user ID to initialize preferences for
 * @returns The user's preferences (existing or newly created)
 */
export async function initializeUserPreferences(
  userId: string
): Promise<Result<UserPreferences>> {
  // Check if preferences already exist
  const existing = await getUserPreferences(userId);

  if (existing.data) {
    // Preferences already exist, return them
    return { data: existing.data, error: existing.error };
  }

  // Create default preferences
  const defaults: Omit<UserPreferences, 'created_at' | 'updated_at'> = {
    user_id: userId,
    default_focus_minutes: 25,
    default_short_break_minutes: 5,
    default_long_break_minutes: 15,
    default_sessions_before_long_break: 4,
    standup_time: '09:00',
    workday_start: '08:00',
    workday_end: '18:00',
    notifications_enabled: true,
    notification_lead_time_minutes: 10,
    notification_sound_enabled: true,
  };

  return upsertUserPreferences(defaults as UserPreferences);
}

export type {
  BlockInstance,
  BlockStatus,
  BlockType,
  CalendarConnection,
  CalendarEvent,
  Task,
  TaskPriority,
  TaskStatus,
  UserPreferences,
};
