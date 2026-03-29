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
    { shape: "Oval", trait: "The Benchmark", desc: "The most balanced proportions — forehead slightly wider than chin, cheeks beautifully curved.", image: "/assets/oval.jpg.webp" },
    { shape: "Round", trait: "Circular Symmetry", desc: "Cheekbone width equals face length, with rounded jawline and no sharp angles.", image: "/assets/round.jpg.webp" },
    { shape: "Square", trait: "Angular Precision", desc: "Wide jawline parallel to forehead, creating a strong and powerful look.", image: "/assets/square.jpg.webp" },
    { shape: "Heart", trait: "Upper Dominance", desc: "Wide forehead with a center hairline peak and a tapered pointed chin like a heart symbol.", image: "/assets/heart.jpg.webp" },
    { shape: "Diamond", trait: "Cheekbone Focus", desc: "Cheekbones are the widest point, while forehead and jaw are narrow and defined.", image: "/assets/diamond.jpg.webp" },
    { shape: "Oblong", trait: "Vertical Depth", desc: "Face length noticeably greater than width, with a slim and elegant bone structure.", image: "/assets/triangle.jpg.webp" }
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
    <div className="bg-white text-[#1A1A1A] font-sans selection:bg-[#FFD1DC] selection:text-[#D23669] antialiased">

      {/* ── MODAL ── */}
      {(selectedTopic || selectedSeason) && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setSelectedTopic(null); setSelectedSeason(null); }} />
          <div className="relative bg-white w-full max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
            <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto overflow-hidden bg-[#F7F4F2]">
              <img
                src={selectedTopic ? knowledgeBase[selectedTopic].image : resolveImageUrl(seasonalLooks[selectedSeason]?.image_url, "https://images.unsplash.com/photo-1550684848-fac1c5b4e853")}
                className="w-full h-full object-cover" alt="Detail"
              />
            </div>
            <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center relative">
              <button onClick={() => { setSelectedTopic(null); setSelectedSeason(null); }}
                className="absolute top-6 right-6 w-8 h-8 border border-[#E8E0DC] flex items-center justify-center text-[#888] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all">
                <X size={14} />
              </button>
              <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-4">Aura Deep-Dive</p>
              <h2 className="text-3xl md:text-5xl font-[200] tracking-[0.02em] uppercase mb-6 leading-[1]">
                {selectedTopic ? knowledgeBase[selectedTopic].title : seasonalData[selectedSeason].title}
              </h2>
              <p className="text-sm font-[300] text-[#555] leading-relaxed mb-8 border-l-2 border-[#1A1A1A] pl-5">
                {selectedTopic ? knowledgeBase[selectedTopic].content : seasonalData[selectedSeason].vibe}
              </p>
              <div className="border border-[#E8E0DC] p-6">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-2">Technical Insight</p>
                <p className="text-xs font-[500] uppercase text-[#1A1A1A] leading-relaxed">
                  {selectedTopic ? knowledgeBase[selectedTopic].tips : `Key Palette: ${seasonalData[selectedSeason].best}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <header className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden mt-[60px] lg:mt-[180px]">
        <img src="/laglace/homee.webp" alt="" fetchpriority="high" decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 opacity-0"
          onLoad={(e) => e.currentTarget.classList.replace("opacity-0", "opacity-100")} />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 flex flex-col items-center text-center px-6" data-aos="fade-up">
          <p className="text-[10px] tracking-[0.5em] uppercase text-white font-[400] mb-6 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            AuraMatch &nbsp;·&nbsp; Academy 2026
          </p>

          <h1 className="text-[3.2rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] font-[200] leading-[0.88] tracking-[0.08em] text-white uppercase mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Visual
          </h1>
          <h1 className="text-[3.2rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] font-[800] leading-[0.88] tracking-[-0.01em] text-white uppercase italic mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            IQ Logic
          </h1>

          <div className="w-12 h-px bg-white/50 mb-6" />

          <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-white font-[300] max-w-xs leading-loose mb-10 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Decoding the biometric science of beauty.<br />Elevate your aesthetic intelligence.
          </p>

          <button onClick={() => navigate("/analysis")}
            className="bg-white text-[#1A1A1A] px-10 py-4 text-[10px] font-[600] uppercase tracking-[0.3em] border border-white hover:bg-[#D23669] hover:text-white hover:border-[#D23669] transition-all duration-300">
            Start Your Analysis
          </button>
        </div>
      </header>

      {/* ── MARQUEE ── */}
      {/* <div className="border-y border-[#E8E0DC] py-4 overflow-hidden bg-white">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-[#888] text-[9px] font-[300] tracking-[0.5em] uppercase mx-10">
              · Discover Your Shape · Analyse Your Color · Boost Your Aura ·
            </span>
          ))}
        </div>
      </div> */}

      {/* ── LESSON 01: COLOR TRINITY ── */}
      {/* <section className="py-28 bg-[#F9E2E7]">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">

         
          <div className="text-center mb-20" data-aos="fade-up">
            <p className="text-[9px] tracking-[0.6em] uppercase text-[#4E3844] font-[400] mb-6">Lesson 01 &nbsp;·&nbsp; The Science</p>
            <h2 className="text-[2.8rem] md:text-[5rem] font-[800] tracking-[0.08em] text-[#221D1D] uppercase leading-[0.92] mb-6">
              The Genetic<br /><span className="font-[300] italic tracking-[0.12em] text-[#FF2D78]">Color Trinity</span>
            </h2>
            <div className="w-12 h-[3px] bg-[#FF2D78] mx-auto mb-8" />
            <p className="text-[11px] font-[400] uppercase tracking-[0.25em] text-[#4E3844] max-w-sm mx-auto leading-loose">
              Three genetic dimensions that determine which colors elevate your skin — and which ones flatten it.
            </p>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.keys(knowledgeBase).map((key, i) => {
              const card = knowledgeBase[key];
              const labels = { Hue: "Temperature", Value: "Depth", Chroma: "Clarity" };
              return (
                <div key={key} onClick={() => setSelectedTopic(key)}
                  data-aos="fade-up" data-aos-delay={i * 100}
                  className="group bg-white border-[3px] border-[#F9E2E7] hover:border-[#FF2D78] cursor-pointer transition-all duration-300 flex flex-col">

                  
                  <div className="h-0 group-hover:h-1 bg-[#FF2D78] transition-all duration-300" />

                  <div className="p-10 md:p-12 flex flex-col flex-1">
                    
                    <p className="text-[9px] tracking-[0.5em] uppercase text-[#958F8F] font-[400] mb-10">0{i + 1}</p>

                    
                    <span className="text-[8px] tracking-[0.5em] uppercase text-[#FF2D78] font-[600] mb-4 self-start border-b border-[#FF2D78]/30 pb-1">
                      {labels[key]}
                    </span>

                    
                    <h3 className="text-[2.6rem] md:text-[3rem] font-[700] uppercase tracking-[0.04em] text-[#221D1D] leading-[0.9] mb-6">
                      {key}
                    </h3>

                   
                    <div className="w-8 h-px bg-[#F9E2E7] mb-6 group-hover:w-16 group-hover:bg-[#FF2D78] transition-all duration-500" />

                   
                    <p className="text-[12px] font-[400] text-[#605858] leading-relaxed flex-1">{card.content}</p>

                    
                    <div className="mt-8 pt-6 border-t border-[#F9E2E7] bg-[#FFF5F7] -mx-10 md:-mx-12 px-10 md:px-12 py-6 -mb-10 md:-mb-12">
                      <p className="text-[8px] tracking-[0.5em] uppercase text-[#FF2D78] font-[600] mb-2">Pro Tip</p>
                      <p className="text-[11px] font-[400] text-[#605858] leading-relaxed">{card.tips}</p>
                    </div>
                  </div>

                  
                  <div className="flex items-center gap-2 px-10 md:px-12 py-5 border-t border-[#F9E2E7] text-[9px] tracking-[0.4em] uppercase text-[#4E3844] font-[600] group-hover:text-[#FF2D78] group-hover:gap-4 transition-all duration-300">
                    <span>Deep Dive</span>
                    <ArrowRight size={11} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section> */}

      {/* ── LESSON 02: SEASONAL ARCHIVE ── */}
      <section className="py-24 bg-[#FAF7F5]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="border-t border-[#E8E0DC] pt-10 mb-16 flex flex-col md:flex-row justify-between items-end gap-8" data-aos="fade-up">
            <div>
              <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-3">Lesson 02</p>
              <h2 className="text-[3rem] md:text-[4.5rem] font-[200] tracking-[0.02em] text-[#1A1A1A] uppercase leading-[1]">
                The Four<br /><span className="font-[700] italic">Aura Archetypes</span>
              </h2>
            </div>
            <p className="text-[9px] font-[300] text-[#888] uppercase tracking-[0.2em] max-w-[280px] md:text-right leading-loose">
              The interaction between skin pigments and external color values
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E8E0DC]">
            {Object.keys(seasonalData).map((seasonKey, i) => {
              const look = seasonalLooks[seasonKey];
              return (
                <div key={seasonKey} data-aos="fade-up" data-aos-delay={i * 80}>
                  <div onClick={() => setSelectedSeason(seasonKey)}
                    className="group relative aspect-[3/4] overflow-hidden bg-white cursor-pointer">
                    {look ? (
                      <img src={resolveImageUrl(look.image_url)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        alt={seasonKey} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[#888] text-[9px] uppercase tracking-[0.2em] font-[300]">Loading...</div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-[9px] font-[300] uppercase tracking-[0.2em] leading-relaxed">
                        {seasonalData[seasonKey].best}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-5 border-t border-[#E8E0DC]">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-1">{seasonKey}</p>
                    <h6 className="text-sm font-[500] uppercase text-[#1A1A1A]">{seasonalData[seasonKey].sub}</h6>
                    <p className="text-[9px] font-[300] text-[#888] mt-1 tracking-[0.15em] uppercase">{seasonalData[seasonKey].theory}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SKIN UNDERTONE ── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="border-t border-[#E8E0DC] pt-10 mb-16 text-center" data-aos="fade-up">
            <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-3">Skin Undertone</p>
            <h2 className="text-[3rem] md:text-[4.5rem] font-[200] tracking-[0.02em] text-[#1A1A1A] uppercase leading-[1]">
              Cool · Warm<br /><span className="font-[700] italic">Neutral</span>
            </h2>
            <p className="mt-5 text-xs font-[300] text-[#888] uppercase tracking-[0.25em] max-w-lg mx-auto leading-loose">
              Use Undertone as your foundation before choosing hair color, outfit colors, and makeup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E8E0DC] mb-12">
            {undertoneData.map((item, idx) => (
              <div key={item.key} data-aos="fade-up" data-aos-delay={idx * 80}
                className="bg-white p-8 md:p-10">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-3">{item.sub}</p>
                <h3 className="text-2xl font-[500] uppercase tracking-tight text-[#1A1A1A] mb-4">{item.title}</h3>
                <p className="text-xs font-[300] text-[#555] leading-relaxed mb-6">{item.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {item.chips.map((chip) => (
                    <span key={chip} className="px-3 py-1 border border-[#E8E0DC] text-[9px] font-[400] uppercase tracking-[0.15em] text-[#555]">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Vein check */}
          {/* <div className="border border-[#E8E0DC] p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">How To Check</p>
                <h3 className="text-2xl md:text-3xl font-[200] uppercase tracking-[0.02em] text-[#1A1A1A]">
                  Check From<br /><span className="font-[700] italic">Vein Color</span>
                </h3>
              </div>
              <p className="text-[9px] font-[300] uppercase tracking-[0.2em] text-[#888]">Natural daylight · Inner wrist</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E8E0DC] mb-4">
              {["Hold your wrist up in natural daylight. Avoid yellow indoor lighting.", "Look at the veins on the inside of your wrist — are they blue/purple or green?", "Compare with the table below, then choose your color tone as recommended."].map((text, i) => (
                <div key={i} className="bg-white p-6">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-3">Step {String(i+1).padStart(2,"0")}</p>
                  <p className="text-xs font-[300] text-[#555] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E8E0DC]">
              <div className="bg-white p-5">
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#888] font-[300] mb-1">Veins: Blue / Purple</p>
                <p className="text-sm font-[600] uppercase text-[#1A1A1A]">Cool Undertone</p>
              </div>
              <div className="bg-white p-5">
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#888] font-[300] mb-1">Veins: Green / Olive</p>
                <p className="text-sm font-[600] uppercase text-[#1A1A1A]">Warm Undertone</p>
              </div>
              <div className="bg-white p-5">
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#888] font-[300] mb-1">Veins: Mix / Hard to Tell</p>
                <p className="text-sm font-[600] uppercase text-[#1A1A1A]">Neutral Undertone</p>
              </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* ── LESSON 03: FACE GEOMETRY ── */}
      <section className="py-24 bg-[#FAF7F5]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="w-full lg:w-[38%] lg:sticky lg:top-28 h-fit" data-aos="fade-right">
              <div className="border-t border-[#E8E0DC] pt-10">
                <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-4">Lesson 03</p>
                <h2 className="text-[3rem] md:text-[4rem] font-[200] tracking-[0.02em] text-[#1A1A1A] uppercase leading-[1] mb-8">
                  The Six<br /><span className="font-[700] italic">Geometry Archetypes</span>
                </h2>
                <p className="text-xs font-[300] text-[#555] leading-relaxed border-l-2 border-[#E8E0DC] pl-5 mb-10">
                  Understanding your true face shape enables precise Contour and Highlight placement, balancing bone structure against light reflection.
                </p>
                <button onClick={() => navigate('/analysis')}
                  className="bg-[#1A1A1A] text-white px-8 py-3 text-[10px] font-[600] uppercase tracking-[0.25em] hover:bg-[#D23669] transition-all duration-300 flex items-center gap-3">
                  Start Biometric Scan <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="w-full lg:w-[62%] grid grid-cols-2 md:grid-cols-3 gap-px bg-[#E8E0DC]">
              {[
                { shape: "Oval", trait: "Ideal Balance", desc: "The most balanced proportions — forehead and jaw beautifully rounded.", image: faceShapes[0].image },
                { shape: "Square", trait: "Strong Presence", desc: "Defined jawline, forehead and cheekbones at similar widths.", image: faceShapes[2].image },
                { shape: "Round", trait: "Soft Contour", desc: "Face width and length are nearly equal, emphasizing softness.", image: faceShapes[1].image },
                { shape: "Heart", trait: "Delicate Point", desc: "Wide forehead that tapers gradually to a pointed chin.", image: faceShapes[3].image },
                { shape: "Diamond", trait: "Sharp Definition", desc: "Cheekbones are the widest point, with narrow forehead and jaw.", image: faceShapes[4].image },
                { shape: "Long", trait: "Vertical Focus", desc: "Face length exceeds width — focus on horizontal balance.", image: faceShapes[5].image }
              ].map((item, i) => (
                <div key={item.shape} className="group bg-white overflow-hidden hover:bg-[#EBC2C8] transition-all duration-500 cursor-default">
                  <div className="aspect-square overflow-hidden bg-[#F7F4F2]">
                    <img src={resolveImageUrl(item.image)} alt={item.shape}
                      className="w-full h-full object-cover scale-[1.3] group-hover:scale-[1.35] transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-5 border-t border-[#E8E0DC] group-hover:border-[#333]">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-1 group-hover:text-[#888]">0{i+1}</p>
                    <h5 className="text-sm font-[600] uppercase text-[#1A1A1A] group-hover:text-white mb-1 transition-colors">{item.shape}</h5>
                    <p className="text-[9px] font-[300] text-[#888] group-hover:text-white/60 uppercase tracking-[0.1em] transition-colors">{item.trait}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LESSON 04: CLOSET LOGIC ── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="border-t border-[#E8E0DC] pt-10 mb-16 text-center" data-aos="fade-up">
            <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-3">Lesson 04</p>
            <h2 className="text-[3rem] md:text-[4.5rem] font-[200] tracking-[0.02em] text-[#1A1A1A] uppercase leading-[1]">
              Closet<br /><span className="font-[700] italic">Logic</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E8E0DC]">
            {closetCards.map((card, idx) => (
              <div key={card.title} data-aos="fade-up" data-aos-delay={idx * 100}
                className={`p-10 md:p-12 flex flex-col justify-between min-h-[320px] transition-all ${card.highlight ? "bg-[#1A1A1A] text-white md:-translate-y-6 shadow-2xl" : "bg-white hover:bg-[#FAF7F5]"}`}>
                <span className={`text-[5rem] font-[200] leading-none ${card.highlight ? "text-white/20" : "text-[#E8E0DC]"}`}>
                  {card.percent}
                </span>
                <div>
                  <h4 className={`text-xl font-[600] uppercase mb-3 ${card.highlight ? "text-white" : "text-[#1A1A1A]"}`}>{card.title}</h4>
                  <p className={`text-xs font-[300] leading-relaxed uppercase tracking-[0.1em] ${card.highlight ? "text-white/60" : "text-[#888]"}`}>
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {/* <div className="border-t border-[#E8E0DC] pt-12 mt-16 flex flex-col items-center text-center gap-6" data-aos="fade-up">
            <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300]">Ready to start?</p>
            <h3 className="text-[2.5rem] md:text-[4rem] font-[200] uppercase tracking-[0.02em] text-[#1A1A1A] leading-[1]">
              Decode Your<br /><span className="font-[700] italic">Genetic Aura</span>
            </h3>
            <button onClick={() => navigate('/analysis')}
              className="bg-[#1A1A1A] text-white px-12 py-4 text-[10px] font-[600] uppercase tracking-[0.3em] hover:bg-[#D23669] transition-all duration-300 flex items-center gap-3">
              Start Free Scan <ArrowRight size={14} />
            </button>
          </div> */}
        </div>
      </section>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #1A1A1A; border-radius: 0; }
      `}</style>
    </div>
  );
}
