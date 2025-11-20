const BUS_EVENT = "auramatch:update";

export function lsGet(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; }
  catch { return fallback; }
}
export function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  // แจ้งทุกหน้าว่ามีการอัปเดต (dashboard/profile จะรีเฟรชตัวเอง)
  window.dispatchEvent(new Event(BUS_EVENT));
}
export function onBus(cb) {
  const h = () => cb();
  window.addEventListener(BUS_EVENT, h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener(BUS_EVENT, h);
    window.removeEventListener("storage", h);
  };
}
