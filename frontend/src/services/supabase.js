import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if credentials are configured
export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your_') &&
  !supabaseAnonKey.includes('your_');

let supabase;

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(
    '⚠️ Supabase is not configured. Running in demo mode. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
  // Create a mock client that won't crash the app
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (_event, _callback) => ({
        data: { subscription: { unsubscribe: () => { } } },
      }),
      signUp: async () => { throw new Error('Supabase not configured. Please set up your .env file.'); },
      signInWithPassword: async () => { throw new Error('Supabase not configured. Please set up your .env file.'); },
      signOut: async () => ({ error: null }),
    },
  };
}

export { supabase };
