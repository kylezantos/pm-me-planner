import React from 'react';
import { Calendar } from 'lucide-react';

interface EmptyCalendarProps {
  /** Optional message override */
  message?: string;
}

export function EmptyCalendar({ message }: EmptyCalendarProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 py-12 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <Calendar className="h-8 w-8 text-neutral-400" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-body-bold font-body-bold text-default-font">
          No blocks scheduled
        </span>
        <span className="text-caption font-caption text-subtext-color max-w-xs">
          {message || 'Click on a time slot to create a block, or drag tasks from the backlog to schedule them'}
        </span>
      </div>
    </div>
  );
}
