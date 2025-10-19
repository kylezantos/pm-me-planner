export type NotificationType =
  | 'block_upcoming'
  | 'block_start'
  | 'block_paused_meeting'
  | 'block_resumed'
  | 'standup';

export interface ScheduledNotification {
  id: string;
  userId: string;
  type: NotificationType;
  targetTime: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  sentAt?: string;
}
