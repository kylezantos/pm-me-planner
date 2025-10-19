import { addMinutes, parseISO, subMinutes } from 'date-fns';
import type { BlockInstance, NotificationType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface ScheduledNotification {
  id: string;
  userId: string;
  type: NotificationType;
  targetTime: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

interface ScheduleBlockNotificationsOptions {
  userId: string;
  blocks: BlockInstance[];
  now?: Date;
  upcomingWarningMinutes?: number;
}

function createNotification(
  userId: string,
  type: NotificationType,
  target: Date,
  payload: Record<string, unknown> = {}
): ScheduledNotification {
  return {
    id: uuidv4(),
    userId,
    type,
    targetTime: target.toISOString(),
    payload,
    createdAt: new Date().toISOString(),
  };
}

export function scheduleBlockNotifications(
  options: ScheduleBlockNotificationsOptions
): ScheduledNotification[] {
  const {
    userId,
    blocks,
    now = new Date(),
    upcomingWarningMinutes = 10,
  } = options;

  const notifications: ScheduledNotification[] = [];

  for (const block of blocks) {
    const start = parseISO(block.planned_start);
    const end = parseISO(block.planned_end);

    const upcomingTime = subMinutes(start, upcomingWarningMinutes);
    if (upcomingTime > now) {
      notifications.push(
        createNotification(userId, 'block_upcoming', upcomingTime, {
          blockId: block.id,
        })
      );
    }

    if (start > now) {
      notifications.push(
        createNotification(userId, 'block_start', start, {
          blockId: block.id,
        })
      );
    }

    if (block.status === 'paused' && block.paused_until) {
      const resumeTime = parseISO(block.paused_until);
      if (resumeTime > now) {
        notifications.push(
          createNotification(userId, 'block_resumed', resumeTime, {
            blockId: block.id,
          })
        );
      }
    }

    const meetingPauseTime = block.actual_start
      ? parseISO(block.actual_start)
      : null;
    if (block.status === 'paused' && meetingPauseTime && meetingPauseTime > now) {
      notifications.push(
        createNotification(userId, 'block_paused_meeting', meetingPauseTime, {
          blockId: block.id,
        })
      );
    }

    if (end > now) {
      notifications.push(
        createNotification(userId, 'block_resumed', addMinutes(end, 1), {
          blockId: block.id,
        })
      );
    }
  }

  return notifications;
}
