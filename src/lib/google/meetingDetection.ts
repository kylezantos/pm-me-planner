import { isBefore } from 'date-fns';
import type { BlockInstance, CalendarEvent } from '../types';
import { findOverlappingMeetings, isTimeRangeOverlapping } from '../meetings';

interface MeetingDetectionOptions {
  events: CalendarEvent[];
  blocks: BlockInstance[];
  now?: Date;
}

interface MeetingDetectionResult {
  activeMeetings: Array<{
    event: CalendarEvent;
    overlappingBlock?: BlockInstance;
  }>;
  conflicts: Array<{
    event: CalendarEvent;
    block: BlockInstance;
    overlapMinutes: number;
  }>;
}

export function detectMeetings(
  options: MeetingDetectionOptions
): MeetingDetectionResult {
  const { events, blocks, now = new Date() } = options;

  const active = findOverlappingMeetings(events, blocks, now);

  const activeMeetings = active.map((overlap) => {
    const event = events.find((item) => item.id === overlap.eventId);
    if (!event) {
      return null;
    }

    const block = overlap.blockId
      ? blocks.find((item) => item.id === overlap.blockId)
      : undefined;

    return {
      event,
      overlappingBlock: block,
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  const conflicts: MeetingDetectionResult['conflicts'] = [];

  for (const block of blocks) {
    const blockStart = new Date(block.planned_start);
    const blockEnd = new Date(block.planned_end);

    for (const event of events) {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);

      const overlaps = isTimeRangeOverlapping(
        eventStart,
        eventEnd,
        blockStart,
        blockEnd
      );

      if (!overlaps) {
        continue;
      }

      const overlapStart = isBefore(eventStart, blockStart)
        ? blockStart
        : eventStart;
      const overlapEnd = isBefore(blockEnd, eventEnd) ? blockEnd : eventEnd;

      const overlapMinutes = Math.max(
        0,
        Math.round((overlapEnd.getTime() - overlapStart.getTime()) / 60000)
      );

      conflicts.push({
        event,
        block,
        overlapMinutes,
      });
    }
  }

  return {
    activeMeetings,
    conflicts,
  };
}

export function getNextResumeTime(
  block: BlockInstance,
  meetings: CalendarEvent[]
): Date {
  const blockStart = new Date(block.planned_start);
  const blockEnd = new Date(block.planned_end);

  const blockingMeetings = meetings.filter((meeting) => {
    const meetingEnd = new Date(meeting.end_time);
    const meetingStart = new Date(meeting.start_time);

    return isTimeRangeOverlapping(
      meetingStart,
      meetingEnd,
      blockStart,
      blockEnd
    );
  });

  if (blockingMeetings.length === 0) {
    return blockEnd;
  }

  const latestMeetingEnd = blockingMeetings.reduce((latest, meeting) => {
    const end = new Date(meeting.end_time);
    return isBefore(latest, end) ? end : latest;
  }, blockStart);

  return isBefore(blockEnd, latestMeetingEnd)
    ? latestMeetingEnd
    : blockEnd;
}
