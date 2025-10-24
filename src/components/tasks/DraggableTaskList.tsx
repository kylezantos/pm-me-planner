import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableTaskCard } from './DraggableTaskCard';
import { TaskCard } from './TaskCard';
import type { Task } from '@/lib/types';

interface DraggableTaskListProps {
  tasks: Task[];
  onToggleStatus: (taskId: string) => Promise<void>;
  onReorder?: (activeId: string, overId: string) => void;
  expandable?: boolean;
}

export function DraggableTaskList({
  tasks,
  onToggleStatus,
  onReorder,
  expandable = false,
}: DraggableTaskListProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      onReorder(active.id as string, over.id as string);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex w-full flex-col items-start gap-2">
          {tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              expandable={expandable}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeTask && (
          <div className="opacity-90 scale-105 shadow-lg">
            <TaskCard
              task={activeTask}
              onToggleStatus={onToggleStatus}
              expandable={false}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
