import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AOS from "aos";
import "aos/dist/aos.css";

// ✅ ดึงฟังก์ชันที่เชื่อมต่อกับ Backend จริง
import { getBestSellerProducts, getLooksBySeason } from "../callapi/call_api_user";
import { getFavoritesByUser, toggleFavorite } from "../callapi/call_api_favorite";


/* ========== 2. Sub-Components ========== */

const FaceShapeIcon = ({ type }) => {
  const strokeColor = "currentColor";
  const strokeWidth = "2.5";
  switch (type) {
    case "round": return <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} /></svg>;
    case "oval": return <svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="28" ry="38" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} /></svg>;
    case "square": return <svg viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="50" rx="2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} /></svg>;
    case "heart": return <svg viewBox="0 0 100 100"><path d="M50 80 C20 60 15 35 35 25 C45 20 50 30 50 30 C50 30 55 20 65 25 C85 35 80 60 50 80 Z" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} /></svg>;
    case "triangle": return <svg viewBox="0 0 100 100"><path d="M50 25 L80 75 L20 75 Z" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} /></svg>;
    case "diamond": return <svg viewBox="0 0 100 100"><path d="M50 20 L80 50 L50 80 L20 50 Z" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} /></svg>;
    default: return null;
  }
};

const SectionHeader = ({ title, subtitle, align = "center", aosType = "fade-up" }) => (
  <div
    className={`mb-24 ${align === "center" ? "text-center" : "text-left"}`}
    data-aos={aosType}
  >
    {subtitle && <span className="text-[11px] font-black tracking-[0.6em] text-[#C5A358] uppercase block mb-6">{subtitle}</span>}
    <h2 className="text-5xl md:text-7xl font-serif italic text-[#1A1A1A] leading-tight font-bold">{title}</h2>
  </div>
);

/* ========== 3. Main Page Component ========== */
export default function AuramatchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userId = 1;

  const [favorites, setFavorites] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [looksBySeason, setLooksBySeason] = useState({ Spring: [], Summer: [], Autumn: [], Winter: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-out-cubic",
      once: false, // ให้เล่นแอนิเมชั่นซ้ำได้เวลาเลื่อนขึ้นลง
      offset: 100,
    });
  }, []);

  const isFavorite = useCallback((productId) => {
    return favorites.some(fav => String(fav.product_id) === String(productId));
  }, [favorites]);

  const getImageUrl = useCallback((path) => {
    if (!path || path === "null") {
      return "https://images.unsplash.com/photo-1596462502278-27bfac4033c8?q=80&w=1000";
    }
    if (path.startsWith("http")) return path;

    // รูปที่อยู่ใน public/
    return `/${path.replace(/^\/+/, "")}`;
  }, []);


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bsData, favData] = await Promise.all([
        getBestSellerProducts(),
        getFavoritesByUser(userId)
      ]);
      setBestSellers(bsData || []);
      setFavorites(Array.isArray(favData) ? favData : []);

      const seasons = ["Spring", "Summer", "Autumn", "Winter"];
      const seasonLooks = {};
      await Promise.all(seasons.map(async (s) => {
        const data = await getLooksBySeason(s);
        seasonLooks[s] = data || [];
      }));
      setLooksBySeason(seasonLooks);
    } catch (err) {
      console.error("Fetch Data Error:", err);
    } finally {
      setIsLoading(false);
      // Refresh AOS after data loads
      setTimeout(() => AOS.refresh(), 100);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleFavorite = async (productId) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      await toggleFavorite(userId, productId);
      const updatedFavs = await getFavoritesByUser(userId);
      setFavorites(updatedFavs || []);
    } catch (e) {
      console.error("Toggle Favorite Error", e);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
      <div className="animate-pulse text-[12px] font-bold tracking-[0.8em] uppercase text-[#C5A358]">Maison AuraMatch...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] overflow-x-hidden">

      {/* 1. HERO SECTION */}
      <section className="relative h-screen flex items-center px-10 md:px-24">
        <div className="absolute top-0 right-0 w-full md:w-3/5 h-full overflow-hidden" data-aos="fade-left">
          <img
            src={getImageUrl("assets/IMG_7259.PNG")}
            className="w-full h-full object-cover scale-105 hero-zoom opacity-90"
            alt="Hero"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1596462502278-27bfac4033c8?q=80&w=1500"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDFCFB] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl" data-aos="fade-right" data-aos-delay="300">
          <span className="text-[12px] font-black tracking-[0.8em] text-[#C5A358] uppercase mb-8 block">The Art of Radiance</span>
          <h1 className="text-7xl md:text-[9rem] font-serif italic leading-[0.85] mb-12 tracking-tighter font-bold">Aura Match.</h1>
          <button onClick={() => navigate("/analysis")} className="group relative px-12 py-5 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.4em] uppercase overflow-hidden transition-all duration-500 hover:shadow-2xl">
            <span className="relative z-10">START ANALYSIS</span>
            <div className="absolute inset-0 bg-[#C5A358] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </button>
        </div>
      </section>

      {/* 2. LOOKBOOK SECTION (Seasons) */}
      <section className="py-40 px-10 md:px-24 bg-white border-y border-gray-50">
        <SectionHeader title="The Seasons Collection" subtitle="Curation" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {["Spring", "Summer", "Autumn", "Winter"].map((season, i) => (
            <div
              key={season}
              className="group relative aspect-[3/4] overflow-hidden cursor-pointer shadow-sm"
              data-aos="fade-up"
              data-aos-delay={i * 150}
              onClick={() => navigate(`/looks`, {
                state: { personal_color: season }
              })}

            >
              <img
                src={getImageUrl(looksBySeason[season]?.[0]?.image_url)}
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                alt={season}
                onError={(e) => { e.target.src = `https://via.placeholder.com/600x800?text=${season}`; }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-10 left-10">
                <p className="text-[10px] font-bold tracking-[0.4em] text-white/80 uppercase mb-2">Palette</p>
                <h3 className="text-4xl font-serif italic text-white font-bold">{season}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BEST SELLERS SECTION */}
      <section className="py-40 px-10 md:px-24">
        <SectionHeader title="Atelier Essentials" subtitle="Best Sellers" align="left" aosType="fade-right" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          {bestSellers.length > 0 ? bestSellers.slice(0, 6).map((p, i) => (
            <article
              key={p.product_id}
              className="group"
              data-aos="fade-up"
              data-aos-delay={(i % 3) * 150}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-white mb-8 border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                <button
                  onClick={() => handleToggleFavorite(p.product_id)}
                  className={`absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300 ${isFavorite(p.product_id) ? "text-red-500 scale-110" : "text-gray-300 hover:text-[#C5A358]"}`}
                >
                  {isFavorite(p.product_id) ? "♥" : "♡"}
                </button>
                <img
                  src={getImageUrl(p.image_url)}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  alt={p.name}
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000"; }}
                />
              </div>
              <div className="space-y-2">
                <h4 className="text-[12px] font-black tracking-[0.2em] uppercase text-[#1A1A1A]">{p.name}</h4>
                <p className="text-xl font-serif italic text-[#C5A358] font-bold">฿{p.price.toLocaleString()}</p>
              </div>
            </article>
          )) : (
            <div className="col-span-full py-20 text-center text-gray-300 uppercase tracking-widest text-xs">No products found</div>
          )}
        </div>
      </section>

      {/* 4. FACIAL IDENTITY SECTION */}
      <section className="py-40 bg-[#F9F7F5] border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-10">
          <SectionHeader title="Facial Identity" subtitle="Precision Analysis" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {["round", "oval", "square", "heart", "triangle", "diamond"].map((type, i) => (
              <div
                key={type}
                className="flex flex-col items-center justify-center p-12 bg-white shadow-sm hover:shadow-2xl transition-all duration-700 group cursor-pointer rounded-sm border border-transparent hover:border-[#C5A358]/30"
                data-aos="zoom-in"
                data-aos-delay={i * 100}
              >
                <div className="w-16 h-16 mb-8 text-[#1A1A1A] group-hover:text-[#C5A358] group-hover:scale-110 transition-all duration-700">
                  <FaceShapeIcon type={type} />
                </div>
                <span className="text-[11px] font-black tracking-[0.4em] uppercase text-gray-400 group-hover:text-[#1A1A1A] transition-colors">
                  {type}
                </span>
                <div className="w-0 group-hover:w-10 h-[2px] bg-[#C5A358] mt-4 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 text-center bg-[#FDFCFB]" data-aos="fade-up">
        <p className="text-[10px] font-bold tracking-[0.8em] uppercase text-[#C5A358] mb-4">Maison AuraMatch • Est. 2026</p>
        <div className="w-12 h-[1px] bg-gray-200 mx-auto"></div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Montserrat:wght@400;600;800;900&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        body { font-family: 'Montserrat', sans-serif; }
        .hero-zoom { animation: heroZoom 20s infinite alternate ease-in-out; }
        @keyframes heroZoom { from { transform: scale(1); } to { transform: scale(1.1); } }
        [data-aos] { pointer-events: none; }
        [data-aos].aos-animate { pointer-events: auto; }
      `}</style>
    </div>
  );
}