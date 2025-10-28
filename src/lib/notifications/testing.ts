import {
  sendNotification,
  requestPermission,
  isPermissionGranted,
} from '@tauri-apps/plugin-notification';

export interface NotificationTestResult {
  permissionGranted: boolean;
  error?: string;
}

export interface TestNotificationOptions {
  title?: string;
  body?: string;
  sound?: boolean;
}
/**
 * Sends a test notification to validate notification behavior. Automatically
 * requests permission if not already granted.
 *
 * @param options Optional override for title/body content and sound setting
 * @returns Promise with permission status and any error encountered
 */
export async function sendTestNotification(
  options?: TestNotificationOptions
): Promise<NotificationTestResult> {
  try {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
      if (!permissionGranted) {
        return { permissionGranted, error: 'Notification permission not granted' };
      }
    }

    await sendNotification({
      title: options?.title ?? 'PM Me Planner',
      body: options?.body ?? 'Test notification for minimized app behavior',
      sound: options?.sound !== undefined ? (options.sound ? 'default' : undefined) : 'default',
    });

    return { permissionGranted: true };
  } catch (error) {
    return {
      permissionGranted: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
