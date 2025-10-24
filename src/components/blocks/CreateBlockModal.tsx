import React, { useState, useEffect } from 'react';
import { Dialog } from '@/ui/components/Dialog';
import { Button } from '@/ui/components/Button';
import { TextField } from '@/ui/components/TextField';
import { Select } from '@/ui/components/Select';
import { InlineError } from '@/components/error';
import { showSuccess, showError } from '@/components/error';
import { useBlocksStore } from '@/lib/store/blocksStore';
import { useBlockTypesStore } from '@/lib/store/blockTypesStore';
import { scheduleBlockInstance, type ConflictDetail } from '@/lib/blocks/scheduling';
import type { BlockInstanceFormData } from '@/lib/types';
import * as SubframeCore from '@subframe/core';

interface CreateBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  /** Pre-fill date if clicked from calendar */
  initialDate?: Date;
  /** Pre-fill start time if clicked from calendar slot */
  initialStartTime?: string;
}

export function CreateBlockModal({
  open,
  onOpenChange,
  userId,
  initialDate,
  initialStartTime,
}: CreateBlockModalProps) {
  const [formData, setFormData] = useState<BlockInstanceFormData>({
    block_type_id: '',
    planned_start: '',
    planned_end: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BlockInstanceFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictDetail[]>([]);
  const [showConflicts, setShowConflicts] = useState(false);
  const [suggestedTimes, setSuggestedTimes] = useState<string[]>([]);

  const { createBlock } = useBlocksStore();
  const { blockTypes, fetchBlockTypes } = useBlockTypesStore();

  // Fetch block types on mount
  useEffect(() => {
    if (open && blockTypes.length === 0) {
      fetchBlockTypes(userId);
    }
  }, [open, blockTypes.length, fetchBlockTypes, userId]);

  // Initialize form with pre-filled values
  useEffect(() => {
    if (open && initialDate) {
      const dateStr = initialDate.toISOString().split('T')[0];
      const startTime = initialStartTime || '09:00';

      setFormData((prev) => ({
        ...prev,
        planned_start: `${dateStr}T${startTime}`,
      }));
    }
  }, [open, initialDate, initialStartTime]);

  // Auto-calculate end time based on selected block type
  useEffect(() => {
    if (formData.block_type_id && formData.planned_start) {
      const selectedBlockType = blockTypes.find((bt) => bt.id === formData.block_type_id);
      if (selectedBlockType) {
        const startDate = new Date(formData.planned_start);
        const endDate = new Date(
          startDate.getTime() + selectedBlockType.default_duration_minutes * 60 * 1000
        );
        setFormData((prev) => ({
          ...prev,
          planned_end: endDate.toISOString(),
        }));
      }
    }
  }, [formData.block_type_id, formData.planned_start, blockTypes]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BlockInstanceFormData, string>> = {};

    if (!formData.block_type_id) {
      newErrors.block_type_id = 'Block type is required';
    }

    if (!formData.planned_start) {
      newErrors.planned_start = 'Start time is required';
    }

    if (!formData.planned_end) {
      newErrors.planned_end = 'End time is required';
    }

    if (formData.planned_start && formData.planned_end) {
      const start = new Date(formData.planned_start);
      const end = new Date(formData.planned_end);

      if (end <= start) {
        newErrors.planned_end = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, forceCreate = false) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const start = new Date(formData.planned_start);
      const end = new Date(formData.planned_end);

      // Check for conflicts using scheduling helper
      const result = await scheduleBlockInstance(
        {
          userId,
          blockTypeId: formData.block_type_id,
          start,
          end,
        },
        {
          strictConflictCheck: 'blocks_and_calendar',
          allowConflicts: forceCreate, // Allow conflicts if user confirmed
        }
      );

      if (result.conflicts.length > 0 && !forceCreate) {
        // Show conflicts and suggest alternative times
        setConflicts(result.conflicts);
        setShowConflicts(true);
        suggestAvailableTimes(start, end);
        setIsSubmitting(false);
        return;
      }

      if (result.created) {
        showSuccess('Block created', 'Your block has been added to the calendar');
        handleClose();
      }
    } catch (error) {
      showError('Failed to create block', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestAvailableTimes = (requestedStart: Date, requestedEnd: Date) => {
    const duration = requestedEnd.getTime() - requestedStart.getTime();
    const suggestions: string[] = [];

    // Suggest next 3 available slots after the requested start time
    let currentStart = new Date(requestedStart.getTime() + duration);

    for (let i = 0; i < 3 && suggestions.length < 3; i++) {
      const currentEnd = new Date(currentStart.getTime() + duration);

      // Check if this slot conflicts
      const hasConflict = conflicts.some((conflict) => {
        const conflictStart = new Date(conflict.start);
        const conflictEnd = new Date(conflict.end);
        return (
          (currentStart >= conflictStart && currentStart < conflictEnd) ||
          (currentEnd > conflictStart && currentEnd <= conflictEnd) ||
          (currentStart <= conflictStart && currentEnd >= conflictEnd)
        );
      });

      if (!hasConflict) {
        suggestions.push(currentStart.toISOString());
      }

      // Move forward by 30 minutes for next check
      currentStart = new Date(currentStart.getTime() + 30 * 60 * 1000);
    }

    setSuggestedTimes(suggestions);
  };

  const handleUseSuggestedTime = (suggestedStart: string) => {
    const selectedBlockType = blockTypes.find((bt) => bt.id === formData.block_type_id);
    if (selectedBlockType) {
      const startDate = new Date(suggestedStart);
      const endDate = new Date(
        startDate.getTime() + selectedBlockType.default_duration_minutes * 60 * 1000
      );
      setFormData({
        ...formData,
        planned_start: suggestedStart,
        planned_end: endDate.toISOString(),
      });
      setShowConflicts(false);
      setConflicts([]);
    }
  };

  const handleClose = () => {
    setFormData({
      block_type_id: '',
      planned_start: '',
      planned_end: '',
      notes: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  const formatDateTimeLocal = (isoString: string) => {
    if (!isoString) return '';
    return isoString.slice(0, 16); // Format: YYYY-MM-DDTHH:mm
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
              <Dialog.Title>Create Time Block</Dialog.Title>
              <Dialog.Description>
                Schedule a time block on your calendar. You can assign tasks to it later.
              </Dialog.Description>
            </Dialog.Header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Block Type */}
              <div className="flex flex-col gap-2">
                <Select
                  label="Block Type"
                  helpText="Choose a block template"
                  error={errors.block_type_id ? true : false}
                  placeholder="Select a block type..."
                  value={formData.block_type_id}
                  onValueChange={(value) => setFormData({ ...formData, block_type_id: value })}
                >
                  {blockTypes.map((blockType) => (
                    <Select.Item key={blockType.id} value={blockType.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: blockType.color }}
                        />
                        <span>{blockType.name}</span>
                        <span className="text-caption text-subtext-color">
                          ({blockType.default_duration_minutes} mins)
                        </span>
                      </div>
                    </Select.Item>
                  ))}
                </Select>
                {errors.block_type_id && <InlineError message={errors.block_type_id} />}
              </div>

              {/* Start Time */}
              <div className="flex flex-col gap-2">
                <TextField
                  label="Start Time"
                  helpText="When does this block start?"
                  error={errors.planned_start ? true : false}
                >
                  <TextField.Input
                    type="datetime-local"
                    value={formatDateTimeLocal(formData.planned_start)}
                    onChange={(e) =>
                      setFormData({ ...formData, planned_start: e.target.value })
                    }
                  />
                </TextField>
                {errors.planned_start && <InlineError message={errors.planned_start} />}
              </div>

              {/* End Time */}
              <div className="flex flex-col gap-2">
                <TextField
                  label="End Time"
                  helpText="When does this block end?"
                  error={errors.planned_end ? true : false}
                >
                  <TextField.Input
                    type="datetime-local"
                    value={formatDateTimeLocal(formData.planned_end)}
                    onChange={(e) =>
                      setFormData({ ...formData, planned_end: e.target.value })
                    }
                  />
                </TextField>
                {errors.planned_end && <InlineError message={errors.planned_end} />}
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-2">
                <TextField
                  label="Notes (optional)"
                  helpText="Any additional context for this block"
                >
                  <TextField.Input
                    placeholder="Add notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </TextField>
              </div>

              {/* Conflict Warning */}
              {showConflicts && conflicts.length > 0 && (
                <div className="flex flex-col gap-3 p-4 bg-error-50 border border-error-200 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-body-bold text-error-700">
                      Time Conflict Detected
                    </h4>
                    <p className="text-caption text-error-600">
                      This time slot overlaps with {conflicts.length} existing{' '}
                      {conflicts.length === 1 ? 'item' : 'items'}:
                    </p>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {conflicts.map((conflict, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-caption text-error-700"
                      >
                        <span className="font-medium">•</span>
                        <span>
                          {conflict.kind === 'calendar' ? '📅' : '🔲'}{' '}
                          {conflict.title || 'Block'} (
                          {new Date(conflict.start).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(conflict.end).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          )
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Suggested Times */}
                  {suggestedTimes.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-error-200">
                      <p className="text-caption font-medium text-error-700">
                        Suggested available times:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTimes.map((time, idx) => (
                          <Button
                            key={idx}
                            variant="neutral-secondary"
                            size="small"
                            onClick={() => handleUseSuggestedTime(time)}
                            type="button"
                          >
                            {new Date(time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Dialog.Actions>
                <Button
                  variant="neutral-secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  type="button"
                >
                  Cancel
                </Button>
                {showConflicts && conflicts.length > 0 ? (
                  <>
                    <Button
                      variant="neutral-secondary"
                      onClick={() => {
                        setShowConflicts(false);
                        setConflicts([]);
                      }}
                      disabled={isSubmitting}
                      type="button"
                    >
                      Edit Time
                    </Button>
                    <Button
                      variant="brand-primary"
                      onClick={(e) => handleSubmit(e, true)}
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      type="button"
                    >
                      Create Anyway
                    </Button>
                  </>
                ) : (
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Create Block
                  </Button>
                )}
              </Dialog.Actions>
            </form>
          </Dialog>
        </SubframeCore.Dialog.Content>
      </SubframeCore.Dialog.Portal>
    </SubframeCore.Dialog.Root>
  );
}
