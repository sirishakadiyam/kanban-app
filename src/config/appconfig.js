const envUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const appConfig = {
  supabaseUrl: envUrl || "https://bknzvargvlgooyqfarej.supabase.co",
  supabaseAnonKey: envKey || "sb_publishable_vkdsNoV-h_RSEQep3hB44A_Ka_rwnFD",
};

export function getConfigError() {
  if (
    !appConfig.supabaseUrl || 
    appConfig.supabaseUrl === "PASTE_YOUR_SUPABASE_URL_HERE"
  ) {
    return "Supabase URL is missing. Add VITE_SUPABASE_URL to .env or paste the URL into src/config/appConfig.js.";
  }

  if (
    !appConfig.supabaseAnonKey ||
    appConfig.supabaseAnonKey === "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE"
  ) {
    return "Supabase publishable key is missing. Add VITE_SUPABASE_ANON_KEY to .env or paste the key into src/config/appConfig.js.";
  }

  try {
    new URL(appConfig.supabaseUrl);
  } catch {
    return "Supabase URL is not a valid URL.";
  }

  return "";
}
