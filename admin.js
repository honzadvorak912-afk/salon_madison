// =============================================================
//  ADMIN - přihlášení, správa fotek, změna hesla
//  Heslo je uložené v Supabase (tabulka madison_settings) jako
//  SHA-256 hash, takže se synchronizuje napříč zařízeními.
// =============================================================

// --- pomocná: SHA-256 hash ---
async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// --- načti uložený hash hesla ze Supabase ---
async function getPasswordHash() {
  const { data, error } = await sb
    .from(CONFIG.SETTINGS_TABLE)
    .select("value")
    .eq("key", "admin_password_hash")
    .maybeSingle();
  if (error) { console.error(error); return null; }
  return data ? data.value : null;
}

// --- ulož nový hash hesla ---
async function setPasswordHash(hash) {
  const { error } = await sb
    .from(CONFIG.SETTINGS_TABLE)
    .upsert({ key: "admin_password_hash", value: hash }, { onConflict: "key" });
  if (error) throw error;
}

// ---------- LOGIN ----------
const loginScreen = document.getElementById("login-screen");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

function showPanel() {
  loginScreen.hidden = true;
  loginScreen.style.display = "none";   // přebije display:flex z CSS
  adminPanel.hidden = false;
  adminPanel.style.display = "block";
  sessionStorage.setItem("madison_admin", "1");
  initPanel();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "Ověřuji…";
  const pw = document.getElementById("pw").value;
  const stored = await getPasswordHash();
  if (stored === null) {
    loginError.textContent = "Heslo není nastavené v databázi. Spusťte prosím SQL skript (viz README).";
    return;
  }
  const entered = await sha256(pw);
  if (entered === stored) {
    loginError.textContent = "";
    showPanel();
  } else {
    loginError.textContent = "Nesprávné heslo.";
  }
});

// zůstat přihlášen do zavření karty
if (sessionStorage.getItem("madison_admin") === "1") showPanel();

document.getElementById("logout-btn")?.addEventListener("click", () => {
  sessionStorage.removeItem("madison_admin");
  location.reload();
});

// ---------- PANEL ----------
function initPanel() {
  const fileInput = document.getElementById("file-input");
  const pickBtn = document.getElementById("pick-btn");
  const dropArea = document.getElementById("drop-area");
  const captionInput = document.getElementById("caption-input");
  const uploadStatus = document.getElementById("upload-status");
  const adminGallery = document.getElementById("admin-gallery");
  const adminEmpty = document.getElementById("admin-empty");
  const photoCount = document.getElementById("photo-count");

  // --- výběr / drag&drop ---
  pickBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => handleFiles(fileInput.files));
  ["dragover", "dragenter"].forEach((ev) =>
    dropArea.addEventListener(ev, (e) => { e.preventDefault(); dropArea.classList.add("drag"); })
  );
  ["dragleave", "drop"].forEach((ev) =>
    dropArea.addEventListener(ev, (e) => { e.preventDefault(); dropArea.classList.remove("drag"); })
  );
  dropArea.addEventListener("drop", (e) => {
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  });

  async function handleFiles(files) {
    const caption = captionInput.value.trim();
    uploadStatus.innerHTML = "";
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const row = document.createElement("div");
      row.className = "row";
      row.textContent = `Nahrávám: ${file.name}…`;
      uploadStatus.appendChild(row);
      try {
        await uploadPhoto(file, caption);
        row.textContent = `✓ ${file.name}`;
        row.classList.add("ok");
      } catch (err) {
        console.error(err);
        row.textContent = `✗ ${file.name} – ${err.message || "chyba"}`;
        row.classList.add("err");
      }
    }
    captionInput.value = "";
    fileInput.value = "";
    loadGallery();
  }

  // --- výpis fotek ---
  async function loadGallery() {
    const photos = await fetchPhotos();
    photoCount.textContent = photos.length;
    adminGallery.innerHTML = "";
    adminEmpty.hidden = photos.length > 0;
    photos.forEach((p) => {
      const fig = document.createElement("figure");
      fig.className = "admin-thumb";
      fig.innerHTML = `<img src="${p.url}" alt="">` +
        (p.caption ? `<figcaption>${p.caption}</figcaption>` : "") +
        `<button class="del" title="Smazat">&times;</button>`;
      fig.querySelector(".del").addEventListener("click", async () => {
        if (!confirm("Opravdu smazat tuto fotku?")) return;
        try { await deletePhoto(p); loadGallery(); }
        catch (err) { alert("Chyba při mazání: " + (err.message || err)); }
      });
      adminGallery.appendChild(fig);
    });
  }
  loadGallery();

  // --- poznámky / oznámení ---
  const noteForm = document.getElementById("note-form");
  const noteInput = document.getElementById("note-input");
  const notesAdminList = document.getElementById("notes-admin-list");
  const notesAdminEmpty = document.getElementById("notes-admin-empty");
  const noteCount = document.getElementById("note-count");

  async function loadNotes() {
    const notes = await fetchNotes();
    noteCount.textContent = notes.length;
    notesAdminList.innerHTML = "";
    notesAdminEmpty.hidden = notes.length > 0;
    notes.forEach((n) => {
      const date = new Date(n.created_at).toLocaleDateString("cs-CZ");
      const row = document.createElement("div");
      row.className = "note-row";
      row.innerHTML = `<div><span class="note-row-date">${date}</span>` +
        `<p>${n.text.replace(/</g, "&lt;")}</p></div>` +
        `<button class="del" title="Smazat">&times;</button>`;
      row.querySelector(".del").addEventListener("click", async () => {
        if (!confirm("Opravdu smazat toto oznámení?")) return;
        try { await deleteNote(n.id); loadNotes(); }
        catch (err) { alert("Chyba při mazání: " + (err.message || err)); }
      });
      notesAdminList.appendChild(row);
    });
  }
  loadNotes();

  noteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = noteInput.value.trim();
    if (!text) return;
    try { await addNote(text); noteInput.value = ""; loadNotes(); }
    catch (err) { alert("Chyba při ukládání: " + (err.message || err)); }
  });

  // --- změna hesla ---
  const pwForm = document.getElementById("pw-form");
  const pwStatus = document.getElementById("pw-status");
  pwForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    pwStatus.className = "form-status";
    const oldPw = document.getElementById("old-pw").value;
    const newPw = document.getElementById("new-pw").value;
    const newPw2 = document.getElementById("new-pw2").value;

    if (newPw !== newPw2) {
      pwStatus.textContent = "Nová hesla se neshodují.";
      pwStatus.classList.add("err"); return;
    }
    const stored = await getPasswordHash();
    if ((await sha256(oldPw)) !== stored) {
      pwStatus.textContent = "Současné heslo není správné.";
      pwStatus.classList.add("err"); return;
    }
    try {
      await setPasswordHash(await sha256(newPw));
      pwStatus.textContent = "Heslo bylo úspěšně změněno.";
      pwStatus.classList.add("ok");
      pwForm.reset();
    } catch (err) {
      pwStatus.textContent = "Chyba při ukládání: " + (err.message || err);
      pwStatus.classList.add("err");
    }
  });
}
