#!/usr/bin/env bun
/**
 * Create a new block instance
 * Usage: bun run scripts/ai-helpers/create-block-instance.ts <block_type_id> <start_time> <end_time>
 * Example: bun run scripts/ai-helpers/create-block-instance.ts "uuid" "2025-10-27T09:00:00Z" "2025-10-27T11:00:00Z"
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createBlockInstance(blockTypeId: string, startTime: string, endTime: string) {
  try {
    const { data, error } = await supabase
      .from('block_instances')
      .insert({
        block_type_id: blockTypeId,
        planned_start: startTime,
        planned_end: endTime,
        status: 'scheduled',
      })
      .select(`
        *,
        block_type:block_types(*)
      `)
      .single();

    if (error) throw error;

    console.log('Block instance created successfully:');
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error creating block instance:', error);
    process.exit(1);
  }
}

const blockTypeId = process.argv[2];
const startTime = process.argv[3];
const endTime = process.argv[4];

if (!blockTypeId || !startTime || !endTime) {
  console.error('Usage: bun run scripts/ai-helpers/create-block-instance.ts <block_type_id> <start_time> <end_time>');
  console.error('Example: bun run scripts/ai-helpers/create-block-instance.ts "uuid" "2025-10-27T09:00:00Z" "2025-10-27T11:00:00Z"');
  process.exit(1);
}

await createBlockInstance(blockTypeId, startTime, endTime);
