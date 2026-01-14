import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

/** --- UI Components (Editorial Style) --- */
const SectionLabel = ({ children }) => (
  <h2 className="text-[10px] tracking-[0.5em] font-bold uppercase text-[#C5A358] mb-6">
    {children}
  </h2>
);

export default function AboutUs() {
  const { t } = useTranslation();

  // Scroll Reveal Logic (Same as Analysis page)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".luxury-reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-light selection:bg-[#C5A358]/20 transition-colors duration-1000">
      
      {/* 1. NAVIGATION SPACE (Minimalist) */}
      <nav className="fixed top-0 w-full z-50 px-10 py-10 flex justify-between items-center mix-blend-difference text-white">
        <span className="text-[10px] tracking-[0.6em] font-bold uppercase pointer-events-none">AuraMatch / Maison</span>
        <div className="w-8 h-[1px] bg-white opacity-50"></div>
      </nav>

      {/* 2. HERO: THE PHILOSOPHY */}
      <section className="relative min-h-screen flex items-center justify-center px-10 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <span className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-serif italic text-gray-100/30 select-none uppercase leading-none">
            Maison
          </span>
        </div>

        <div className="relative z-10 w-full max-w-[1400px] text-center luxury-reveal">
          <SectionLabel>The Philosophy</SectionLabel>
          <h1 className="text-7xl md:text-[10rem] font-serif leading-[0.8] tracking-tighter mb-12">
            Beauty is <br />
            <span className="italic text-[#C5A358]">Intelligence.</span>
          </h1>
          <p className="max-w-xl mx-auto text-sm md:text-base leading-relaxed text-gray-500 font-light tracking-wide italic">
            "เราเชื่อว่าความสง่างามที่แท้จริงเริ่มต้นจากการเข้าใจโครงสร้างและโทนสีดั้งเดิมของตนเอง 
            AuraMatch จึงถูกสร้างขึ้นเพื่อเป็นสะพานเชื่อมระหว่างเทคโนโลยี AI ชั้นสูงและความงามที่เป็นเอกลักษณ์"
          </p>
        </div>
      </section>

      {/* 3. CORE VALUES: EDITORIAL GRID */}
      <section className="max-w-[1400px] mx-auto px-10 py-40">
        <div className="grid lg:grid-cols-12 gap-20 items-start">
          <div className="lg:col-span-5 luxury-reveal">
            <SectionLabel>Our Values</SectionLabel>
            <h3 className="text-6xl font-serif italic mb-10 leading-tight">Defining the <br /> New Standard.</h3>
            <div className="space-y-16">
              <ValueItem 
                num="01" 
                title="Human-Centric AI" 
                desc="เราพัฒนาอัลกอริทึมที่ไม่ได้มองแค่ตัวเลข แต่คำนึงถึงความรู้สึกและบุคลิกภาพของผู้ใช้เป็นหัวใจสำคัญ" 
              />
              <ValueItem 
                num="02" 
                title="Transparent Beauty" 
                desc="ทุกคำแนะนำถูกออกแบบมาให้อธิบายได้ (Explainable AI) เพื่อให้คุณตัดสินใจบนพื้นฐานของเหตุผลและความมั่นใจ" 
              />
            </div>
          </div>
          <div className="lg:col-span-7 luxury-reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="relative aspect-[4/5] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 group">
                <img 
                  src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1774&auto=format&fit=crop" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                  alt="Aesthetic" 
                />
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE COLLECTIVE (TEAM) */}
      <section className="max-w-[1400px] mx-auto px-10 pb-40">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-10 mb-20 luxury-reveal">
          <h3 className="text-5xl font-serif italic">The Collective.</h3>
          <p className="text-[9px] tracking-[0.4em] font-bold uppercase text-gray-400">Architects of Aura</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          <TeamMember 
            name="Sarid B." 
            role="AI Architect" 
            img="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
          />
          <TeamMember 
            name="Mint T." 
            role="Creative Director" 
            img="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
            delay="0.2s"
          />
          <TeamMember 
            name="Jo P." 
            role="Lead Engineer" 
            img="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop"
            delay="0.4s"
          />
        </div>
      </section>

      {/* 5. CTA: FINAL STATEMENT */}
      <section className="py-60 luxury-reveal text-center">
        <div className="max-w-4xl mx-auto px-10">
          <h2 className="text-5xl md:text-8xl font-serif italic leading-none mb-12">Start your <br /> transformation.</h2>
          <a 
            href="/analysis" 
            className="group relative inline-flex items-center gap-6 px-16 py-6 border border-[#1A1A1A] overflow-hidden transition-all hover:text-white"
          >
            <div className="absolute inset-0 w-0 bg-[#1A1A1A] transition-all duration-500 group-hover:w-full"></div>
            <span className="relative text-[10px] tracking-[0.5em] font-bold uppercase">Begin Analysis</span>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-gray-50 text-center">
        <p className="text-[10px] tracking-[0.6em] font-bold uppercase text-gray-300">© 2026 AuraMatch Atelier / Paris — Bangkok</p>
      </footer>

      {/* Custom Styles (Keep Analysis classes for consistency) */}
      <style>{`
        .luxury-reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .luxury-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

/** --- Sub-components --- */
function ValueItem({ num, title, desc }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-bold text-[#C5A358]">{num}</span>
        <div className="h-[1px] w-8 bg-[#C5A358]"></div>
        <h4 className="text-xl font-serif italic">{title}</h4>
      </div>
      <p className="text-sm text-gray-400 font-light leading-relaxed pl-14">{desc}</p>
    </div>
  );
}

function TeamMember({ name, role, img, delay = "0s" }) {
  return (
    <div className="luxury-reveal space-y-8 group" style={{ transitionDelay: delay }}>
      <div className="aspect-[3/4] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
        <img 
          src={img} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          alt={name} 
        />
      </div>
      <div className="text-center">
        <p className="text-[9px] tracking-[0.4em] font-bold uppercase text-[#C5A358] mb-2">{role}</p>
        <p className="text-3xl font-serif italic">{name}</p>
      </div>
    </div>
  );
}