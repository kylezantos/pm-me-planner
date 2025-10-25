import React, { useState, useEffect } from 'react';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog';
import { showSuccess, showError } from '@/components/error/toastUtils';
import { useBlocksStore } from '@/lib/store/blocksStore';
import { useBlockTypesStore } from '@/lib/store/blockTypesStore';
import { scheduleBlockInstance, type ConflictDetail } from '@/lib/blocks/scheduling';

interface SimpleCreateBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  /** Pre-filled date/time when clicking on a calendar slot */
  defaultStart?: Date;
  defaultEnd?: Date;
}

export function SimpleCreateBlockModal({
  open,
  onOpenChange,
  userId,
  defaultStart,
  defaultEnd,
}: SimpleCreateBlockModalProps) {
  const [blockTypeId, setBlockTypeId] = useState('');
  const [plannedStart, setPlannedStart] = useState('');
  const [plannedEnd, setPlannedEnd] = useState('');
  const [notes, setNotes] = useState('');
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

  // Set default times when modal opens
  useEffect(() => {
    if (open) {
      if (defaultStart) {
        setPlannedStart(formatDateTimeLocal(defaultStart));
      }
      if (defaultEnd) {
        setPlannedEnd(formatDateTimeLocal(defaultEnd));
      }
    }
  }, [open, defaultStart, defaultEnd]);

  // Auto-calculate end time when block type is selected
  useEffect(() => {
    if (blockTypeId && plannedStart && !plannedEnd) {
      const selectedBlockType = blockTypes.find((bt) => bt.id === blockTypeId);
      if (selectedBlockType) {
        const startDate = new Date(plannedStart);
        const endDate = new Date(
          startDate.getTime() + selectedBlockType.default_duration_minutes * 60000
        );
        setPlannedEnd(formatDateTimeLocal(endDate));
      }
    }
  }, [blockTypeId, plannedStart, plannedEnd, blockTypes]);

  const handleSubmit = async (e: React.FormEvent, forceCreate = false) => {
    e.preventDefault();

    if (!blockTypeId) {
      showError('Validation error', 'Block type is required');
      return;
    }

    if (!plannedStart || !plannedEnd) {
      showError('Validation error', 'Start and end times are required');
      return;
    }

    // Validate that end is after start
    const start = new Date(plannedStart);
    const end = new Date(plannedEnd);
    if (end <= start) {
      showError('Validation error', 'End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check for conflicts using scheduling helper
      const result = await scheduleBlockInstance(
        {
          userId,
          blockTypeId,
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

  const suggestAvailableTimes = async (requestedStart: Date, requestedEnd: Date) => {
    const duration = requestedEnd.getTime() - requestedStart.getTime();
    const suggestions: string[] = [];
    const maxSuggestions = 6;
    const incrementMinutes = 15;

    // Start searching from the requested time
    let currentStart = new Date(requestedStart.getTime());

    // Scan forward up to 8 hours to find available slots
    const maxSearchTime = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    const searchEndTime = currentStart.getTime() + maxSearchTime;

    while (suggestions.length < maxSuggestions && currentStart.getTime() < searchEndTime) {
      // Move to next slot
      currentStart = new Date(currentStart.getTime() + incrementMinutes * 60 * 1000);
      const currentEnd = new Date(currentStart.getTime() + duration);

      // Check if this slot has any conflicts
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
    }

    setSuggestedTimes(suggestions);
  };

  const handleUseSuggestedTime = (suggestedStart: string) => {
    const selectedBlockType = blockTypes.find((bt) => bt.id === blockTypeId);
    if (selectedBlockType) {
      const startDate = new Date(suggestedStart);
      const endDate = new Date(
        startDate.getTime() + selectedBlockType.default_duration_minutes * 60 * 1000
      );
      setPlannedStart(formatDateTimeLocal(startDate));
      setPlannedEnd(formatDateTimeLocal(endDate));
      setShowConflicts(false);
      setConflicts([]);
      setSuggestedTimes([]);
    }
  };

  const handleClose = () => {
    setBlockTypeId('');
    setPlannedStart('');
    setPlannedEnd('');
    setNotes('');
    setConflicts([]);
    setShowConflicts(false);
    setSuggestedTimes([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Block</DialogTitle>
          <DialogDescription>
            Schedule a time block for focused work
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
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
            <p className="text-sm text-muted-foreground">Choose which type of work block to create</p>
          </div>

          {/* Start Time */}
          <div className="flex flex-col gap-2">
            <label className="text-label-bold font-label-bold text-default-font">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={plannedStart}
              onChange={(e) => setPlannedStart(e.target.value)}
              className="flex h-10 w-full items-center gap-2 rounded border border-solid border-neutral-border bg-default-background px-3 py-2 text-body font-body text-default-font focus:border-brand-600 focus:outline-none"
              required
            />
          </div>

          {/* End Time */}
          <div className="flex flex-col gap-2">
            <label className="text-label-bold font-label-bold text-default-font">
              End Time
            </label>
            <input
              type="datetime-local"
              value={plannedEnd}
              onChange={(e) => setPlannedEnd(e.target.value)}
              className="flex h-10 w-full items-center gap-2 rounded border border-solid border-neutral-border bg-default-background px-3 py-2 text-body font-body text-default-font focus:border-brand-600 focus:outline-none"
              required
            />
            <span className="text-caption font-caption text-subtext-color">
              {plannedStart && plannedEnd && (
                `Duration: ${Math.round((new Date(plannedEnd).getTime() - new Date(plannedStart).getTime()) / 60000)} minutes`
              )}
            </span>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any context or reminders..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">Optional notes about this block</p>
          </div>

          {/* Conflict Warning */}
          {showConflicts && conflicts.length > 0 && (
            <div className="flex flex-col gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex flex-col gap-1">
                <h4 className="text-body font-bold text-red-700">
                  Time Conflict Detected
                </h4>
                <p className="text-caption text-red-600">
                  This time slot overlaps with {conflicts.length} existing{' '}
                  {conflicts.length === 1 ? 'item' : 'items'}:
                </p>
              </div>

              <ul className="flex flex-col gap-2">
                {conflicts.map((conflict, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-caption text-red-700"
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
                <div className="flex flex-col gap-2 pt-2 border-t border-red-200">
                  <p className="text-caption font-medium text-red-700">
                    Suggested available times:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTimes.map((time, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
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

          <DialogFooter>
            {showConflicts && conflicts.length > 0 ? (
              <>
                <Button
                  variant="outline"
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
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                  type="button"
                >
                  {isSubmitting ? 'Creating...' : 'Create Anyway'}
                </Button>
              </>
            ) : (
              <>
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
                  {isSubmitting ? 'Creating...' : 'Create Block'}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Format a Date object to datetime-local input format (YYYY-MM-DDTHH:mm)
 */
function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
