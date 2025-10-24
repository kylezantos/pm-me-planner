import React, { useState } from 'react';
import { Button } from '@/ui/components/Button';
import { TextField } from '@/ui/components/TextField';
import { Switch } from '@/ui/components/Switch';
import { Checkbox } from '@/ui/components/Checkbox';
import { InlineError } from '@/components/error';
import { showSuccess, showError } from '@/components/error';
import { useBlockTypesStore } from '@/lib/store/blockTypesStore';
import type { BlockTypeInsert } from '@/lib/types';
import { FeatherX } from '@subframe/core';

interface CreateBlockTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

interface BlockTypeFormData {
  name: string;
  color: string;
  default_duration_minutes: number;
  pomodoro_focus_minutes: number;
  pomodoro_short_break_minutes: number;
  pomodoro_long_break_minutes: number;
  pomodoro_sessions_before_long_break: number;
  recurring_enabled: boolean;
  recurring_days_of_week: number[];
  recurring_time_of_day: string;
  recurring_auto_create: boolean;
  recurring_weeks_in_advance: number;
}

const PREDEFINED_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
];

const DAYS_OF_WEEK = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
];

export function CreateBlockTypeModal({ open, onOpenChange, userId }: CreateBlockTypeModalProps) {
  const [formData, setFormData] = useState<BlockTypeFormData>({
    name: '',
    color: '#3b82f6', // Default blue
    default_duration_minutes: 120, // Default 2 hours
    pomodoro_focus_minutes: 25,
    pomodoro_short_break_minutes: 5,
    pomodoro_long_break_minutes: 15,
    pomodoro_sessions_before_long_break: 4,
    recurring_enabled: false,
    recurring_days_of_week: [],
    recurring_time_of_day: '09:00',
    recurring_auto_create: false,
    recurring_weeks_in_advance: 1,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BlockTypeFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createBlockType } = useBlockTypesStore();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BlockTypeFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.color) {
      newErrors.color = 'Color is required';
    }

    if (formData.default_duration_minutes <= 0) {
      newErrors.default_duration_minutes = 'Duration must be greater than 0';
    }

    if (formData.pomodoro_focus_minutes <= 0) {
      newErrors.pomodoro_focus_minutes = 'Focus duration must be greater than 0';
    }

    if (formData.pomodoro_short_break_minutes <= 0) {
      newErrors.pomodoro_short_break_minutes = 'Short break duration must be greater than 0';
    }

    if (formData.pomodoro_long_break_minutes <= 0) {
      newErrors.pomodoro_long_break_minutes = 'Long break duration must be greater than 0';
    }

    if (formData.pomodoro_sessions_before_long_break <= 0) {
      newErrors.pomodoro_sessions_before_long_break = 'Sessions must be greater than 0';
    }

    if (formData.recurring_enabled && formData.recurring_days_of_week.length === 0) {
      newErrors.recurring_days_of_week = 'Select at least one day for recurring blocks';
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
      const blockTypeData: BlockTypeInsert = {
        user_id: userId,
        name: formData.name.trim(),
        color: formData.color,
        default_duration_minutes: formData.default_duration_minutes,
        pomodoro_focus_minutes: formData.pomodoro_focus_minutes,
        pomodoro_short_break_minutes: formData.pomodoro_short_break_minutes,
        pomodoro_long_break_minutes: formData.pomodoro_long_break_minutes,
        pomodoro_sessions_before_long_break: formData.pomodoro_sessions_before_long_break,
        recurring_enabled: formData.recurring_enabled,
        recurring_days_of_week: formData.recurring_days_of_week,
        recurring_time_of_day: formData.recurring_enabled ? formData.recurring_time_of_day : null,
        recurring_auto_create: formData.recurring_auto_create,
        recurring_weeks_in_advance: formData.recurring_weeks_in_advance,
      };

      const blockType = await createBlockType(blockTypeData);

      if (blockType) {
        showSuccess('Block type created', `"${formData.name}" has been added to your block types`);
        handleClose();
      } else {
        showError('Failed to create block type', 'Please try again');
      }
    } catch (error) {
      showError('Failed to create block type', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      color: '#3b82f6',
      default_duration_minutes: 120,
      pomodoro_focus_minutes: 25,
      pomodoro_short_break_minutes: 5,
      pomodoro_long_break_minutes: 15,
      pomodoro_sessions_before_long_break: 4,
      recurring_enabled: false,
      recurring_days_of_week: [],
      recurring_time_of_day: '09:00',
      recurring_auto_create: false,
      recurring_weeks_in_advance: 1,
    });
    setErrors({});
    onOpenChange(false);
  };

  const toggleDayOfWeek = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      recurring_days_of_week: prev.recurring_days_of_week.includes(day)
        ? prev.recurring_days_of_week.filter((d) => d !== day)
        : [...prev.recurring_days_of_week, day].sort(),
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex min-w-[600px] max-w-[800px] flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background shadow-lg p-6 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-heading-3 font-heading-3 text-default-font">
              Create Block Type
            </span>
            <span className="text-caption font-caption text-subtext-color">
              Define a new block type template for organizing your work. This will include default settings for
              duration, pomodoro configuration, and recurring schedule.
            </span>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-neutral-100"
            aria-label="Close"
          >
            <FeatherX className="h-5 w-5 text-default-font" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6 overflow-y-auto">
              {/* Basic Information */}
              <div className="flex flex-col gap-4">
                <h3 className="text-label-bold font-label-bold text-default-font">Basic Information</h3>

                {/* Name */}
                <div className="flex flex-col gap-2">
                  <TextField
                    label="Name"
                    helpText="A descriptive name for this block type"
                    error={errors.name ? true : false}
                  >
                    <TextField.Input
                      placeholder="e.g., Client Work, Deep Focus, Meetings"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      autoFocus
                    />
                  </TextField>
                  {errors.name && <InlineError message={errors.name} />}
                </div>

                {/* Color Picker */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-bold font-label-bold text-default-font">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_COLORS.map((colorOption) => (
                      <button
                        key={colorOption.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: colorOption.value })}
                        className={`h-8 w-8 rounded-md border-2 transition-all ${
                          formData.color === colorOption.value
                            ? 'border-neutral-800 scale-110'
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                        style={{ backgroundColor: colorOption.value }}
                        title={colorOption.name}
                      />
                    ))}
                  </div>
                  <span className="text-caption font-caption text-subtext-color">
                    Selected: {PREDEFINED_COLORS.find((c) => c.value === formData.color)?.name || 'Custom'}
                  </span>
                  {errors.color && <InlineError message={errors.color} />}
                </div>

                {/* Default Duration */}
                <div className="flex flex-col gap-2">
                  <TextField
                    label="Default Duration (minutes)"
                    helpText="How long should blocks of this type typically last?"
                    error={errors.default_duration_minutes ? true : false}
                  >
                    <TextField.Input
                      type="number"
                      placeholder="e.g., 120"
                      value={formData.default_duration_minutes?.toString() || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          default_duration_minutes: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      min={1}
                    />
                  </TextField>
                  {errors.default_duration_minutes && (
                    <InlineError message={errors.default_duration_minutes} />
                  )}
                </div>
              </div>

              {/* Pomodoro Settings */}
              <div className="flex flex-col gap-4">
                <h3 className="text-label-bold font-label-bold text-default-font">Pomodoro Settings</h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Focus Duration */}
                  <div className="flex flex-col gap-2">
                    <TextField
                      label="Focus Duration (min)"
                      error={errors.pomodoro_focus_minutes ? true : false}
                    >
                      <TextField.Input
                        type="number"
                        value={formData.pomodoro_focus_minutes?.toString() || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pomodoro_focus_minutes: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        min={1}
                      />
                    </TextField>
                    {errors.pomodoro_focus_minutes && (
                      <InlineError message={errors.pomodoro_focus_minutes} />
                    )}
                  </div>

                  {/* Short Break */}
                  <div className="flex flex-col gap-2">
                    <TextField
                      label="Short Break (min)"
                      error={errors.pomodoro_short_break_minutes ? true : false}
                    >
                      <TextField.Input
                        type="number"
                        value={formData.pomodoro_short_break_minutes?.toString() || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pomodoro_short_break_minutes: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        min={1}
                      />
                    </TextField>
                    {errors.pomodoro_short_break_minutes && (
                      <InlineError message={errors.pomodoro_short_break_minutes} />
                    )}
                  </div>

                  {/* Long Break */}
                  <div className="flex flex-col gap-2">
                    <TextField
                      label="Long Break (min)"
                      error={errors.pomodoro_long_break_minutes ? true : false}
                    >
                      <TextField.Input
                        type="number"
                        value={formData.pomodoro_long_break_minutes?.toString() || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pomodoro_long_break_minutes: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        min={1}
                      />
                    </TextField>
                    {errors.pomodoro_long_break_minutes && (
                      <InlineError message={errors.pomodoro_long_break_minutes} />
                    )}
                  </div>

                  {/* Sessions Before Long Break */}
                  <div className="flex flex-col gap-2">
                    <TextField
                      label="Sessions Before Long Break"
                      error={errors.pomodoro_sessions_before_long_break ? true : false}
                    >
                      <TextField.Input
                        type="number"
                        value={formData.pomodoro_sessions_before_long_break?.toString() || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pomodoro_sessions_before_long_break: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        min={1}
                      />
                    </TextField>
                    {errors.pomodoro_sessions_before_long_break && (
                      <InlineError message={errors.pomodoro_sessions_before_long_break} />
                    )}
                  </div>
                </div>
              </div>

              {/* Recurring Schedule */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.recurring_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, recurring_enabled: checked })}
                  />
                  <label className="text-label-bold font-label-bold text-default-font">
                    Enable Recurring Schedule
                  </label>
                </div>

                {formData.recurring_enabled && (
                  <>
                    {/* Days of Week */}
                    <div className="flex flex-col gap-2">
                      <label className="text-label-bold font-label-bold text-default-font">Days of Week</label>
                      <div className="flex gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDayOfWeek(day.value)}
                            className={`flex h-10 w-10 items-center justify-center rounded-md border-2 text-body font-body transition-all ${
                              formData.recurring_days_of_week.includes(day.value)
                                ? 'border-brand-600 bg-brand-50 text-brand-600'
                                : 'border-neutral-200 bg-white text-default-font hover:border-neutral-400'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                      {errors.recurring_days_of_week && (
                        <InlineError message={errors.recurring_days_of_week} />
                      )}
                    </div>

                    {/* Time of Day */}
                    <div className="flex flex-col gap-2">
                      <label className="text-label-bold font-label-bold text-default-font">
                        Time of Day
                      </label>
                      <input
                        type="time"
                        value={formData.recurring_time_of_day}
                        onChange={(e) =>
                          setFormData({ ...formData, recurring_time_of_day: e.target.value })
                        }
                        className="flex h-10 w-full items-center gap-2 rounded border border-solid border-neutral-border bg-default-background px-3 py-2 text-body font-body text-default-font focus:border-brand-600 focus:outline-none"
                      />
                    </div>

                    {/* Auto-Create */}
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={formData.recurring_auto_create}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, recurring_auto_create: checked as boolean })
                        }
                        label="Automatically create blocks in advance"
                      />
                    </div>

                    {/* Weeks in Advance */}
                    <div className="flex flex-col gap-2">
                      <TextField
                        label="Weeks in Advance"
                        helpText="How many weeks ahead to create recurring blocks"
                      >
                        <TextField.Input
                          type="number"
                          value={formData.recurring_weeks_in_advance?.toString() || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recurring_weeks_in_advance: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          min={1}
                          max={12}
                        />
                      </TextField>
                    </div>
                  </>
                )}
              </div>

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
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
              Create Block Type
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
