import React, { useState } from 'react';
import { Checkbox } from '@/ui/checkbox';
import { Loader2 } from 'lucide-react';
import type { TaskStatus } from '@/lib/types';

interface TaskCheckboxProps {
  taskId: string;
  status: TaskStatus;
  onToggle: (taskId: string) => Promise<void>;
  className?: string;
}

export function TaskCheckbox({ taskId, status, onToggle, className = '' }: TaskCheckboxProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async () => {
    setIsLoading(true);
    try {
      await onToggle(taskId);
    } catch (error) {
      console.error('Failed to toggle task status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <Checkbox
      checked={status === 'completed'}
      onCheckedChange={handleChange}
      className={className}
      aria-label={status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
    />
  );
}
