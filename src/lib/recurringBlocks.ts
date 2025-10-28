import { supabase } from './supabase';
import type { BlockInstance, BlockStatus, BlockType } from './types';

interface GenerateRecurringBlocksOptions {
  userId: string;
  startDate?: Date;
}

interface GenerateResult {
  created: BlockInstance[];
  skipped: number;
}

const MS_PER_MINUTE = 60 * 1000;

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MS_PER_MINUTE);
}

function combineDateAndTime(day: Date, time: string | null): Date | null {
  if (!time) {
    return null;
  }

  const [hours = '0', minutes = '0', seconds = '0'] = time.split(':');
  const result = new Date(day);
  result.setHours(Number(hours), Number(minutes), Number(seconds), 0);
  return result;
}

function getGenerationWindow(
  blockType: BlockType,
  startDate: Date
): { windowStart: Date; windowEnd: Date } {
  const windowStart = startOfDay(startDate);
  const weeksInAdvance = Math.max(blockType.recurring_weeks_in_advance ?? 1, 1);
  const windowEnd = new Date(windowStart);
  windowEnd.setDate(windowEnd.getDate() + weeksInAdvance * 7);
  return { windowStart, windowEnd };
}

function buildPlannedTimes(
  blockType: BlockType,
  windowStart: Date,
  windowEnd: Date
): Date[] {
  const schedules: Date[] = [];
  const days = blockType.recurring_days_of_week ?? [];
  if (!days.length) {
    return schedules;
  }

  for (
    let dayOffset = 0;
    windowStart.getTime() + dayOffset * 24 * 60 * 60 * 1000 < windowEnd.getTime();
    dayOffset += 1
  ) {
    const currentDate = new Date(windowStart);
    currentDate.setDate(currentDate.getDate() + dayOffset);

    if (!days.includes(currentDate.getDay())) {
      continue;
    }

    const plannedStart = combineDateAndTime(
      currentDate,
      blockType.recurring_time_of_day
    );

    if (!plannedStart) {
      continue;
    }

    if (plannedStart.getTime() < Date.now()) {
      continue;
    }

    schedules.push(plannedStart);
  }

  return schedules;
}

export async function generateRecurringBlocks(
  options: GenerateRecurringBlocksOptions
): Promise<GenerateResult> {
  const { userId, startDate = new Date() } = options;

  const { data: blockTypes, error: blockTypesError } = await supabase
    .from('block_types')
    .select('*')
    .eq('user_id', userId)
    .eq('recurring_enabled', true)
    .eq('recurring_auto_create', true);

  if (blockTypesError) {
    throw new Error(blockTypesError.message);
  }

  if (!blockTypes || blockTypes.length === 0) {
    return { created: [], skipped: 0 };
  }

  const created: BlockInstance[] = [];
  let skipped = 0;

  for (const blockType of blockTypes) {
    const { windowStart, windowEnd } = getGenerationWindow(blockType, startDate);
    const plannedStarts = buildPlannedTimes(blockType, windowStart, windowEnd);

    if (plannedStarts.length === 0) {
      continue;
    }

    const { data: existingInstances, error: existingError } = await supabase
      .from('block_instances')
      .select('planned_start')
      .eq('block_type_id', blockType.id)
      .gte('planned_start', windowStart.toISOString())
      .lt('planned_start', windowEnd.toISOString());

    if (existingError) {
      throw new Error(existingError.message);
    }

    const existingStartTimes = new Set(
      (existingInstances ?? []).map((instance) =>
        new Date(instance.planned_start).getTime()
      )
    );

    const instancesToCreate = plannedStarts
      .filter((start) => !existingStartTimes.has(start.getTime()))
      .map((plannedStart) => {
        const plannedEnd = addMinutes(
          plannedStart,
          blockType.default_duration_minutes
        );

        return {
          user_id: userId,
          block_type_id: blockType.id,
          planned_start: plannedStart.toISOString(),
          planned_end: plannedEnd.toISOString(),
          status: 'scheduled' as BlockStatus,
        };
      });

    skipped += plannedStarts.length - instancesToCreate.length;

    if (instancesToCreate.length === 0) {
      continue;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('block_instances')
      .insert(instancesToCreate)
      .select();

    if (insertError) {
      throw new Error(insertError.message);
    }

    if (inserted) {
      created.push(...(inserted as BlockInstance[]));
    }
  }

  return { created, skipped };
}
