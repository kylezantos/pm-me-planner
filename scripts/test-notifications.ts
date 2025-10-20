import { scheduleBlockNotifications } from '../src/lib/notifications/scheduler';
import type { BlockInstance, ScheduledNotification } from '../src/lib/types';

function assert(name: string, cond: boolean) {
  if (!cond) throw new Error(`FAIL: ${name}`);
  console.log(`PASS: ${name}`);
}

function mkBlock(overrides: Partial<BlockInstance> = {}): BlockInstance {
  const now = new Date();
  const start = new Date(now.getTime() + 20 * 60 * 1000); // +20m
  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1h
  return {
    id: 'blk_1',
    user_id: 'user_1',
    block_type_id: 'type_1',
    planned_start: start.toISOString(),
    planned_end: end.toISOString(),
    status: 'scheduled',
    actual_start: null,
    actual_end: null,
    paused_until: null,
    pause_reason: null,
    notes: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    ...overrides,
  };
}

function run() {
  const userId = 'user_1';
  const now = new Date();

  // 1) Past block should not schedule start/upcoming
  {
    const pastStart = new Date(now.getTime() - 60 * 60 * 1000);
    const pastEnd = new Date(now.getTime() - 30 * 60 * 1000);
    const blocks = [
      mkBlock({ planned_start: pastStart.toISOString(), planned_end: pastEnd.toISOString() }),
    ];
    const out = scheduleBlockNotifications({ userId, blocks, now, upcomingWarningMinutes: 10, standupTime: null });
    assert('past block -> no upcoming/start', out.every(n => n.type !== 'block_upcoming' && n.type !== 'block_start'));
  }

  // 2) Upcoming block schedules upcoming + start
  {
    const blocks = [mkBlock()];
    const out = scheduleBlockNotifications({ userId, blocks, now, upcomingWarningMinutes: 10, standupTime: null });
    const types = out.map(n => n.type);
    assert('upcoming -> has block_upcoming', types.includes('block_upcoming'));
    assert('upcoming -> has block_start', types.includes('block_start'));
  }

  // 3) Paused block with future paused_until schedules block_resumed
  {
    const resume = new Date(now.getTime() + 15 * 60 * 1000);
    const blocks = [mkBlock({ status: 'paused', paused_until: resume.toISOString() })];
    const out = scheduleBlockNotifications({ userId, blocks, now, upcomingWarningMinutes: 10, standupTime: null });
    assert('paused -> has block_resumed', out.some(n => n.type === 'block_resumed'));
  }

  // 4) Preferences disabled -> no notifications
  {
    const blocks = [mkBlock()];
    const out = scheduleBlockNotifications({
      userId,
      blocks,
      now,
      upcomingWarningMinutes: 10,
      standupTime: null,
      preferences: { notifications_enabled: false, notification_lead_time_minutes: null, notification_sound_enabled: false },
    });
    assert('notifications disabled -> none', out.length === 0);
  }

  // 5) Standup today or tomorrow
  {
    const blocks: BlockInstance[] = [];
    const time = `${now.getHours().toString().padStart(2, '0')}:${(now.getMinutes() + 1).toString().padStart(2, '0')}`;
    const out = scheduleBlockNotifications({ userId, blocks, now, upcomingWarningMinutes: 10, standupTime: time });
    assert('standup scheduled', out.some(n => n.type === 'standup'));
  }

  console.log('All basic notification tests passed.');
}

run();

