import { startOfWeek, endOfWeek, format } from 'date-fns';
import type { BlockStatus } from '../types';
import { listBlockInstancesWithType, type BlockInstanceWithType } from '../repositories';

export interface BlockCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: BlockStatus;
  color: string;
  blockTypeId: string;
  blockInstanceId: string;
}

export function toBlockCalendarEvent(
  item: BlockInstanceWithType
): BlockCalendarEvent {
  const title = item.block_types?.name ?? 'Block';
  const color = item.block_types?.color ?? '#888888';

  return {
    id: item.id,
    title,
    start: new Date(item.planned_start),
    end: new Date(item.planned_end),
    status: item.status,
    color,
    blockTypeId: item.block_type_id,
    blockInstanceId: item.id,
  };
}

export async function getBlockCalendarEventsForRange(args: {
  userId: string;
  start: Date;
  end: Date;
}): Promise<BlockCalendarEvent[]> {
  const { userId, start, end } = args;
  const { data, error } = await listBlockInstancesWithType({
    user_id: userId,
    start_gte: start.toISOString(),
    start_lt: end.toISOString(),
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toBlockCalendarEvent);
}

export function groupEventsByDay(
  events: BlockCalendarEvent[]
): Record<string, BlockCalendarEvent[]> {
  const grouped: Record<string, BlockCalendarEvent[]> = {};
  for (const ev of events) {
    // Key by YYYY-MM-DD using local timezone to prevent off-by-one errors near midnight
    const key = format(ev.start, 'yyyy-MM-dd');
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ev);
  }

  // Sort events within each day by start time
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  return grouped;
}

export function getWeekRange(
  date: Date = new Date(),
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1
): { start: Date; end: Date } {
  const start = startOfWeek(date, { weekStartsOn });
  const end = endOfWeek(date, { weekStartsOn });
  return { start, end };
}

export async function getWeekEvents(
  userId: string,
  opts?: { date?: Date; weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }
): Promise<BlockCalendarEvent[]> {
  const { date = new Date(), weekStartsOn = 1 } = opts ?? {};
  const { start, end } = getWeekRange(date, weekStartsOn);
  return getBlockCalendarEventsForRange({ userId, start, end });
}

export async function getDayEvents(
  userId: string,
  date: Date
): Promise<BlockCalendarEvent[]> {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return getBlockCalendarEventsForRange({
    userId,
    start: dayStart,
    end: dayEnd,
  });
}

