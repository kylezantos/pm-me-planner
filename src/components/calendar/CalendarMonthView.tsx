import React, { useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { useBlocksStore } from '@/lib/store/blocksStore';
import { useBlockTypesStore } from '@/lib/store/blockTypesStore';
import type { BlockInstance } from '@/lib/types';
import type { BlockCalendarEvent } from '@/lib/calendar/events';

export interface CalendarMonthViewProps {
  userId: string;
  initialDate?: Date;
  onSelectEvent?: (event: BlockCalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; action: string }) => void;
}

interface DayWithBlocks {
  date: Date;
  blocks: BlockInstance[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

const MAX_VISIBLE_EVENTS = 3;

export function CalendarMonthView({
  userId,
  initialDate = new Date(),
  onSelectEvent,
  onSelectSlot,
}: CalendarMonthViewProps) {
  const currentDate = initialDate;

  const { blocks, loading, error, fetchBlocksForDateRange } = useBlocksStore();
  const blockTypes = useBlockTypesStore((state) => state.blockTypes);

  // Fetch blocks for current month
  useEffect(() => {
    const fetchMonthBlocks = async () => {
      try {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);

        // Fetch from start of first week to end of last week to fill the calendar grid
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

        await fetchBlocksForDateRange(
          userId,
          calendarStart.toISOString(),
          calendarEnd.toISOString()
        );
      } catch (error) {
        console.error('Failed to fetch month blocks:', error);
      }
    };

    fetchMonthBlocks();
  }, [currentDate, userId, fetchBlocksForDateRange]);

  // Generate calendar days (including overflow from previous/next month)
  const calendarDays = useMemo((): DayWithBlocks[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    // Get full weeks to display (Mon-Sun)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map((date) => {
      // Find blocks for this day using timezone-safe comparison
      const dayBlocks = blocks.filter((block) => {
        const blockDate = new Date(block.planned_start);
        return isSameDay(blockDate, date);
      });

      return {
        date,
        blocks: dayBlocks,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isToday(date),
      };
    });
  }, [currentDate, blocks]);
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const handleDayClick = (date: Date) => {
    if (onSelectSlot) {
      // Default to 9am-10am slot when clicking empty day
      const start = new Date(date);
      start.setHours(9, 0, 0, 0);
      const end = new Date(date);
      end.setHours(10, 0, 0, 0);
      onSelectSlot({ start, end, action: 'select' });
    }
  };

  const handleEventClick = (block: BlockInstance, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectEvent) {
      const blockType = blockTypes.find((bt) => bt.id === block.block_type_id);
      // Convert BlockInstance to BlockCalendarEvent
      onSelectEvent({
        id: block.id,
        blockInstanceId: block.id,
        title: blockType?.name || 'Block',
        start: new Date(block.planned_start),
        end: new Date(block.planned_end),
        status: block.status,
        blockTypeId: block.block_type_id,
        color: blockType?.color || '#888888',
      });
    }
  };

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-body font-body text-error-font">
          Failed to load calendar events
        </p>
        <p className="text-caption font-caption text-subtext-color mt-2">
          {error || 'Please try again later'}
        </p>
      </div>
    );
  }

  // Loading state
  if (loading && blocks.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 grid grid-rows-[auto_1fr]">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-neutral-border bg-neutral-50">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-caption-bold font-caption-bold text-subtext-color"
              >
                {day}
              </div>
            ))}
          </div>
          {/* Loading skeleton */}
          <div className="grid grid-rows-5">
            {[...Array(5)].map((_, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7">
                {[...Array(7)].map((_, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="border-r border-b border-neutral-border p-2 bg-white"
                  >
                    <div className="h-5 w-6 bg-neutral-100 rounded animate-pulse mb-2" />
                    <div className="space-y-1">
                      <div className="h-6 bg-neutral-100 rounded animate-pulse" />
                      <div className="h-6 bg-neutral-100 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Month grid */}
      <div className="flex-1 w-full grid grid-rows-[auto_1fr]">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-neutral-border bg-neutral-50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-caption-bold font-caption-bold text-subtext-color"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid auto-rows-fr">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((day) => {
                const visibleBlocks = day.blocks.slice(0, MAX_VISIBLE_EVENTS);
                const hiddenCount = Math.max(0, day.blocks.length - MAX_VISIBLE_EVENTS);

                return (
                  <div
                    key={day.date.toISOString()}
                    onClick={() => handleDayClick(day.date)}
                    className={`
                      border-r border-b border-neutral-border p-2 cursor-pointer
                      hover:bg-neutral-50 transition-colors
                      ${!day.isCurrentMonth ? 'bg-neutral-100/50' : 'bg-white'}
                      ${day.isToday ? 'bg-brand-50/30' : ''}
                      min-h-[100px]
                    `}
                  >
                    {/* Date number */}
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`
                          text-caption font-caption
                          ${day.isToday ? 'bg-brand-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                          ${!day.isCurrentMonth ? 'text-subtext-color' : 'text-default-font'}
                        `}
                      >
                        {format(day.date, 'd')}
                      </span>
                    </div>

                    {/* Event badges */}
                    <div className="space-y-1">
                      {visibleBlocks.map((block) => {
                        const blockType = blockTypes.find((bt) => bt.id === block.block_type_id);
                        return (
                          <div
                            key={block.id}
                            onClick={(e) => handleEventClick(block, e)}
                            className="text-caption font-caption px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: blockType?.color || '#888888',
                              color: '#ffffff',
                            }}
                            title={blockType?.name || 'Block'}
                          >
                            {format(new Date(block.planned_start), 'h:mm a')} {blockType?.name}
                          </div>
                        );
                      })}

                      {/* "+N more" indicator */}
                      {hiddenCount > 0 && (
                        <div className="text-caption font-caption text-subtext-color px-2">
                          +{hiddenCount} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
