import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* ===== Config (colors) ===== */
const COLORS = {
  base: "#FADCDC",
  accent: "#E6DCEB",
  primary: "#75464A",
  hover: "#D85E79",
};

/* ===== Utilities ===== */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(m.matches);
    update();
    m.addEventListener?.("change", update);
    return () => m.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

function useReveal(selector = ".reveal", options = { threshold: 0.18 }) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(selector));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("reveal-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("reveal-in");
          io.unobserve(e.target);
        }
      });
    }, options);
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selector, options]);
}

/* === Tiny confetti burst for clicks (no lib) === */
function burstAt(el, color = COLORS.hover) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const n = 10;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("span");
    p.className = "burst-piece";
    p.style.left = `${cx}px`;
    p.style.top = `${cy}px`;
    p.style.setProperty("--dx", `${(Math.random() - 0.5) * 120}px`);
    p.style.setProperty("--dy", `${(Math.random() - 0.5) * 90}px`);
    p.style.setProperty("--rot", `${Math.random() * 360}deg`);
    p.style.background = i % 2 ? color : COLORS.accent;
    el.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}

/* ========== Small Visual Helpers ========== */
function ShimmerCard({
  children,
  className = "",
  pad = "p-5",
  onClick,
  onMouseDown,
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      onMouseDown={onMouseDown}
      className={`rounded-[1.25rem] p-[1px] shadow-sm transition-all duration-300 ${
        onClick ? "cursor-pointer" : ""
      } ${className} borderGlow pressable`}
      style={{
        background:
          "linear-gradient(90deg, #FADCDC, #E6DCEB, #ffd2e1, #d4c6ff)",
      }}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) =>
        onClick && (e.key === "Enter" || e.key === " ") && onClick()
      }
    >
      <div
        className={`rounded-=[1.2rem] border bg-white/75 backdrop-blur ${pad} reveal`}
        style={{ borderColor: COLORS.accent }}
      >
        {children}
      </div>
    </div>
  );
}

/** ========= Button ========= */
function MagneticButton({ children, className = "", style, ...props }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const strength = 18;
    const handle = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
    };
    const reset = () => (el.style.transform = "translate(0,0)");
    el.addEventListener("mousemove", handle);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", handle);
      el.removeEventListener("mouseleave", reset);
    };
  }, [reduced]);

  const ripple = (e) => {
    const el = ref.current;
    if (!el) return;
    const circle = document.createElement("span");
    const diameter = Math.max(el.clientWidth, el.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - el.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - el.getBoundingClientRect().top - radius}px`;
    circle.className = "btn-ripple";
    el.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  return (
    <button
      ref={ref}
      onClick={(e) => {
        ripple(e);
        props.onClick && props.onClick(e);
      }}
      className={`rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition will-change-transform hover:-translate-y-0.5 hover:shadow-md active:scale-[.98] overflow-hidden ${className}`}
      style={{
        background: "#FFB3C6",
        color: "#75464A",
        border: `1px solid ${COLORS.accent}`,
        boxShadow: "0 8px 18px rgba(255,179,198,.45)",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/* ===== Face type config (ใช้ key คงที่ แล้วไปแปลทีหลัง) ===== */
const FACE_TYPES = ["round", "oval", "square", "heart", "triangle", "diamond"];

/* ===== New Pretty Face Icons (gradient, soft shadow) ===== */
function FaceIcon({ typeKey, active }) {
  const typeMap = {
    round: "Round",
    oval: "Oval",
    square: "Square",
    heart: "Heart",
    triangle: "Triangle",
    diamond: "Diamond",
  };
  const type = typeMap[typeKey] || "Oval";

  const gStroke = active ? COLORS.primary : COLORS.accent;
  const gFill = active ? "#fff5f7" : "#ffffff";
  const size = 60;

  const defs = (
    <defs>
      <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f6ebff" />
      </linearGradient>
      <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="100%" stopColor={gFill} stopOpacity="0.9" />
      </linearGradient>
      <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.18" />
      </filter>
    </defs>
  );

  const common = {
    fill: "url(#shine)",
    stroke: gStroke,
    strokeWidth: 2,
    filter: "url(#soft)",
  };

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {defs}
      {type === "Round" && <circle cx="32" cy="32" r="20" {...common} />}
      {type === "Oval" && <ellipse cx="32" cy="32" rx="16" ry="20" {...common} />}
      {type === "Square" && (
        <rect x="16" y="16" width="32" height="32" rx="10" {...common} />
      )}
      {type === "Heart" && (
        <path
          d="M32 50s-14-9.3-20-16.7C7 28.6 9 20 16 18c5-1.5 8 1 10 3 2-2 5-4.5 10-3 7 2 9 10.6 4 15.3C46 40.7 32 50 32 50z"
          {...common}
        />
      )}
      {type === "Triangle" && <path d="M32 12 L52 48 H12 Z" {...common} />}
      {type === "Diamond" && (
        <path d="M32 10 L50 32 L32 54 L14 32 Z" {...common} />
      )}
      {/* gloss */}
      <ellipse cx="26" cy="24" rx="6" ry="4" fill="url(#edge)" opacity="0.45" />
    </svg>
  );
}

/* ========== Page Component ========== */
export default function AuramatchPage() {
  const { t } = useTranslation();
  const [shape, setShape] = useState("oval"); // เก็บเป็น key
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  useReveal();

  const swatches = useMemo(
    () => ({
      Spring: ["#f9cc99", "#f6b16a", "#f2a85a", "#e9c86f"],
      Summer: ["#d9c6e9", "#b8c7e5", "#cfd8f0", "#cfe1ec"],
      Autumn: ["#8b3e1f", "#cc6e1f", "#7e5d18", "#9a7a36"],
      Winter: ["#b80f2e", "#142d5a", "#3f3e4f", "#a7a4b1"],
    }),
    []
  );

  // ตั้ง title ตามภาษา
  useEffect(() => {
    document.title = t("home.pageTitle");
  }, [t]);

  // press effect helper
  const press = (e) => {
    const root = e.currentTarget;
    root.classList.add("pressed");
    burstAt(root);
    setTimeout(() => root.classList.remove("pressed"), 180);
  };

  return (
    <div id="home" className="min-h-screen text-slate-800 siteBG">
      {/* ===== HERO ===== */}
      <section className="relative z-10 min-h-[560px] md:min-h-[640px] flex items-center overflow-hidden">
        <img
          src="/assets/IMG_7259.PNG"
          alt={t("home.hero.imageAlt")}
          className="absolute inset-0 h-full w-full object-cover object-right hero-kenburns"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-white/10" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-14">
          <div className="reveal" style={{ transitionDelay: "60ms" }}>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-sm tagPulse"
              style={{ borderColor: COLORS.accent, color: COLORS.primary }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full animate-ping-fast"
                style={{ backgroundColor: COLORS.hover }}
              />
              {t("home.hero.badge")}
            </div>
            <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl text-[#75464A]">
              {t("home.hero.title")}
            </h1>
            <p className="mt-4 max-w-xl text-sm text-[#75464A]/75">
              {t("home.hero.desc")}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <MagneticButton onClick={() => navigate("/analysis")}>
                {t("home.hero.uploadBtn")}
              </MagneticButton>
              <MagneticButton
                onClick={() => navigate("/products")}
                style={{
                  background: "#ffffff",
                  color: COLORS.primary,
                  border: `1px solid ${COLORS.accent}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,.06)",
                }}
              >
                {t("home.hero.viewProductsBtn")}
              </MagneticButton>
            </div>
            <p className="mt-3 text-xs text-[#75464A]/60">
              {t("home.hero.meta")}
            </p>
          </div>
        </div>
      </section>

      {/* ===== Facial structure type (hover tilt + click burst) ===== */}
      <section id="analysis" className="bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <HeaderDivider
            title={t("home.section.facialType")}
            onClick={() => navigate("/advisor")}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {FACE_TYPES.map((key, idx) => (
              <button
                key={key}
                onMouseDown={press}
                onClick={() => {
                  setShape(key);
                  navigate("/advisor");
                }}
                className="reveal tiltCard pressable flex flex-col items-center gap-2 rounded-2xl border bg-white px-4 py-5 text-sm shadow-sm transition hover:shadow-lg hover:bg-[#FFB3C6]/30 relative overflow-hidden"
                style={{
                  borderColor: COLORS.accent,
                  color: COLORS.primary,
                  transitionDelay: `${idx * 40}ms`,
                }}
              >
                <FaceIcon typeKey={key} active={shape === key} />
                <span className="font-medium">
                  {t(`home.shape.${key}`)}
                </span>
              </button>
            ))}
          </div>
          <ShimmerCard className="mt-6" pad="p-4">
            <div className="text-sm text-[#75464A]">
              <strong className="mr-2">
                {t("home.facial.selectedLabel")}
              </strong>
              {t(`home.shape.${shape}`)}
            </div>
          </ShimmerCard>
        </div>
      </section>

      {/* ===== Personal Color (click pulse + burst) ===== */}
      <section className="bg-gradient-to-b from-white to-[#E6DCEB]/40">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <HeaderDivider
            title={t("home.section.personalColor")}
            onClick={() => navigate("/advisor")}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.entries(swatches).map(([season, colors], idx) => (
              <ShimmerCard
                key={season}
                pad="p-4"
                onMouseDown={press}
                onClick={() => navigate("/advisor")}
                className="hover:scale-[1.01] transition-transform reveal"
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <div className="mb-1 font-semibold text-[#75464A] flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full glowDot" />
                  {/* season ชื่อ palette ใช้คำแปล */}
                  <span>{t(`home.season.${season.toLowerCase()}`)}</span>
                </div>
                <p className="mb-3 text-xs text-[#75464A]/60">
                  {t("home.personal.paletteLabel")}
                </p>
                <div className="flex gap-2">
                  {colors.map((c, i) => (
                    <div
                      key={c}
                      className="h-6 w-6 rounded-md border shadow-sm swatch reveal"
                      style={{
                        backgroundColor: c,
                        borderColor: COLORS.accent,
                        transitionDelay: `${i * 30}ms`,
                      }}
                    />
                  ))}
                </div>
              </ShimmerCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Recommended products ===== */}
      <section className="bg-gradient-to-b from-white to-[#E6DCEB]/40">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <HeaderDivider title={t("home.section.recommended")} />
          <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                name: "LA GLACE PEACH BLUSH",
                price: "289",
                img: "/assets/brush1.jpg",
              },
              {
                name: "LA GLACE CONTOUR & HIGHLIGHT",
                price: "199",
                img: "/assets/contour.png",
              },
              {
                name: "LA GLACE BABBI VIBES",
                price: "289",
                img: "/assets/brush2.jpg",
              },
              {
                name: "LA GLACE CONCEALER",
                price: "259",
                img: "/assets/concealer.jpg",
              },
              {
                name: "LA GLACE ICY GLAZE GLOSS",
                price: "319",
                img: "/assets/lipoil.png",
              },
              {
                name: "LA GLACE GLOW CUSHION",
                price: "299",
                img: "/assets/cushion.png",
              },
            ].map((p, i) => (
              <article
                key={i}
                className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition reveal productCard"
                style={{
                  borderColor: COLORS.accent,
                  transitionDelay: `${i * 50}ms`,
                }}
              >
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs text-[#75464A]/60">
                    {t("home.products.badge")}
                  </div>
                  <div className="mt-1 flex items-start justify-between">
                    <h3 className="font-semibold text-[#75464A]">
                      {p.name}
                    </h3>
                    <span className="text-sm text-[#75464A]">
                      {t("home.products.pricePrefix")} {p.price}
                    </span>
                  </div>
                  <MagneticButton
                    className="mt-3 w-full"
                    onClick={() => navigate("/products")}
                  >
                    {t("home.products.buyNow")}
                  </MagneticButton>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Winter Looks ===== */}
      <section className="relative z-10 bg-[#FADCDC]/40 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <HeaderDivider title={t("home.section.winterLooks")} />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {[
              { titleKey: "home.winter.look1", img: "/makeup/winter/winter1.jpg" },
              { titleKey: "home.winter.look2", img: "/makeup/winter/winter2.jpg" },
              { titleKey: "home.winter.look3", img: "/makeup/winter/winter3.jpg" },
            ].map((w, i) => (
              <article
                key={w.titleKey}
                onClick={() => navigate("/look")}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl reveal"
                style={{
                  borderColor: COLORS.accent,
                  transitionDelay: `${i * 60}ms`,
                }}
                title={t("home.winter.cardTooltip")}
              >
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={w.img}
                    alt={t(w.titleKey)}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0">
                  <div
                    className="mx-4 mb-4 rounded-xl px-6 py-4 text-center shadow-lg transition duration-300 group-hover:opacity-100 opacity-95"
                    style={{
                      background:
                        "linear-gradient(0deg, rgba(255,179,198,0.65) 0%, rgba(255,179,198,0.4) 100%)",
                    }}
                  >
                    <div className="text-white text-base font-bold tracking-wide">
                      {t(w.titleKey)}
                    </div>
                    <button
                      onMouseDown={(e) => press(e)}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/look");
                      }}
                      className="mt-2 inline-block rounded-md bg-white/90 px-4 py-1.5 text-sm font-semibold text-[#75464A] hover:scale-[1.03] transition"
                    >
                      {t("home.winter.seeMore")}
                    </button>
                  </div>
                </div>
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[12px] font-medium text-[#75464A] shadow">
                  {t("home.winter.badge")}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Makeup Tutorial (YouTube + TikTok) ===== */}
      <section className="bg-[#FADCDC]/40">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <HeaderDivider title={t("home.section.tutorial")} />
          <ShortsRail />
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer
        className="border-t bg-white/80"
        style={{ borderColor: COLORS.accent }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 md:flex-row">
          <div className="text-sm text-[#75464A]">
            {t("home.footer.copy")}
          </div>
          <div className="flex gap-1 text-sm">
            {["instagram", "tiktok", "facebook"].map((s) => (
              <a
                key={s}
                href="#"
                className="rounded-md px-3 py-2 text-[#75464A] transition hover:bg-[#D85E79] hover:text-white"
              >
                {t(`home.footer.${s}`)}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ===== Styles (BG + Animations) ===== */}
      <style>{`
 /* Background gradient (โทนเดิม) */
 .siteBG {
 background:
 radial-gradient(1200px 600px at -10% -10%, rgba(250,220,220,.55), transparent 60%),
 radial-gradient(900px 480px at 110% 0%, rgba(230,220,235,.55), transparent 60%),
 linear-gradient(180deg, #fff 0%, #fff8fb 30%, #fdf2f7 55%, #f7f2ff 100%);
 background-attachment: fixed;
 }

 /* Reveal on scroll */
 .reveal { opacity: 0; transform: translateY(14px); transition: opacity .6s ease, transform .6s ease; }
 .reveal-in { opacity: 1 !important; transform: translateY(0) !important; }

 /* Press micro interaction */
 .pressable.pressed { transform: scale(.995); }
 .burst-piece {
 position: absolute; width: 6px; height: 6px; border-radius: 2px;
 transform: translate(-50%, -50%);
 animation: burst .7s ease-out forwards;
 }
 @keyframes burst {
 to {
 transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot));
 opacity: 0;
 }
 }

 /* Border glow */
 .borderGlow { position: relative; }
 .borderGlow::before {
 content: "";
 position: absolute; inset: 0; border-radius: 1.2rem;
 padding: 1px; 
 background: linear-gradient(90deg, #FADCDC, #E6DCEB, #ffd2e1, #d4c6ff);
 -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
 -webkit-mask-composite: xor; mask-composite: exclude;
 filter: blur(0px);
 opacity: .7; pointer-events: none;
 }
 .borderGlow:hover::before { filter: blur(2px); opacity: .95; transition: .3s; }

 /* Hero Ken Burns */
 .hero-kenburns { animation: kenburns 26s ease-in-out infinite; transform-origin: center; }
 @keyframes kenburns { 
 0% { transform: scale(1.03); } 
 50% { transform: scale(1.08); } 
 100% { transform: scale(1.03); } 
 }

 /* Header Divider */
 .headerLine {
 background: linear-gradient(90deg, ${COLORS.accent}, ${COLORS.base}, #ffd2e1, #d4c6ff);
 background-size: 200% 100%;
 animation: headerShift 6s linear infinite;
 border-radius: 2px; height: 2px;
 }
 @keyframes headerShift {
 0% { background-position: 0% 50% }
 50% { background-position: 100% 50% }
 100% { background-position: 0% 50% }
 }

 /* Hover tilt */
 .tiltCard { transform-style: preserve-3d; perspective: 600px; transition: transform .2s ease; }
 .tiltCard:hover { transform: rotateX(2deg) rotateY(-2deg) translateY(-2px); }

 /* Product card */
 .productCard:hover { box-shadow: 0 10px 30px rgba(0,0,0,.08); }

 /* Shine & ping */
 @keyframes spark { 0% { transform: translateY(0) translateX(0); opacity: .9 } 70% { opacity: .9 } 100% { transform: translateY(-40px) translateX(10px); opacity: 0 } }
 .animate-spark { animation: spark 6s ease-in-out infinite; }
 @keyframes ping-fast { 0% { transform: scale(1); opacity: .9 } 80%, 100% { transform: scale(1.8); opacity: 0 } }

 /* Glow dot */
 .glowDot { background: radial-gradient(circle, ${
   COLORS.hover
 } 0%, rgba(216,94,121,.0) 70%); box-shadow: 0 0 12px rgba(216,94,121,.35); }

 /* Button ripple */
 .btn-ripple {
 position: absolute; border-radius: 9999px; transform: scale(0); opacity: .35;
 background: white; animation: ripple .6s ease-out; pointer-events: none;
 }
 @keyframes ripple { to { transform: scale(2.6); opacity: 0; } }

 /* Reduce motion */
 @media (prefers-reduced-motion: reduce) {
 .reveal, .reveal-in, .hero-kenburns, .tiltCard, .tagPulse, .siteBG { animation: none !important; transition: none !important; transform: none !important; background-attachment: scroll !important; }
 }
 `}</style>
    </div>
  );
}

/* ===== Section header ===== */
function HeaderDivider({ title, onClick }) {
  return (
    <div
      className={`relative mb-10 flex items-center ${
        onClick ? "cursor-pointer select-none" : ""
      }`}
      onClick={onClick}
      title={onClick ? `Go to ${title}` : undefined}
    >
      <div className="h-[2px] flex-1 mx-[10px] headerLine" />
      <h2 className="text-2xl font-semibold text-[#75464A] whitespace-nowrap text-center reveal">
        {title}
      </h2>
      <div className="h-[2px] flex-1 mx-[10px] headerLine" />
    </div>
  );
}

/* ===== Shorts Rail (YouTube + TikTok) ===== */
function ShortsRail() {
  const { t } = useTranslation();
  const railRef = useRef(null);
  const items = [
    {
      type: "youtube",
      id: "YXcHOI4Bbc8",
      titleKey: "home.shorts.1",
    },
    {
      type: "youtube",
      id: "6iuzw0vX6nA",
      titleKey: "home.shorts.2",
    },
    {
      type: "youtube",
      id: "g9ssRteDO30",
      titleKey: "home.shorts.3",
    },
    {
      type: "youtube",
      id: "g9ssRteDO30",
      titleKey: "home.shorts.4",
    },
    {
      type: "youtube",
      id: "g9ssRteDO30",
      titleKey: "home.shorts.5",
    },
    {
      type: "youtube",
      id: "g9ssRteDO30",
      titleKey: "home.shorts.6",
    },
  ];

  const scrollBy = (dx) =>
    railRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <div className="relative">
      <button
        onClick={() => scrollBy(-320)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-white/90 px-3 py-2 shadow-sm hover:scale-105 transition"
        style={{ borderColor: COLORS.accent }}
        aria-label={t("home.shorts.scrollLeft")}
      >
        ‹
      </button>
      <button
        onClick={() => scrollBy(320)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-white/90 px-3 py-2 shadow-sm hover:scale-105 transition"
        style={{ borderColor: COLORS.accent }}
        aria-label={t("home.shorts.scrollRight")}
      >
        ›
      </button>

      <div
        ref={railRef}
        className="flex gap-4 overflow-x-auto scroll-smooth px-10 py-2"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map(({ type, id, titleKey }, i) => (
          <div
            key={`${type}-${id}-${i}`}
            className="min-w-[240px] max-w-[240px] shrink-0 rounded-2xl border bg-white shadow-sm overflow-hidden reveal hover:shadow-md transition"
            style={{
              borderColor: COLORS.accent,
              transitionDelay: `${i * 40}ms`,
            }}
          >
            <div className="aspect-[9/16] w-full">
              {type === "youtube" ? (
                <iframe
                  src={`https://www.youtube.com/embed/${id}`}
                  title={t(titleKey)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full hover:scale-[1.01] transition"
                />
              ) : (
                <iframe
                  src={`https://www.tiktok.com/embed/v2/video/${id}`}
                  title={t(titleKey)}
                  frameBorder="0"
                  allow="encrypted-media; fullscreen; clipboard-write"
                  className="h-full w-full hover:scale-[1.01] transition"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
