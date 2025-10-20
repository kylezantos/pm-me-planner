import { NotificationQueueService } from './queue';
import { sendQueuedNotification } from './sender';

const DEFAULT_POLL_INTERVAL_MS = 30_000;

export class NotificationRunner {
  private readonly queue: NotificationQueueService;
  private readonly userId: string;
  private readonly intervalMs: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(options: { userId: string; intervalMs?: number }) {
    this.userId = options.userId;
    this.intervalMs = options.intervalMs ?? DEFAULT_POLL_INTERVAL_MS;
    this.queue = new NotificationQueueService();
  }

  async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const due = await this.queue.listDueNotifications(this.userId);
      if (due.length === 0) return;
      for (const item of due) await sendQueuedNotification(item);
      await this.queue.markSent(due.map((item) => item.id));
    } catch (error) {
      console.error('Notification runner tick failed', error);
    } finally {
      this.running = false;
    }
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
    void this.tick();
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }
}

