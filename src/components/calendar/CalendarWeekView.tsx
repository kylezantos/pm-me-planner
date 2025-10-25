import React, { useEffect, useState } from 'react';
import { isSameDay, isToday } from 'date-fns';
import { useWeekCalendar } from '@/lib/calendar/hooks';
import type { BlockCalendarEvent } from '@/lib/calendar/events';

export interface CalendarWeekViewProps {
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
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarWeekView({
  userId,
  initialDate,
  onSelectEvent,
  onSelectSlot,
  className = '',
}: CalendarWeekViewProps) {
  const { date, range, events, loading, error } = useWeekCalendar(userId, {
    date: initialDate,
    weekStartsOn: 1, // Monday
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;

  // Get day index (0-6 for Mon-Sun)
  const currentDayOfWeek = currentTime.getDay();
  const adjustedDay = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Adjust to Mon=0, Sun=6

  // Generate week dates (Mon-Sun)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(range.start);
    date.setDate(range.start.getDate() + i);
    return date;
  });

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
  const getEventStyle = (event: BlockCalendarEvent, dayIndex: number) => {
    const startHour = event.start.getHours() + event.start.getMinutes() / 60;
    const endHour = event.end.getHours() + event.end.getMinutes() / 60;
    const duration = endHour - startHour;
    const minHour = GRID_CONFIG.HOURS[0]; // 6am

    return {
      left: `calc(${GRID_CONFIG.TIME_COL_WIDTH}px + ${dayIndex * (100 / 7)}% + 2px)`,
      top: `${(startHour - minHour) * GRID_CONFIG.SLOT_HEIGHT + 2}px`,
      width: `calc(${100 / 7}% - 4px)`,
      height: `${duration * GRID_CONFIG.SLOT_HEIGHT - 4}px`,
    };
  };

  // Group events by day
  const eventsByDay: Record<number, BlockCalendarEvent[]> = {};
  events.forEach((event) => {
    const eventDate = new Date(event.start);
    const dayIndex = weekDates.findIndex((d) => isSameDay(d, eventDate));
    if (dayIndex >= 0) {
      if (!eventsByDay[dayIndex]) eventsByDay[dayIndex] = [];
      eventsByDay[dayIndex].push(event);
    }
  });

  // Handle slot click
  const handleSlotClick = (dayIndex: number, hour: number) => {
    if (!onSelectSlot) return;

    const slotDate = new Date(weekDates[dayIndex]);
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
    <div className={`flex-1 overflow-auto bg-white ${className}`}>
      <div className="min-w-[900px]">
        {/* Day Headers */}
        <div
          className="sticky top-0 bg-white z-10 border-b border-gray-200"
          style={{
            display: 'grid',
            gridTemplateColumns: `${GRID_CONFIG.TIME_COL_WIDTH}px repeat(7, 1fr)`,
          }}
        >
          <div className="border-r border-gray-200" />
          {weekDates.map((day, index) => {
            const today = isToday(day);
            return (
              <div
                key={index}
                className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
                  today ? 'bg-blue-50' : ''
                }`}
              >
                <div className="text-xs text-gray-500">{DAYS_OF_WEEK[index]}</div>
                <div className={`text-lg font-semibold mt-0.5 ${today ? 'text-blue-600' : ''}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="relative">
          {GRID_CONFIG.HOURS.map((hour) => (
            <div
              key={hour}
              style={{
                display: 'grid',
                gridTemplateColumns: `${GRID_CONFIG.TIME_COL_WIDTH}px repeat(7, 1fr)`,
                height: `${GRID_CONFIG.SLOT_HEIGHT}px`,
              }}
              className="border-b border-gray-200"
            >
              {/* Time Label */}
              <div className="border-r border-gray-200 p-2 text-xs text-gray-500">
                {formatTime(hour)}
              </div>

              {/* Day Slots */}
              {weekDates.map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="border-r border-gray-200 last:border-r-0 relative cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSlotClick(dayIndex, hour)}
                >
                  {/* Half-hour line */}
                  <div className="absolute top-1/2 left-0 right-0 border-t border-gray-100" />
                </div>
              ))}
            </div>
          ))}

          {/* Events Layer */}
          {Object.entries(eventsByDay).map(([dayIndex, dayEvents]) =>
            dayEvents.map((event, eventIndex) => (
              <div
                key={`${dayIndex}-${eventIndex}`}
                className="absolute rounded p-2 border border-opacity-50 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                style={{
                  ...getEventStyle(event, parseInt(dayIndex)),
                  backgroundColor: event.color,
                  borderColor: event.color,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectEvent) onSelectEvent(event);
                }}
              >
                <div className="text-sm font-semibold text-white truncate">{event.title}</div>
                <div className="text-xs text-white text-opacity-90 mt-1">
                  {formatStartTime(event.start)}
                </div>
              </div>
            ))
          )}

          {/* Current Time Indicator */}
          {currentHour >= GRID_CONFIG.HOURS[0] &&
            currentHour <= GRID_CONFIG.HOURS[GRID_CONFIG.HOURS.length - 1] + 1 &&
            adjustedDay >= 0 &&
            adjustedDay < 7 && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  left: `calc(${GRID_CONFIG.TIME_COL_WIDTH}px + ${adjustedDay * (100 / 7)}%)`,
                  top: `${(currentHour - GRID_CONFIG.HOURS[0]) * GRID_CONFIG.SLOT_HEIGHT}px`,
                  width: `calc(${100 / 7}%)`,
                }}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg" />
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

export default CalendarWeekView;
