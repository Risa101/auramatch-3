// src/utils/coupon.js
export function makeCouponCode(prefix = "WELCOME") {
  const seed = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${seed}`;
}

function isExpired(ts) {
  return typeof ts === "number" && Date.now() > ts;
}

// แจ้งให้ UI ทุกที่อัปเดตเมื่อคูปองเปลี่ยน
export function notifyCouponChanged() {
  try {
    window.dispatchEvent(new Event("coupon:changed"));
  } catch {}
}

export async function getOrCreateWelcomeCoupon(user) {
  const uid = user?.uid || "guest";
  const KEY = "auramatch:coupon";
  const KEY_UID = "auramatch:coupon_last_uid";

  let current = null;
  try {
    current = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    current = null;
  }

  const needNew =
    !current ||
    current?.uid !== uid ||
    current?.status !== "active" ||
    isExpired(current?.validUntil);

  if (needNew) {
    const code = makeCouponCode("WELCOME");
    const validUntil = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 วัน

    current = {
      code,
      uid,
      status: "active",
      discount: 10,
      validUntil,
      createdAt: Date.now(),
      type: "welcome",
    };

    localStorage.setItem(KEY, JSON.stringify(current));
    localStorage.setItem(KEY_UID, uid);
  }

  notifyCouponChanged();
  return current;
}

export function clearCoupon() {
  localStorage.removeItem("auramatch:coupon");
  localStorage.removeItem("auramatch:coupon_used");
  localStorage.removeItem("auramatch:coupon_last_uid");
  notifyCouponChanged();
}
