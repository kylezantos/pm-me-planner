import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import type { Task } from '@/lib/types';

interface DraggableTaskCardProps {
  task: Task;
  onToggleStatus: (taskId: string) => Promise<void>;
  expandable?: boolean;
}

export function DraggableTaskCard({
  task,
  onToggleStatus,
  expandable = false,
}: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'default',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        onToggleStatus={onToggleStatus}
        expandable={expandable}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
