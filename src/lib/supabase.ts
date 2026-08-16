import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Supabase client, or null when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 * are not set. Callers must check `isSupabaseConfigured` before using it so
 * the app keeps working in simulated demo mode.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : null;
