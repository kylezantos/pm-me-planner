import React, { useEffect, useState } from 'react';
import { isSameDay } from 'date-fns';
import { useDayCalendar } from '@/lib/calendar/hooks';
import type { BlockCalendarEvent } from '@/lib/calendar/events';

export interface CalendarDayViewProps {
  userId: string;
  initialDate?: Date;
  onSelectEvent?: (event: BlockCalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; action: string }) => void;
  className?: string;
}

const GRID_CONFIG = {
  HOURS: Array.from({ length: 17 }, (_, i) => i + 6), // 6am to 10pm
  SLOT_HEIGHT: 80, // px per hour
  TIME_COL_WIDTH: 80, // px
} as const;

export function CalendarDayView({
  userId,
  initialDate,
  onSelectEvent,
  onSelectSlot,
  className = '',
}: CalendarDayViewProps) {
  const { date, range, events, loading, error } = useDayCalendar(userId, initialDate);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;

  // Check if the displayed date is today
  const isToday = isSameDay(date, currentTime);

  // Get day name and date
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dateNumber = date.getDate();

  // Format time for display
  const formatTime = (hour: number): string => {
    const h = Math.floor(hour);
    const period = h >= 12 ? 'pm' : 'am';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}${period}`;
  };

  // Format event start time
  const formatStartTime = (date: Date): string => {
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const period = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return minutes > 0
      ? `${displayHour}:${minutes.toString().padStart(2, '0')}${period}`
      : `${displayHour}${period}`;
  };

  // Calculate event position and dimensions
  const getEventStyle = (event: BlockCalendarEvent) => {
    const startHour = event.start.getHours() + event.start.getMinutes() / 60;
    const endHour = event.end.getHours() + event.end.getMinutes() / 60;
    const duration = endHour - startHour;
    const minHour = GRID_CONFIG.HOURS[0]; // 6am

    return {
      left: `${GRID_CONFIG.TIME_COL_WIDTH + 2}px`,
      top: `${(startHour - minHour) * GRID_CONFIG.SLOT_HEIGHT + 2}px`,
      width: `calc(100% - ${GRID_CONFIG.TIME_COL_WIDTH + 4}px)`,
      height: `${duration * GRID_CONFIG.SLOT_HEIGHT - 4}px`,
    };
  };

  // Handle slot click
  const handleSlotClick = (hour: number) => {
    if (!onSelectSlot) return;

    const slotDate = new Date(date);
    slotDate.setHours(hour, 0, 0, 0);

    const endDate = new Date(slotDate);
    endDate.setHours(hour + 1, 0, 0, 0);

    onSelectSlot({ start: slotDate, end: endDate, action: 'click' });
  };

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-medium">Error loading calendar events</p>
        <p className="text-gray-500 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className={`h-full w-full overflow-auto bg-white ${className}`}>
      <div className="min-w-[600px]">
        {/* Day Header */}
        <div
          className="sticky top-0 bg-white z-10 border-b border-gray-200"
          style={{
            display: 'grid',
            gridTemplateColumns: `${GRID_CONFIG.TIME_COL_WIDTH}px 1fr`,
          }}
        >
          <div className="border-r border-gray-200" />
          <div className={`p-4 border-r border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}>
            <div className="text-sm text-gray-500">{dayName}</div>
            <div className={`text-2xl font-semibold mt-1 ${isToday ? 'text-blue-600' : ''}`}>
              {dateNumber}
            </div>
          </div>
        </div>

        {/* Time Grid */}
        <div className="relative">
          {GRID_CONFIG.HOURS.map((hour) => (
            <div
              key={hour}
              style={{
                display: 'grid',
                gridTemplateColumns: `${GRID_CONFIG.TIME_COL_WIDTH}px 1fr`,
                height: `${GRID_CONFIG.SLOT_HEIGHT}px`,
              }}
              className="border-b border-gray-200"
            >
              {/* Time Label */}
              <div className="border-r border-gray-200 p-3 text-sm text-gray-500">
                {formatTime(hour)}
              </div>

              {/* Time Slot */}
              <div
                className="border-r border-gray-200 relative cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSlotClick(hour)}
              >
                {/* Half-hour line */}
                <div className="absolute top-1/2 left-0 right-0 border-t border-gray-100" />
              </div>
            </div>
          ))}

          {/* Events Layer */}
          {events.map((event, index) => (
            <div
              key={index}
              className="absolute rounded p-3 border border-opacity-50 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
              style={{
                ...getEventStyle(event),
                backgroundColor: event.color,
                borderColor: event.color,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectEvent) onSelectEvent(event);
              }}
            >
              <div className="text-base font-semibold text-white">{event.title}</div>
              <div className="text-sm text-white text-opacity-90 mt-1">
                {formatStartTime(event.start)}
              </div>
            </div>
          ))}

          {/* Current Time Indicator */}
          {isToday &&
            currentHour >= GRID_CONFIG.HOURS[0] &&
            currentHour <= GRID_CONFIG.HOURS[GRID_CONFIG.HOURS.length - 1] + 1 && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: `${(currentHour - GRID_CONFIG.HOURS[0]) * GRID_CONFIG.SLOT_HEIGHT}px` }}
            >
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-600 shadow-lg ml-[80px]" />
                <div className="flex-1 h-0.5 bg-blue-600 shadow-sm" />
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-30">
              <p className="text-gray-500">Loading events...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarDayView;
