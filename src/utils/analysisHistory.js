// src/utils/analysisHistory.js
const KEY = "auramatch:analysisHistory";

/* ---------- core helpers ---------- */
export function readHistory() {
  try {
    const raw = localStorage.getItem(KEY) || "[]";
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeHistory(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    // ยิงสองชื่ออีเวนต์เพื่อให้ทุกหน้าที่ฟังคนละชื่อก็รับได้
    window.dispatchEvent(new Event("history:updated"));
    window.dispatchEvent(new Event("history:changed"));
  } catch {}
}

/* ---------- public apis ---------- */
export function addHistory(entry) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // เผื่อ entry จากหน้าอื่นส่ง field ไม่ครบ เราจะ normalize ให้
  const row = {
    id,
    createdAt: Date.now(),           // ตัวหลักที่หน้า History ใช้
    ts: Date.now(),                  // สำรอง เผื่อโค้ดเก่าบางที่ยังอ่าน ts
    season: entry?.season ?? null,
    faceShape: entry?.faceShape ?? null,
    preview: entry?.preview || "",
    face: entry?.face ?? null,
    hairLength: entry?.hairLength ?? null,
    hairTexture: entry?.hairTexture ?? null,
    uid: safeUser()?.uid || null,
  };

  const list = readHistory();
  const next = [row, ...list].slice(0, 50);
  writeHistory(next);
  return row;
}

export function removeHistory(id) {
  const next = readHistory().filter((x) => x.id !== id);
  writeHistory(next);
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("history:updated"));
    window.dispatchEvent(new Event("history:changed"));
  } catch {}
}

export function applyToProfile(entry) {
  try {
    const u = safeUser() || {};
    const updated = {
      ...u,
      lastSeason: entry?.season ?? u.lastSeason ?? null,
      lastFaceShape: entry?.faceShape ?? u.lastFaceShape ?? null,
      lastAnalysis: {
        season: entry?.season ?? null,
        faceShape: entry?.faceShape ?? null,
        face: entry?.face ?? null,
        hairLength: entry?.hairLength ?? null,
        hairTexture: entry?.hairTexture ?? null,
        preview: entry?.preview || "",
        ts: Date.now(),
        createdAt: Date.now(),
      },
    };
    localStorage.setItem("auramatch:user", JSON.stringify(updated));
    window.dispatchEvent(new Event("user:updated"));
  } catch {}
}

/* ---------- utils ---------- */
function safeUser() {
  try {
    return JSON.parse(localStorage.getItem("auramatch:user") || "null");
  } catch {
    return null;
  }
}
