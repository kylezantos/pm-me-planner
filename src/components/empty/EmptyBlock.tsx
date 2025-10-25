import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyBlock() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 py-8 px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
        <Inbox className="h-6 w-6 text-neutral-400" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-caption-bold font-caption-bold text-default-font">
          No tasks in this block
        </span>
        <span className="text-caption font-caption text-subtext-color max-w-[200px]">
          Drag tasks from the backlog to add them here
        </span>
      </div>
    </div>
  );
}
