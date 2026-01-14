import React, { useEffect, useMemo, useState, useCallback } from "react";
import { getdatapromotions } from "../callapi/call_api_user";
import AOS from "aos";
import "aos/dist/aos.css";

const PAGE_SIZE = 4;

export default function Coupons() {
  const [promotions, setPromotions] = useState([]);
  const [query, setQuery] = useState("");
  const [activeBrand, setActiveBrand] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [page, setPage] = useState(1);

  /* INIT */
  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-out", once: true });
  }, []);

  /* FETCH */
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getdatapromotions();
        setPromotions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("โหลดโปรโมชั่นไม่สำเร็จ", err);
        setPromotions([]);
      }
    }
    fetchData();
  }, []);

  /* IMAGE PATH */
  const getImageUrl = useCallback((logoUrl) => {
    if (!logoUrl || logoUrl === "null") {
      return "https://images.unsplash.com/photo-1596462502278-27bfac4033c8?q=80&w=200";
    }
    if (logoUrl.startsWith("http")) return logoUrl;
    return `/assets${logoUrl}`;
  }, []);

  /* DATE */
  const isExpired = (endDate) =>
    endDate ? new Date(endDate) < new Date() : false;

  /* BRAND LIST */
  const brands = useMemo(() => {
    const list = promotions.map(p => p.brand_name).filter(Boolean);
    return ["all", ...new Set(list)];
  }, [promotions]);

  /* FILTER */
  const filtered = useMemo(() => {
    let items = [...promotions];

    if (activeBrand !== "all") {
      items = items.filter(p => p.brand_name === activeBrand);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        p =>
          p.brand_name?.toLowerCase().includes(q) ||
          p.coupon_code?.toLowerCase().includes(q) ||
          p.promo_name?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [promotions, activeBrand, query]);

  /* PAGINATION */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  /* USE COUPON */
  const useCoupon = async (code, id, expired) => {
    if (expired || !code) return;
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] pb-32">
      <main className="max-w-6xl mx-auto px-6 pt-20">

        {/* COUPONS */}
        <div className="grid gap-12">
          {paginated.map((promo) => {
            const expired = isExpired(promo.end_date);

            return (
              <div
                key={promo.promotion_id}
                className={`flex flex-col md:flex-row bg-white border ${
                  expired ? "opacity-50 grayscale" : "hover:shadow-xl"
                }`}
              >
                {/* LOGO */}
                <div className="md:w-1/4 p-10 bg-[#F9F9F9] flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-white shadow mb-4 flex items-center justify-center p-4">
                    <img
                      src={getImageUrl(promo.logo_url)}
                      alt={promo.brand_name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-black tracking-widest uppercase">
                    {promo.brand_name}
                  </span>
                </div>

                {/* INFO */}
                <div className="flex-1 p-12">
                  <h3 className="text-4xl font-serif italic mb-4">
                    {promo.promo_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    {promo.promo_detail}
                  </p>
                </div>

                {/* CODE */}
                <div className="md:w-1/3 p-12 bg-black text-center text-white">
                  <p className="text-xs tracking-[0.5em] text-[#C5A358] mb-4">
                    YOUR CODE
                  </p>
                  <p className="text-3xl font-mono font-black tracking-widest mb-8">
                    {promo.coupon_code || "-"}
                  </p>

                  <button
                    onClick={() =>
                      useCoupon(promo.coupon_code, promo.promotion_id, expired)
                    }
                    disabled={expired || !promo.coupon_code}
                    className="w-full py-4 text-xs font-black tracking-[0.4em] uppercase bg-white text-black"
                  >
                    {copiedId === promo.promotion_id ? "COPIED ✓" : "REDEEM NOW"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-24 flex justify-center gap-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`w-14 h-14 font-black text-xs border ${
                  page === num ? "bg-black text-white" : "bg-white text-gray-400"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
