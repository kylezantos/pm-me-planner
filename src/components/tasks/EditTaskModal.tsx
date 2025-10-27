import React, { useState, useEffect } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog';
import { showSuccess, showError } from '@/components/error/toastUtils';
import { useTasksStore } from '@/lib/store/tasksStore';
import { useBlockTypesStore } from '@/lib/store/blockTypesStore';
import type { Task, TaskPriority } from '@/lib/types';

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  userId: string;
}

export function EditTaskModal({ open, onOpenChange, task, userId }: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [blockTypeId, setBlockTypeId] = useState(task.block_type_id);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [estimatedDuration, setEstimatedDuration] = useState<string>(
    task.estimated_duration_minutes?.toString() || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateTask } = useTasksStore();
  const { blockTypes, fetchBlockTypes } = useBlockTypesStore();

  // Reset form when task changes or modal opens
  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description || '');
      setBlockTypeId(task.block_type_id);
      setPriority(task.priority);
      setEstimatedDuration(task.estimated_duration_minutes?.toString() || '');
    }
  }, [open, task]);

  // Fetch block types on mount
  useEffect(() => {
    if (open && blockTypes.length === 0) {
      fetchBlockTypes(userId);
    }
  }, [open, blockTypes.length, fetchBlockTypes, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showError('Validation error', 'Title is required');
      return;
    }

    if (!blockTypeId) {
      showError('Validation error', 'Block type is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description?.trim() || null,
        block_type_id: blockTypeId,
        priority: priority,
        estimated_duration_minutes: estimatedDuration ? parseInt(estimatedDuration, 10) : null,
      });

      showSuccess('Task updated', 'Your changes have been saved');
      onOpenChange(false);
    } catch (error) {
      showError('Failed to update task', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details of your task. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              placeholder="e.g., Review Q4 metrics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
            <p className="text-sm text-muted-foreground">What do you need to do?</p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Add any additional context or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">Optional details about this task</p>
          </div>

          {/* Block Type */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-blockType">Block Type</Label>
            <Select value={blockTypeId} onValueChange={(value) => setBlockTypeId(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a block type..." />
              </SelectTrigger>
              <SelectContent>
                {blockTypes.map((blockType) => (
                  <SelectItem key={blockType.id} value={blockType.id}>
                    {blockType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Which block template does this belong to?</p>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-priority">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">How urgent is this task?</p>
          </div>

          {/* Estimated Duration */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-duration">Estimated Duration (minutes)</Label>
            <Input
              id="edit-duration"
              type="number"
              placeholder="e.g., 45"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              min={0}
            />
            <p className="text-sm text-muted-foreground">How long do you think this will take?</p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
