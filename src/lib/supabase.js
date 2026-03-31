import { createClient } from "@supabase/supabase-js";
import { appConfig, getConfigError } from "../config/appconfig";

const configError = getConfigError();

export const hasSupabaseEnv = !configError;

export const supabase = hasSupabaseEnv
  ? createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey)
  : null;

export async function ensureGuestSession() {
  if (!supabase) {
    throw new Error(configError);
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (sessionData.session) return sessionData.session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;

  return data.session;
}

export function getSupabaseConfigError() {
  return configError;
}