import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { groupEventsByDay } from './events';
import type { BlockCalendarEvent } from './events';

describe('groupEventsByDay', () => {
  let originalTimezone: string;

  beforeEach(() => {
    // Store original timezone
    originalTimezone = process.env.TZ || '';
  });

  afterEach(() => {
    // Restore original timezone
    if (originalTimezone) {
      process.env.TZ = originalTimezone;
    } else {
      delete process.env.TZ;
    }
  });

  const createMockEvent = (
    id: string,
    start: Date,
    end: Date
  ): BlockCalendarEvent => ({
    id,
    title: `Event ${id}`,
    start,
    end,
    status: 'scheduled',
    color: '#000000',
    blockTypeId: 'block-type-1',
    blockInstanceId: `instance-${id}`,
  });

  describe('Local timezone grouping', () => {
    it('should group events by local date, not UTC', () => {
      // Event at 11:30 PM local time on Jan 15, 2025
      // In UTC, this might be on Jan 16 depending on timezone
      const event1 = createMockEvent(
        '1',
        new Date(2025, 0, 15, 23, 30), // Jan 15, 2025 11:30 PM
        new Date(2025, 0, 15, 23, 59)  // Jan 15, 2025 11:59 PM
      );

      const grouped = groupEventsByDay([event1]);

      // Should be grouped under local date (Jan 15), not UTC date
      expect(grouped['2025-01-15']).toBeDefined();
      expect(grouped['2025-01-15']).toHaveLength(1);
      expect(grouped['2025-01-15'][0].id).toBe('1');

      // Should NOT be grouped under Jan 16 (even if UTC would be Jan 16)
      expect(grouped['2025-01-16']).toBeUndefined();
    });

    it('should group event at midnight correctly in local timezone', () => {
      // Event exactly at midnight local time
      const event1 = createMockEvent(
        '1',
        new Date(2025, 0, 16, 0, 0), // Jan 16, 2025 12:00 AM
        new Date(2025, 0, 16, 1, 0)  // Jan 16, 2025 1:00 AM
      );

      const grouped = groupEventsByDay([event1]);

      // Should be grouped under Jan 16 (local date)
      expect(grouped['2025-01-16']).toBeDefined();
      expect(grouped['2025-01-16']).toHaveLength(1);
      expect(grouped['2025-01-16'][0].id).toBe('1');
    });

    it('should group event one minute before midnight correctly', () => {
      // Event at 11:59 PM local time on Jan 15, 2025
      const event1 = createMockEvent(
        '1',
        new Date(2025, 0, 15, 23, 59), // Jan 15, 2025 11:59 PM
        new Date(2025, 0, 16, 0, 30)   // Ends on Jan 16, 2025 12:30 AM
      );

      const grouped = groupEventsByDay([event1]);

      // Should be grouped under Jan 15 (based on start time)
      expect(grouped['2025-01-15']).toBeDefined();
      expect(grouped['2025-01-15']).toHaveLength(1);
      expect(grouped['2025-01-15'][0].id).toBe('1');
    });
  });

  describe('DST boundary handling', () => {
    it('should correctly group events across DST spring forward (March)', () => {
      // In 2025, DST starts on March 9 at 2:00 AM (clocks jump to 3:00 AM)
      // Event before DST transition
      const event1 = createMockEvent(
        '1',
        new Date(2025, 2, 9, 1, 30),  // March 9, 2025 1:30 AM (before DST)
        new Date(2025, 2, 9, 2, 30)   // March 9, 2025 2:30 AM (after DST jump)
      );

      // Event after DST transition
      const event2 = createMockEvent(
        '2',
        new Date(2025, 2, 9, 3, 0),   // March 9, 2025 3:00 AM (after DST)
        new Date(2025, 2, 9, 4, 0)    // March 9, 2025 4:00 AM
      );

      const grouped = groupEventsByDay([event1, event2]);

      // Both should be grouped under March 9 in local timezone
      expect(grouped['2025-03-09']).toBeDefined();
      expect(grouped['2025-03-09']).toHaveLength(2);
      expect(grouped['2025-03-09'][0].id).toBe('1');
      expect(grouped['2025-03-09'][1].id).toBe('2');
    });

    it('should correctly group events across DST fall back (November)', () => {
      // In 2025, DST ends on November 2 at 2:00 AM (clocks fall back to 1:00 AM)
      // Event before DST transition
      const event1 = createMockEvent(
        '1',
        new Date(2025, 10, 2, 0, 30),  // November 2, 2025 12:30 AM
        new Date(2025, 10, 2, 1, 30)   // November 2, 2025 1:30 AM (first occurrence)
      );

      // Event after DST transition (second 1:00 AM)
      const event2 = createMockEvent(
        '2',
        new Date(2025, 10, 2, 3, 0),   // November 2, 2025 3:00 AM (after fall back)
        new Date(2025, 10, 2, 4, 0)    // November 2, 2025 4:00 AM
      );

      const grouped = groupEventsByDay([event1, event2]);

      // Both should be grouped under November 2 in local timezone
      expect(grouped['2025-11-02']).toBeDefined();
      expect(grouped['2025-11-02']).toHaveLength(2);
      expect(grouped['2025-11-02'][0].id).toBe('1');
      expect(grouped['2025-11-02'][1].id).toBe('2');
    });
  });

  describe('Multiple events on same day', () => {
    it('should group multiple events on the same day', () => {
      const event1 = createMockEvent(
        '1',
        new Date(2025, 0, 15, 9, 0),
        new Date(2025, 0, 15, 10, 0)
      );
      const event2 = createMockEvent(
        '2',
        new Date(2025, 0, 15, 14, 0),
        new Date(2025, 0, 15, 15, 0)
      );
      const event3 = createMockEvent(
        '3',
        new Date(2025, 0, 15, 11, 0),
        new Date(2025, 0, 15, 12, 0)
      );

      const grouped = groupEventsByDay([event1, event2, event3]);

      expect(grouped['2025-01-15']).toBeDefined();
      expect(grouped['2025-01-15']).toHaveLength(3);
    });

    it('should sort events within the same day by start time', () => {
      const event1 = createMockEvent(
        '1',
        new Date(2025, 0, 15, 14, 0),
        new Date(2025, 0, 15, 15, 0)
      );
      const event2 = createMockEvent(
        '2',
        new Date(2025, 0, 15, 9, 0),
        new Date(2025, 0, 15, 10, 0)
      );
      const event3 = createMockEvent(
        '3',
        new Date(2025, 0, 15, 11, 0),
        new Date(2025, 0, 15, 12, 0)
      );

      const grouped = groupEventsByDay([event1, event2, event3]);

      expect(grouped['2025-01-15'][0].id).toBe('2'); // 9:00 AM
      expect(grouped['2025-01-15'][1].id).toBe('3'); // 11:00 AM
      expect(grouped['2025-01-15'][2].id).toBe('1'); // 2:00 PM
    });
  });

  describe('Multiple days', () => {
    it('should group events across multiple days correctly', () => {
      const event1 = createMockEvent(
        '1',
        new Date(2025, 0, 15, 9, 0),
        new Date(2025, 0, 15, 10, 0)
      );
      const event2 = createMockEvent(
        '2',
        new Date(2025, 0, 16, 14, 0),
        new Date(2025, 0, 16, 15, 0)
      );
      const event3 = createMockEvent(
        '3',
        new Date(2025, 0, 17, 11, 0),
        new Date(2025, 0, 17, 12, 0)
      );

      const grouped = groupEventsByDay([event1, event2, event3]);

      expect(Object.keys(grouped)).toHaveLength(3);
      expect(grouped['2025-01-15']).toBeDefined();
      expect(grouped['2025-01-16']).toBeDefined();
      expect(grouped['2025-01-17']).toBeDefined();
      expect(grouped['2025-01-15']).toHaveLength(1);
      expect(grouped['2025-01-16']).toHaveLength(1);
      expect(grouped['2025-01-17']).toHaveLength(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty array', () => {
      const grouped = groupEventsByDay([]);
      expect(grouped).toEqual({});
    });

    it('should handle single event', () => {
      const event = createMockEvent(
        '1',
        new Date(2025, 0, 15, 9, 0),
        new Date(2025, 0, 15, 10, 0)
      );

      const grouped = groupEventsByDay([event]);

      expect(Object.keys(grouped)).toHaveLength(1);
      expect(grouped['2025-01-15']).toBeDefined();
      expect(grouped['2025-01-15']).toHaveLength(1);
    });

    it('should handle leap year date', () => {
      // Feb 29, 2024 is a valid leap year date
      const event = createMockEvent(
        '1',
        new Date(2024, 1, 29, 12, 0), // Feb 29, 2024
        new Date(2024, 1, 29, 13, 0)
      );

      const grouped = groupEventsByDay([event]);

      expect(grouped['2024-02-29']).toBeDefined();
      expect(grouped['2024-02-29']).toHaveLength(1);
    });

    it('should handle year boundary (New Year)', () => {
      const event1 = createMockEvent(
        '1',
        new Date(2024, 11, 31, 23, 30), // Dec 31, 2024 11:30 PM
        new Date(2025, 0, 1, 0, 30)     // Jan 1, 2025 12:30 AM
      );

      const grouped = groupEventsByDay([event1]);

      // Should be grouped under Dec 31 (based on start time)
      expect(grouped['2024-12-31']).toBeDefined();
      expect(grouped['2024-12-31']).toHaveLength(1);
    });
  });

  describe('Different timezones simulation', () => {
    it('should use local timezone for grouping regardless of system timezone', () => {
      // Create events that would have different UTC dates in different timezones
      // Event at 11:00 PM local time
      const event1 = createMockEvent(
        '1',
        new Date(2025, 0, 15, 23, 0),
        new Date(2025, 0, 15, 23, 59)
      );

      const grouped = groupEventsByDay([event1]);

      // Should always group by local date representation
      expect(grouped['2025-01-15']).toBeDefined();

      // The important thing is that we're using format() with local timezone
      // rather than toISOString() which would use UTC
      const key = Object.keys(grouped)[0];
      expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
    });
  });
});
