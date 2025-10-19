import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});

// Helper function to test database connection
// This uses the auth endpoint to verify we can connect to Supabase
export async function testConnection(): Promise<boolean> {
  try {
    // Try to get the current session (will return null if not logged in, but proves connection works)
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return false;
  }
}
