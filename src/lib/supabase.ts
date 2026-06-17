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
const targetKey = isSupabaseConfigured() ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsam94YmVvcHZsbGNuZGxiaWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2ODA2MzYsImV4cCI6MjA5NzI1NjYzNn0.DP6qlUMZAfjVqng2JOMSrE5c2Ecz0riqiHbG_BSPciY';

export const supabase = createClient(targetUrl, targetKey);
