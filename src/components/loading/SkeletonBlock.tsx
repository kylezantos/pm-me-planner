import React from 'react';
import { SkeletonText } from '@/ui/components/SkeletonText';

interface SkeletonBlockProps {
  /** Height in pixels or tailwind height class */
  height?: string;
}

export function SkeletonBlock({ height = 'h-32' }: SkeletonBlockProps) {
  return (
    <div
      className={`flex w-full flex-col items-start gap-1 rounded-md bg-neutral-200 px-2 py-2 animate-pulse ${height}`}
    >
      {/* Block type name skeleton */}
      <SkeletonText size="label" className="w-24" />
      {/* Start time skeleton */}
      <div className="flex w-full items-center gap-2">
        <SkeletonText size="label" className="w-16" />
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-neutral-300" />
          <SkeletonText size="label" className="w-4" />
        </div>
      </div>
    </div>
  );
}
