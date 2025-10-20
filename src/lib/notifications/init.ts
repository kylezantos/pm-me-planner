import { NotificationRunner } from './delivery';
import { NotificationSchedulerRunner } from './schedulerRunner';
import { subscribePauseNotifications } from './realtime';
import { initNotificationActionHandler } from './actionHandler';

export interface NotificationServiceHandle {
  stop: () => void;
}

export function startNotifications(options: {
  userId: string;
  deliveryIntervalMs?: number;
  scheduleIntervalMs?: number;
  lookaheadMinutes?: number;
  debounceMs?: number;
  minTickIntervalMs?: number;
  listenRealtime?: boolean;
  snoozeMinutes?: number;
}): NotificationServiceHandle {
  const {
    userId,
    deliveryIntervalMs,
    scheduleIntervalMs,
    lookaheadMinutes,
    debounceMs,
    minTickIntervalMs,
    listenRealtime,
    snoozeMinutes,
  } = options;

  const delivery = new NotificationRunner({ userId, intervalMs: deliveryIntervalMs });
  const scheduler = new NotificationSchedulerRunner({
    userId,
    intervalMs: scheduleIntervalMs,
    lookaheadMinutes,
    debounceMs,
    minTickIntervalMs,
    listenRealtime,
  });
  const unsubscribePause = subscribePauseNotifications({ userId });
  const unsubscribeActions = initNotificationActionHandler({ userId, snoozeMinutes });

  delivery.start();
  scheduler.start();

  return {
    stop: () => {
      delivery.stop();
      scheduler.stop();
      unsubscribePause();
      unsubscribeActions();
    },
  };
}
