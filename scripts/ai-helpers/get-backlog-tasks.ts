#!/usr/bin/env bun
/**
 * Get backlog tasks (unassigned tasks)
 * Usage: bun run scripts/ai-helpers/get-backlog-tasks.ts [block_type_id]
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getBacklogTasks(blockTypeId?: string) {
  try {
    let query = supabase
      .from('tasks')
      .select('*')
      .is('block_instance_id', null)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (blockTypeId) {
      query = query.eq('block_type_id', blockTypeId);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching backlog tasks:', error);
    process.exit(1);
  }
}

// Get block_type_id from command line args
const blockTypeId = process.argv[2];
await getBacklogTasks(blockTypeId);
