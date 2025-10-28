import React from 'react';
import { Skeleton } from '@/ui/skeleton';

export function SkeletonTaskCard() {
  return (
    <div className="flex w-full flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background">
      <div className="flex w-full items-center justify-between px-3 py-3">
        <div className="flex grow shrink-0 basis-0 items-center gap-2">
          {/* Checkbox skeleton */}
          <Skeleton className="h-4 w-4 rounded" />
          {/* Chevron skeleton */}
          <Skeleton className="h-4 w-4" />
          {/* Task title skeleton */}
          <Skeleton className="h-4 w-48" />
        </div>
        {/* Priority icon skeleton */}
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      {/* Time estimate skeleton */}
      <div className="flex w-full items-center gap-2 px-3 pb-3">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
