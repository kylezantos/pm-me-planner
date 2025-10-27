#!/usr/bin/env bun
/**
 * List all block types
 * Usage: bun run scripts/ai-helpers/list-block-types.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listBlockTypes() {
  try {
    const { data, error } = await supabase
      .from('block_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    console.log('Available Block Types:');
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching block types:', error);
    process.exit(1);
  }
}

await listBlockTypes();
