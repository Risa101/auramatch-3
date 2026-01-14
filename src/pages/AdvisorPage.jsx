import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AOS from "aos";
import "aos/dist/aos.css";
import "./AdvisorPage.css";

/* ==========================================================
   Helpers & Icons
   ========================================================== */
const IconChevron = ({ open }) => (
  <svg 
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.6s cubic-bezier(0.19, 1, 0.22, 1)' }} 
    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  >
    <path d="M6 9l6 6 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Swatch = ({ color }) => (
  <div className="swatch group relative cursor-help" style={{ background: color, width: '22px', height: '22px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.05)' }}>
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 uppercase tracking-tighter">
      {color}
    </div>
  </div>
);

/* ==========================================================
   Data Mapping (Sync with i18n)
   ========================================================== */
const QUIZ = (t) => [
  {
    key: "ratio",
    q: t("advisor.quiz.ratio.q"),
    options: [
      { label: t("advisor.quiz.ratio.opt1"), score: { Round: 2, Square: 1 } },
      { label: t("advisor.quiz.ratio.opt2"), score: { Oval: 2, Diamond: 1 } },
      { label: t("advisor.quiz.ratio.opt3"), score: { Heart: 1, Triangle: 1, Oval: 1 } },
    ],
  },
  {
    key: "jaw",
    q: t("advisor.quiz.jaw.q"),
    options: [
      { label: t("advisor.quiz.jaw.opt1"), score: { Round: 2, Oval: 1 } },
      { label: t("advisor.quiz.jaw.opt2"), score: { Square: 2, Triangle: 1 } },
      { label: t("advisor.quiz.jaw.opt3"), score: { Heart: 2, Diamond: 1 } },
    ],
  },
  {
    key: "forehead",
    q: t("advisor.quiz.forehead.q"),
    options: [
      { label: t("advisor.quiz.forehead.opt1"), score: { Oval: 1, Round: 1, Square: 1 } },
      { label: t("advisor.quiz.forehead.opt2"), score: { Heart: 2, Oval: 1 } },
      { label: t("advisor.quiz.forehead.opt3"), score: { Triangle: 2, Diamond: 1 } },
    ],
  },
  {
    key: "overall",
    q: t("advisor.quiz.overall.q"),
    options: [
      { label: t("advisor.quiz.overall.opt1"), score: { Round: 1, Oval: 1 } },
      { label: t("advisor.quiz.overall.opt2"), score: { Square: 2, Diamond: 1 } },
      { label: t("advisor.quiz.overall.opt3"), score: { Heart: 2, Triangle: 1 } },
    ],
  },
];

const SEASONS_DATA = (t) => ["Spring", "Summer", "Autumn", "Winter"].map(s => ({
  key: s,
  name: t(`advisor.season.${s}.name`),
  undertone: t(`advisor.season.${s}.undertone`),
  desc: t(`advisor.season.${s}.desc`),
  best: t(`advisor.season.${s}.best`, { returnObjects: true }) || [],
  makeup: t(`advisor.season.${s}.makeup`, { returnObjects: true }) || [],
  palette: t(`advisor.season.${s}.palette`, { returnObjects: true }) || [],
}));

/* ==========================================================
   Main Component: AdvisorPage
   ========================================================== */
export default function AdvisorPage() {
  const { t } = useTranslation();
  const [faceResult, setFaceResult] = useState(null);
  const [openAcc, setOpenAcc] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 1200, easing: "ease-out-cubic", once: false });
  }, []);

  return (
    <div className="advisor-page bg-[#FDFCFB] text-[#1A1A1A] font-jost min-h-screen overflow-x-hidden">
      
      {/* 1. HERO HEADER */}
      <header className="relative pt-48 pb-24 text-center px-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-serif italic text-gray-100 opacity-40 select-none uppercase tracking-tighter">
            Guide
          </span>
        </div>
        <div className="relative z-10" data-aos="fade-up">
          <span className="text-[#D4AF37] tracking-[0.8em] uppercase text-[10px] font-black mb-6 block">
            AuraMatch Intelligence
          </span>
          <h1 className="text-6xl md:text-8xl font-serif italic text-[#1A1A1A] leading-tight font-medium">
            {t("advisor.hero.title")}
          </h1>
          <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto mt-10" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-10">
        
        {/* 2. FACE ANALYSIS SECTION */}
        <section className="mb-40">
          <div className="text-center mb-16" data-aos="fade-up">
            <h3 className="font-serif text-3xl italic mb-4">Face Shape Analysis</h3>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400">Discover your natural geometry</p>
          </div>
          
          {!faceResult ? (
            <div data-aos="zoom-in" data-aos-delay="200">
              <FaceQuiz onResult={setFaceResult} />
            </div>
          ) : (
            <div className="text-center animate-fadeIn py-20 bg-white border border-gray-100 shadow-2xl rounded-sm" data-aos="zoom-in">
              <span className="inline-block px-6 py-2 bg-[#D4AF37] text-white text-[10px] font-black tracking-widest uppercase mb-6">
                {t("advisor.faceResult.badge")}
              </span>
              <h2 className="text-6xl md:text-7xl font-serif italic mb-6">
                {t(`advisor.shape.${faceResult.shape}.name`)}
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-12 text-sm leading-relaxed font-light">
                {t(`advisor.shape.${faceResult.shape}.traits`)}
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <button 
                  onClick={() => setFaceResult(null)} 
                  className="px-12 py-4 border border-[#1A1A1A] text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500"
                >
                  {t("advisor.faceResult.retry")}
                </button>
                <button 
                  onClick={() => window.location.href='/analysis'}
                  className="px-12 py-4 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#D4AF37] transition-all duration-500 shadow-xl"
                >
                  {t("advisor.faceResult.toAnalysis")}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 3. KNOWLEDGE ATELIER (Accordion) */}
        <section className="mb-40 space-y-2 border-t border-gray-100">
          <AccordionItem 
            title={t("advisor.accordion.basics")} 
            isOpen={openAcc === 0} 
            onClick={() => setOpenAcc(openAcc === 0 ? -1 : 0)}
          >
            <div className="grid md:grid-cols-2 gap-20 py-16 px-4">
              <div className="space-y-6" data-aos="fade-right">
                <h4 className="font-serif text-3xl italic text-[#D4AF37]">{t("advisor.learn.whatis.title")}</h4>
                <p className="text-base text-gray-500 leading-relaxed font-light">{t("advisor.learn.whatis.desc")}</p>
              </div>
              <div className="bg-[#FAF9F8] p-12 rounded-sm border border-gray-50" data-aos="fade-left">
                <h4 className="font-black text-[11px] tracking-[0.5em] uppercase mb-8 text-[#1A1A1A]">{t("advisor.learn.axis.title")}</h4>
                <ul className="space-y-6 text-[12px] tracking-widest font-bold">
                   <li className="flex justify-between border-b border-gray-200 pb-4"><span>Undertone</span><span className="text-[#D4AF37]">{t("advisor.learn.axis.undertone")}</span></li>
                   <li className="flex justify-between border-b border-gray-200 pb-4"><span>Value</span><span className="text-[#D4AF37]">{t("advisor.learn.axis.value")}</span></li>
                   <li className="flex justify-between"><span>Chroma</span><span className="text-[#D4AF37]">{t("advisor.learn.axis.chroma")}</span></li>
                </ul>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem 
            title={t("advisor.accordion.seasons")} 
            isOpen={openAcc === 1} 
            onClick={() => setOpenAcc(openAcc === 1 ? -1 : 1)}
          >
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 py-16">
              {SEASONS_DATA(t).map((s, idx) => (
                <SeasonCard key={idx} s={s} index={idx} />
              ))}
            </div>
          </AccordionItem>
        </section>
      </main>

      <footer className="py-20 text-center border-t border-gray-50">
        <p className="text-[10px] font-black tracking-[0.8em] uppercase text-[#D4AF37]">Maison AuraMatch • Est. 2026</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500;1,700&family=Jost:wght@300;400;700;900&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-jost { font-family: 'Jost', sans-serif; }
        .shadow-lux { shadow-lux: 0 50px 100px -20px rgba(0,0,0,0.04); }
      `}</style>
    </div>
  );
}

/* ==========================================================
   Sub-Components
   ========================================================== */

function FaceQuiz({ onResult }) {
  const { t } = useTranslation();
  const QUIZ_DATA = QUIZ(t);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  if (!QUIZ_DATA[step]) return null;
  const q = QUIZ_DATA[step];

  const handlePick = (option) => {
    const newAnswers = { ...answers, [q.key]: option };
    setAnswers(newAnswers);
    if (step < QUIZ_DATA.length - 1) {
      setStep(step + 1);
    } else {
      const score = { Round: 0, Oval: 0, Square: 0, Heart: 0, Triangle: 0, Diamond: 0 };
      Object.values(newAnswers).forEach(ans => {
        Object.entries(ans.score).forEach(([shape, val]) => score[shape] += val);
      });
      const winner = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
      onResult({ shape: winner });
    }
  };

  return (
    <div className="bg-white p-12 md:p-20 border border-gray-100 shadow-2xl max-w-3xl mx-auto rounded-sm">
      <div className="mb-16">
        <div className="flex justify-between text-[10px] font-black tracking-[0.4em] text-gray-300 mb-6 uppercase">
          <span>Question 0{step + 1} / 0{QUIZ_DATA.length}</span>
          <span className="text-[#D4AF37]">{Math.round(((step + 1) / QUIZ_DATA.length) * 100)}% Complete</span>
        </div>
        <div className="h-[1px] bg-gray-100 w-full relative">
          <div className="absolute top-0 left-0 h-full bg-[#D4AF37] transition-all duration-1000 shadow-[0_0_8px_#D4AF37]" style={{ width: `${((step + 1) / QUIZ_DATA.length) * 100}%` }} />
        </div>
      </div>
      
      <h4 className="text-4xl md:text-5xl font-serif italic mb-16 text-center text-[#1A1A1A]">{q.q}</h4>
      
      <div className="grid gap-4">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handlePick(opt)}
            className="group flex items-center justify-between p-8 border border-gray-100 hover:border-[#D4AF37] transition-all duration-500 text-left"
          >
            <span className="text-[12px] font-bold tracking-widest uppercase text-gray-400 group-hover:text-[#1A1A1A] transition-colors">{opt.label}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-100 group-hover:bg-[#D4AF37] transition-all duration-500" />
          </button>
        ))}
      </div>
    </div>
  );
}

function AccordionItem({ title, children, isOpen, onClick }) {
  return (
    <div className="border-b border-gray-100">
      <button onClick={onClick} className="w-full flex justify-between items-center py-12 text-left group">
        <span className="font-serif text-3xl md:text-4xl italic group-hover:text-[#D4AF37] transition-all duration-500">{title}</span>
        <IconChevron open={isOpen} />
      </button>
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] overflow-hidden ${isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
}

function SeasonCard({ s, index }) {
  return (
    <div className="bg-white p-12 border border-gray-50 shadow-sm hover:shadow-2xl transition-all duration-700 group rounded-sm" data-aos="fade-up" data-aos-delay={index * 150}>
      <div className="flex justify-between items-start mb-10">
        <div>
          <h4 className="font-serif text-3xl italic text-[#1A1A1A] mb-2">{s.name}</h4>
          <span className="text-[10px] font-black tracking-[0.5em] text-[#D4AF37] uppercase">{s.undertone}</span>
        </div>
        <div className="flex gap-2">
          {s.palette.map((c, i) => <Swatch key={i} color={c} />)}
        </div>
      </div>
      <p className="text-sm text-gray-400 font-light leading-relaxed mb-10 border-l-2 border-[#D4AF37]/20 pl-6">{s.desc}</p>
      <div className="grid grid-cols-2 gap-10">
        <div>
          <span className="text-[9px] font-black tracking-[0.3em] text-gray-300 uppercase block mb-4">Core Colors</span>
          <ul className="text-[11px] space-y-3 font-medium text-gray-500">
            {s.best.map((b, i) => <li key={i} className="flex items-center gap-3">
              <div className="w-1 h-1 bg-[#D4AF37] rounded-full" /> {b}
            </li>)}
          </ul>
        </div>
        <div>
          <span className="text-[9px] font-black tracking-[0.3em] text-gray-300 uppercase block mb-4">Makeup Guide</span>
          <ul className="text-[11px] space-y-3 font-medium text-gray-500">
            {s.makeup.map((m, i) => <li key={i} className="flex items-center gap-3">
              <div className="w-1 h-1 bg-[#D4AF37] rounded-full" /> {m}
            </li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}