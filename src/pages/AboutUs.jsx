import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkles, Globe, Fingerprint } from "lucide-react";

/** --- UI Components (Atelier Style) --- */
const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="h-px w-8 bg-[#D4AF37]"></div>
    <h2 className="text-[10px] tracking-[0.8em] font-black uppercase text-[#D4AF37]">
      {children}
    </h2>
  </div>
);

export default function AboutUs() {
  const { t } = useTranslation();

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
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] overflow-x-hidden selection:bg-[#D4AF37]/20">
      
      {/* 1. HERO: THE MANIFESTO */}
      <section className="relative min-h-screen flex items-center justify-center px-10 pt-20 overflow-hidden">
        {/* Decorative Background Text */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
          <span className="text-[35vw] font-serif italic text-black/[0.02] select-none uppercase leading-none tracking-tighter">
            Atelier
          </span>
        </div>

        <div className="relative z-10 w-full max-w-7xl text-center luxury-reveal">
          <div className="inline-block mb-12">
             <SectionLabel>Our Essence</SectionLabel>
          </div>
          <h1 className="text-6xl md:text-[11rem] font-serif leading-[0.85] tracking-tighter mb-16">
            Elegance <br />
            <span className="italic text-[#D4AF37]">Redefined.</span>
          </h1>
          <div className="max-w-2xl mx-auto space-y-8">
            <p className="text-sm md:text-lg leading-[2] text-gray-500 font-light tracking-[0.1em] italic">
              "We believe that true beauty is a biometric signature. AuraMatch was conceived at the intersection of high-frequency neural networks and the timeless heritage of personal styling."
            </p>
            <div className="flex justify-center gap-12 pt-8">
               <Stat num="99.2%" label="AI Precision" />
               <Stat num="2026" label="Established" />
               <Stat num="GLOBAL" label="Identity" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. VISION & IMAGE GRID */}
      <section className="max-w-7xl mx-auto px-10 py-60">
        <div className="grid lg:grid-cols-12 gap-24 items-center">
          <div className="lg:col-span-6 relative luxury-reveal">
            <div className="aspect-[4/5] overflow-hidden bg-gray-100">
               <img 
                 src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070" 
                 className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2s]" 
                 alt="Aesthetic Vision" 
               />
            </div>
            {/* Overlay Badge */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#1A1A1A] p-8 hidden md:flex flex-col justify-center">
               <Fingerprint className="text-[#D4AF37] mb-4" size={32} />
               <p className="text-[8px] text-white tracking-[0.3em] font-black uppercase">Your biological code is your style compass.</p>
            </div>
          </div>

          <div className="lg:col-span-6 luxury-reveal space-y-12" style={{ transitionDelay: '0.4s' }}>
            <SectionLabel>Our Values</SectionLabel>
            <h3 className="text-6xl font-serif italic mb-10 leading-none">The Science <br/> of Allure.</h3>
            <div className="space-y-16">
              <ValueItem 
                icon={<Sparkles size={18}/>}
                title="Hyper-Personalization" 
                desc="Beyond generic advice, we decode your unique chroma and geometric proportions to build a digital twin of your aesthetic potential." 
              />
              <ValueItem 
                icon={<Globe size={18}/>}
                title="Universal Heritage" 
                desc="Merging global trends with localized skin-tone research, ensuring every recommendation feels culturally and personally resonant." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE COLLECTIVE (REFINED) */}
      <section className="bg-[#1A1A1A] text-white py-60 relative">
        <div className="max-w-7xl mx-auto px-10">
          <header className="flex flex-col md:flex-row justify-between items-end gap-10 mb-32 luxury-reveal">
            <div className="space-y-4">
              <span className="text-[9px] tracking-[0.8em] font-black text-[#D4AF37] uppercase block">The Architects</span>
              <h3 className="text-7xl font-serif italic leading-none">The Collective.</h3>
            </div>
            <p className="text-[10px] tracking-[0.4em] font-bold uppercase text-white/30 max-w-xs text-right leading-relaxed">
              A symphony of AI researchers, color theorists, and creative directors.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <TeamMember 
              name="Alexander V." 
              role="Chief AI Scientist" 
              img="https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=2000"
            />
            <TeamMember 
              name="Elena S." 
              role="Artistic Director" 
              img="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2000"
              delay="0.2s"
            />
            <TeamMember 
              name="Marcus T." 
              role="Chroma Specialist" 
              img="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2000"
              delay="0.4s"
            />
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA */}
      <section className="py-60 luxury-reveal text-center relative">
        <div className="max-w-4xl mx-auto px-10">
          <SectionLabel>Your Journey</SectionLabel>
          <h2 className="text-6xl md:text-9xl font-serif italic leading-[0.9] mb-16 tracking-tighter">Discover your <br /> true aura.</h2>
          <a 
            href="/analysis" 
            className="group relative inline-flex items-center gap-10 px-20 py-8 bg-[#1A1A1A] text-white overflow-hidden transition-all duration-700 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span className="relative z-10 text-[11px] tracking-[0.6em] font-black uppercase">Begin the Scan</span>
            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-3 transition-transform" />
          </a>
        </div>
      </section>

      <style>{`
        .luxury-reveal {
          opacity: 0;
          transform: translateY(60px);
          transition: all 1.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .luxury-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

/** --- Sub-components (Atelier Refined) --- */
function ValueItem({ icon, title, desc }) {
  return (
    <div className="flex gap-8 group">
      <div className="shrink-0 w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#1A1A1A] group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <div className="space-y-4">
        <h4 className="text-2xl font-serif italic group-hover:text-[#D4AF37] transition-colors">{title}</h4>
        <p className="text-[12px] text-gray-400 font-light leading-relaxed tracking-widest uppercase">{desc}</p>
      </div>
    </div>
  );
}

function Stat({ num, label }) {
  return (
    <div className="text-center">
       <p className="text-2xl font-serif italic text-[#1A1A1A] mb-1">{num}</p>
       <p className="text-[8px] font-black tracking-[0.4em] text-gray-300 uppercase">{label}</p>
    </div>
  );
}

function TeamMember({ name, role, img, delay = "0s" }) {
  return (
    <div className="luxury-reveal space-y-10 group" style={{ transitionDelay: delay }}>
      <div className="relative aspect-[3/4] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-[2s]">
        <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" alt={name} />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="space-y-2">
        <p className="text-[9px] tracking-[0.5em] font-black uppercase text-[#D4AF37]">{role}</p>
        <p className="text-3xl font-serif italic text-white group-hover:tracking-widest transition-all duration-700">{name}</p>
      </div>
    </div>
  );
}