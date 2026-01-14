import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AOS from "aos";
import "aos/dist/aos.css";
import MakeoverStudio from "../components/MakeoverStudio.jsx";

/* --- Configuration --- */
const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
const FACE_TYPES = ["Oval", "Round", "Square", "Heart", "Diamond", "Rectangle"];

const PALETTES = {
  Spring: ["#FBD2B7", "#FFC78A", "#F8A87A", "#F6E2A2"],
  Summer: ["#D8C4F2", "#BFD6F6", "#CFE5F7", "#E3D9F9"],
  Autumn: ["#C17A43", "#E29D62", "#A4743A", "#B69355"],
  Winter: ["#AC1740", "#1F2E5E", "#44445A", "#B2B0BE"],
};

/* --- Sub-Component: Section Header --- */
const SectionHeader = ({ title, subtitle, align = "center", aosType = "fade-up" }) => (
  <div className={`mb-24 ${align === "center" ? "text-center" : "text-left"}`} data-aos={aosType}>
    {subtitle && <span className="text-[11px] font-jost font-black tracking-[0.6em] text-[#D4AF37] uppercase block mb-6">{subtitle}</span>}
    <h2 className="text-5xl md:text-7xl font-serif italic text-[#1A1A1A] leading-tight font-medium">{title}</h2>
  </div>
);

export default function Analysis() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 1200, easing: "ease-out-cubic", once: false });
  }, []);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setResult(null);
      setStatus("idle");
      setTimeout(() => AOS.refresh(), 100);
    };
    reader.readAsDataURL(f);
  };

  /* --- REAL-TIME SAVE FUNCTION --- */
  const saveToHistory = (analysisResult, imageBase64) => {
    try {
      // 1. ดึงประวัติเก่า
      const history = JSON.parse(localStorage.getItem("auramatch:analysisHistory") || "[]");
      
      // 2. สร้างก้อนข้อมูลใหม่
      const newRecord = {
        id: Date.now().toString(),
        preview: imageBase64, // รูปภาพที่ใช้
        season: analysisResult.season,
        faceShape: analysisResult.faceShape,
        undertone: analysisResult.undertone,
        createdAt: Date.now(),
        face: {
          SubTone: analysisResult.undertone,
          Precision: analysisResult.clarity
        }
      };

      // 3. บันทึก (เอาอันล่าสุดไว้บนสุด)
      const updatedHistory = [newRecord, ...history];
      // จำกัดประวัติแค่ 10 รายการเพื่อไม่ให้ LocalStorage เต็ม (Optional)
      const limitedHistory = updatedHistory.slice(0, 10); 
      
      localStorage.setItem("auramatch:analysisHistory", JSON.stringify(limitedHistory));

      // 4. แจ้งเตือน Navbar และหน้า History ให้โหลดข้อมูลใหม่ทันที
      window.dispatchEvent(new Event("history:changed"));
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  const startAnalysis = async () => {
    if (!preview) return;
    setStatus("analyzing");
    
    // จำลองการโหลดประมวลผล
    setTimeout(() => {
      const generatedResult = {
        season: SEASONS[Math.floor(Math.random() * SEASONS.length)],
        faceShape: FACE_TYPES[Math.floor(Math.random() * FACE_TYPES.length)],
        undertone: Math.random() > 0.5 ? "Warm Golden" : "Cool Rosy",
        clarity: "98.5%"
      };

      setResult(generatedResult);
      setStatus("done");

      // บันทึกลง LocalStorage และแจ้งเตือน Component อื่นๆ ทันที
      saveToHistory(generatedResult, preview);

      setTimeout(() => AOS.refresh(), 100);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] overflow-x-hidden font-jost">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen flex items-center px-10 md:px-24">
        <div className="absolute top-0 right-0 w-full md:w-3/5 h-full overflow-hidden" data-aos="fade-left">
          <img 
            src={preview || "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1976"} 
            className={`w-full h-full object-cover scale-105 hero-zoom transition-all duration-[2000ms] ${status === 'analyzing' ? 'blur-lg' : 'opacity-90 grayscale-[30%]'}`}
            alt="Analysis"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDFCFB] via-transparent to-transparent" />
          
          {status === 'analyzing' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-[2px] bg-[#D4AF37] shadow-[0_0_20px_#D4AF37] animate-scan-line"></div>
            </div>
          )}
        </div>
        
        <div className="relative z-10 max-w-3xl" data-aos="fade-right" data-aos-delay="300">
          <span className="text-[12px] font-black tracking-[0.8em] text-[#D4AF37] uppercase mb-8 block">The Digital Atelier</span>
          <h1 className="text-7xl md:text-[9rem] font-serif italic leading-[0.85] mb-12 tracking-tighter font-bold">
            Analysis.
          </h1>
          
          <div className="flex flex-wrap items-center gap-8">
            <button 
              onClick={() => inputRef.current?.click()} 
              className="group relative px-12 py-5 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.4em] uppercase overflow-hidden transition-all duration-500 hover:shadow-2xl"
            >
              <span className="relative z-10">UPLOAD PORTRAIT</span>
              <div className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </button>

            {preview && status !== "done" && status !== "analyzing" && (
              <button 
                onClick={startAnalysis} 
                className="text-[11px] font-bold tracking-[0.4em] text-[#1A1A1A] border-b-2 border-[#D4AF37] pb-1 hover:text-[#D4AF37] transition-colors uppercase"
              >
                Start Scanning
              </button>
            )}
          </div>
          <input ref={inputRef} type="file" className="hidden" onChange={onPick} />
        </div>
      </section>

      {/* 2. RESULTS PRESENTATION */}
      {result && (
        <main className="max-w-[1600px] mx-auto px-10 md:px-24 pb-40 space-y-60">
          
          {/* Stat Grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 border border-gray-100 shadow-sm" data-aos="fade-up">
            <StatBlock label="Color Essence" value={result.season} />
            <StatBlock label="Structural Form" value={result.faceShape} />
            <StatBlock label="Sub-Tone" value={result.undertone} />
            <StatBlock label="Precision" value={result.clarity} />
          </section>

          {/* Color Palette Section */}
          <section className="grid lg:grid-cols-2 gap-32 items-center">
            <div className="order-2 lg:order-1 relative" data-aos="fade-right">
              <div className="grid grid-cols-2 gap-4">
                {PALETTES[result.season].map((color, i) => (
                  <div 
                    key={i} 
                    className="aspect-square w-full shadow-lg" 
                    style={{ backgroundColor: color }}
                    data-aos="zoom-in"
                    data-aos-delay={i * 100}
                  ></div>
                ))}
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-10 shadow-2xl border border-gray-50" data-aos="fade-up">
                <p className="text-[10px] font-black tracking-[0.3em] text-[#D4AF37] uppercase mb-2">Palette Signature</p>
                <p className="text-4xl font-serif italic text-[#1A1A1A]">{result.season}</p>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-8" data-aos="fade-left">
              <SectionHeader title="The Color Theory" subtitle="Personal Curation" align="left" aosType="none" />
              <p className="text-base text-gray-400 font-light leading-relaxed max-w-md">
                จากการประมวลผล ผิวของคุณโดดเด่นในโทน {result.season} ซึ่งการใช้เฉดสีที่แนะนำจะช่วยดึงความเปล่งประกายของใบหน้าออกมาได้อย่างสมบูรณ์แบบ
              </p>
            </div>
          </section>

          {/* Virtual Studio */}
          <section className="py-20">
            <SectionHeader title="The Makeover Studio" subtitle="Virtual Atelier" />
            <div className="bg-white p-4 shadow-2xl rounded-sm overflow-hidden" data-aos="zoom-in">
               <MakeoverStudio base={preview} />
            </div>
          </section>

          {/* Curated Selections */}
          <section className="space-y-20">
             <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-100 pb-10" data-aos="fade-right">
                <h3 className="text-5xl font-serif italic font-medium text-[#1A1A1A]">Curated <br /> Selections.</h3>
                <p className="text-[10px] tracking-[0.4em] font-bold uppercase text-[#D4AF37]">Based on your profile</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                {[1, 2, 3].map(i => (
                  <div key={i} className="group cursor-pointer" data-aos="fade-up" data-aos-delay={i * 150}>
                    <div className="aspect-[3/4] overflow-hidden bg-gray-50 mb-8 border border-gray-100 transition-all duration-700 group-hover:shadow-2xl">
                      <img src={`https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2087`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-110" alt="product" />
                    </div>
                    <div className="flex justify-between items-center px-2">
                      <p className="text-[12px] font-black tracking-widest uppercase text-[#1A1A1A]">Product Essence 0{i}</p>
                      <p className="font-serif italic text-[#D4AF37] text-lg">฿2,450</p>
                    </div>
                  </div>
                ))}
             </div>
          </section>

        </main>
      )}

      {/* FOOTER */}
      <footer className="py-20 text-center border-t border-gray-50" data-aos="fade-up">
        <p className="text-[10px] font-bold tracking-[0.8em] uppercase text-[#D4AF37]">Maison AuraMatch • Paris — Bangkok • 2026</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500;1,700&family=Jost:wght@300;400;700;900&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-jost { font-family: 'Jost', sans-serif; }
        
        .hero-zoom { animation: heroZoom 20s infinite alternate ease-in-out; }
        @keyframes heroZoom { from { transform: scale(1); } to { transform: scale(1.1); } }
        
        .animate-scan-line {
          animation: scan 2.5s ease-in-out infinite;
        }
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="bg-white py-16 px-10 flex flex-col justify-center items-center text-center group hover:bg-[#1A1A1A] transition-all duration-700">
      <span className="text-[10px] tracking-[0.4em] font-bold uppercase text-gray-400 mb-4 group-hover:text-[#D4AF37] transition-colors">{label}</span>
      <span className="text-3xl font-serif italic text-[#1A1A1A] group-hover:text-white transition-all">{value}</span>
      <div className="w-0 h-[1px] bg-[#D4AF37] mt-4 group-hover:w-12 transition-all duration-500"></div>
    </div>
  );
}