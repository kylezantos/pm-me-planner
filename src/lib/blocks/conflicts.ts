import { parseISO } from 'date-fns';

export function isTimeRangeOverlapping(
  start1: Date | string,
  end1: Date | string,
  start2: Date | string,
  end2: Date | string
): boolean {
  const s1 = typeof start1 === 'string' ? parseISO(start1) : start1;
  const e1 = typeof end1 === 'string' ? parseISO(end1) : end1;
  const s2 = typeof start2 === 'string' ? parseISO(start2) : start2;
  const e2 = typeof end2 === 'string' ? parseISO(end2) : end2;
  return s1 < e2 && s2 < e1;
}

export function assertValidRange(start: Date, end: Date): void {
  if (!(start instanceof Date) || isNaN(start.valueOf())) {
    throw new Error('Invalid start time');
  }
  if (!(end instanceof Date) || isNaN(end.valueOf())) {
    throw new Error('Invalid end time');
  }
  if (!(start < end)) {
    throw new Error('End time must be after start time');
  }
}

