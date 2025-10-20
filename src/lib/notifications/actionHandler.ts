import { listenForNotificationActions, ensureNotificationActionsRegistered } from './actions';
import { NotificationQueueService } from './queue';
import { updateBlockInstance, getBlockInstanceById } from '../repositories';
import type { NotificationType } from '../types';
import type { Options as TauriNotificationOptions } from '@tauri-apps/plugin-notification';

type ActionId = 'start' | 'snooze' | 'skip';

interface TauriNotificationActionEvent extends Partial<TauriNotificationOptions> {
  actionId?: string;
  extra?: Record<string, unknown>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOTIF_TYPES: ReadonlyArray<NotificationType> = [
  'block_upcoming',
  'block_start',
  'block_paused',
  'block_resumed',
  'standup',
];

export function initNotificationActionHandler(options: { userId: string; snoozeMinutes?: number }): () => void {
  const { userId, snoozeMinutes = 5 } = options;
  const queue = new NotificationQueueService();

  // Ensure action types are registered before listening
  void ensureNotificationActionsRegistered();

  const unsubscribe = listenForNotificationActions(async (evt: TauriNotificationActionEvent) => {
    try {
      const actionId: ActionId | undefined = (typeof evt?.actionId === 'string' ? (evt.actionId as ActionId) : undefined);
      const extra: Record<string, unknown> = (evt?.extra && typeof evt.extra === 'object') ? (evt.extra as Record<string, unknown>) : {};

      if (!actionId) {
        return;
      }

      const blockInstanceId = (typeof extra['block_instance_id'] === 'string' && UUID_RE.test(extra['block_instance_id'] as string))
        ? (extra['block_instance_id'] as string)
        : null;
      const notificationType = (typeof extra['type'] === 'string' ? (extra['type'] as string) : null);

      if (actionId === 'start') {
        if (blockInstanceId) {
          const block = await getBlockInstanceById(blockInstanceId);
          if (block.error) throw block.error;
          const status = block.data?.status;
          if (status === 'scheduled' || status === 'paused') {
            await updateBlockInstance(blockInstanceId, {
              status: 'in_progress',
              actual_start: new Date().toISOString(),
            });
          } else {
            console.warn('[NotificationActions] Start ignored: invalid block status', status);
          }
        }
        return;
      }

      if (actionId === 'snooze') {
        const target = new Date(Date.now() + snoozeMinutes * 60 * 1000).toISOString();
        if (!notificationType) {
          console.error('[NotificationActions] Cannot snooze: missing notification type');
          return;
        }
        if (!NOTIF_TYPES.includes(notificationType as NotificationType)) {
          console.warn('[NotificationActions] Invalid notification type for snooze:', notificationType);
          return;
        }
        await queue.enqueue(userId, [
          {
            type: notificationType as NotificationType,
            targetTime: target,
            payload: extra as Record<string, unknown>,
          },
        ]);
        return;
      }

      if (actionId === 'skip') {
        if (blockInstanceId) {
          const block = await getBlockInstanceById(blockInstanceId);
          if (block.error) throw block.error;
          const status = block.data?.status;
          if (status !== 'completed') {
            await updateBlockInstance(blockInstanceId, { status: 'skipped' });
          } else {
            console.warn('[NotificationActions] Skip ignored: already completed');
          }
        }
        return;
      }
    } catch (err) {
      console.error('[NotificationActions] handler error', err);
    }
  });

  return unsubscribe;
}
