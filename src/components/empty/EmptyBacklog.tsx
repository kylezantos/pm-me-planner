import React from 'react';
import { Button } from '@/ui/button';
import { Plus, CheckSquare } from 'lucide-react';

interface EmptyBacklogProps {
  onCreateTask?: () => void;
}

export function EmptyBacklog({ onCreateTask }: EmptyBacklogProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 py-12 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <CheckSquare className="h-8 w-8 text-neutral-400" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-body-bold font-body-bold text-default-font">
          No tasks in your backlog
        </span>
        <span className="text-caption font-caption text-subtext-color max-w-xs">
          Create your first task to get started with time blocking and AI-powered
          scheduling
        </span>
      </div>
      {onCreateTask && (
        <Button
          size="sm"
          onClick={onCreateTask}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      )}
    </div>
  );
}
