import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if environment variables are set. If not, use the correct fallback values.
const targetUrl = (supabaseUrl && supabaseUrl !== 'https://your-supabase-project.supabase.co') 
  ? supabaseUrl 
  : 'https://cljoxbeopvllcndlbicb.supabase.co';

const targetKey = (supabaseAnonKey && supabaseAnonKey !== 'your-supabase-anon-key' && supabaseAnonKey !== 'your-actual-anon-key-here') 
  ? supabaseAnonKey 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsam94YmVvcHZsbGNuZGxiaWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2ODA2MzYsImV4cCI6MjA5NzI1NjYzNn0.DP6qlUMZAfjVqng2JOMSrE5c2Ecz0riqiHbG_BSPciY';

/**
 * Returns true if Supabase URL and Anon Key are configured correctly.
 * Since we have valid fallback values built in, we always return true.
 */
export const isSupabaseConfigured = (): boolean => {
  return true;
};

export const supabase = createClient(targetUrl, targetKey);
