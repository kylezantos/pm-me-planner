import { parseISO, subMinutes, setHours, setMinutes, setSeconds, addDays } from 'date-fns';
import type {
  BlockInstance,
  NotificationType,
  UserPreferences,
  BlockNotificationPayload,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

// Use central ScheduledNotification type from notifications/types
import type { ScheduledNotification } from '../types';

interface ScheduleBlockNotificationsOptions {
  userId: string;
  blocks: BlockInstance[];
  now?: Date;
  upcomingWarningMinutes?: number;
  standupTime?: string | null;
  preferences?: Pick<
    UserPreferences,
    'notifications_enabled' | 'notification_lead_time_minutes' | 'notification_sound_enabled'
  > | null;
  // Optional map for enriching payloads with block metadata
  blockTypeMeta?: Map<string, { name?: string; color?: string }>;
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
    standupTime,
    preferences,
  } = options;

  const notifications: ScheduledNotification[] = [];

  if (preferences && !preferences.notifications_enabled) {
    return notifications;
  }

  const warningMinutes = preferences?.notification_lead_time_minutes ?? upcomingWarningMinutes;

  for (const block of blocks) {
    const start = parseISO(block.planned_start);
    const upcomingTime = subMinutes(start, warningMinutes);
    if (upcomingTime > now) {
      notifications.push(
        createNotification(
          userId,
          'block_upcoming',
          upcomingTime,
          buildBlockPayload(block, warningMinutes, options.blockTypeMeta)
        )
      );
    }

    if (start > now) {
      notifications.push(
        createNotification(
          userId,
          'block_start',
          start,
          buildBlockPayload(block, undefined, options.blockTypeMeta)
        )
      );
    }

    if (block.status === 'paused' && block.paused_until) {
      const resumeTime = parseISO(block.paused_until);

      if (resumeTime > now) {
        notifications.push(
          createNotification(
            userId,
            'block_resumed',
            resumeTime,
            buildBlockPayload(block, undefined, options.blockTypeMeta)
          )
        );
      }
    }
  }

  if (standupTime) {
    const [hours, minutes] = standupTime.split(':').map(Number);
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
      const todayStandup = setSeconds(setMinutes(setHours(new Date(now), hours), minutes), 0);
      const targetStandup = todayStandup > now ? todayStandup : addDays(todayStandup, 1);

      notifications.push(
        createNotification(userId, 'standup', targetStandup, {
          time: standupTime,
        })
      );
    }
  }

  return notifications;
}

function buildBlockPayload(
  block: BlockInstance,
  leadMinutes?: number,
  typeMeta?: Map<string, { name?: string; color?: string }>
): BlockNotificationPayload {
  const meta = typeMeta?.get(block.block_type_id);
  return {
    block_name: meta?.name ?? block.block_type_id,
    block_color: meta?.color,
    lead_minutes: leadMinutes,
    block_type_id: block.block_type_id,
    block_instance_id: block.id,
    start_time: block.planned_start,
  };
}
