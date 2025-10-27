#!/usr/bin/env bun
/**
 * Assign a task to a block instance
 * Usage: bun run scripts/ai-helpers/assign-task-to-block.ts <task_id> <block_instance_id>
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function assignTaskToBlock(taskId: string, blockInstanceId: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ block_instance_id: blockInstanceId })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    console.log('Task assigned successfully:');
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error assigning task:', error);
    process.exit(1);
  }
}

const taskId = process.argv[2];
const blockInstanceId = process.argv[3];

if (!taskId || !blockInstanceId) {
  console.error('Usage: bun run scripts/ai-helpers/assign-task-to-block.ts <task_id> <block_instance_id>');
  process.exit(1);
}

await assignTaskToBlock(taskId, blockInstanceId);
