const KEY = "auramatch:likes";

export function getLikes() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function isLiked(id) {
  const likes = getLikes();
  return likes.some(item => item.id === id);
}

export function toggleLike(item) {
  let likes = getLikes();
  const exists = likes.find(it => it.id === item.id);

  if (exists) {
    likes = likes.filter(it => it.id !== item.id);
  } else {
    likes.push(item);
  }

  localStorage.setItem(KEY, JSON.stringify(likes));
  // ยิง Event แจ้งเตือนหน้าอื่นๆ เช่น หน้า AccountProfile
  window.dispatchEvent(new Event("likes:updated"));
}

export function subscribeLikes(callback) {
  const handler = () => callback(getLikes());
  window.addEventListener("likes:updated", handler);
  window.addEventListener("storage", handler);
  callback(getLikes());
  return () => {
    window.removeEventListener("likes:updated", handler);
    window.removeEventListener("storage", handler);
  };
}