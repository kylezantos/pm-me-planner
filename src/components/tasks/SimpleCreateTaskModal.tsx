import React, { useState, useEffect } from 'react';
import { Button } from '@/ui/components/Button';
import { TextField } from '@/ui/components/TextField';
import { TextArea } from '@/ui/components/TextArea';
import { Select } from '@/ui/components/Select';
import { showSuccess, showError } from '@/components/error/toastUtils';
import { useTasksStore } from '@/lib/store/tasksStore';
import { useBlockTypesStore } from '@/lib/store/blockTypesStore';
import type { TaskPriority } from '@/lib/types';
import { FeatherX } from '@subframe/core';

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex min-w-[480px] max-w-[600px] flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background shadow-lg p-6 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-heading-3 font-heading-3 text-default-font">
              Create New Task
            </span>
            <span className="text-caption font-caption text-subtext-color">
              Add a new task to your backlog. You can schedule it later by dragging it to a calendar block.
            </span>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center p-1 rounded hover:bg-neutral-100"
            aria-label="Close"
          >
            <FeatherX className="h-5 w-5 text-default-font" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          {/* Title */}
          <TextField
            label="Title"
            helpText="What do you need to do?"
          >
            <TextField.Input
              placeholder="e.g., Review Q4 metrics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </TextField>

          {/* Description */}
          <TextArea
            label="Description"
            helpText="Optional details about this task"
          >
            <TextArea.Input
              placeholder="Add any additional context or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </TextArea>

          {/* Block Type */}
          <Select
            label="Block Type"
            helpText="Which block template does this belong to?"
            placeholder="Select a block type..."
            value={blockTypeId}
            onValueChange={(value) => setBlockTypeId(value)}
          >
            {blockTypes.map((blockType) => (
              <Select.Item key={blockType.id} value={blockType.id}>
                {blockType.name}
              </Select.Item>
            ))}
          </Select>

          {/* Priority */}
          <Select
            label="Priority"
            helpText="How urgent is this task?"
            value={priority}
            onValueChange={(value) => setPriority(value as TaskPriority)}
          >
            <Select.Item value="low">Low</Select.Item>
            <Select.Item value="medium">Medium</Select.Item>
            <Select.Item value="high">High</Select.Item>
          </Select>

          {/* Estimated Duration */}
          <TextField
            label="Estimated Duration (minutes)"
            helpText="How long do you think this will take?"
          >
            <TextField.Input
              type="number"
              placeholder="e.g., 45"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              min={0}
            />
          </TextField>

          {/* Actions */}
          <div className="flex w-full items-center justify-end gap-2 pt-4">
            <Button
              variant="neutral-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
