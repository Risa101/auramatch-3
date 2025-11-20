// src/components/DiscountBanner.jsx
import { useEffect, useState } from "react";

const KEY = "auramatch:coupon";

export default function DiscountBanner() {
  const [coupon, setCoupon] = useState(null);

  const readCoupon = () => {
    const logged = localStorage.getItem("auramatch:isLoggedIn") === "true";
    if (!logged) return setCoupon(null);

    try {
      const c = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!c) return setCoupon(null);
      if (c.status !== "active") return setCoupon(null);
      if (Date.now() > c.validUntil) return setCoupon(null);
      setCoupon(c);
    } catch {
      setCoupon(null);
    }
  };

  useEffect(() => {
    readCoupon();
    const onStorage = (e) => {
      if (
        e.key === null ||
        e.key === KEY ||
        e.key === "auramatch:isLoggedIn"
      ) {
        readCoupon();
      }
    };
    const onCustom = () => readCoupon();

    window.addEventListener("storage", onStorage);
    window.addEventListener("coupon:changed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("coupon:changed", onCustom);
    };
  }, []);

  if (!coupon) return null;

  const daysLeft = Math.max(
    0,
    Math.ceil((coupon.validUntil - Date.now()) / (24 * 60 * 60 * 1000))
  );

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(coupon.code);
        alert("Copied discount code!");
      } else {
        window.prompt("Copy this code:", coupon.code);
      }
    } catch {}
  };

  return (
    <div
      className="mx-auto my-2 w-full max-w-7xl rounded-xl px-4 py-3 text-[#75464A] backdrop-blur"
      style={{
        background:
          "linear-gradient(90deg, rgba(255,179,198,.25), rgba(230,220,235,.25))",
        border: "1px solid #E6DCEB",
      }}
      role="region"
      aria-label="Discount banner"
    >
      <div className="flex flex-wrap items-center gap-3">
        <strong>Welcome coupon</strong>
        <span className="rounded-md bg-white/70 px-2 py-1 font-semibold">
          {coupon.code}
        </span>
        <button
          onClick={copy}
          className="rounded-md border px-3 py-1 text-sm hover:bg-white"
          style={{ borderColor: "#E6DCEB" }}
        >
          Copy
        </button>
        <span className="ml-auto text-sm opacity-70">
          {daysLeft} days left · {coupon.discount}% off
        </span>
      </div>
    </div>
  );
}
