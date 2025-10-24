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

  // 4) Preferences disabled -> no notifications (including standup)
  {
    const blocks = [mkBlock()];
    const out = scheduleBlockNotifications({
      userId,
      blocks,
      now,
      upcomingWarningMinutes: 10,
      standupTime: '09:00',
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

  // 6) Custom notification_lead_time_minutes is respected
  {
    const blocks = [mkBlock()];
    const customLeadTime = 15;
    const out = scheduleBlockNotifications({
      userId,
      blocks,
      now,
      upcomingWarningMinutes: 10, // default that should be overridden
      standupTime: null,
      preferences: { notifications_enabled: true, notification_lead_time_minutes: customLeadTime, notification_sound_enabled: true },
    });
    const upcomingNotification = out.find(n => n.type === 'block_upcoming');
    assert('custom lead time -> has upcoming notification', !!upcomingNotification);
    if (upcomingNotification) {
      const blockStartTime = new Date(blocks[0].planned_start);
      const expectedUpcomingTime = new Date(blockStartTime.getTime() - customLeadTime * 60 * 1000);
      assert('custom lead time -> correct timing', upcomingNotification.targetTime === expectedUpcomingTime.toISOString());
      assert('custom lead time -> payload includes lead_minutes', upcomingNotification.payload?.lead_minutes === customLeadTime);
    }
  }

  // 7) Default upcomingWarningMinutes used when notification_lead_time_minutes is null
  {
    const blocks = [mkBlock()];
    const defaultLeadTime = 10;
    const out = scheduleBlockNotifications({
      userId,
      blocks,
      now,
      upcomingWarningMinutes: defaultLeadTime,
      standupTime: null,
      preferences: { notifications_enabled: true, notification_lead_time_minutes: null, notification_sound_enabled: true },
    });
    const upcomingNotification = out.find(n => n.type === 'block_upcoming');
    assert('null lead time -> has upcoming notification', !!upcomingNotification);
    if (upcomingNotification) {
      const blockStartTime = new Date(blocks[0].planned_start);
      const expectedUpcomingTime = new Date(blockStartTime.getTime() - defaultLeadTime * 60 * 1000);
      assert('null lead time -> uses default', upcomingNotification.targetTime === expectedUpcomingTime.toISOString());
      assert('null lead time -> payload includes default lead_minutes', upcomingNotification.payload?.lead_minutes === defaultLeadTime);
    }
  }

  // 8) Standup not scheduled when standup_time is null
  {
    const blocks = [mkBlock()];
    const out = scheduleBlockNotifications({
      userId,
      blocks,
      now,
      upcomingWarningMinutes: 10,
      standupTime: null,
      preferences: { notifications_enabled: true, notification_lead_time_minutes: 10, notification_sound_enabled: true },
    });
    assert('no standup time -> no standup notification', out.every(n => n.type !== 'standup'));
  }

  // 9) Standup scheduled when standup_time is provided
  {
    const blocks: BlockInstance[] = [];
    const standupTime = '09:00';
    const out = scheduleBlockNotifications({
      userId,
      blocks,
      now,
      upcomingWarningMinutes: 10,
      standupTime,
      preferences: { notifications_enabled: true, notification_lead_time_minutes: 10, notification_sound_enabled: true },
    });
    const standupNotification = out.find(n => n.type === 'standup');
    assert('standup time provided -> has standup notification', !!standupNotification);
    if (standupNotification) {
      assert('standup notification -> includes time in payload', standupNotification.payload?.time === standupTime);
    }
  }

  // 10) Enabled notifications with all features
  {
    const blocks = [mkBlock()];
    const customLeadTime = 20;
    const standupTime = '08:30';
    const out = scheduleBlockNotifications({
      userId,
      blocks,
      now,
      upcomingWarningMinutes: 10,
      standupTime,
      preferences: { notifications_enabled: true, notification_lead_time_minutes: customLeadTime, notification_sound_enabled: true },
    });
    assert('all features enabled -> has block_upcoming', out.some(n => n.type === 'block_upcoming'));
    assert('all features enabled -> has block_start', out.some(n => n.type === 'block_start'));
    assert('all features enabled -> has standup', out.some(n => n.type === 'standup'));
  }

  // 11) Edge case: notifications_enabled=false prevents standup even if standup_time is set
  {
    const blocks = [mkBlock()];
    const out = scheduleBlockNotifications({
      userId,
      blocks,
      now,
      upcomingWarningMinutes: 10,
      standupTime: '09:00',
      preferences: { notifications_enabled: false, notification_lead_time_minutes: 10, notification_sound_enabled: true },
    });
    assert('notifications disabled -> no standup despite standup_time', out.length === 0);
  }

  // 12) Edge case: no preferences object (null) should use default upcomingWarningMinutes
  {
    const blocks = [mkBlock()];
    const defaultLeadTime = 10;
    const out = scheduleBlockNotifications({
      userId,
      blocks,
      now,
      upcomingWarningMinutes: defaultLeadTime,
      standupTime: null,
      preferences: null,
    });
    const upcomingNotification = out.find(n => n.type === 'block_upcoming');
    assert('no preferences -> notifications are enabled', !!upcomingNotification);
    if (upcomingNotification) {
      const blockStartTime = new Date(blocks[0].planned_start);
      const expectedUpcomingTime = new Date(blockStartTime.getTime() - defaultLeadTime * 60 * 1000);
      assert('no preferences -> uses default lead time', upcomingNotification.targetTime === expectedUpcomingTime.toISOString());
    }
  }

  // 13) Edge case: notification_lead_time_minutes of 0 should schedule for block start time
  {
    const blocks = [mkBlock()];
    const out = scheduleBlockNotifications({
      userId,
      blocks,
      now,
      upcomingWarningMinutes: 10,
      standupTime: null,
      preferences: { notifications_enabled: true, notification_lead_time_minutes: 0, notification_sound_enabled: true },
    });
    const upcomingNotification = out.find(n => n.type === 'block_upcoming');
    assert('zero lead time -> has upcoming notification', !!upcomingNotification);
    if (upcomingNotification) {
      const blockStartTime = new Date(blocks[0].planned_start);
      assert('zero lead time -> scheduled for start time', upcomingNotification.targetTime === blockStartTime.toISOString());
      assert('zero lead time -> payload shows 0 minutes', upcomingNotification.payload?.lead_minutes === 0);
    }
  }

  // 14) Edge case: very large notification_lead_time_minutes (e.g., 2 hours for a block 3 hours away)
  {
    // Create a block far enough in the future to accommodate the long lead time
    const futureStart = new Date(now.getTime() + 180 * 60 * 1000); // +3 hours
    const futureEnd = new Date(futureStart.getTime() + 60 * 60 * 1000); // +1h duration
    const blocks = [mkBlock({ planned_start: futureStart.toISOString(), planned_end: futureEnd.toISOString() })];
    const longLeadTime = 120; // 2 hours
    const out = scheduleBlockNotifications({
      userId,
      blocks,
      now,
      upcomingWarningMinutes: 10,
      standupTime: null,
      preferences: { notifications_enabled: true, notification_lead_time_minutes: longLeadTime, notification_sound_enabled: true },
    });
    const upcomingNotification = out.find(n => n.type === 'block_upcoming');
    assert('long lead time -> has upcoming notification', !!upcomingNotification);
    if (upcomingNotification) {
      const expectedUpcomingTime = new Date(futureStart.getTime() - longLeadTime * 60 * 1000);
      assert('long lead time -> correct timing', upcomingNotification.targetTime === expectedUpcomingTime.toISOString());
      assert('long lead time -> notification is in future', new Date(upcomingNotification.targetTime) > now);
    }
  }

  console.log('\n✓ All notification preference enforcement tests passed (18 test cases).');
  console.log('\nVerified behaviors:');
  console.log('  1. scheduleBlockNotifications returns empty list when notifications_enabled=false');
  console.log('  2. Custom notification_lead_time_minutes is used when set');
  console.log('  3. Default upcomingWarningMinutes is used when notification_lead_time_minutes is null');
  console.log('  4. Standup notification is emitted when standup_time is present');
  console.log('  5. Standup notification is NOT emitted when standup_time is null');
  console.log('  6. Disabled notifications prevent ALL notifications (blocks + standup)');
  console.log('  7. null preferences object allows notifications with default settings');
  console.log('  8. notification_lead_time_minutes of 0 schedules notification at block start');
  console.log('  9. Very large notification_lead_time_minutes values are handled correctly');
}

run();

