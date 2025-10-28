import React from 'react';
import { Skeleton } from '@/ui/skeleton';

interface SkeletonBlockProps {
  /** Height in pixels or tailwind height class */
  height?: string;
}

export function SkeletonBlock({ height = 'h-32' }: SkeletonBlockProps) {
  return (
    <div
      className={`flex w-full flex-col items-start gap-1 rounded-md bg-neutral-200 px-2 py-2 ${height}`}
    >
      {/* Block type name skeleton */}
      <Skeleton className="h-3 w-24" />
      {/* Start time skeleton */}
      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-4" />
        </div>
      </div>
    </div>
  );
}
