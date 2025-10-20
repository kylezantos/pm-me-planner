import { NotificationQueueService } from './queue';
import { listBlockInstancesWithType } from '../repositories';
import { supabase } from '../supabase';

export class NotificationSchedulerRunner {
  private readonly queue: NotificationQueueService;
  private readonly userId: string;
  private readonly intervalMs: number;
  private readonly lookaheadMinutes: number;
  private readonly debounceMs: number;
  private readonly minTickIntervalMs: number;
  private readonly listenRealtime: boolean;
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private lastRunTs = 0;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private channel: ReturnType<typeof supabase.channel> | null = null;

  constructor(options: { userId: string; intervalMs?: number; lookaheadMinutes?: number; debounceMs?: number; minTickIntervalMs?: number; listenRealtime?: boolean }) {
    this.userId = options.userId;
    this.intervalMs = options.intervalMs ?? 60_000;
    this.lookaheadMinutes = options.lookaheadMinutes ?? 60;
    this.debounceMs = options.debounceMs ?? 3_000;
    this.minTickIntervalMs = options.minTickIntervalMs ?? 5_000;
    this.listenRealtime = options.listenRealtime ?? true;
    this.queue = new NotificationQueueService();
  }

  async tick(): Promise<void> {
    if (this.running) return;
    const nowTs = Date.now();
    if (nowTs - this.lastRunTs < this.minTickIntervalMs) {
      // Throttle excessive triggers
      return;
    }
    this.running = true;
    try {
      const now = new Date();
      const cutoff = new Date(now.getTime() + this.lookaheadMinutes * 60 * 1000);

      const { data, error } = await listBlockInstancesWithType({
        user_id: this.userId,
        start_gte: now.toISOString(),
        start_lt: cutoff.toISOString(),
      });

      if (error) throw error;

      const typeMeta = new Map<string, { name?: string; color?: string }>();
      for (const item of data ?? []) {
        if (item.block_types) {
          typeMeta.set(item.block_type_id, {
            name: item.block_types.name,
            color: item.block_types.color,
          });
        }
      }

      const blocks = (data ?? []).map((b) => ({
        id: b.id,
        user_id: b.user_id,
        block_type_id: b.block_type_id,
        planned_start: b.planned_start,
        planned_end: b.planned_end,
        status: b.status,
        actual_start: b.actual_start,
        actual_end: b.actual_end,
        paused_until: b.paused_until,
        pause_reason: b.pause_reason,
        notes: b.notes,
        created_at: b.created_at,
        updated_at: b.updated_at,
      }));

      await this.queue.scheduleBlocks(this.userId, blocks, now, this.lookaheadMinutes, typeMeta);
    } catch (err) {
      console.error('[NotificationSchedulerRunner] tick failed', err);
    } finally {
      this.running = false;
      this.lastRunTs = Date.now();
    }
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.tick();
    }, this.intervalMs);
    void this.tick();

    if (this.listenRealtime) {
      // Debounced realtime triggers to avoid storms
      this.channel = supabase
        .channel(`notif-schedule-${this.userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'block_instances', filter: `user_id=eq.${this.userId}` },
          () => this.requestDebouncedTick()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'block_types', filter: `user_id=eq.${this.userId}` },
          () => this.requestDebouncedTick()
        )
        .subscribe();
    }
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.channel) {
      try {
        supabase.removeChannel(this.channel);
      } catch (_) {}
      this.channel = null;
    }
  }

  requestDebouncedTick(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.tick();
    }, this.debounceMs);
  }
}
