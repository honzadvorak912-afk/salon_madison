// =============================================================
//  SUPABASE - sdílený klient + funkce pro galerii
//  Vyžaduje: config.js a knihovnu @supabase/supabase-js (CDN)
// =============================================================

const sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// --- načti fotky (seřazené, nejnovější první) ---
async function fetchPhotos() {
  const { data, error } = await sb
    .from(CONFIG.PHOTOS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("Chyba načítání fotek:", error); return []; }
  return data || [];
}

// --- nahraj fotku do storage + zapiš řádek do tabulky ---
async function uploadPhoto(file, caption = "") {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: upErr } = await sb.storage
    .from(CONFIG.STORAGE_BUCKET)
    .upload(fileName, file, { cacheControl: "3600", upsert: false });
  if (upErr) throw upErr;

  const { data: pub } = sb.storage.from(CONFIG.STORAGE_BUCKET).getPublicUrl(fileName);

  const { error: insErr } = await sb
    .from(CONFIG.PHOTOS_TABLE)
    .insert([{ url: pub.publicUrl, path: fileName, caption }]);
  if (insErr) throw insErr;

  return pub.publicUrl;
}

// --- smaž fotku (z tabulky i ze storage) ---
async function deletePhoto(photo) {
  if (photo.path) {
    await sb.storage.from(CONFIG.STORAGE_BUCKET).remove([photo.path]);
  }
  const { error } = await sb.from(CONFIG.PHOTOS_TABLE).delete().eq("id", photo.id);
  if (error) throw error;
}

// --- realtime: zavolá callback při jakékoliv změně fotek ---
function subscribePhotos(callback) {
  return sb
    .channel("madison-photos-changes")
    .on("postgres_changes",
        { event: "*", schema: "public", table: CONFIG.PHOTOS_TABLE },
        () => callback())
    .subscribe();
}

// =============================================================
//  POZNÁMKY / OZNÁMENÍ
// =============================================================

// --- načti poznámky (nejnovější první) ---
async function fetchNotes() {
  const { data, error } = await sb
    .from(CONFIG.NOTES_TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("Chyba načítání poznámek:", error); return []; }
  return data || [];
}

// --- přidej poznámku ---
async function addNote(text) {
  const { error } = await sb.from(CONFIG.NOTES_TABLE).insert([{ text }]);
  if (error) throw error;
}

// --- smaž poznámku ---
async function deleteNote(id) {
  const { error } = await sb.from(CONFIG.NOTES_TABLE).delete().eq("id", id);
  if (error) throw error;
}

// --- realtime poznámek ---
function subscribeNotes(callback) {
  return sb
    .channel("madison-notes-changes")
    .on("postgres_changes",
        { event: "*", schema: "public", table: CONFIG.NOTES_TABLE },
        () => callback())
    .subscribe();
}
