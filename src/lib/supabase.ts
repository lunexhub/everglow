import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = 'https://qndtxtwwuqofmlncwweq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZHR4dHd3dXFvZm1sbmN3d2VxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQxNTU3NywiZXhwIjoyMTAwOTkxNTc3fQ.C2kDVSsUkaLVKuEUK_ac_o3fDnNL0hH7xv-el2jB8uA';

const getValidUrl = (raw: any): string => {
  if (!raw || typeof raw !== 'string') return SUPABASE_PROJECT_URL;
  const clean = raw.replace(/[\r\n\t ]+/g, '').replace(/^['"]|['"]$/g, '');
  if (!clean || clean === 'undefined' || !clean.startsWith('http')) return SUPABASE_PROJECT_URL;
  return clean;
};

const getValidKey = (raw: any): string => {
  if (!raw || typeof raw !== 'string') return SUPABASE_ANON_KEY;
  const clean = raw.replace(/[\r\n\t ]+/g, '').replace(/^['"]|['"]$/g, '');
  if (!clean || clean === 'undefined' || clean.length < 20) return SUPABASE_ANON_KEY;
  return clean;
};

const supabaseUrl = getValidUrl((import.meta as any).env?.VITE_SUPABASE_URL);
const supabaseAnonKey = getValidKey((import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export const isDemoModeActive = (): boolean => {
  return localStorage.getItem('everglow_demo_mode') === 'true';
};

export const setDemoModeState = (enabled: boolean): void => {
  localStorage.setItem('everglow_demo_mode', enabled ? 'true' : 'false');
  window.dispatchEvent(new Event('demo_mode_changed'));
};
