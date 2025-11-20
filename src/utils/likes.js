// src/utils/likes.js
// จัดการรายการลุคที่ถูกใจ (favorites) แบบ hybrid:
// - ทำงานได้ทันทีด้วย localStorage
// - ถ้ามี Firebase (export { auth, db } จาก src/lib/firebase.js) จะ sync แบบ realtime ได้

const KEY = "auramatch:likes"; // เก็บ array ของ payload {id,title,season,img,tags,ext}

// ---------- Local helpers ----------
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  // แจ้งทุกคอมโพเนนต์ในแท็บเดียวกัน
  window.dispatchEvent(new Event("likes:changed"));
}
function uniqPush(list, item) {
  if (!list.find((x) => x.id === item.id)) list.unshift(item);
  return list;
}
export function getLikes() {
  return load();
}
export function subscribeLikes(cb) {
  const handler = () => cb(load());
  handler();
  window.addEventListener("storage", handler);
  window.addEventListener("likes:changed", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("likes:changed", handler);
  };
}
export function likeLook(payload) {
  const list = load();
  uniqPush(list, {
    id: payload.id,              // e.g. `${season}:${title}`
    title: payload.title,
    season: payload.season,
    img: payload.img,
    tags: payload.tags || [],
    ext: payload.ext || "#",
  });
  save(list.slice(0, 50));
}
export function unlikeLook(id) {
  const list = load().filter((x) => x.id !== id);
  save(list);
}
