import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://qndtxtwwuqofmlncwweq.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZHR4dHd3dXFvZm1sbmN3d2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MTU1NzcsImV4cCI6MjEwMDk5MTU3N30.IKx7MQ-YbAhsWjFIqhxT4A6gj9bCUHAcW2A-mDv9P9g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isDemoModeActive = (): boolean => {
  return localStorage.getItem('everglow_demo_mode') === 'true';
};

export const setDemoModeState = (enabled: boolean): void => {
  localStorage.setItem('everglow_demo_mode', enabled ? 'true' : 'false');
  window.dispatchEvent(new Event('demo_mode_changed'));
};
