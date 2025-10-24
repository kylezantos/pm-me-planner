import React, { useState, useEffect } from 'react';
import { Dialog } from '@/ui/components/Dialog';
import { Button } from '@/ui/components/Button';
import { TextField } from '@/ui/components/TextField';
import { TextArea } from '@/ui/components/TextArea';
import { Select } from '@/ui/components/Select';
import { InlineError } from '@/components/error';
import { showSuccess, showError } from '@/components/error';
import { useTasksStore } from '@/lib/store/tasksStore';
import { useBlockTypesStore } from '@/lib/store/blockTypesStore';
import type { TaskPriority, TaskFormData } from '@/lib/types';
import * as SubframeCore from '@subframe/core';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function CreateTaskModal({ open, onOpenChange, userId }: CreateTaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    block_type_id: '',
    priority: 'medium' as TaskPriority,
    estimated_duration_minutes: undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createTask } = useTasksStore();
  const { blockTypes, fetchBlockTypes } = useBlockTypesStore();

  // Fetch block types on mount
  useEffect(() => {
    if (open && blockTypes.length === 0) {
      fetchBlockTypes(userId);
    }
  }, [open, blockTypes.length, fetchBlockTypes, userId]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.block_type_id) {
      newErrors.block_type_id = 'Block type is required';
    }

    if (
      formData.estimated_duration_minutes !== undefined &&
      formData.estimated_duration_minutes <= 0
    ) {
      newErrors.estimated_duration_minutes = 'Duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const task = await createTask({
        user_id: userId,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        block_type_id: formData.block_type_id,
        priority: formData.priority,
        estimated_duration_minutes: formData.estimated_duration_minutes || null,
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
    setFormData({
      title: '',
      description: '',
      block_type_id: '',
      priority: 'medium',
      estimated_duration_minutes: undefined,
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <SubframeCore.Dialog.Root open={open} onOpenChange={onOpenChange}>
      <SubframeCore.Dialog.Portal>
        <SubframeCore.Dialog.Overlay asChild={true}>
          <Dialog.Overlay />
        </SubframeCore.Dialog.Overlay>
        <SubframeCore.Dialog.Content asChild={true}>
          <Dialog>
            <Dialog.Header>
              <Dialog.Title>Create New Task</Dialog.Title>
              <Dialog.Description>
                Add a new task to your backlog. You can schedule it later by dragging it to a calendar block.
              </Dialog.Description>
            </Dialog.Header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Title */}
              <div className="flex flex-col gap-2">
                <TextField
                  label="Title"
                  helpText="What do you need to do?"
                  error={errors.title ? true : false}
                >
                  <TextField.Input
                    placeholder="e.g., Review Q4 metrics"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    autoFocus
                  />
                </TextField>
                {errors.title && <InlineError message={errors.title} />}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <TextArea
                  label="Description"
                  helpText="Optional details about this task"
                >
                  <TextArea.Input
                    placeholder="Add any additional context or notes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </TextArea>
              </div>

              {/* Block Type */}
              <div className="flex flex-col gap-2">
                <Select
                  label="Block Type"
                  helpText="Which block template does this belong to?"
                  error={errors.block_type_id ? true : false}
                  placeholder="Select a block type..."
                  value={formData.block_type_id}
                  onValueChange={(value) => setFormData({ ...formData, block_type_id: value })}
                >
                  {blockTypes.map((blockType) => (
                    <Select.Item key={blockType.id} value={blockType.id}>
                      {blockType.name}
                    </Select.Item>
                  ))}
                </Select>
                {errors.block_type_id && <InlineError message={errors.block_type_id} />}
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-2">
                <Select
                  label="Priority"
                  helpText="How urgent is this task?"
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
                >
                  <Select.Item value="low">Low</Select.Item>
                  <Select.Item value="medium">Medium</Select.Item>
                  <Select.Item value="high">High</Select.Item>
                </Select>
              </div>

              {/* Estimated Duration */}
              <div className="flex flex-col gap-2">
                <TextField
                  label="Estimated Duration (minutes)"
                  helpText="How long do you think this will take?"
                  error={errors.estimated_duration_minutes ? true : false}
                >
                  <TextField.Input
                    type="number"
                    placeholder="e.g., 45"
                    value={formData.estimated_duration_minutes || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimated_duration_minutes: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      })
                    }
                    min={0}
                  />
                </TextField>
                {errors.estimated_duration_minutes && (
                  <InlineError message={errors.estimated_duration_minutes} />
                )}
              </div>

              <Dialog.Actions>
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
              </Dialog.Actions>
            </form>
          </Dialog>
        </SubframeCore.Dialog.Content>
      </SubframeCore.Dialog.Portal>
    </SubframeCore.Dialog.Root>
  );
}
