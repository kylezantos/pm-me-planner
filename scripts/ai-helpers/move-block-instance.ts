#!/usr/bin/env bun
/**
 * Move/reschedule a block instance
 * Usage: bun run scripts/ai-helpers/move-block-instance.ts <block_instance_id> <new_start_time> <new_end_time>
 * Example: bun run scripts/ai-helpers/move-block-instance.ts "uuid" "2025-10-27T14:00:00Z" "2025-10-27T16:00:00Z"
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function moveBlockInstance(blockInstanceId: string, newStartTime: string, newEndTime: string) {
  try {
    const { data, error } = await supabase
      .from('block_instances')
      .update({
        planned_start: newStartTime,
        planned_end: newEndTime,
      })
      .eq('id', blockInstanceId)
      .select(`
        *,
        block_type:block_types(*)
      `)
      .single();

    if (error) throw error;

    console.log('Block instance rescheduled successfully:');
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error moving block instance:', error);
    process.exit(1);
  }
}

const blockInstanceId = process.argv[2];
const newStartTime = process.argv[3];
const newEndTime = process.argv[4];

if (!blockInstanceId || !newStartTime || !newEndTime) {
  console.error('Usage: bun run scripts/ai-helpers/move-block-instance.ts <block_instance_id> <new_start_time> <new_end_time>');
  console.error('Example: bun run scripts/ai-helpers/move-block-instance.ts "uuid" "2025-10-27T14:00:00Z" "2025-10-27T16:00:00Z"');
  process.exit(1);
}

await moveBlockInstance(blockInstanceId, newStartTime, newEndTime);
