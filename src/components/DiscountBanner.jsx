// src/components/DiscountBanner.jsx
import { useEffect, useState } from "react";

const KEY = "auramatch:coupon";

export default function DiscountBanner() {
  const [coupon, setCoupon] = useState(null);
  const [copied, setCopied] = useState(false);

  const readCoupon = () => {
    const logged = localStorage.getItem("auramatch:isLoggedIn") === "true";
    if (!logged) {
      setCoupon(null);
      return;
    }
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || "null");
      if (c && c.status === "active" && Date.now() <= c.validUntil) {
        setCoupon(c);
      } else {
        setCoupon(null);
      }
    } catch {
      setCoupon(null);
    }
  };

  useEffect(() => {
    readCoupon();
    window.addEventListener("auth:changed", readCoupon);
    window.addEventListener("coupon:changed", readCoupon);
    window.addEventListener("storage", readCoupon);
    return () => {
      window.removeEventListener("auth:changed", readCoupon);
      window.removeEventListener("coupon:changed", readCoupon);
      window.removeEventListener("storage", readCoupon);
    };
  }, []);

  if (!coupon) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      window.prompt("Your exclusive code:", coupon.code);
    }
  };

  return (
    <div className="relative w-full bg-[#FDFCFB] px-8 mt-[90px] pb-4 animate-fade-in z-[40]">
      <div 
        className="group relative overflow-hidden rounded-[2rem] border bg-white/50 px-8 py-5 backdrop-blur-xl transition-all duration-700 hover:shadow-lg hover:shadow-[#C5A358]/5 mx-auto max-w-[1400px]"
        style={{ borderColor: "rgba(197, 163, 88, 0.15)" }}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div className="hidden border-r border-gray-100 pr-8 lg:block">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C5A358]">Privilege</span>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#1A1A1A] mb-1">The Atelier Welcome Gift</h3>
              <p className="text-sm font-serif italic text-gray-400">Enjoy {coupon.discount}% off on your next selection.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center bg-white/80 border border-gray-100 rounded-full px-5 py-2.5 transition-all group-hover:border-[#C5A358]/30">
              <span className="text-xs font-bold tracking-[0.2em] text-[#1A1A1A] mr-4">{coupon.code}</span>
              <div className="w-[1px] h-3 bg-gray-200 mr-4" />
              <button 
                onClick={copy} 
                className={`text-[10px] font-bold uppercase tracking-widest transition-all ${copied ? "text-green-500" : "text-[#C5A358] hover:text-[#1A1A1A]"}`}
              >
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
}