import { useEffect, useMemo, useState, useCallback } from 'react';
import { getBlockCalendarEventsForRange, getWeekRange, type BlockCalendarEvent } from './events';
import { subscribeCalendarChanges } from './realtime';

export interface CalendarRange {
  start: Date;
  end: Date;
}

export function useCalendarRangeEvents(
  userId: string,
  range: CalendarRange
): {
  events: BlockCalendarEvent[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [events, setEvents] = useState<BlockCalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBlockCalendarEventsForRange({
        userId,
        start: range.start,
        end: range.end,
      });
      setEvents(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, range.start, range.end]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const unsubscribe = subscribeCalendarChanges({ userId, onChange: fetchEvents });
    return () => unsubscribe();
  }, [userId, fetchEvents]);

  return { events, loading, error, refresh: fetchEvents };
}

export function useWeekCalendar(
  userId: string,
  options?: { date?: Date; weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }
): {
  date: Date;
  range: CalendarRange;
  events: BlockCalendarEvent[];
  loading: boolean;
  error: Error | null;
  next: () => void;
  prev: () => void;
  today: () => void;
  setDate: (d: Date) => void;
  refresh: () => Promise<void>;
} {
  const [date, setDate] = useState<Date>(options?.date ?? new Date());
  const weekStartsOn = options?.weekStartsOn ?? 1;

  const range = useMemo(() => getWeekRange(date, weekStartsOn), [date, weekStartsOn]);
  const { events, loading, error, refresh } = useCalendarRangeEvents(userId, range);

  const next = useCallback(() => {
    const d = new Date(date);
    d.setDate(d.getDate() + 7);
    setDate(d);
  }, [date]);

  const prev = useCallback(() => {
    const d = new Date(date);
    d.setDate(d.getDate() - 7);
    setDate(d);
  }, [date]);

  const today = useCallback(() => setDate(new Date()), []);

  return { date, range, events, loading, error, next, prev, today, setDate, refresh };
}

export function useDayCalendar(
  userId: string,
  initialDate?: Date
): {
  date: Date;
  range: CalendarRange;
  events: BlockCalendarEvent[];
  loading: boolean;
  error: Error | null;
  next: () => void;
  prev: () => void;
  today: () => void;
  setDate: (d: Date) => void;
  refresh: () => Promise<void>;
} {
  const [date, setDate] = useState<Date>(initialDate ?? new Date());

  const range = useMemo(() => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }, [date]);

  const { events, loading, error, refresh } = useCalendarRangeEvents(userId, range);

  const next = useCallback(() => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    setDate(d);
  }, [date]);

  const prev = useCallback(() => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d);
  }, [date]);

  const today = useCallback(() => setDate(new Date()), []);

  return { date, range, events, loading, error, next, prev, today, setDate, refresh };
}

