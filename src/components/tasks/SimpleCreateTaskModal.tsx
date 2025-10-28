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
import type { TaskPriority } from '@/lib/types';

interface SimpleCreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function SimpleCreateTaskModal({ open, onOpenChange, userId }: SimpleCreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [blockTypeId, setBlockTypeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [estimatedDuration, setEstimatedDuration] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createTask } = useTasksStore();
  const { blockTypes, fetchBlockTypes } = useBlockTypesStore();

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
      const task = await createTask({
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || null,
        block_type_id: blockTypeId,
        priority: priority,
        estimated_duration_minutes: estimatedDuration ? parseInt(estimatedDuration, 10) : null,
        block_instance_id: null, // Starts in backlog
        status: 'pending',
      });

      if (task) {
        showSuccess('Task created', 'Your task has been added to the backlog');
        handleClose();
      } else {
        showError('Failed to create task', 'Please try again');
      }
    } catch (error) {
      showError('Failed to create task', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setBlockTypeId('');
    setPriority('medium');
    setEstimatedDuration('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your backlog. You can schedule it later by dragging it to a calendar block.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add any additional context or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">Optional details about this task</p>
          </div>

          {/* Block Type */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="blockType">Block Type</Label>
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
            <Label htmlFor="priority">Priority</Label>
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
            <Label htmlFor="duration">Estimated Duration (minutes)</Label>
            <Input
              id="duration"
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
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
