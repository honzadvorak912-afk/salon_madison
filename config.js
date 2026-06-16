// =============================================================
//  KONFIGURACE - SALÓN MADISON
//  Údaje z Supabase (Project Settings → API Keys)
//  Používá se "publishable" klíč (bezpečný pro prohlížeč při zapnutém RLS).
//  NIKDY sem nedávej "secret" klíč!
// =============================================================

const CONFIG = {
  // Project URL
  SUPABASE_URL: "https://ueqxkztwgbhgqowugzqn.supabase.co",

  // Publishable (browser-safe) klíč
  SUPABASE_ANON_KEY: "sb_publishable_-eOlckyZhQgo4IuCZrupPQ_zbA5HgXj",

  // Tabulka s fotkami (oddělená od Penzionu)
  PHOTOS_TABLE: "madison_photos",

  // Tabulka s nastavením (heslo admina)
  SETTINGS_TABLE: "madison_settings",

  // Tabulka s poznámkami (oznámení na webu)
  NOTES_TABLE: "madison_notes",

  // Storage bucket pro fotky
  STORAGE_BUCKET: "madison-gallery",
};
