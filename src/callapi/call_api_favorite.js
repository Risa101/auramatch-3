export async function getFavoritesByUser(userId) {
  const res = await fetch(`http://127.0.0.1:5010/favorites/${userId}`);
  if (!res.ok) throw new Error("โหลด favorite ไม่สำเร็จ");
  const json = await res.json();
  return json.data ?? [];
}

export async function toggleFavorite(userId, productId) {
  const res = await fetch(`http://127.0.0.1:5010/favorites/toggle`, {
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
