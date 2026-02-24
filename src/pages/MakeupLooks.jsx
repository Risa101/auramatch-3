import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, ArrowUpRight, Loader2, X, CheckCircle2, Info } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getLooksBySeason } from "../callapi/call_api_user";

const SeasonalGallery = () => {
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

  // --- States ---
  const [activeSeason, setActiveSeason] = useState('Spring');
  const [loading, setLoading] = useState(true);
  const [selectedLook, setSelectedLook] = useState(null);
  const [seasonalData, setSeasonalData] = useState({
    Spring: [], Summer: [], Autumn: [], Winter: []
  });

  const seasonTheme = {
    Spring: { bg: "#FFF7ED", accent: "#D23669", text: "Warm & Bright", details: "โทนสีพีช ชมพูคอรัล และเขียวอ่อน เสริมความสดใส" },
    Summer: { bg: "#F0F9FF", accent: "#38BDF8", text: "Cool & Soft", details: "โทนสีฟ้าพาสเทล ชมพูนม และม่วงลาเวนเดอร์ ดูนุ่มนวล" },
    Autumn: { bg: "#FEF2F2", accent: "#EF4444", text: "Warm & Deep", details: "โทนสีส้มอิฐ น้ำตาลทอง และเขียวขี้ม้า เสริมความลึกลับ" },
    Winter: { bg: "#F5F3FF", accent: "#8B5CF6", text: "Cool & Vivid", details: "โทนสีน้ำเงินเข้ม ชมพูบานเย็น และขาวดำ เน้นความชัดเจน" }
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
  }, [initGalleryData]);

  // Lock Body Scroll when Modal is open
  useEffect(() => {
    if (selectedLook) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedLook]);

  const currentLooks = seasonalData[activeSeason] || [];

  const getFullImageUrl = (path) => {
    if (!path) return "/assets/home2.webp";
    if (String(path).startsWith('http')) return path;
    const normalizedPath = String(path).startsWith('/') ? String(path) : `/${String(path)}`;
    return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] py-32 px-10 overflow-x-hidden font-sans selection:bg-[#FF85A2] selection:text-white">
      <div className="max-w-[1400px] mx-auto">
        
        {/* --- 1. HEADER SECTION --- */}
        <div className="relative mb-24">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#FF85A2]/5 blur-[120px] rounded-full z-0 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div data-aos="fade-right" className="max-w-4xl">
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-2 rounded-full border border-gray-100 shadow-sm mb-10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D23669] animate-pulse"></div>
                <span className="text-[10px] tracking-[0.4em] uppercase text-[#D23669] font-black">Personal Color Intelligence</span>
              </div>
              <h2 className="text-[4rem] md:text-[6.5rem] lg:text-[8rem] font-[900] leading-[0.85] tracking-tighter text-[#1A1A1A] uppercase">
                Makeup <br />
                <span className="text-[#FF85A2] italic font-light lowercase pr-4">for</span>
                <span>{activeSeason}</span>
              </h2>
            </div>
            
            <div className="flex bg-white/60 backdrop-blur-xl p-2 rounded-full border border-gray-200/50 shadow-sm overflow-x-auto no-scrollbar">
              {Object.keys(seasonTheme).map((s) => (
                <button 
                  key={s} 
                  onClick={() => setActiveSeason(s)} 
                  className={`whitespace-nowrap px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeSeason === s ? 'bg-[#1A1A1A] text-white shadow-xl translate-y-[-1px]' : 'text-gray-400 hover:text-black hover:bg-white/50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- 2. LUXURY MARQUEE --- */}
        <div className="relative mb-32 opacity-60">
          <div className="bg-white/50 py-10 overflow-hidden border-y border-gray-100/80">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <span className="text-[#1A1A1A] text-[11px] font-bold tracking-[0.8em] uppercase mx-16">Precision Aesthetic</span>
                  <Sparkles size={14} className="text-[#FF85A2]" />
                  <span className="text-[#1A1A1A] text-[11px] font-bold tracking-[0.8em] uppercase mx-16">Biometric Matching</span>
                  <div className="w-16 h-[1px] bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- 3. CONTENT GRID --- */}
        {loading ? (
          <div className="h-[500px] flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <Loader2 className="animate-spin text-[#D23669]" size={48} />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FF85A2]/30" size={20} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400 animate-pulse">Syncing Archive...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {currentLooks.length > 0 ? (
              currentLooks.map((item, i) => (
                <div 
                    key={i} 
                    data-aos="fade-up" 
                    data-aos-delay={i * 50} 
                    className="group cursor-pointer" 
                    onClick={() => setSelectedLook(item)}
                >
                  <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-sm transition-all duration-1000 group-hover:shadow-2xl group-hover:-translate-y-4 flex items-center justify-center" style={{ backgroundColor: seasonTheme[activeSeason].bg }}>
                    <img 
                        src={getFullImageUrl(item.image_url || item.image)} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 z-10" 
                        onError={(e) => e.target.style.opacity = '0'} 
                        alt="" 
                    />
                    
                    {/* Placeholder when image fails */}
                    <div className="flex flex-col items-center gap-4 opacity-[0.15] group-hover:opacity-30 transition-opacity duration-700">
                        <Sparkles size={50} className="text-[#D23669]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em]">Visualizing</span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-12 z-20">
                      <div className="bg-white text-black py-5 rounded-full text-[10px] font-black text-center uppercase tracking-[0.3em] shadow-2xl transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                        Explore Look
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex justify-between items-end px-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-[1px] bg-[#D23669]"></div>
                        <span className="text-[10px] font-black text-[#D23669] uppercase tracking-[0.2em]">{seasonTheme[activeSeason].text}</span>
                      </div>
                      <h3 className="text-[28px] font-[900] uppercase text-[#1A1A1A] tracking-tighter leading-none group-hover:tracking-normal transition-all duration-500">{item.name}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-[#1A1A1A] group-hover:text-white transition-all duration-500 shrink-0 shadow-sm">
                      <ArrowUpRight size={22} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[4rem]">
                <Info size={30} className="text-gray-200 mb-4" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-300">No matching looks found in archive</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- 4. MODAL DETAILS: ADVISOR PERSPECTIVE --- */}
      {selectedLook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 lg:p-12">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-500" onClick={() => setSelectedLook(null)}></div>
          
          <div className="relative bg-white w-full max-w-6xl max-h-[92vh] rounded-[3.5rem] md:rounded-[5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in fade-in duration-500">
            <button 
                onClick={() => setSelectedLook(null)} 
                className="absolute top-10 right-10 z-50 w-14 h-14 bg-white/90 backdrop-blur-md text-black rounded-full flex items-center justify-center hover:bg-black hover:text-white hover:scale-110 transition-all duration-500 shadow-xl"
            >
                <X size={24} />
            </button>
            
            <div className="w-full md:w-[45%] h-[45vh] md:h-auto overflow-hidden bg-gray-50">
                <img 
                    src={getFullImageUrl(selectedLook.image_url || selectedLook.image)} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]" 
                    alt="" 
                />
            </div>

            <div className="w-full md:w-[55%] p-12 md:p-20 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FF85A2]/10 text-[#D23669] text-[10px] font-black uppercase tracking-widest mb-10">
                    <Sparkles size={12} /> Personal Color Analysis
                </div>
                
                <h2 className="text-5xl md:text-7xl font-[900] text-[#1A1A1A] uppercase tracking-tighter leading-[0.9] mb-8">
                    {selectedLook.name}
                </h2>
                
                <p className="text-gray-400 text-[13px] font-medium leading-relaxed mb-12 uppercase tracking-wide border-l-2 border-gray-100 pl-8">
                    {selectedLook.description || "A masterfully curated aesthetic designed to harmonize with your biometric profile and enhance your natural aura."}
                </p>
                
                <div className="grid grid-cols-1 gap-6 mb-16">
                    <div className="flex items-start gap-5 p-7 rounded-[2.5rem] bg-[#F9F9F9] border border-gray-100/50 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                        <CheckCircle2 className="text-[#D23669] mt-1 transition-transform group-hover:scale-125 duration-500" size={20} />
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-[#1A1A1A] mb-2">Palette Insight</h4>
                            <p className="text-[12px] text-gray-500 font-medium leading-relaxed">{seasonTheme[activeSeason].details}</p>
                        </div>
                    </div>
                </div>
              </div>
              
              <button className="w-full py-7 bg-[#1A1A1A] text-white rounded-full font-black text-[11px] tracking-[0.4em] hover:bg-[#D23669] transition-all duration-500 shadow-2xl uppercase mt-auto">
                Apply This Master Look
              </button>
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
