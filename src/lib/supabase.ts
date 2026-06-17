import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Returns true if Supabase URL and Anon Key are configured correctly.
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
    supabaseAnonKey !== 'your-supabase-anon-key' &&
    supabaseAnonKey !== 'your-actual-anon-key-here'
  );
};

// Safety initialization for local fallback or build-time compilation
const targetUrl = isSupabaseConfigured() ? supabaseUrl : 'https://cljoxbeopvllcndlbicb.supabase.co';
const targetKey = isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key-prevent-crash';

export const supabase = createClient(targetUrl, targetKey);
