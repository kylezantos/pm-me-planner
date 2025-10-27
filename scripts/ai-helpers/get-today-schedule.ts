#!/usr/bin/env bun
/**
 * Get today's schedule (blocks and tasks)
 * Usage: bun run scripts/ai-helpers/get-today-schedule.ts
 */

import { createClient } from '@supabase/supabase-js';
import { startOfDay, endOfDay } from 'date-fns';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getTodaySchedule() {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today).toISOString();
    const endOfToday = endOfDay(today).toISOString();

    // Get today's block instances with their tasks
    const { data: blocks, error: blocksError } = await supabase
      .from('block_instances')
      .select(`
        *,
        block_type:block_types(*),
        tasks(*)
      `)
      .gte('planned_start', startOfToday)
      .lt('planned_start', endOfToday)
      .order('planned_start', { ascending: true });

    if (blocksError) throw blocksError;

    console.log('Today\'s Schedule:');
    console.log(JSON.stringify(blocks, null, 2));
    return blocks;
  } catch (error) {
    console.error('Error fetching today\'s schedule:', error);
    process.exit(1);
  }
}

await getTodaySchedule();
