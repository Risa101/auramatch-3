const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export async function getFavoritesByUser(userId) {
  const res = await fetch(`${API_BASE}/favorites/${userId}`);
  if (!res.ok) throw new Error("โหลด favorite ไม่สำเร็จ");
  const json = await res.json();
  return json.data ?? [];
}

export async function toggleFavorite(userId, productId) {
  const res = await fetch(`${API_BASE}/favorites/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      product_id: productId,
    }),
  });
  if (!res.ok) throw new Error("toggle favorite ไม่สำเร็จ");
  return res.json();
}
