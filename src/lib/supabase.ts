import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://qndtxtwwuqofmlncwweq.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZHR4dHd3dXFvZm1sbmN3d2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MTU1NzcsImV4cCI6MjEwMDk5MTU3N30.IKx7MQ-YbAhsWjFIqhxT4A6gj9bCUHAcW2A-mDv9P9g';

const getValidUrl = (url: any): string => {
  if (!url || typeof url !== 'string') return DEFAULT_URL;
  const trimmed = url.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed || trimmed === 'undefined' || !trimmed.startsWith('http')) return DEFAULT_URL;
  return trimmed;
};

const getValidKey = (key: any): string => {
  if (!key || typeof key !== 'string') return DEFAULT_KEY;
  const trimmed = key.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed || trimmed === 'undefined' || trimmed.length < 10) return DEFAULT_KEY;
  return trimmed;
};

const supabaseUrl = getValidUrl((import.meta as any).env?.VITE_SUPABASE_URL);
const supabaseAnonKey = getValidKey((import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isDemoModeActive = (): boolean => {
  return localStorage.getItem('everglow_demo_mode') === 'true';
};

export const setDemoModeState = (enabled: boolean): void => {
  localStorage.setItem('everglow_demo_mode', enabled ? 'true' : 'false');
  window.dispatchEvent(new Event('demo_mode_changed'));
};
