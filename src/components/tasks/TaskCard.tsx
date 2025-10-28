import React, { useState } from 'react';
import { Badge } from '@/ui/badge';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { TaskCheckbox } from './TaskCheckbox';
import type { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (taskId: string) => Promise<void>;
  /** If true, shows the expand/collapse chevron */
  expandable?: boolean;
  /** If provided, renders drag handle for dnd-kit */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Callback when edit is clicked */
  onEdit?: (task: Task) => void;
  /** Callback when delete is clicked */
  onDelete?: (taskId: string) => void;
}

export function TaskCard({
  task,
  onToggleStatus,
  expandable = false,
  dragHandleProps,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasDescription = Boolean(task.description || task.notes);
  const canExpand = expandable && hasDescription;

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'default' as const;
      case 'low':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex w-full flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background hover:border-neutral-300 transition-colors">
      <div className="flex w-full items-center justify-between px-3 py-3">
        <div className="flex grow shrink-0 basis-0 items-center gap-2">
          {/* Drag handle */}
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder"
            >
              <div className="flex flex-col gap-0.5">
                <div className="h-0.5 w-3 bg-neutral-400 rounded" />
                <div className="h-0.5 w-3 bg-neutral-400 rounded" />
                <div className="h-0.5 w-3 bg-neutral-400 rounded" />
              </div>
            </div>
          )}

          {/* Checkbox */}
          <TaskCheckbox
            taskId={task.id}
            status={task.status}
            onToggle={onToggleStatus}
          />

          {/* Expand/collapse chevron */}
          {canExpand && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-default-font" />
              ) : (
                <ChevronRight className="h-4 w-4 text-default-font" />
              )}
            </button>
          )}

          {/* Task title */}
          <span
            className={`text-body-bold font-body-bold ${
              task.status === 'completed'
                ? 'text-neutral-400 line-through'
                : 'text-default-font'
            }`}
          >
            {task.title}
          </span>
        </div>

        {/* Priority indicator & actions */}
        <div className="flex items-center gap-2">
          {/* Priority tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <AlertCircle className={`h-5 w-5 ${getPriorityColor(task.priority)}`} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
            </TooltipContent>
          </Tooltip>

          {/* Actions menu (only show if onEdit or onDelete are provided) */}
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-neutral-100 transition-colors"
                  aria-label="Task actions"
                >
                  <MoreVertical className="h-4 w-4 text-default-font" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(task.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Time estimate */}
      {task.estimated_duration_minutes && (
        <div className="flex w-full items-center gap-2 px-3 pb-3">
          <Clock className="h-4 w-4 text-subtext-color" />
          <span className="text-caption font-caption text-subtext-color">
            {task.estimated_duration_minutes} mins
          </span>
        </div>
      )}

      {/* Expanded details */}
      {canExpand && isExpanded && (
        <div className="flex w-full flex-col items-start gap-2 border-t border-solid border-neutral-border bg-neutral-50 px-3 py-3">
          {task.description && (
            <span className="text-caption font-caption text-default-font">
              {task.description}
            </span>
          )}
          {task.notes && (
            <div className="flex flex-col gap-1">
              <span className="text-caption-bold font-caption-bold text-subtext-color">
                Notes:
              </span>
              <span className="text-caption font-caption text-default-font">
                {task.notes}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
