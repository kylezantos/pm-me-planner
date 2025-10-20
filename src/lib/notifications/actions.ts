import { registerActionTypes, onAction, type Options as NotificationOptions } from '@tauri-apps/plugin-notification';

export type NotificationActionId = 'start' | 'snooze' | 'skip';

const actions = [
  {
    id: 'start' as const,
    title: 'Start',
  },
  {
    id: 'snooze' as const,
    title: 'Snooze 5 min',
  },
  {
    id: 'skip' as const,
    title: 'Skip',
  },
];

const registerOptions = [
  {
    id: 'block-actions',
    actions,
  },
];

let registrationPromise: Promise<void> | null = null;

export async function ensureNotificationActionsRegistered(): Promise<void> {
  if (!registrationPromise) {
    registrationPromise = registerActionTypes(registerOptions).catch((error) => {
      console.error('Failed to register notification actions:', error);
      registrationPromise = null; // allow retry on next call
      throw error;
    });
  }
  await registrationPromise;
}

export function listenForNotificationActions(
  handler: (payload: NotificationOptions) => void
): () => void {
  let disposed = false;
  const listenerPromise = onAction((notification) => {
    if (!disposed) {
      handler(notification);
    }
  });

  return () => {
    disposed = true;
    void listenerPromise.then((listener) => listener.unregister());
  };
}

export function addNotificationActions(options: NotificationOptions): NotificationOptions {
  return {
    ...options,
    actionTypeId: 'block-actions',
  };
}
