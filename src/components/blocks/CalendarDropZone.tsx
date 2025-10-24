import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface CalendarDropZoneProps {
  id: string;
  /** The block instance ID (for assigning tasks to existing blocks) */
  blockInstanceId?: string;
  /** If true, shows highlighted state */
  isActive?: boolean;
  /** Children to render inside the drop zone */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CalendarDropZone({
  id,
  blockInstanceId,
  isActive = false,
  children,
  className = '',
  style,
}: CalendarDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      blockInstanceId,
    },
  });

  const getDropZoneStyles = () => {
    const baseClasses = 'transition-all duration-200';

    if (isOver) {
      return `${baseClasses} bg-brand-100 border-2 border-dashed border-brand-600 ${className}`;
    }

    if (isActive) {
      return `${baseClasses} border border-dashed border-neutral-300 hover:border-brand-400 ${className}`;
    }

    return `${baseClasses} ${className}`;
  };

  return (
    <div ref={setNodeRef} className={getDropZoneStyles()} style={style}>
      {children}
      {isOver && !children && (
        <div className="flex items-center justify-center h-full p-4">
          <span className="text-caption font-caption text-brand-600">
            Drop task here
          </span>
        </div>
      )}
    </div>
  );
}
