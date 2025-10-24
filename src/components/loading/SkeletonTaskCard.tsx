import React from 'react';
import { SkeletonText } from '@/ui/components/SkeletonText';
import { SkeletonCircle } from '@/ui/components/SkeletonCircle';

export function SkeletonTaskCard() {
  return (
    <div className="flex w-full flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background animate-pulse">
      <div className="flex w-full items-center justify-between px-3 py-3">
        <div className="flex grow shrink-0 basis-0 items-center gap-2">
          {/* Checkbox skeleton */}
          <SkeletonCircle size="small" />
          {/* Chevron skeleton */}
          <div className="h-4 w-4 rounded bg-neutral-200" />
          {/* Task title skeleton */}
          <SkeletonText size="default" className="w-48" />
        </div>
        {/* Priority icon skeleton */}
        <SkeletonCircle size="small" />
      </div>
      {/* Time estimate skeleton */}
      <div className="flex w-full items-center gap-2 px-3 pb-3">
        <div className="h-4 w-4 rounded bg-neutral-200" />
        <SkeletonText size="label" className="w-16" />
      </div>
    </div>
  );
}
