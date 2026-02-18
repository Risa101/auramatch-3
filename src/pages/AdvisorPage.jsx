import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { X, ArrowRight, Sparkles, Zap, ArrowUpRight } from "lucide-react";
import { getLooksBySeason } from "../callapi/call_api_user";

export default function UltimateAcademy() {
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Academy", to: "/academy" },
    { label: "Analysis", to: "/analysis" },
    { label: "Shop", to: "/shop" },
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
        updatedLooks[season] = results[index]?.[0] || null;
      });
      setSeasonalLooks(updatedLooks);
    } catch (err) {
      console.error("Archive Load Error:", err);
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
      content: "กฎของอุณหภูมิสีที่เป็นรากฐานของ Undertone สีที่ใช่จะทำให้ผิวดูสุขภาพดี ไม่ซีดจาง",
      tips: "Warm Tone มักเข้ากับสีทอง ส่วน Cool Tone จะโดดเด่นในสีเงิน",
      image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070",
      color: "bg-[#FFF4E0]"
    },
    Value: {
      title: "Value: Depth",
      content: "ระดับความสว่าง-เข้มที่มีผลต่อความคมชัดบนใบหน้า การเลือก Value ผิดอาจทำให้หน้าดูจมหายไป",
      tips: " High Value (สีอ่อน) ให้ความนุ่มนวล, Low Value (สีเข้ม) ให้ความน่าเกรงขาม",
      image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1932",
      color: "bg-[#F3F4F6]"
    },
    Chroma: {
      title: "Chroma: Clarity",
      content: "ความสดหรือความหม่น (Vivid vs Muted) ตัวกำหนดความ 'แพง' บางคนเหมาะกับสีสด บางคนเหมาะกับสีตุ่น",
      tips: "ถ้าหน้าดูหมองในสี Neon ลองเปลี่ยนมาใช้สี Muted ที่มีความอมเทามากขึ้น",
      image: "https://images.unsplash.com/photo-1502691876148-a84978f5d81b?q=80&w=2070",
      color: "bg-[#E8D9F2]"
    }
  };

  const seasonalData = {
    Spring: { title: "Spring", sub: "Warm & Bright", best: "ส้มพีช, เขียวสด, เหลืองทอง", vibe: "พลังแห่งความสดใสด้วยโทนสีอุ่นที่สว่างกระจ่างใส", theory: "Yellow Base / High Clarity" },
    Summer: { title: "Summer", sub: "Cool & Soft", best: "ฟ้าพาสเทล, ชมพูกุหลาบ, ม่วงหม่น", vibe: "ความละมุนอ่อนโยนในโทนสีเย็นแบบพาสเทล", theory: "Blue Base / Muted Value" },
    Autumn: { title: "Autumn", sub: "Warm & Muted", best: "ส้มอิฐ, เขียวขี้ม้า, แดงมะฮอกกานี", vibe: "เสน่ห์ที่ลุ่มลึกและหรูหราด้วยโทนสีอุ่นแบบตุ่น", theory: "Yellow Base / Rich Depth" },
    Winter: { title: "Winter", sub: "Cool & Brilliant", best: "น้ำเงินรอยัล, แดงทับทิม, ขาว/ดำ", vibe: "ความโดดเด่นขั้นสุดด้วยสีสดชัดในโทนเย็น", theory: "Blue Base / High Contrast" }
  };

  const faceShapes = [
    { shape: "Oval", trait: "The Benchmark", desc: "สัดส่วนที่สมดุลที่สุด หน้าผากกว้างกว่าคางเล็กน้อย ช่วงแก้มโค้งมนสวยงาม" },
    { shape: "Round", trait: "Circular Symmetry", desc: "ความกว้างโหนกแก้มเท่ากับความยาวใบหน้า เส้นกรามโค้งมน ไร้เหลี่ยมมุม" },
    { shape: "Square", trait: "Angular Precision", desc: "แนวกรามกว้างขนานกับหน้าผาก สร้างลุคที่ดูแข็งแรงและมีพลัง" },
    { shape: "Heart", trait: "Upper Dominance", desc: "หน้าผากกว้าง มีขวัญผมตรงกลาง และคางเรียวแหลมเหมือนสัญลักษณ์หัวใจ" },
    { shape: "Diamond", trait: "Cheekbone Focus", desc: "โหนกแก้มเป็นส่วนที่กว้างที่สุด ขณะที่หน้าผากและกรามมีความเรียวแคบ" },
    { shape: "Oblong", trait: "Vertical Depth", desc: "ใบหน้ามีความยาวมากกว่าความกว้างอย่างชัดเจน โครงสร้างดูเพรียวบางหรูหรา" }
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
                src={selectedTopic ? knowledgeBase[selectedTopic].image : (seasonalLooks[selectedSeason] ? `${import.meta.env.VITE_API_URL}${seasonalLooks[selectedSeason].image_url}` : 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853')} 
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
              <div className="bg-[#F9F9F9] p-8 rounded-[2.5rem]">
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
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-[300px] text-right">การวิเคราะห์ปฏิกิริยาระหว่าง "เม็ดสีใต้ผิว" กับ "ค่าสีภายนอก"</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.keys(seasonalData).map((seasonKey, i) => {
              const look = seasonalLooks[seasonKey];
              return (
                <div key={seasonKey} className="flex flex-col gap-6" data-aos="fade-up" data-aos-delay={i*100}>
                  <div onClick={() => setSelectedSeason(seasonKey)} className="group relative aspect-[3/4] rounded-[3rem] overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all cursor-pointer border border-gray-100">
                    {look ? (
                      <img src={`${import.meta.env.VITE_API_URL}${look.image_url}`} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" alt={seasonKey} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300 font-black text-[10px] uppercase">Loading AI Data...</div>
                    )}
                    <div className="absolute top-8 left-8"><span className="bg-white/95 text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">{seasonKey}</span></div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-10">
                       <p className="text-white text-[10px] font-black uppercase leading-relaxed italic">"เพิ่มความสว่างให้ผิวด้วย {seasonalData[seasonKey].best}"</p>
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

      {/* --- 5. LESSON 03: FACE GEOMETRY (BALANCED - PASTEL VERSION) --- */}
      <section className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="w-full lg:w-[40%] lg:sticky lg:top-32 h-fit" data-aos="fade-right">
              <span className="text-[11px] tracking-[0.4em] font-black uppercase text-[#D23669] block mb-6">Lesson 03</span>
              <h2 className="text-4xl md:text-[5rem] lg:text-[6rem] font-[900] leading-[0.85] tracking-tighter text-[#4A4A4A] uppercase mb-8">
                The Six <br /><span className="text-[#FF85A2]">Geometry</span> Archetypes
              </h2>
              <p className="text-[11px] text-gray-400 uppercase tracking-[0.15em] leading-loose border-l-4 border-[#D23669]/10 pl-8 mb-10">
                การเข้าใจรูปหน้าจริงจะช่วยให้การลง Contour และ Highlight แม่นยำระดับมิลลิเมตร เพื่อปรับสมดุลระหว่างโครงสร้างกระดูกและการตกกระทบของแสง
              </p>
              <button onClick={() => navigate('/analysis')} className="bg-[#4A4A4A] hover:bg-[#D23669] text-white px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-4 group">
                Start Biometric Scan <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
            
            <div className="w-full lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { shape: "Oval", trait: "Ideal Balance", desc: "สัดส่วนที่สมดุลที่สุด หน้าผากและกรามมีความโค้งมนสวยงาม", bg: "#F1F5F9" }, // Blue-Gray Pastel
                { shape: "Square", trait: "Strong Presence", desc: "แนวกรามชัดเจน หน้าผากและโหนกแก้มกว้างไล่เลี่ยกัน", bg: "#FDF2F2" }, // Red Pastel
                { shape: "Round", trait: "Soft Contour", desc: "ความกว้างและยาวของใบหน้าเกือบเท่ากัน เน้นความละมุน", bg: "#FFFBEB" }, // Amber Pastel
                { shape: "Heart", trait: "Delicate Point", desc: "หน้าผากกว้างและค่อยๆ เรียวเล็กลงจนถึงปลายคางที่แหลม", bg: "#F5F3FF" }, // Purple Pastel
                { shape: "Diamond", trait: "Sharp Definition", desc: "โหนกแก้มเป็นจุดที่กว้างที่สุด พร้อมหน้าผากและคางที่เรียว", bg: "#ECFDF5" }, // Emerald Pastel
                { shape: "Long", trait: "Vertical Focus", desc: "ใบหน้ามีความยาวมากกว่าความกว้าง เน้นการปรับสมดุลแนวนอน", bg: "#EFF6FF" }  // Blue Pastel
              ].map((item, i) => (
                <div 
                  key={item.shape} 
                  style={{ '--pastel-bg': item.bg }} 
                  className="p-10 rounded-[3.5rem] bg-[var(--pastel-bg)] hover:bg-[#4A4A4A] group transition-all duration-700 min-h-[280px] flex flex-col justify-between cursor-default shadow-sm hover:shadow-2xl"
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black text-[#D23669] group-hover:text-white/40 uppercase">0{i+1} / Shape</span>
                      <div className="w-2 h-2 rounded-full bg-[#D23669] group-hover:bg-[#FF85A2] transition-colors"></div>
                    </div>
                    <h5 className="text-[20px] font-[900] uppercase text-[#4A4A4A] group-hover:text-white transition-colors">{item.shape}</h5>
                    <p className="text-[9px] font-black text-[#D23669] group-hover:text-[#FF85A2] uppercase mt-2 tracking-widest">{item.trait}</p>
                  </div>
                  <p className="text-[11px] font-medium text-gray-400 group-hover:text-white/80 uppercase leading-loose tracking-tight transition-colors">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- 6. LESSON 04: CLOSET LOGIC --- */}
      <section className="py-32 bg-[#F9F9F9]">
        <div className="max-w-[1400px] mx-auto px-10 text-center">
          <span className="text-[11px] tracking-[0.5em] font-black uppercase text-[#D23669] block mb-4">Lesson 04</span>
          <h2 className="text-4xl md:text-[3.5rem] font-[900] tracking-tighter uppercase mb-20 text-[#4A4A4A]">Closet <span className="text-[#FF85A2]">Logic</span></h2>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white p-16 rounded-[4rem] shadow-sm hover:shadow-xl transition-all group" data-aos="fade-up">
              <span className="text-6xl font-[900] text-[#D23669]/10 group-hover:text-[#D23669]/20 transition-colors block mb-8">60%</span>
              <h4 className="text-2xl font-[900] uppercase text-[#4A4A4A] mb-4">Neutral Base</h4>
              <p className="text-[11px] font-bold text-gray-400 uppercase leading-loose tracking-wider">สีพื้นฐานสำหรับชิ้นหลัก เช่น สูท กางเกง เพื่อความคลาสสิก</p>
            </div>
            <div className="bg-[#D23669] p-16 rounded-[4rem] shadow-xl text-white transform lg:-translate-y-8 group" data-aos="fade-up" data-aos-delay="100">
              <span className="text-6xl font-[900] text-white/20 block mb-8">30%</span>
              <h4 className="text-2xl font-[900] uppercase mb-4">Personal Hero</h4>
              <p className="text-[11px] font-bold text-white/70 uppercase leading-loose tracking-wider">จุดที่สีประจำฤดูกาลทำงานหนักที่สุดเพื่อขับออร่าให้ผิว</p>
            </div>
            <div className="bg-white p-16 rounded-[4rem] shadow-sm hover:shadow-xl transition-all group" data-aos="fade-up" data-aos-delay="200">
              <span className="text-6xl font-[900] text-[#D23669]/10 group-hover:text-[#D23669]/20 transition-colors block mb-8">10%</span>
              <h4 className="text-2xl font-[900] uppercase text-[#4A4A4A] mb-4">Statement</h4>
              <p className="text-[11px] font-bold text-gray-400 uppercase leading-loose tracking-wider">สีตัดกัน (Pop Color) เพื่อสร้างความโดดเด่นและสไตล์เฉพาะตัว</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 7. PRESTIGE CTA --- */}
      <section className="py-24 bg-black text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#D23669]/10 animate-pulse"></div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-10" data-aos="zoom-in">
          <h2 className="text-[3.5rem] md:text-[5.5rem] font-[900] tracking-tighter uppercase leading-[1] mb-12">Decode Your <br /> <span className="text-[#FF85A2]">Genetic Aura</span> Today.</h2>
          <button onClick={() => navigate('/analysis')} className="mx-auto flex items-center gap-6 bg-white text-black px-12 py-6 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#FF85A2] hover:text-white transition-all duration-500 shadow-2xl">
            Start Your Free Scan <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* --- 8. LUXURY FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
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
      </footer>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D23669; border-radius: 10px; }
      `}</style>
    </div>
  );
}
