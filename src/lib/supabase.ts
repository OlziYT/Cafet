import { createClient } from '@supabase/supabase-js';
import { useAuthStore } from '../store/auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials are missing');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

// Initialize auth state from stored session
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    useAuthStore.getState().login({
      id: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata.name,
      role: session.user.user_metadata.role || 'user'
    });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.getState().logout();
  }
});