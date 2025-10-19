import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type {
  NotificationQueueItem,
  NotificationType,
  BlockInstance,
} from '../types';
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

    const { error } = await this.client
      .from('notification_queue')
      .insert(records);

    if (error) {
      throw new Error(error.message);
    }
  }

  async listDueNotifications(
    userId: string,
    now: Date = new Date()
  ): Promise<NotificationQueueItem[]> {
    const { data, error } = await this.client
      .from('notification_queue')
      .select('*')
      .eq('user_id', userId)
      .is('sent_at', null)
      .lte('target_time', now.toISOString())
      .order('target_time', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as NotificationQueueItem[];
  }

  async markSent(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    const { error } = await this.client
      .from('notification_queue')
      .update({ sent_at: new Date().toISOString() })
      .in('id', ids);

    if (error) {
      throw new Error(error.message);
    }
  }

  async scheduleBlocks(
    userId: string,
    blocks: BlockInstance[],
    now: Date = new Date(),
    lookaheadMinutes: number = DEFAULT_LOOKAHEAD_MINUTES
  ): Promise<void> {
    const cutoff = new Date(now.getTime() + lookaheadMinutes * 60 * 1000);

    const { data, error } = await this.client
      .from('notification_queue')
      .select('id, target_time')
      .eq('user_id', userId)
      .gte('target_time', now.toISOString())
      .lte('target_time', cutoff.toISOString());

    if (error) {
      throw new Error(error.message);
    }

    const upcomingTargets = new Set(
      (data ?? []).map((item) => item.target_time)
    );

    const scheduled = scheduleBlockNotifications({
      userId,
      blocks,
      now,
      upcomingWarningMinutes: 10,
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
}
