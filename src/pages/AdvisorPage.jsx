import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { X, ArrowRight, Sparkles, Zap, ArrowUpRight } from "lucide-react";
import { getLooksBySeason } from "../callapi/call_api_user";

export default function UltimateAcademy() {
  const navigate = useNavigate();
  const API_BASE_URL = (() => { const h = typeof window !== "undefined" ? window.location.hostname : ""; return ["localhost","127.0.0.1"].includes(h) ? "" : (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""); })();

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Advisor", to: "/advisor" },
    { label: "Analysis", to: "/analysis" },
    { label: "Shop", to: "/cosmetics" },
  ];

  const BASE_PATH = "/";
  
  // --- States ---
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [activeColor, setActiveColor] = useState("Spring");
  const [isLoading, setIsLoading] = useState(false);
  const [seasonalLooks, setSeasonalLooks] = useState({
    Spring: null, Summer: null, Autumn: null, Winter: null
  });

  const fallbackLooksBySeason = {
    Spring: { name: "Spring Aura", image_url: "/assets/ad1.jpeg" },
    Summer: { name: "Summer Aura", image_url: "/assets/ad2.jpeg" },
    Autumn: { name: "Autumn Aura", image_url: "/assets/ad4.JPG" },
    Winter: { name: "Winter Aura", image_url: "/assets/ad7.JPG" },
  };

  const resolveImageUrl = (path, fallback = "/assets/home2.webp") => {
    if (!path) return fallback;
    if (String(path).startsWith("http")) return path;
    const normalizedPath = String(path).startsWith("/") ? String(path) : `/${String(path)}`;
    return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
  };

  // --- 1. API Fetching ---
  const initAcademyData = useCallback(async () => {
    setIsLoading(true);
    try {
      const seasons = ["Spring", "Summer", "Autumn", "Winter"];
      const results = await Promise.all(
        seasons.map(season => getLooksBySeason(season))
      );
      const updatedLooks = {};
      seasons.forEach((season, index) => {
        updatedLooks[season] = results[index]?.[0] || fallbackLooksBySeason[season];
      });
      setSeasonalLooks(updatedLooks);
    } catch (err) {
      console.error("Archive Load Error:", err);
      setSeasonalLooks(fallbackLooksBySeason);
    } finally {
      setIsLoading(false);
      setTimeout(() => AOS.refresh(), 500);
    }
  }, []);

  useEffect(() => {
    initAcademyData();
    AOS.init({ duration: 1200, easing: "ease-out-back", once: true });
    window.scrollTo(0, 0);
  }, [initAcademyData]);

  // --- 2. Data Source ---
  const knowledgeBase = {
    Hue: {
      title: "Hue: Temperature",
      content: "The rule of color temperature that forms the foundation of Undertone — the right color makes skin look healthy and vibrant.",
      tips: "Warm Tone pairs well with gold, while Cool Tone stands out in silver.",
      image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070",
      color: "bg-[#FFF4E0]"
    },
    Value: {
      title: "Value: Depth",
      content: "The level of lightness/darkness that affects sharpness on the face — choosing the wrong Value can make your face appear to disappear.",
      tips: "High Value (light colors) gives softness; Low Value (dark colors) gives strength and authority.",
      image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1932",
      color: "bg-[#F3F4F6]"
    },
    Chroma: {
      title: "Chroma: Clarity",
      content: "Vividness vs mutedness — the defining factor of looking 'luxurious.' Some suit vivid colors, others suit muted tones.",
      tips: "If your face looks dull in Neon, try switching to a Muted color with more gray undertone.",
      image: "https://images.unsplash.com/photo-1502691876148-a84978f5d81b?q=80&w=2070",
      color: "bg-[#E8D9F2]"
    }
  };

  const seasonalData = {
    Spring: { title: "Spring", sub: "Warm & Bright", best: "Peach orange, vivid green, golden yellow", vibe: "The energy of brightness with warm, clear tones", theory: "Yellow Base / High Clarity" },
    Summer: { title: "Summer", sub: "Cool & Soft", best: "Pastel blue, rose pink, dusty purple", vibe: "Soft and gentle in cool pastel tones", theory: "Blue Base / Muted Value" },
    Autumn: { title: "Autumn", sub: "Warm & Muted", best: "Brick orange, olive green, mahogany red", vibe: "Deep, rich charm with warm muted tones", theory: "Yellow Base / Rich Depth" },
    Winter: { title: "Winter", sub: "Cool & Brilliant", best: "Royal blue, ruby red, white/black", vibe: "Ultimate boldness with vivid cool tones", theory: "Blue Base / High Contrast" }
  };

  const undertoneData = [
    {
      key: "Cool",
      title: "Cool Undertone",
      sub: "Blue / Pink Base",
      desc: "Skin has a pink or blue undertone. Pairs well with silver jewelry and cool tones such as Rose, Berry, Ash.",
      chips: ["Silver", "Rose Pink", "Berry", "Navy"],
      bg: "bg-[#EEF4FF]",
      accent: "text-[#5D78C8]",
    },
    {
      key: "Warm",
      title: "Warm Undertone",
      sub: "Yellow / Golden Base",
      desc: "Skin has a yellow or golden undertone. Pairs well with gold jewelry and warm colors such as Peach, Coral, Camel.",
      chips: ["Gold", "Peach", "Coral", "Camel"],
      bg: "bg-[#FFF5EA]",
      accent: "text-[#CC7B2C]",
    },
    {
      key: "Neutral",
      title: "Neutral Undertone",
      sub: "Balanced Base",
      desc: "Skin is balanced between cool and warm tones. Works with both sides, favoring colors that are not too vivid or too dark.",
      chips: ["Taupe", "Dusty Rose", "Soft Beige", "Mauve"],
      bg: "bg-[#F4F4F4]",
      accent: "text-[#596273]",
    },
  ];

  const faceShapes = [
    { shape: "Oval", trait: "The Benchmark", desc: "The most balanced proportions — forehead slightly wider than chin, cheeks beautifully curved.", image: "/assets/oval.jpg" },
    { shape: "Round", trait: "Circular Symmetry", desc: "Cheekbone width equals face length, with rounded jawline and no sharp angles.", image: "/assets/round.jpg" },
    { shape: "Square", trait: "Angular Precision", desc: "Wide jawline parallel to forehead, creating a strong and powerful look.", image: "/assets/sqare.jpg" },
    { shape: "Heart", trait: "Upper Dominance", desc: "Wide forehead with a center hairline peak and a tapered pointed chin like a heart symbol.", image: "/assets/heart.jpg" },
    { shape: "Diamond", trait: "Cheekbone Focus", desc: "Cheekbones are the widest point, while forehead and jaw are narrow and defined.", image: "/assets/diamond.jpg" },
    { shape: "Oblong", trait: "Vertical Depth", desc: "Face length noticeably greater than width, with a slim and elegant bone structure.", image: "/assets/rectangular.jpg" }
  ];

  const closetCards = [
    {
      percent: "60%",
      title: "Neutral Base",
      desc: "Base colors for key pieces such as suits and trousers, for a classic look.",
      // image: "/assets/ad7.JPG",
      highlight: false,
    },
    {
      percent: "30%",
      title: "Personal Hero",
      desc: "Where your seasonal color works hardest to enhance your skin's aura.",
      // image: "/assets/ad8.JPG",
      highlight: true,
    },
    {
      percent: "10%",
      title: "Statement",
      desc: "Contrasting (Pop Color) to create a standout and distinctive personal style.",
      // image: "/assets/ad9.JPG",
      highlight: false,
    },
  ];

  return (
    <div className="bg-white text-[#4A4A4A] font-sans selection:bg-[#FFD1DC] selection:text-[#D23669] antialiased">
      
      {/* --- 1. MODAL DETAIL --- */}
      {(selectedTopic || selectedSeason) && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setSelectedTopic(null); setSelectedSeason(null); }}></div>
          <div className="relative bg-white w-full max-w-5xl rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-500">
            <div className="w-full md:w-1/2 h-72 md:h-auto overflow-hidden bg-gray-100">
              <img 
                src={selectedTopic ? knowledgeBase[selectedTopic].image : resolveImageUrl(seasonalLooks[selectedSeason]?.image_url, "https://images.unsplash.com/photo-1550684848-fac1c5b4e853")} 
                className="w-full h-full object-cover" 
                alt="Detail" 
              />
            </div>
            <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col justify-center">
              <button onClick={() => { setSelectedTopic(null); setSelectedSeason(null); }} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"><X size={24}/></button>
              <span className="text-[10px] tracking-[0.4em] font-black uppercase text-[#D23669] mb-4">Aura Deep-Dive</span>
              <h2 className="text-4xl md:text-5xl font-[900] tracking-tighter uppercase mb-6 leading-none">
                {selectedTopic ? knowledgeBase[selectedTopic].title : seasonalData[selectedSeason].title}
              </h2>
              <p className="text-[12px] font-bold text-gray-500 leading-relaxed uppercase tracking-wider mb-8 border-l-2 border-[#D23669] pl-6">
                {selectedTopic ? knowledgeBase[selectedTopic].content : seasonalData[selectedSeason].vibe}
              </p>
              <div className="bg-[#FFF5F8] p-8 rounded-[2.5rem] border border-[#EEDDE4]">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#D23669] mb-2">Technical Insight</p>
                <p className="text-[11px] font-black uppercase text-[#4A4A4A] leading-relaxed italic">
                  {selectedTopic ? knowledgeBase[selectedTopic].tips : `Key Palette: ${seasonalData[selectedSeason].best}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. HERO --- */}
            <header className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <picture>
            <source srcSet="/assets/dior.jpeg" type="image/webp" />
            <img
              src="/assets/dior.jpeg"
              alt=""
              loading="eager"
              fetchpriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </picture>
        </div>
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-10">
          <div data-aos="fade-right" className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
              <Sparkles size={10} className="text-white" />
              <span className="text-[8px] tracking-[0.2em] uppercase text-white font-black">Academy Session 2026</span>
            </div>
            <h1 className="text-[4rem] md:text-[6rem] lg:text-[7.5rem] font-[900] leading-[0.9] tracking-tighter text-white uppercase">
              Visual <br /> <span className="text-[#FF85A2]">IQ</span> <span className="font-light italic text-white">Logic</span>
            </h1>
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/85 max-w-md leading-relaxed">
              Decoding the biometric science of beauty. Elevate your aesthetic intelligence through our advanced color theory.
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate("/analysis")}
                className="group relative overflow-hidden bg-white text-black px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:pr-16"
              >
                <span className="relative z-10">Start Your Analysis</span>
                <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- 2. MARQUEE --- */}
      <div className="bg-[#D23669] py-5 overflow-hidden border-y border-white/10 relative z-20">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-white text-[10px] font-[900] tracking-[0.5em] uppercase mx-12">
              • DISCOVER YOUR SHAPE • ANALYSE YOUR COLOR • BOOST YOUR AURA •
            </span>
          ))}
        </div>
      </div>

      {/* --- 3. LESSON 01: COLOR TRINITY --- */}
      <section className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-10">
          <span className="text-[11px] tracking-[0.4em] font-black uppercase text-[#D23669] block mb-4">Lesson 01</span>
          <h2 className="text-4xl md:text-[3.5rem] font-[900] tracking-tighter text-[#4A4A4A] uppercase mb-16">The Genetic <span className="text-[#FF85A2]">Color Trinity</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.keys(knowledgeBase).map((key, i) => (
              <div key={key} onClick={() => setSelectedTopic(key)} className={`group ${knowledgeBase[key].color} p-12 rounded-[3.5rem] h-[480px] flex flex-col justify-between transition-all hover:-translate-y-4 cursor-pointer relative overflow-hidden shadow-sm hover:shadow-2xl`}>
                <div className="absolute -right-4 -top-4 text-[10rem] font-[900] text-black/5 uppercase italic">0{i + 1}</div>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Zap size={20} className="text-[#D23669]" /></div>
                <div className="relative z-10">
                  <h3 className="text-4xl font-[900] uppercase tracking-tighter mb-4">{key}</h3>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-loose">{knowledgeBase[key].content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 4. LESSON 02: SEASONAL ARCHIVE --- */}
      <section className="py-32 bg-[#F9F9F9]">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div data-aos="fade-right">
              <span className="text-[11px] tracking-[0.4em] font-black uppercase text-[#D23669] block mb-4">Lesson 02</span>
              <h2 className="text-4xl md:text-[3.5rem] font-[900] tracking-tighter text-[#4A4A4A] uppercase">The Four <span className="text-[#FF85A2]">Aura Archetypes</span></h2>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-[300px] text-right">Analysis of the interaction between "skin pigments" and "external color values"</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.keys(seasonalData).map((seasonKey, i) => {
              const look = seasonalLooks[seasonKey];
              return (
                <div key={seasonKey} className="flex flex-col gap-6" data-aos="fade-up" data-aos-delay={i*100}>
                  <div onClick={() => setSelectedSeason(seasonKey)} className="group relative aspect-[3/4] rounded-[3rem] overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all cursor-pointer border border-gray-100">
                    {look ? (
                      <img src={resolveImageUrl(look.image_url)} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" alt={seasonKey} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300 font-black text-[10px] uppercase">Loading AI Data...</div>
                    )}
                    <div className="absolute top-8 left-8"><span className="bg-white/95 text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">{seasonKey}</span></div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-10">
                       <p className="text-white text-[10px] font-black uppercase leading-relaxed italic">"Brighten your skin with {seasonalData[seasonKey].best}"</p>
                    </div>
                  </div>
                  <div className="px-4">
                    <h6 className="text-[12px] font-black uppercase text-[#4A4A4A] mb-1">{seasonalData[seasonKey].sub}</h6>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{seasonalData[seasonKey].theory}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- 5. LESSON: SKIN UNDERTONE --- */}
      <section className="py-28 bg-white">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="mb-14 text-center">
            <span className="text-[11px] tracking-[0.4em] font-black uppercase text-[#D23669] block mb-4">Skin Undertone</span>
            <h2 className="text-4xl md:text-[3.5rem] font-[900] tracking-tighter text-[#4A4A4A] uppercase">
              Cool <span className="text-[#FF85A2]">Warm</span> Neutral
            </h2>
            <p className="mt-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              Use Undertone as your foundation before choosing hair color, outfit colors, and makeup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {undertoneData.map((item, idx) => (
              <div
                key={item.key}
                data-aos="fade-up"
                data-aos-delay={idx * 80}
                className={`${item.bg} rounded-[3rem] p-10 border border-[#EEDDE4] shadow-sm hover:shadow-xl transition-all`}
              >
                <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${item.accent} mb-3`}>{item.sub}</p>
                <h3 className="text-3xl font-[900] tracking-tighter uppercase text-[#4A4A4A] mb-4">{item.title}</h3>
                <p className="text-[11px] font-bold text-gray-500 leading-relaxed mb-7">{item.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {item.chips.map((chip) => (
                    <span key={chip} className="px-4 py-2 rounded-full bg-white text-[10px] font-black uppercase tracking-wider text-gray-500 border border-[#EEDDE4]">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 bg-[#F9F9F9] rounded-[3rem] p-8 md:p-12 border border-[#EEDDE4]">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D23669] mb-2">
                  How To Check Your Undertone
                </p>
                <h3 className="text-2xl md:text-4xl font-[900] uppercase tracking-tighter text-[#4A4A4A]">
                  Check From Vein Color
                </h3>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Natural daylight • inner wrist
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-[2rem] p-6 border border-[#EEDDE4]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#D23669] mb-3">Step 1</p>
                <p className="text-[12px] font-bold text-gray-600">Hold your wrist up in natural daylight. Avoid yellow indoor lighting.</p>
              </div>
              <div className="bg-white rounded-[2rem] p-6 border border-[#EEDDE4]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#D23669] mb-3">Step 2</p>
                <p className="text-[12px] font-bold text-gray-600">Look at the veins on the inside of your wrist — are they blue/purple or green?</p>
              </div>
              <div className="bg-white rounded-[2rem] p-6 border border-[#EEDDE4]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#D23669] mb-3">Step 3</p>
                <p className="text-[12px] font-bold text-gray-600">Compare the result with the table below, then choose your color tone as recommended.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-[2rem] p-6 bg-[#EEF4FF] border border-[#D7E4FF]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#5D78C8] mb-2">Veins: Blue / Purple</p>
                <p className="text-[14px] font-[900] uppercase text-[#4A4A4A]">Cool Undertone</p>
              </div>
              <div className="rounded-[2rem] p-6 bg-[#FFF5EA] border border-[#FFE5C9]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#CC7B2C] mb-2">Veins: Green / Olive</p>
                <p className="text-[14px] font-[900] uppercase text-[#4A4A4A]">Warm Undertone</p>
              </div>
              <div className="rounded-[2rem] p-6 bg-[#F4F4F4] border border-[#E8E8E8]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#596273] mb-2">Veins: Mix / Hard to Tell</p>
                <p className="text-[14px] font-[900] uppercase text-[#4A4A4A]">Neutral Undertone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 6. LESSON 03: FACE GEOMETRY (BALANCED - PASTEL VERSION) --- */}
      <section className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="w-full lg:w-[40%] lg:sticky lg:top-32 h-fit" data-aos="fade-right">
              <span className="text-[11px] tracking-[0.4em] font-black uppercase text-[#D23669] block mb-6">Lesson 03</span>
              <h2 className="text-4xl md:text-[5rem] lg:text-[6rem] font-[900] leading-[0.85] tracking-tighter text-[#4A4A4A] uppercase mb-8">
                The Six <br /><span className="text-[#FF85A2]">Geometry</span> Archetypes
              </h2>
              <p className="text-[11px] text-gray-400 uppercase tracking-[0.15em] leading-loose border-l-4 border-[#D23669]/10 pl-8 mb-10">
                Understanding your true face shape enables millimeter-precision Contour and Highlight placement, balancing bone structure against light reflection.
              </p>
              <button onClick={() => navigate('/analysis')} className="bg-[#D23669] hover:bg-[#FF85A2] text-white px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#D23669]/30 flex items-center gap-4 group">
                Start Biometric Scan <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
            
            <div className="w-full lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { shape: "Oval", trait: "Ideal Balance", desc: "The most balanced proportions — forehead and jaw beautifully rounded.", bg: "#F1F5F9", image: faceShapes[0].image }, // Blue-Gray Pastel
                { shape: "Square", trait: "Strong Presence", desc: "Defined jawline, forehead and cheekbones at similar widths.", bg: "#FDF2F2", image: faceShapes[2].image }, // Red Pastel
                { shape: "Round", trait: "Soft Contour", desc: "Face width and length are nearly equal, emphasizing softness.", bg: "#FFFBEB", image: faceShapes[1].image }, // Amber Pastel
                { shape: "Heart", trait: "Delicate Point", desc: "Wide forehead that tapers gradually to a pointed chin.", bg: "#F5F3FF", image: faceShapes[3].image }, // Purple Pastel
                { shape: "Diamond", trait: "Sharp Definition", desc: "Cheekbones are the widest point, with narrow forehead and jaw.", bg: "#ECFDF5", image: faceShapes[4].image }, // Emerald Pastel
                { shape: "Long", trait: "Vertical Focus", desc: "Face length exceeds width — focus on horizontal balance.", bg: "#EFF6FF", image: faceShapes[5].image }  // Blue Pastel
              ].map((item, i) => (
                <div 
                  key={item.shape} 
                  style={{ '--pastel-bg': item.bg }} 
                  className="p-10 rounded-[3.5rem] bg-[var(--pastel-bg)] hover:bg-[#D23669] group transition-all duration-700 min-h-[280px] flex flex-col justify-between cursor-default shadow-sm hover:shadow-2xl"
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black text-[#D23669] group-hover:text-white/40 uppercase">0{i+1} / Shape</span>
                      <div className="w-2 h-2 rounded-full bg-[#D23669] group-hover:bg-[#FF85A2] transition-colors"></div>
                    </div>
                    <h5 className="text-[20px] font-[900] uppercase text-[#4A4A4A] group-hover:text-white transition-colors">{item.shape}</h5>
                    <p className="text-[9px] font-black text-[#D23669] group-hover:text-[#FF85A2] uppercase mt-2 tracking-widest">{item.trait}</p>
                  </div>
                  <div className="h-44 rounded-[1.5rem] overflow-hidden mb-5 border border-white/70 shadow-sm bg-white">
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.shape}
                      className="w-full h-full object-contain p-2"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[11px] font-medium text-gray-400 group-hover:text-white/80 uppercase leading-loose tracking-tight transition-colors">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- 7. LESSON 04: CLOSET LOGIC --- */}
      <section className="py-32 bg-[#F9F9F9]">
        <div className="max-w-[1400px] mx-auto px-10 text-center">
          <span className="text-[11px] tracking-[0.5em] font-black uppercase text-[#D23669] block mb-4">Lesson 04</span>
          <h2 className="text-4xl md:text-[3.5rem] font-[900] tracking-tighter uppercase mb-20 text-[#4A4A4A]">Closet <span className="text-[#FF85A2]">Logic</span></h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {closetCards.map((card, idx) => (
              <div
                key={card.title}
                className={`${card.highlight ? "bg-[#D23669] text-white transform lg:-translate-y-8 shadow-xl" : "bg-white shadow-sm hover:shadow-xl"} p-10 rounded-[4rem] transition-all group`}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                {/* <div className="h-44 rounded-[2rem] overflow-hidden mb-8 border border-white/20">
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover" loading="lazy" />
                </div> */}
                <span className={`text-6xl font-[900] ${card.highlight ? "text-white/20" : "text-[#D23669]/10 group-hover:text-[#D23669]/20"} transition-colors block mb-6`}>
                  {card.percent}
                </span>
                <h4 className="text-2xl font-[900] uppercase mb-4">{card.title}</h4>
                <p className={`text-[11px] font-bold uppercase leading-loose tracking-wider ${card.highlight ? "text-white/70" : "text-gray-400"}`}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 8. PRESTIGE CTA --- */}
      {/* <section className="py-24 bg-black text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#D23669]/10 animate-pulse"></div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-10" data-aos="zoom-in">
          <h2 className="text-[3.5rem] md:text-[5.5rem] font-[900] tracking-tighter uppercase leading-[1] mb-12">Decode Your <br /> <span className="text-[#FF85A2]">Genetic Aura</span> Today.</h2>
          <button onClick={() => navigate('/analysis')} className="mx-auto flex items-center gap-6 bg-white text-black px-12 py-6 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#FF85A2] hover:text-white transition-all duration-500 shadow-2xl">
            Start Your Free Scan <ArrowRight size={18} />
          </button>
        </div>
      </section> */}

      {/* --- 9. LUXURY FOOTER --- */}
      {/* <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <h3 className="text-2xl font-[900] tracking-tighter uppercase">Aura<span className="text-[#D23669]">Match</span></h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase leading-loose max-w-sm">
                Leading the intersection of biometric technology and premium beauty aesthetics.
                Your personalized dose of confidence, delivered daily.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest">Navigation</h4>
              <ul className="space-y-2">
                {navItems.map((item, i) => (
                  <li key={i}>
                    <Link to={item.to} className="text-[10px] font-bold text-gray-400 hover:text-[#D23669] transition-colors uppercase">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest">Connect</h4>
              <div className="flex gap-4">
                <span className="text-[10px] font-bold text-gray-400 cursor-pointer hover:text-[#D23669]">INSTAGRAM</span>
                <span className="text-[10px] font-bold text-gray-400 cursor-pointer hover:text-[#D23669]">TIKTOK</span>
              </div>
            </div>
          </div>
          <div className="text-center pt-10 border-t border-gray-50">
            <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
              © 2026 AURAMATCH BIOMETRIC BEAUTY LAB. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer> */}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D23669; border-radius: 10px; }
      `}</style>
    </div>
  );
}
