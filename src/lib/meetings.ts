import { differenceInMinutes, isBefore, parseISO } from 'date-fns';
import type { BlockInstance, CalendarEvent } from './types';

export interface ActiveMeetingOverlap {
  eventId: string;
  title: string;
  meetingStart: string;
  meetingEnd: string;
  blockId?: string;
}

export function isTimeRangeOverlapping(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return isBefore(start1, end2) && isBefore(start2, end1);
}

export function findOverlappingMeetings(
  events: CalendarEvent[],
  blocks: BlockInstance[],
  now: Date = new Date()
): ActiveMeetingOverlap[] {
  return events
    .filter((event) => {
      const start = parseISO(event.start_time);
      const end = parseISO(event.end_time);
      return isBefore(start, now) && isBefore(now, end);
    })
    .map((event) => {
      const meetingStart = parseISO(event.start_time);
      const meetingEnd = parseISO(event.end_time);

      const overlappingBlock = blocks.find((block) => {
        const blockStart = parseISO(block.planned_start);
        const blockEnd = parseISO(block.planned_end);

        return isTimeRangeOverlapping(meetingStart, meetingEnd, blockStart, blockEnd);
      });

      return {
        eventId: event.id,
        title: event.title,
        meetingStart: event.start_time,
        meetingEnd: event.end_time,
        blockId: overlappingBlock?.id,
      };
    });
}

export function calculateMeetingMinutesDuringBlock(
  event: CalendarEvent,
  block: BlockInstance
): number {
  const meetingStart = parseISO(event.start_time);
  const meetingEnd = parseISO(event.end_time);
  const blockStart = parseISO(block.planned_start);
  const blockEnd = parseISO(block.planned_end);

  const effectiveStart = isBefore(meetingStart, blockStart) ? blockStart : meetingStart;
  const effectiveEnd = isBefore(blockEnd, meetingEnd) ? blockEnd : meetingEnd;

  if (!isBefore(effectiveStart, effectiveEnd)) {
    return 0;
  }

  return differenceInMinutes(effectiveEnd, effectiveStart);
}
