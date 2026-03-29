import { useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, Loader2, X, Heart } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getLooksBySeason, generateGeminiImage, getdataProducts } from "../callapi/call_api_user";
import { toggleLike, subscribeLikes } from "../utils/likes";
import { Link } from "react-router-dom";

function b64ToFile(dataUrl, filename = 'face.jpg') {
  try {
    const [header, data] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return new File([arr], filename, { type: mime });
  } catch { return null; }
}

function getUserFacePhoto() {
  try {
    const u = JSON.parse(localStorage.getItem('auramatch:user') || 'null');
    return u?.lastAnalysis?.preview || null;
  } catch { return null; }
}

const SeasonalGallery = () => {
  const API_BASE_URL = (() => { const h = typeof window !== "undefined" ? window.location.hostname : ""; return ["localhost","127.0.0.1"].includes(h) ? "" : (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""); })();

  // --- States ---
  const [activeSeason, setActiveSeason] = useState('Spring');
  const [loading, setLoading] = useState(true);
  const [selectedLook, setSelectedLook] = useState(null);
  const [likedIds, setLikedIds] = useState([]);
  const [tryOnStatus, setTryOnStatus] = useState('idle');
  const [tryOnImage, setTryOnImage] = useState('');
  const [tryOnError, setTryOnError] = useState('');
  const [seasonalData, setSeasonalData] = useState({
    Spring: [], Summer: [], Autumn: [], Winter: []
  });
  const [allProducts, setAllProducts] = useState([]);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [trendTryOnStatus, setTrendTryOnStatus] = useState('idle');
  const [trendTryOnImage, setTrendTryOnImage] = useState('');
  const [trendTryOnError, setTrendTryOnError] = useState('');

  const seasonTheme = {
    Spring: { bg: "#FFF7ED", accent: "#D23669", text: "Warm & Bright", details: "Peach, coral pink, and soft green tones for a fresh radiant look." },
    Summer: { bg: "#F0F9FF", accent: "#38BDF8", text: "Cool & Soft", details: "Pastel blue, milky pink, and lavender tones for a soft, gentle feel." },
    Autumn: { bg: "#FEF2F2", accent: "#EF4444", text: "Warm & Deep", details: "Brick orange, golden brown, and olive green tones for a deep, mysterious look." },
    Winter: { bg: "#F5F3FF", accent: "#8B5CF6", text: "Cool & Vivid", details: "Deep navy, fuchsia pink, and black/white tones for bold clarity." }
  };

  const fallbackSeasonalData = {
    Spring: [
      { name: "Peach Glow Daily", image_url: "/assets/ad1.jpeg", description: "Fresh peach tone for bright warm skin." },
      { name: "Soft Coral Blush", image_url: "/assets/ad3.JPG", description: "Coral + warm brown for easy daily look." },
    ],
    Summer: [
      { name: "Rose Milk Look", image_url: "/assets/ad2.jpeg", description: "Muted pink tone for cool soft mood." },
      { name: "Lavender Soft Glam", image_url: "/assets/ad6.JPG", description: "Soft cool lavender for elegant finish." },
    ],
    Autumn: [
      { name: "Terracotta Chic", image_url: "/assets/ad4.JPG", description: "Warm earthy orange-brown statement." },
      { name: "Mocha Sunset", image_url: "/assets/ad5.JPG", description: "Deep warm contour and rich lips." },
    ],
    Winter: [
      { name: "Ruby Contrast", image_url: "/assets/ad7.JPG", description: "High-contrast cool look with ruby lip." },
      { name: "Berry Night", image_url: "/assets/ad8.JPG", description: "Vivid cool berry tones for sharp features." },
    ],
  };

  // --- Fetch Logic ---
  const initGalleryData = useCallback(async () => {
    setLoading(true);
    try {
      const seasons = ["Spring", "Summer", "Autumn", "Winter"];
      const results = await Promise.all(seasons.map(s => getLooksBySeason(s)));
      const updatedData = {};
      seasons.forEach((s, i) => {
        const apiItems = Array.isArray(results[i]) ? results[i] : [];
        updatedData[s] = apiItems.length > 0 ? apiItems : fallbackSeasonalData[s];
      });
      setSeasonalData(updatedData);
    } catch (err) {
      console.error("Fetch Error:", err);
      setSeasonalData(fallbackSeasonalData);
    } finally {
      setLoading(false);
      setTimeout(() => AOS.refresh(), 500);
    }
  }, []);

  useEffect(() => {
    initGalleryData();
    AOS.init({ duration: 1000, easing: "ease-out", once: true });
    window.scrollTo(0, 0);
    getdataProducts().then(data => setAllProducts(Array.isArray(data) ? data : [])).catch(() => {});
  }, [initGalleryData]);

  useEffect(() => {
    return subscribeLikes((all) => setLikedIds(all.map(x => x.id)));
  }, []);

  // Lock Body Scroll when Modal is open
  const handleTryOnLook = async () => {
    const facePhoto = getUserFacePhoto();
    if (!facePhoto) { setTryOnError('no_face'); return; }
    const faceFile = b64ToFile(facePhoto);
    if (!faceFile) { setTryOnError('Could not load your face photo.'); return; }
    setTryOnStatus('loading');
    setTryOnError('');
    setTryOnImage('');
    const name = selectedLook?.name || 'this look';
    const season = activeSeason;
    const prompt = `Apply "${name}" ${season} seasonal makeup look to this face. Use the signature colors and style of the ${season} palette: ${seasonTheme[season]?.details || ''}. Keep the same person's identity, realistic and beautiful result.`;
    try {
      const res = await generateGeminiImage({ file: faceFile, prompt });
      setTryOnImage(res?.image || res?.data_url || '');
      setTryOnStatus('done');
    } catch {
      setTryOnError('Try-On failed. Please try again.');
      setTryOnStatus('error');
    }
  };

  const handleTryOnTrend = async (trend) => {
    const facePhoto = getUserFacePhoto();
    if (!facePhoto) { setTrendTryOnError('no_face'); return; }
    const faceFile = b64ToFile(facePhoto);
    if (!faceFile) { setTrendTryOnError('Could not load your face photo.'); return; }
    setTrendTryOnStatus('loading');
    setTrendTryOnError('');
    setTrendTryOnImage('');
    const prompt = `Apply the "${trend.name}" makeup trend to this face. Style: ${trend.desc} Keep the same person's identity, realistic and beautiful result.`;
    try {
      const res = await generateGeminiImage({ file: faceFile, prompt });
      setTrendTryOnImage(res?.image || res?.data_url || '');
      setTrendTryOnStatus('done');
    } catch {
      setTrendTryOnError('Try-On failed. Please try again.');
      setTrendTryOnStatus('error');
    }
  };

  useEffect(() => {
    setTrendTryOnStatus('idle');
    setTrendTryOnImage('');
    setTrendTryOnError('');
  }, [selectedTrend]);

  useEffect(() => {
    setTryOnStatus('idle');
    setTryOnImage('');
    setTryOnError('');
  }, [selectedLook]);

  useEffect(() => {
    if (selectedLook || selectedTrend) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedLook, selectedTrend]);

  const currentLooks = seasonalData[activeSeason] || [];

  const getFullImageUrl = (path) => {
    if (!path) return "/assets/home2.webp";
    if (String(path).startsWith('http')) return path;
    const normalizedPath = String(path).startsWith('/') ? String(path) : `/${String(path)}`;
    return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-sans selection:bg-[#FFD1DC] selection:text-[#D23669] antialiased">

      {/* --- HERO (Victoria's Secret editorial style) --- */}
      <header className="relative h-screen min-h-[600px] max-h-[900px] flex flex-col justify-end overflow-hidden mt-[60px] lg:mt-[180px]">
        <img
          src="/assets/spring-makeup-lead.webp"
          alt="Spring Makeup 2026"
          className="absolute inset-0 w-full h-full object-cover object-top scale-[1.02]"
        />
        {/* subtle vignette — keeps image clean, darkens only bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/30 to-transparent" />

        {/* editorial text block — bottom aligned */}
        <div className="relative z-10 w-full pb-14 md:pb-20 flex flex-col items-center text-center gap-6 px-6">

          {/* eyebrow label */}
          <p data-aos="fade-up" data-aos-delay="0"
            className="text-[9px] font-[600] uppercase tracking-[0.45em] text-white/60 leading-none">
            Aura Match &nbsp;·&nbsp; Spring / Summer 2026
          </p>

          {/* main heading — thin elegant weight */}
          <h1 data-aos="fade-up" data-aos-delay="60"
            className="text-[2.6rem] sm:text-[3.6rem] md:text-[5rem] lg:text-[6.2rem] font-[200] leading-[0.92] tracking-[0.06em] text-white uppercase">
            Makeup
            <br />
            <span className="font-[800] tracking-tighter italic text-[#FF85A2]">for</span>
            {" "}
            <span className="font-[800] tracking-tighter">{activeSeason}</span>
          </h1>

          {/* season tab bar — clean text tabs, no pill background */}
          <div data-aos="fade-up" data-aos-delay="120"
            className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {Object.keys(seasonTheme).map((s, i) => (
              <>
                <button
                  key={s}
                  onClick={() => setActiveSeason(s)}
                  className={`relative whitespace-nowrap px-4 py-1 text-[10px] font-[700] uppercase tracking-[0.25em] transition-all duration-400 ${
                    activeSeason === s
                      ? 'text-white'
                      : 'text-white/45 hover:text-white/80'
                  }`}
                >
                  {s}
                  {activeSeason === s && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF85A2]" />
                  )}
                </button>
                {i < Object.keys(seasonTheme).length - 1 && (
                  <span key={`div-${s}`} className="text-white/20 text-[10px] select-none">|</span>
                )}
              </>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-24">


        {/* --- SPRING 2026 TRENDS --- */}
        {(() => {
          const TRENDS = [
            { num: "01", name: "Soft Smoky Liner", desc: "Diffused liner hugging the lash line, blurred outward for a lived-in effect.", colors: ["#3B2314","#5C3D2E","#6B4C3B","#9C7A6A"], seasons: ["Autumn","Winter"], cats: ["Eye"], img: "/assets/look1.jpg.webp" },
            { num: "02", name: "Glossy Lids", desc: "Shiny, hydrated reflective eyes — layer clear gloss over bare lids for that wet look.", colors: ["#FADADD","#FFB6C1","#E8D5C4","#FFFAF0"], seasons: ["Spring","Summer"], cats: ["Eye"], img: "/assets/look2.jpg.webp" },
            { num: "03", name: "All-Over Pink", desc: "Monochromatic pink across cheeks, lids & lips. One tone, full face, total romance.", colors: ["#FFB6C1","#FF85A2","#D23669","#C97DB5"], seasons: ["Spring","Summer"], cats: ["Blush","Lip"], img: "/assets/look3.jpg.webp" },
            { num: "04", name: "Skin That Looks Like Skin", desc: "Hydrated, even & lightly perfected — never overdone. Sheer foundation, strategic concealing.", colors: ["#F5D5B8","#EBC49A","#D4A47C","#C48B6A"], seasons: ["Spring","Summer","Autumn","Winter"], cats: ["Cushion"], img: "/assets/look4.jpg.webp" },
            { num: "05", name: "Blurred Lips", desc: "Softly stained, gently smudged edges. Tap color from the center outward for zero harsh lines.", colors: ["#D4896A","#C0705A","#B5614E","#A0514A"], seasons: ["Spring","Autumn"], cats: ["Lip"], img: "/assets/look5.jpg.webp" },
            { num: "06", name: "Barely-There Brows", desc: "Fluffy natural arches, minimally filled. Brush, shape, and let your natural brow take the lead.", colors: ["#C8A882","#A07850","#7D5A3C","#4A3728"], seasons: ["Spring","Summer"], cats: ["Eye"], img: "/assets/look6.jpg.webp" },
            { num: "07", name: "Warm Neutral Everything", desc: "Beige, cocoa & rose-brown tones across the full face. Sun-warmed and effortlessly soft.", colors: ["#E8C9A0","#C4956A","#A0714E","#7D5A3C"], seasons: ["Spring","Autumn"], cats: ["Blush","Lip","Eye"], img: "/assets/look7.jpg.webp" },
            { num: "07", name: "Warm Neutral Everything", desc: "Beige, cocoa & rose-brown tones across the full face. Sun-warmed and effortlessly soft.", colors: ["#E8C9A0","#C4956A","#A0714E","#7D5A3C"], seasons: ["Spring","Autumn"], cats: ["Blush","Lip","Eye"], img: "/assets/look8.jpg.webp" },
            { num: "07", name: "Warm Neutral Everything", desc: "Beige, cocoa & rose-brown tones across the full face. Sun-warmed and effortlessly soft.", colors: ["#E8C9A0","#C4956A","#A0714E","#7D5A3C"], seasons: ["Spring","Autumn"], cats: ["Blush","Lip","Eye"], img: "/assets/look9.jpg.webp" },
            
          ];

          const userSeason = (() => { try { return JSON.parse(localStorage.getItem('auramatch:user') || 'null')?.lastAnalysis?.season || null; } catch { return null; } })();

          const getProductsForTrend = (cats) => {
            const results = [];
            const usedIds = new Set();
            for (const cat of cats) {
              if (results.length >= 2) break;
              const pool = allProducts.filter(p => p.category?.toLowerCase() === cat.toLowerCase() && !usedIds.has(p.product_id));
              const pick = (userSeason ? pool.find(p => p.personal_color_tags?.toLowerCase().includes(userSeason.toLowerCase())) : null) || pool[0];
              if (pick) { results.push(pick); usedIds.add(pick.product_id); }
            }
            if (results.length < 2) {
              const fill = allProducts.filter(p => !usedIds.has(p.product_id));
              const seasonal = userSeason ? fill.filter(p => p.personal_color_tags?.toLowerCase().includes(userSeason.toLowerCase())) : fill;
              (seasonal.length > 0 ? seasonal : fill).slice(0, 2 - results.length).forEach(p => results.push(p));
            }
            return results.slice(0, 2);
          };

          const imgSrc = (p) => p.image_url?.startsWith('http') ? p.image_url : `${API_BASE_URL}${p.image_url?.startsWith('/') ? '' : '/'}${p.image_url}`;

          return (
            <div className="mb-28">
              {/* VS-style section header — no pills, just editorial text */}
              <div className="border-t border-[#E8E0DC] pt-10 pb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6" data-aos="fade-up">
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#888] font-[400] mb-3">
                    Spring / Summer 2026
                  </p>
                  <h2 className="text-[2.2rem] md:text-[3.4rem] font-[300] tracking-[-0.01em] text-[#1A1A1A] leading-[1.05]">
                    Makeup Trends
                  </h2>
                </div>
                <div className="flex items-center gap-6">
                  <Link to="/cosmetics"
                    className="text-[11px] tracking-[0.18em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:text-[#D23669] hover:border-[#D23669] transition-colors">
                    Shop All
                  </Link>
                  <a href="https://www.allure.com/story/spring-makeup-trends-2026" target="_blank" rel="noreferrer"
                    className="text-[10px] tracking-[0.15em] uppercase text-[#aaa] border-b border-[#ddd] pb-0.5 hover:text-[#D23669] hover:border-[#D23669] transition-colors">
                    Source: Allure
                  </a>
                </div>
              </div>

              {/* Trend grid — VS editorial: 2-col on tablet, 3-col on desktop, no rounded corners */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E8E0DC]">
                {TRENDS.map((trend, i) => {
                  const trendProducts = getProductsForTrend(trend.cats);
                  return (
                    <div key={trend.num} data-aos="fade-up" data-aos-delay={i * 40}
                      onClick={() => setSelectedTrend({ ...trend, trendProducts: getProductsForTrend(trend.cats) })}
                      className="group bg-white flex flex-col cursor-pointer hover:bg-[#FAFAFA] transition-colors duration-300">

                      {/* Image */}
                      <div className="relative overflow-hidden aspect-[3/4] bg-[#F5F3F0]">
                        <img
                          src={trend.img}
                          alt={trend.name}
                          className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-700"
                          onError={e => { e.target.src = '/assets/home2.webp'; }}
                        />
                        {/* Vignette */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Number top-left */}
                        <span className="absolute top-4 left-4 text-[10px] tracking-[0.35em] text-white/50 font-[300] uppercase">{trend.num}</span>

                        {/* Heart top-right */}
                        <button
                          onClick={e => { e.stopPropagation(); toggleLike({ id: `trend_${trend.num}`, title: trend.name, img: trend.img, type: 'trend' }); }}
                          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all active:scale-90">
                          <Heart size={16} className={likedIds.includes(`trend_${trend.num}`) ? 'fill-white text-white' : 'text-white/60 hover:text-white'} />
                        </button>

                        {/* Name bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <div className="flex gap-1.5 mb-2">
                            {trend.colors.map((c, ci) => (
                              <div key={ci} className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <h4 className="text-base font-[500] tracking-[0.04em] text-white leading-tight">{trend.name}</h4>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {trend.seasons.map(s => (
                              <button key={s} onClick={e => { e.stopPropagation(); setSelectedTrend(null); setActiveSeason(s); }}
                                className="text-[9px] tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors border-b border-white/20 pb-px">
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex flex-col flex-1">
                        <p className="text-[13px] text-[#605858] font-[300] leading-relaxed mb-5">{trend.desc}</p>

                        {/* Shop */}
                        <div className="mt-auto border-t border-[#F0EAE8] pt-4 space-y-3">
                          <p className="text-[9px] tracking-[0.3em] uppercase text-[#aaa] font-[400]">Shop This Trend</p>
                          {trendProducts.map(p => (
                            <Link key={p.product_id} to="/cosmetics" state={{ openProductId: p.product_id }}
                              onClick={e => e.stopPropagation()}
                              className="flex items-center gap-3 group/prod">
                              <div className="w-11 h-11 overflow-hidden bg-[#F5F3F0] shrink-0">
                                <img src={imgSrc(p)} alt={p.name} className="w-full h-full object-cover group-hover/prod:scale-105 transition-transform duration-300" onError={e => { e.target.src = '/assets/home2.webp'; }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-[500] text-[#1A1A1A] truncate uppercase tracking-[0.03em]">{p.name}</p>
                                <p className="text-[10px] text-[#aaa] capitalize mt-0.5 font-[300]">{p.category}</p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-[11px] text-[#1A1A1A] font-[500]">฿{parseFloat(p.price).toLocaleString()}</p>
                              </div>
                            </Link>
                          ))}
                          {allProducts.length === 0 && [0,1].map(j => (
                            <div key={j} className="flex items-center gap-3 animate-pulse">
                              <div className="w-11 h-11 bg-[#F0EAE8] shrink-0" />
                              <div className="flex-1 space-y-1.5">
                                <div className="h-2 w-3/4 bg-[#F0EAE8] rounded" />
                                <div className="h-2 w-1/2 bg-[#F0EAE8] rounded" />
                              </div>
                              <div className="h-2 w-10 bg-[#F0EAE8] rounded shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* --- MARQUEE DIVIDER --- */}
        {/* <div className="mb-24 overflow-hidden border-y border-[#E8E0DC] py-4">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-10 px-10">
                <span className="text-[10px] tracking-[0.4em] uppercase text-[#888] font-[400]">Personal Color Analysis</span>
                <span className="text-[#D0C8C4] select-none">—</span>
                <span className="text-[10px] tracking-[0.4em] uppercase text-[#888] font-[400]">Spring · Summer 2026</span>
                <span className="text-[#D0C8C4] select-none">—</span>
                <span className="text-[10px] tracking-[0.4em] uppercase text-[#888] font-[400]">Curated for Your Aura</span>
                <span className="text-[#D0C8C4] select-none">—</span>
              </div>
            ))}
          </div>
        </div> */}

        {/* --- LOOK GALLERY HEADER --- */}
        <div className="border-t border-[#E8E0DC] pt-10 pb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4" data-aos="fade-up">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#888] font-[400] mb-3">
              {activeSeason} Collection
            </p>
            <h2 className="text-[2.2rem] md:text-[3.4rem] font-[300] tracking-[-0.01em] text-[#1A1A1A] leading-[1.05]">
              Looks for You
            </h2>
          </div>
          {/* Season tabs */}
          <div className="flex items-center gap-0 border border-[#E8E0DC]">
            {Object.keys(seasonTheme).map((s, i) => (
              <button key={s}
                onClick={() => setActiveSeason(s)}
                className={`px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase transition-all duration-200 border-r border-[#E8E0DC] last:border-r-0 ${
                  activeSeason === s
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#888] hover:text-[#1A1A1A] bg-white'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* --- LOOK GRID --- */}
        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#888]" size={28} />
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#bbb] font-[300]">Loading</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[#E8E0DC] mb-28">
            {currentLooks.length > 0 ? (
              currentLooks.map((item, i) => (
                <div key={i} data-aos="fade-up" data-aos-delay={i * 40}
                  className="group cursor-pointer bg-white relative overflow-hidden"
                  onClick={() => setSelectedLook(item)}
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-[#F5F3F0] overflow-hidden">
                    <img
                      src={getFullImageUrl(item.image_url || item.image)}
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-700"
                      onError={e => e.target.style.opacity = '0'}
                      alt=""
                    />

                    {/* Heart */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const lookId = `look_${item.look_id || item.id || i}`;
                        toggleLike({ id: lookId, title: item.name, img: item.image_url || item.image, season: activeSeason, type: "look" });
                      }}
                      className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center transition-all active:scale-90">
                      <Heart size={16} className={likedIds.includes(`look_${item.look_id || item.id || i}`) ? 'fill-white text-white' : 'text-white/50 hover:text-white'} />
                    </button>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-5 z-10">
                      <span className="text-[10px] tracking-[0.25em] uppercase text-white font-[400] border-b border-white/60 pb-0.5">
                        View Look
                      </span>
                    </div>
                  </div>

                  {/* Label below */}
                  <div className="p-4">
                    <p className="text-[9px] tracking-[0.25em] uppercase text-[#aaa] font-[300] mb-1">{seasonTheme[activeSeason].text}</p>
                    <h3 className="text-sm font-[500] text-[#1A1A1A] tracking-[0.02em] leading-snug group-hover:text-[#D23669] transition-colors duration-300">{item.name}</h3>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full h-[300px] flex flex-col items-center justify-center bg-white">
                <p className="text-[10px] tracking-[0.35em] uppercase text-[#ccc] font-[300]">No looks found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- TREND MODAL (VS style) --- */}
      {selectedTrend && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedTrend(null)} />
          <div className="relative bg-white w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in duration-300">

            {/* Close */}
            <button onClick={() => setSelectedTrend(null)}
              className="absolute top-5 right-5 z-50 w-9 h-9 flex items-center justify-center text-white bg-black/40 hover:bg-black transition-colors duration-200">
              <X size={16} />
            </button>

            {/* Left image — full height */}
            <div className="w-full md:w-[45%] h-[40vh] md:h-auto overflow-hidden shrink-0 bg-[#F5F3F0]">
              <img src={selectedTrend.img} className="w-full h-full object-cover object-top" alt="" />
            </div>

            {/* Right panel */}
            <div className="w-full md:w-[55%] overflow-y-auto custom-scrollbar flex flex-col">
              <div className="p-8 md:p-12 flex-1 flex flex-col">

                {/* Eyebrow */}
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#aaa] font-[300] mb-5">
                  Spring / Summer 2026 Trend
                </p>

                {/* Heading */}
                <h2 className="text-[2rem] md:text-[2.8rem] font-[300] text-[#1A1A1A] tracking-[-0.01em] leading-[1.05] mb-4">
                  {selectedTrend.name}
                </h2>

                {/* Description */}
                <p className="text-[13px] text-[#605858] font-[300] leading-relaxed mb-6 border-l border-[#E8E0DC] pl-4">
                  {selectedTrend.desc}
                </p>

                {/* Palette */}
                <div className="flex items-center gap-2 mb-6">
                  {selectedTrend.colors.map((c, ci) => (
                    <div key={ci} className="w-6 h-6 border border-[#E8E0DC]" style={{ backgroundColor: c }} />
                  ))}
                  <span className="text-[9px] tracking-[0.25em] uppercase text-[#bbb] font-[300] ml-2">Palette</span>
                </div>

                {/* Season tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedTrend.seasons.map(s => (
                    <button key={s} onClick={() => { setActiveSeason(s); setSelectedTrend(null); }}
                      className="text-[9px] tracking-[0.2em] uppercase text-[#605858] border border-[#E8E0DC] px-3 py-1.5 hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all duration-200">
                      {s}
                    </button>
                  ))}
                </div>

                {/* Shop */}
                {selectedTrend.trendProducts?.length > 0 && (
                  <div className="border-t border-[#E8E0DC] pt-5 mb-6">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-[#aaa] font-[300] mb-4">Shop This Trend</p>
                    <div className="space-y-4">
                      {selectedTrend.trendProducts.map(p => (
                        <Link key={p.product_id} to="/cosmetics" state={{ openProductId: p.product_id }}
                          onClick={() => setSelectedTrend(null)}
                          className="flex items-center gap-4 group/prod">
                          <div className="w-14 h-14 overflow-hidden bg-[#F5F3F0] shrink-0">
                            <img src={p.image_url?.startsWith('http') ? p.image_url : `${API_BASE_URL}${p.image_url?.startsWith('/') ? '' : '/'}${p.image_url}`}
                              alt={p.name} className="w-full h-full object-cover group-hover/prod:scale-105 transition-transform duration-300" onError={e => { e.target.src = '/assets/home2.webp'; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-[500] text-[#1A1A1A] truncate uppercase tracking-[0.04em]">{p.name}</p>
                            <p className="text-[10px] text-[#aaa] capitalize mt-0.5 font-[300]">{p.category}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-[12px] text-[#1A1A1A] font-[500]">฿{parseFloat(p.price).toLocaleString()}</p>
                            <ArrowUpRight size={12} className="text-[#ccc] group-hover/prod:text-[#1A1A1A] transition-colors ml-auto mt-1" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Try-On result */}
                {trendTryOnStatus === 'done' && trendTryOnImage && (
                  <div className="mb-6 border-t border-[#E8E0DC] pt-5">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-[#aaa] font-[300] mb-4">Before / After</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[9px] tracking-[0.2em] uppercase text-[#bbb] mb-1.5">Before</p>
                        <img src={getUserFacePhoto()} alt="Before" className="w-full object-cover aspect-square" />
                      </div>
                      <div>
                        <p className="text-[9px] tracking-[0.2em] uppercase text-[#D23669] mb-1.5">After</p>
                        <img src={trendTryOnImage} alt="After" className="w-full object-cover aspect-square" />
                      </div>
                    </div>
                  </div>
                )}
                {trendTryOnStatus === 'loading' && (
                  <div className="flex items-center gap-3 mb-5 text-[#888]">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-[10px] tracking-[0.3em] uppercase font-[300]">AI Styling...</span>
                  </div>
                )}
                {trendTryOnError && trendTryOnError !== 'no_face' && (
                  <p className="mb-4 text-[11px] text-red-400 font-[300]">{trendTryOnError}</p>
                )}

                {/* Actions */}
                <div className="mt-auto pt-6 border-t border-[#E8E0DC] flex gap-3">
                  <button
                    onClick={() => toggleLike({ id: `trend_${selectedTrend.num}`, title: selectedTrend.name, img: selectedTrend.img, type: 'trend' })}
                    className={`w-11 h-11 flex items-center justify-center border transition-all duration-200 ${likedIds.includes(`trend_${selectedTrend.num}`) ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'border-[#E8E0DC] text-[#888] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'}`}>
                    <Heart size={14} className={likedIds.includes(`trend_${selectedTrend.num}`) ? 'fill-white' : ''} />
                  </button>
                  {!getUserFacePhoto() ? (
                    <button disabled className="flex-1 py-3 border border-[#E8E0DC] text-[#bbb] text-[10px] tracking-[0.25em] uppercase font-[400] cursor-not-allowed">
                      Analyze Face First
                    </button>
                  ) : (
                    <button onClick={() => handleTryOnTrend(selectedTrend)}
                      disabled={trendTryOnStatus === 'loading'}
                      className="flex-1 py-3 bg-[#1A1A1A] text-white text-[10px] tracking-[0.25em] uppercase font-[400] hover:bg-[#D23669] transition-colors duration-200 disabled:opacity-40 flex items-center justify-center gap-2">
                      {trendTryOnStatus === 'loading'
                        ? <><Loader2 size={12} className="animate-spin" /> Styling</>
                        : trendTryOnStatus === 'done'
                        ? 'Try Again'
                        : 'Try This Look'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LOOK MODAL (VS style) --- */}
      {selectedLook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedLook(null)} />
          <div className="relative bg-white w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in duration-300">

            {/* Close */}
            <button onClick={() => setSelectedLook(null)}
              className="absolute top-5 right-5 z-50 w-9 h-9 flex items-center justify-center text-white bg-black/40 hover:bg-black transition-colors duration-200">
              <X size={16} />
            </button>

            {/* Image */}
            <div className="w-full md:w-[45%] h-[40vh] md:h-auto overflow-hidden shrink-0 bg-[#F5F3F0]">
              <img src={getFullImageUrl(selectedLook.image_url || selectedLook.image)}
                className="w-full h-full object-cover" alt="" />
            </div>

            {/* Right panel */}
            <div className="w-full md:w-[55%] overflow-y-auto custom-scrollbar">
              <div className="p-8 md:p-12 flex flex-col h-full">

                <p className="text-[9px] tracking-[0.35em] uppercase text-[#aaa] font-[300] mb-5">
                  {activeSeason} · Personal Color Analysis
                </p>

                <h2 className="text-[2rem] md:text-[2.8rem] font-[300] text-[#1A1A1A] tracking-[-0.01em] leading-[1.05] mb-4">
                  {selectedLook.name}
                </h2>

                <p className="text-[13px] text-[#605858] font-[300] leading-relaxed mb-6 border-l border-[#E8E0DC] pl-4">
                  {selectedLook.description || "A curated aesthetic designed to harmonize with your personal color palette."}
                </p>

                {/* Palette insight */}
                <div className="border border-[#E8E0DC] p-5 mb-6">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#aaa] font-[300] mb-2">Palette Insight</p>
                  <p className="text-[13px] text-[#605858] font-[300] leading-relaxed">{seasonTheme[activeSeason].details}</p>
                </div>

                {/* Try-On result */}
                {tryOnStatus === 'done' && tryOnImage && (
                  <div className="mb-6 border-t border-[#E8E0DC] pt-5">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-[#aaa] font-[300] mb-4">Before / After</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[9px] tracking-[0.2em] uppercase text-[#bbb] mb-1.5">Before</p>
                        <img src={getUserFacePhoto()} alt="Before" className="w-full object-cover aspect-square" />
                      </div>
                      <div>
                        <p className="text-[9px] tracking-[0.2em] uppercase text-[#D23669] mb-1.5">After</p>
                        <img src={tryOnImage} alt="After" className="w-full object-cover aspect-square" />
                      </div>
                    </div>
                  </div>
                )}
                {tryOnStatus === 'loading' && (
                  <div className="flex items-center gap-3 mb-5 text-[#888]">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-[10px] tracking-[0.3em] uppercase font-[300]">AI Styling...</span>
                  </div>
                )}
                {tryOnError && tryOnError !== 'no_face' && (
                  <p className="mb-4 text-[11px] text-red-400 font-[300]">{tryOnError}</p>
                )}

                {/* Actions */}
                <div className="mt-auto pt-6 border-t border-[#E8E0DC] flex gap-3">
                  <button
                    onClick={() => {
                      const lookId = `look_${selectedLook.look_id || selectedLook.id || selectedLook.name}`;
                      toggleLike({ id: lookId, title: selectedLook.name, img: selectedLook.image_url || selectedLook.image, season: activeSeason, type: "look" });
                    }}
                    className={`w-11 h-11 flex items-center justify-center border transition-all duration-200 ${
                      likedIds.includes(`look_${selectedLook.look_id || selectedLook.id || selectedLook.name}`)
                        ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                        : 'border-[#E8E0DC] text-[#888] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
                    }`}>
                    <Heart size={14} className={likedIds.includes(`look_${selectedLook.look_id || selectedLook.id || selectedLook.name}`) ? 'fill-white' : ''} />
                  </button>
                  {!getUserFacePhoto() ? (
                    <button disabled className="flex-1 py-3 border border-[#E8E0DC] text-[#bbb] text-[10px] tracking-[0.25em] uppercase font-[400] cursor-not-allowed">
                      Analyze Face First
                    </button>
                  ) : (
                    <button onClick={handleTryOnLook} disabled={tryOnStatus === 'loading'}
                      className="flex-1 py-3 bg-[#1A1A1A] text-white text-[10px] tracking-[0.25em] uppercase font-[400] hover:bg-[#D23669] transition-colors duration-200 disabled:opacity-40 flex items-center justify-center gap-2">
                      {tryOnStatus === 'loading'
                        ? <><Loader2 size={12} className="animate-spin" /> Styling</>
                        : tryOnStatus === 'done' ? 'Try Again' : 'Try This Look'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM STYLES --- */}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: flex; width: fit-content; animation: marquee 50s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E5E5; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SeasonalGallery;
