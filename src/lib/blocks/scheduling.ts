import { supabase } from '../supabase';
import type { BlockInstance, CalendarEvent } from '../types';
import { assertValidRange, isTimeRangeOverlapping } from './conflicts';

export interface ScheduleOptions {
  strictConflictCheck?: 'none' | 'blocks' | 'blocks_and_calendar';
  allowConflicts?: boolean;
}

export interface ConflictDetail {
  kind: 'block' | 'calendar';
  id: string;
  title?: string;
  start: string;
  end: string;
}

export interface ScheduleResult {
  created?: BlockInstance;
  conflicts: ConflictDetail[];
}

export async function scheduleBlockInstance(params: {
  userId: string;
  blockTypeId: string;
  start: Date;
  end?: Date;
  durationMinutesFallback?: number;
}, options: ScheduleOptions = {}): Promise<ScheduleResult> {
  const { userId, blockTypeId, start } = params;
  const strict = options.strictConflictCheck ?? 'blocks_and_calendar';

  let end = params.end;
  if (!end) {
    // fetch block type to compute end from duration
    const { data: bt, error } = await supabase
      .from('block_types')
      .select('default_duration_minutes')
      .eq('id', blockTypeId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const minutes = (bt?.default_duration_minutes ?? params.durationMinutesFallback ?? 60) as number;
    end = new Date(start.getTime() + minutes * 60 * 1000);
  }

  assertValidRange(start, end!);
  const conflicts = strict === 'none' ? [] : await findConflicts(userId, start, end!, strict);
  if (conflicts.length > 0 && !options.allowConflicts) {
    return { conflicts };
  }

  const { data, error } = await supabase
    .from('block_instances')
    .insert({
      user_id: userId,
      block_type_id: blockTypeId,
      planned_start: start.toISOString(),
      planned_end: end!.toISOString(),
      status: 'scheduled',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { created: data as BlockInstance, conflicts };
}

export async function rescheduleBlockInstance(params: {
  userId: string;
  blockInstanceId: string;
  newStart: Date;
  newEnd: Date;
}, options: ScheduleOptions = {}): Promise<{ updated?: BlockInstance; conflicts: ConflictDetail[] } > {
  const { userId, blockInstanceId, newStart, newEnd } = params;
  const strict = options.strictConflictCheck ?? 'blocks_and_calendar';
  assertValidRange(newStart, newEnd);

  const conflicts = strict === 'none' ? [] : await findConflicts(userId, newStart, newEnd, strict, blockInstanceId);
  if (conflicts.length > 0 && !options.allowConflicts) {
    return { conflicts };
  }

  const { data, error } = await supabase
    .from('block_instances')
    .update({
      planned_start: newStart.toISOString(),
      planned_end: newEnd.toISOString(),
    })
    .eq('id', blockInstanceId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { updated: data as BlockInstance, conflicts };
}

async function findConflicts(
  userId: string,
  start: Date,
  end: Date,
  mode: 'blocks' | 'blocks_and_calendar',
  excludeBlockId?: string
): Promise<ConflictDetail[]> {
  const s = start.toISOString();
  const e = end.toISOString();
  const conflicts: ConflictDetail[] = [];

  // Block overlaps: planned_start < newEnd AND planned_end > newStart
  const blockQuery = supabase
    .from('block_instances')
    .select('id, planned_start, planned_end')
    .eq('user_id', userId)
    .lt('planned_start', e)
    .gt('planned_end', s);
  const { data: blocks, error: bErr } = await blockQuery;
  if (bErr) throw new Error(bErr.message);

  for (const b of (blocks ?? [])) {
    if (excludeBlockId && b.id === excludeBlockId) continue;
    if (isTimeRangeOverlapping(b.planned_start, b.planned_end, s, e)) {
      conflicts.push({ kind: 'block', id: b.id, start: b.planned_start, end: b.planned_end });
    }
  }

  if (mode === 'blocks') return conflicts;

  // Calendar overlaps: start_time < newEnd AND end_time > newStart
  const { data: events, error: cErr } = await supabase
    .from('calendar_events')
    .select('id, title, start_time, end_time')
    .eq('user_id', userId)
    .lt('start_time', e)
    .gt('end_time', s);
  if (cErr) throw new Error(cErr.message);

  for (const ev of (events ?? []) as Pick<CalendarEvent, 'id' | 'title' | 'start_time' | 'end_time'>[]) {
    if (isTimeRangeOverlapping(ev.start_time, ev.end_time, s, e)) {
      conflicts.push({ kind: 'calendar', id: ev.id, title: ev.title, start: ev.start_time, end: ev.end_time });
    }
  }

  return conflicts;
}
