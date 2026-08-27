import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'agenda_oss_supabase_url';
const STORAGE_KEY_KEY = 'agenda_oss_supabase_anon_key';

const DEFAULT_SUPABASE_URL = 'https://odusjvvrheqdgqhiohnz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_QneHTa9ATLWYYGdnOoAAHow_uXpyyUkA';

/**
 * Retrieves Supabase URL and Anon Key from Vite environment variables or localStorage.
 * Trims whitespace, removes trailing slashes, and ignores placeholder dummy values.
 */
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL)?.trim() : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY)?.trim() : '';

  const isPlaceholder = (val?: string) => !val || val.includes('your-project-id') || val.includes('xyzcompany') || val.includes('placeholder');

  let url = (!isPlaceholder(localUrl) ? localUrl : '') || (!isPlaceholder(envUrl) ? envUrl : '') || (localUrl || envUrl || '') || DEFAULT_SUPABASE_URL;
  let anonKey = (!isPlaceholder(localKey) ? localKey : '') || (!isPlaceholder(envKey) ? envKey : '') || (localKey || envKey || '') || DEFAULT_SUPABASE_ANON_KEY;

  // Strip trailing slashes from URL
  if (url && url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  return { url, anonKey };
}

/**
 * Checks whether valid Supabase credentials have been configured.
 */
export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('http') &&
    anonKey.length > 10 &&
    !url.includes('your-project-id.supabase.co') &&
    !url.includes('placeholder-project')
  );
}

/**
 * Persists custom Supabase credentials to localStorage.
 */
export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    let cleanUrl = url.trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    reinitializeSupabaseClient();
  }
}

/**
 * Clears custom credentials stored in localStorage.
 */
export function clearCustomSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

// Fallback dummy client if credentials aren't set yet, to avoid runtime crash on module load
const { url, anonKey } = getSupabaseCredentials();
const activeUrl = url && url.startsWith('http') ? url : 'https://placeholder-project.supabase.co';
const activeKey = anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export let supabase: SupabaseClient = createClient(activeUrl, activeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Re-instantiates the Supabase client when new credentials are saved.
 */
export function reinitializeSupabaseClient(): SupabaseClient {
  const { url: newUrl, anonKey: newKey } = getSupabaseCredentials();
  const validUrl = newUrl && newUrl.startsWith('http') ? newUrl : 'https://placeholder-project.supabase.co';
  const validKey = newKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

  supabase = createClient(validUrl, validKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return supabase;
}
