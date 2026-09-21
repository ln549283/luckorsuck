import { supabase } from './supabase';

export async function ensureAnonymousSession() {
  const { data: sessionData } = await supabase.auth.getSession();

  if (sessionData.session) {
    return sessionData.session;
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) throw error;

  return data.session;
}
