import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type {
  NotificationQueueItem,
  NotificationType,
  BlockInstance,
} from '../types';
import { getUserPreferences } from '../repositories';
import { scheduleBlockNotifications } from './scheduler';

const DEFAULT_LOOKAHEAD_MINUTES = 60;

export interface NotificationQueueServiceConfig {
  client?: SupabaseClient;
}

export class NotificationQueueService {
  private readonly client: SupabaseClient;

  constructor(config: NotificationQueueServiceConfig = {}) {
    this.client = config.client ?? supabase;
  }

  async enqueue(
    userId: string,
    notifications: Array<{
      type: NotificationType;
      targetTime: string;
      payload?: Record<string, unknown>;
    }>
  ): Promise<void> {
    if (notifications.length === 0) {
      return;
    }

    const records = notifications.map((notification) => ({
      user_id: userId,
      type: notification.type,
      target_time: notification.targetTime,
      payload: notification.payload ?? null,
    }));

    try {
      const { error } = await this.client
        .from('notification_queue')
        .insert(records);

      if (error) {
        console.error('[NotificationQueue] Failed to enqueue', error);
        throw new Error(`Failed to enqueue notifications: ${error.message}`);
      }
    } catch (err) {
      console.error('[NotificationQueue] Unexpected enqueue error', err);
      throw err;
    }
  }

  async listDueNotifications(
    userId: string,
    now: Date = new Date(),
    limit: number = 100
  ): Promise<NotificationQueueItem[]> {
    try {
      const { data, error } = await this.client
        .from('notification_queue')
        .select('*')
        .eq('user_id', userId)
        .is('sent_at', null)
        .lte('target_time', now.toISOString())
        .order('target_time', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('[NotificationQueue] listDueNotifications failed', error);
        throw new Error(`Failed to fetch due notifications: ${error.message}`);
      }

      return (data ?? []) as NotificationQueueItem[];
    } catch (err) {
      console.error('[NotificationQueue] Unexpected listDue error', err);
      throw err;
    }
  }

  async markSent(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    try {
      const { error } = await this.client
        .from('notification_queue')
        .update({ sent_at: new Date().toISOString() })
        .in('id', ids);

      if (error) {
        console.error('[NotificationQueue] markSent failed', error);
        throw new Error(`Failed to mark notifications sent: ${error.message}`);
      }
    } catch (err) {
      console.error('[NotificationQueue] Unexpected markSent error', err);
      throw err;
    }
  }

  async scheduleBlocks(
    userId: string,
    blocks: BlockInstance[],
    now: Date = new Date(),
    lookaheadMinutes: number = DEFAULT_LOOKAHEAD_MINUTES,
    blockTypeMeta?: Map<string, { name?: string; color?: string }>
  ): Promise<void> {
    const cutoff = new Date(now.getTime() + lookaheadMinutes * 60 * 1000);

    const { data, error } = await this.client
      .from('notification_queue')
      .select('id, target_time')
      .eq('user_id', userId)
      .gte('target_time', now.toISOString())
      .lte('target_time', cutoff.toISOString());

    if (error) {
      console.error('[NotificationQueue] Failed to fetch upcoming targets', error);
      throw new Error(error.message);
    }

    const upcomingTargets = new Set(
      (data ?? []).map((item) => item.target_time)
    );

    const preferencesResult = await getUserPreferences(userId);
    if (preferencesResult.error) {
      throw new Error(preferencesResult.error.message);
    }

    const preferences = preferencesResult.data ?? null;

    const scheduled = scheduleBlockNotifications({
      userId,
      blocks,
      now,
      upcomingWarningMinutes: 10,
      standupTime: preferences?.standup_time ?? null,
      preferences,
      blockTypeMeta,
    });

    const deduped = scheduled.filter((notification) => {
      if (notification.targetTime <= now.toISOString()) {
        return false;
      }

      if (notification.targetTime > cutoff.toISOString()) {
        return false;
      }

      return !upcomingTargets.has(notification.targetTime);
    });

    if (deduped.length === 0) {
      return;
    }

    await this.enqueue(userId, deduped);
  }

  async cleanupOldNotifications(
    userId: string,
    daysToKeep: number = 30
  ): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    try {
      const { error } = await this.client
        .from('notification_queue')
        .delete()
        .eq('user_id', userId)
        .not('sent_at', 'is', null)
        .lt('sent_at', cutoff.toISOString());

      if (error) {
        console.error('[NotificationQueue] cleanupOldNotifications failed', error);
      }
    } catch (err) {
      console.error('[NotificationQueue] Unexpected cleanup error', err);
    }
  }
}
