import React, { useState } from "react";
import { Button } from "@/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarWeekView } from "@/components/calendar/CalendarWeekView";
import { CalendarDayView } from "@/components/calendar/CalendarDayView";
import { CalendarMonthView } from "@/components/calendar/CalendarMonthView";
import { ViewSelector, type CalendarViewType } from "@/components/calendar/ViewSelector";
import { getMondayOfWeek, formatMonthRange, formatDayRange, formatWeekRange } from "@/lib/calendar/utils";
import type { BlockCalendarEvent } from "@/lib/calendar/events";

export interface CalendarViewProps {
  userId: string;
  onSelectEvent: (event: BlockCalendarEvent) => void;
  onSelectSlot: (slot: { start: Date; end: Date; action: string }) => void;
}

export function CalendarView({
  userId,
  onSelectEvent,
  onSelectSlot,
}: CalendarViewProps) {
  // Single date state for all views
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calendar view state
  const [calendarView, setCalendarView] = useState<CalendarViewType>("week");

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format date range for display
  const formatDateRange = () => {
    if (calendarView === 'month') {
      return formatMonthRange(currentDate);
    } else if (calendarView === 'day') {
      return formatDayRange(currentDate);
    } else {
      const weekStart = getMondayOfWeek(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return formatWeekRange(weekStart, weekEnd);
    }
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col items-start self-stretch overflow-hidden">
      {/* Header Section (~60px fixed height) */}
      <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border bg-default-background px-6 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-body-bold font-body-bold text-default-font min-w-[200px] text-center">
            {formatDateRange()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <ViewSelector
            value={calendarView}
            onValueChange={setCalendarView}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={goToToday}
          >
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Section (flex-1 to fill remaining space) */}
      <div className="flex flex-1 min-h-0 w-full items-stretch overflow-hidden">
        {calendarView === 'month' ? (
          <CalendarMonthView
            userId={userId}
            initialDate={currentDate}
            onSelectEvent={onSelectEvent}
            onSelectSlot={onSelectSlot}
          />
        ) : calendarView === 'week' ? (
          <CalendarWeekView
            userId={userId}
            initialDate={getMondayOfWeek(currentDate)}
            onSelectEvent={onSelectEvent}
            onSelectSlot={onSelectSlot}
          />
        ) : (
          <CalendarDayView
            userId={userId}
            initialDate={currentDate}
            onSelectEvent={onSelectEvent}
            onSelectSlot={onSelectSlot}
          />
        )}
      </div>
    </div>
  );
}

export default CalendarView;
