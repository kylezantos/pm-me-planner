import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import type {
  NotificationQueueItem,
  BlockNotificationPayload,
  StandupPayload,
} from '../types';
import { addNotificationActions } from './actions';

let nextNotificationId = 1;

const PERMISSION_CHECK_INTERVAL_MS = 60 * 60 * 1000;
let lastPermissionCheck = 0;

async function ensurePermission(): Promise<boolean> {
  const now = Date.now();

  if (now - lastPermissionCheck < PERMISSION_CHECK_INTERVAL_MS) {
    return isPermissionGranted();
  }

  lastPermissionCheck = now;

  let granted = await isPermissionGranted();

  if (!granted) {
    const permission = await requestPermission();
    granted = permission === 'granted';
  }

  return granted;
}

function resolveTitle(type: NotificationQueueItem['type']): string {
  switch (type) {
    case 'block_upcoming':
      return 'Block starting soon';
    case 'block_start':
      return 'Block in progress';
    case 'block_paused':
      return 'Block paused for meeting';
    case 'block_resumed':
      return 'Block resumed';
    case 'standup':
      return 'Daily standup reminder';
    default:
      return 'PM Me Planner';
  }
}

function resolveBody(item: NotificationQueueItem): string {
  const payload = item.payload ?? {};

  switch (item.type) {
    case 'block_upcoming': {
      const { name, minutes } = resolveBlockPayload(payload as BlockNotificationPayload | null);
      return `${name} begins in ${minutes} minutes.`;
    }
    case 'block_start': {
      const { name } = resolveBlockPayload(payload as BlockNotificationPayload | null);
      return `${name} is starting now.`;
    }
    case 'block_paused': {
      const { name } = resolveBlockPayload(payload as BlockNotificationPayload | null);
      return `${name} paused due to a meeting.`;
    }
    case 'block_resumed':
      return 'Meeting ended—your block has resumed.';
    case 'standup':
      return formatStandupNotification(payload as StandupPayload | null);
    default:
      return 'You have a new update.';
  }
}

export async function sendQueuedNotification(item: NotificationQueueItem): Promise<void> {
  const hasPermission = await ensurePermission();

  if (!hasPermission) {
    console.warn('Notifications disabled by user');
    return;
  }

  const id = nextNotificationId++;
  const options = addNotificationActions({
    id,
    title: resolveTitle(item.type),
    body: resolveBody(item),
    extra: buildExtra(item),
  });

  sendNotification(options);
}

function buildExtra(item: NotificationQueueItem): Record<string, unknown> {
  return {
    type: item.type,
    // expose relevant block/standup context
    ...(item.payload ?? {}),
    queue_item_id: item.id,
    target_time: item.target_time,
  };
}

function resolveBlockPayload(payload: BlockNotificationPayload | null): {
  name: string;
  minutes: number;
} {
  const name = typeof payload?.block_name === 'string' ? payload.block_name : 'Scheduled block';
  const minutes = typeof payload?.lead_minutes === 'number' ? payload.lead_minutes : 10;

  return { name, minutes };
}

function formatStandupNotification(payload: StandupPayload | null): string {
  const time = typeof payload?.time === 'string' ? payload.time : null;

  if (time) {
    return `Standup starts at ${time}.`;
  }

  return 'Time for the daily standup check-in.';
}
