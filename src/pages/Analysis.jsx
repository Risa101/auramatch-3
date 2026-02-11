// src/pages/Analysis.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import "./Analysis.css";
import MakeoverStudio from "../components/MakeoverStudio.jsx";
import { saveAnalysisHistory } from "../callapi/call_api_user";

/* ✅ persist realtime */
import { auth } from "../lib/firebase";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
const db = getFirestore();

/* ====== BRAND COLORS ====== */
const COLORS = {
  base: "#FFF0F5",
  accent: "#F2E4EA",
  primary: "#4A4A4A",
  hover: "#D23669",
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5010").replace(/\/+$/, "");
const BASE_PATH = import.meta.env.BASE_URL || "/";
const assetPath = (p) => `${BASE_PATH}${String(p).replace(/^\/+/, "")}`;

const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
const FACE_TYPES = ["Oval", "Round", "Square", "Heart", "Diamond", "Rectangle"];

/* ---------------- Palettes ---------------- */
const PALETTES = {
  Spring: ["#FBD2B7", "#FFC78A", "#F8A87A", "#F6E2A2"],
  Summer: ["#D8C4F2", "#BFD6F6", "#CFE5F7", "#E3D9F9"],
  Autumn: ["#C17A43", "#E29D62", "#A4743A", "#B69355"],
  Winter: ["#AC1740", "#1F2E5E", "#44445A", "#B2B0BE"],
};

/* ---------------- Hair Color Palettes ---------------- */
const HAIR_COLORS = {
  Spring: [
    { name: "Honey Blonde", hex: "#D8B88A" },
    { name: "Golden Brown", hex: "#9A643C" },
    { name: "Peach Brown", hex: "#C1816B" },
  ],
  Summer: [
    { name: "Ash Brown", hex: "#6B605A" },
    { name: "Cool Beige", hex: "#B9AE9E" },
    { name: "Rose Brown", hex: "#A47486" },
  ],
  Autumn: [
    { name: "Chestnut", hex: "#6E3B2F" },
    { name: "Copper", hex: "#B35E27" },
    { name: "Caramel", hex: "#A8703C" },
  ],
  Winter: [
    { name: "Blue-Black", hex: "#0E1420" },
    { name: "Espresso", hex: "#2B1D19" },
    { name: "Cool Burgundy", hex: "#5A1F33" },
  ],
};

/* ---------------- Face feature recs ---------------- */
const SHAPE_RECS = {
  brows: { softArch: "Soft Arch", straight: "Straight", arched: "High Arch" },
  eyes: { natural: "Natural Gradient", cat: "Cat-Eye Lift", dolly: "Dolly Eye" },
  nose: { softContour: "Soft Contour", definedContour: "Defined Contour", natural: "Natural" },
  lips: { gradient: "Gradient Lip", full: "Full Bold Lip", soft: "Soft Blur Lip" },
};

/* ---------------- Products (sample) ---------------- */
const PRODUCTS = {
  Spring: [
    { name: "Peach Blush", price: "289", img: assetPath("product/brush1.jpg") },
    { name: "Coral Tint Balm", price: "219", img: assetPath("product/brush2.jpg") },
    { name: "Glow Cushion", price: "299", img: assetPath("product/contour.png") },
  ],
  Summer: [
    { name: "Mauve Cream Blush", price: "289", img: assetPath("product/brush1.jpg") },
    { name: "Cool Pink Lip Oil", price: "199", img: assetPath("product/lipoil.png") },
    { name: "Sheer Highlighter", price: "259", img: assetPath("product/brush1.jpg") },
  ],
  Autumn: [
    { name: "Terracotta Blush", price: "289", img: assetPath("product/brush1.jpg") },
    { name: "Honey Bronze", price: "349", img: assetPath("product/contour.png") },
    { name: "Matte Caramel Lip", price: "229", img: assetPath("product/lip.png") },
  ],
  Winter: [
    { name: "Berry Lip", price: "249", img: assetPath("product/lip.png") },
    { name: "Plum Glow Blush", price: "289", img: assetPath("product/brush1.jpg") },
    { name: "Cool Contour Stick", price: "299", img: assetPath("product/contour.png") },
  ],
};

/* ---------------- Hairstyles by face shape ---------------- */
const HAIR_STYLE_MAP = {
  Oval: [
    { key: "long-layers", name: "Long Layers", img: assetPath("hair/LongLayers.jpg") },
    { key: "soft-wave-lob", name: "Soft Wave Lob", img: assetPath("hair/Soft%20Wave%20Lob.jpg") },
    { key: "curtain-bangs", name: "Curtain Bangs", img: assetPath("hair/Curtain%20Bangs.jpg") },
  ],
  Round: [
    { key: "layered-wolf", name: "Soft Wolf Cut", img: assetPath("hair/SoftWolfCut.jpg") },
    { key: "long-straight", name: "Long Straight with Volume", img: assetPath("hair/Long%20StraightwithVolume.jpg") },
    { key: "side-bangs", name: "Side-swept Bangs", img: assetPath("hair/Side-sweptBangs.jpg") },
  ],
  Square: [
    { key: "textured-bob", name: "Textured Bob", img: assetPath("hair/TexturedBob.jpg") },
    { key: "soft-curl", name: "Soft C-curl", img: assetPath("hair/SoftC-curl.jpg") },
    { key: "round-layers", name: "Round Layers", img: assetPath("hair/roundlayers.jpg") },
  ],
  Heart: [
    { key: "face-framing", name: "Face-framing Layers", img: assetPath("hair/Face-framing%20Layers.jpg") }, // fixed
    { key: "airy-bangs", name: "Airy Bangs", img: assetPath("hair/Airy%20Bangs.jpg") },                       // fixed
    { key: "s-wave", name: "S-wave Medium", img: assetPath("hair/S-wave%20Medium.jpg") },                     // fixed
  ],
  Diamond: [
    { key: "lob-wave", name: "Lob Wave", img: assetPath("hair/lob-wave.jpg") },
    { key: "curtain-bangs", name: "Curtain Bangs", img: assetPath("hair/curtain-bangs.jpg") },
    { key: "long-soft", name: "Long Soft Layers", img: assetPath("hair/Long-layers.jpg") },
  ],
  Rectangle: [
    { key: "soft-waves", name: "Soft Waves", img: assetPath("hair/soft-waves.jpg") },
    { key: "bouncy-lob", name: "Bouncy Lob", img: assetPath("hair/bouncy-lob.jpg") },
    { key: "oval-bangs", name: "Oval Bang Curve", img: assetPath("hair/oval-bang.jpg") },
  ],
};

/* ---------- Utils (mock) ---------- */
async function analyzeImageMock(file) {
  await wait(600);
  const season = SEASONS[Math.floor(Math.random() * SEASONS.length)];
  const faceShape = FACE_TYPES[Math.floor(Math.random() * FACE_TYPES.length)];
  const hairLength = pick(["Short", "Medium", "Long"]);
  const hairTexture = pick(["Straight", "Wavy", "Curly"]);
  const face = {
    brows: pick(["softArch", "straight", "arched"]),
    eyes: pick(["natural", "cat", "dolly"]),
    nose: pick(["softContour", "definedContour", "natural"]),
    lips: pick(["gradient", "full", "soft"]),
  };
  return { season, face, faceShape, hairLength, hairTexture };
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ---------- YouTube helpers ---------- */
const FACE_SHAPE_TH = {
  Oval: "รูปไข่",
  Round: "ทรงกลม",
  Square: "สี่เหลี่ยม",
  Heart: "รูปหัวใจ",
  Diamond: "รูปเพชร",
  Rectangle: "สี่เหลี่ยมผืนผ้า",
  Pear: "ทรงลูกแพร์",
};
const SEASON_TH = {
  Spring: "สปริง",
  Summer: "ซัมเมอร์",
  Autumn: "ออทัมน์/เอิร์ธโทน",
  Winter: "วินเทอร์",
};
const EYE_QUERY = {
  natural: "แต่งตา natural gradient",
  cat: "อายไลเนอร์ cat eye ยกหาง",
  dolly: "แต่งตา dolly eye กลมหวาน",
};
const BROW_QUERY = {
  softArch: "เขียนคิ้ว soft arch",
  straight: "คิ้วเกาหลีตรง",
  arched: "คิ้วโก่ง high arch",
};
const buildYT = (q) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
function buildYouTubeLinks(result) {
  if (!result) return [];
  const links = [];
  const { season, faceShape, face } = result;
  if (season) {
    const th = SEASON_TH[season] || season;
    links.push({
      title: `แต่งหน้าโทน ${th} (Personal Color)`,
      url: buildYT(`แต่งหน้า โทน ${season} personal color ไทย`),
    });
    links.push({
      title: `เลือกสีลิป/บลัช โทน ${th}`,
      url: buildYT(`ลิป บลัช โทน ${season} personal color`),
    });
  }
  if (faceShape) {
    const th = FACE_SHAPE_TH[faceShape] || faceShape;
    links.push({
      title: `คอนทัวร์รูปหน้า (${th})`,
      url: buildYT(`คอนทัวร์ รูปหน้า ${th} how to`),
    });
  }
  if (face?.eyes)
    links.push({
      title: `เทคนิคตา: ${EYE_QUERY[face.eyes] || "แต่งตา"}`,
      url: buildYT(EYE_QUERY[face.eyes] || "แต่งตา"),
    });
  if (face?.brows)
    links.push({
      title: `เขียนคิ้ว: ${BROW_QUERY[face.brows] || "ทรงคิ้วเข้ากับใบหน้า"}`,
      url: buildYT(
        BROW_QUERY[face.brows] || "เขียนคิ้ว ทรงคิ้ว เข้ากับใบหน้า"
      ),
    });
  return links.slice(0, 5);
}

/* ---------- Shared UI helpers ---------- */
const CARD = "rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]";

/* ===== Utilities (Motion & Reveal) ===== */
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

/* ===== Magnetic Button ===== */
function MagneticButton({ children, className = "", style, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
  }, []);

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
      className={`relative overflow-hidden rounded-full px-8 py-4 text-[10px] font-[900] uppercase tracking-[0.2em] shadow-sm transition will-change-transform hover:-translate-y-0.5 hover:shadow-md active:scale-[.98] ${className}`}
      style={{
        background: COLORS.hover,
        color: "#ffffff",
        border: "1px solid transparent",
        boxShadow: "0 10px 24px rgba(210,54,105,.35)",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/* ===== Section Header ===== */
function SectionHeader({ title, meta }) {
  return (
    <div className="mb-10">
      <span className="text-[11px] tracking-[0.4em] font-black uppercase text-[#D23669]">
        Analysis Report
      </span>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h3 className="text-3xl md:text-4xl font-[900] tracking-tighter uppercase text-[#4A4A4A] reveal">
          {title}
        </h3>
        {meta && <div className="text-xs text-[#4A4A4A]/70">{meta}</div>}
      </div>
    </div>
  );
}

/* ===== Pretty Face Icon ===== */
function FaceIcon({ type }) {
  const size = 56;
  const gStroke = COLORS.primary;
  const gFill = "#ffffff";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="shineA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="100%" stopColor={gFill} stopOpacity="0.92" />
        </linearGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.18" />
        </filter>
      </defs>
      {type === "Oval" && (
        <ellipse
          cx="32"
          cy="32"
          rx="16"
          ry="20"
          fill="url(#shineA)"
          stroke={gStroke}
          strokeWidth="2"
          filter="url(#soft)"
        />
      )}
      {type === "Round" && (
        <circle
          cx="32"
          cy="32"
          r="20"
          fill="url(#shineA)"
          stroke={gStroke}
          strokeWidth="2"
          filter="url(#soft)"
        />
      )}
      {type === "Square" && (
        <rect
          x="16"
          y="16"
          width="32"
          height="32"
          rx="10"
          fill="url(#shineA)"
          stroke={gStroke}
          strokeWidth="2"
          filter="url(#soft)"
        />
      )}
      {type === "Heart" && (
        <path
          d="M32 50s-14-9.3-20-16.7C7 28.6 9 20 16 18c5-1.5 8 1 10 3 2-2 5-4.5 10-3 7 2 9 10.6 4 15.3C46 40.7 32 50 32 50z"
          fill="url(#shineA)"
          stroke={gStroke}
          strokeWidth="2"
          filter="url(#soft)"
        />
      )}
      {type === "Diamond" && (
        <path
          d="M32 10 L50 32 L32 54 L14 32 Z"
          fill="url(#shineA)"
          stroke={gStroke}
          strokeWidth="2"
          filter="url(#soft)"
        />
      )}
      {type === "Rectangle" && (
        <rect
          x="18"
          y="14"
          width="28"
          height="36"
          rx="8"
          fill="url(#shineA)"
          stroke={gStroke}
          strokeWidth="2"
          filter="url(#soft)"
        />
      )}
      <ellipse cx="26" cy="24" rx="5.5" ry="3.6" fill="#ffffff" opacity=".45" />
    </svg>
  );
}

/* ======= Palette UI ======= */
function PaletteRow({ colors }) {
  return (
    <div className="flex gap-2">
      {colors.map((c) => (
        <div
          key={typeof c === "string" ? c : c.hex}
          className="h-7 w-7 rounded-md border shadow-sm transition hover:-translate-y-0.5 reveal"
          style={{
            backgroundColor: typeof c === "string" ? c : c.hex,
            borderColor: COLORS.accent,
          }}
          title={typeof c === "string" ? c : `${c.name} ${c.hex}`}
        />
      ))}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      className="rounded-xl border bg-white/80 p-4 reveal"
      style={{ borderColor: COLORS.accent }}
    >
      <div className="text-xs text-[#4A4A4A]/70">{label}</div>
      <div className="text-sm font-semibold text-[#4A4A4A]">{value}</div>
    </div>
  );
}

function RecBadge({ text }) {
  return (
    <span
      className="rounded-full border px-3 py-1 text-xs font-medium reveal"
      style={{ borderColor: COLORS.accent, color: COLORS.primary }}
    >
      {text}
    </span>
  );
}

function ProductCard({ p }) {
  return (
    <article
      className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg reveal"
      style={{ borderColor: COLORS.accent }}
    >
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={p.img}
          alt={p.name}
          className="h-full w-full object-cover transition group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-4">
        <div className="text-xs text-[#4A4A4A]/60">Recommended</div>
        <div className="mt-1 flex items-start justify-between">
          <h4 className="font-semibold text-[#4A4A4A]">{p.name}</h4>
          <span className="text-sm text-[#4A4A4A]">THB {p.price}</span>
        </div>
        <MagneticButton className="mt-3 w-full">BUY NOW</MagneticButton>
      </div>
    </article>
  );
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E6DCEB] bg-white shadow-sm reveal">
      <div className="aspect-square w-full animate-pulse bg-[#E6DCEB]/30" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-[#E6DCEB]/50" />
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 animate-pulse rounded bg-[#E6DCEB]/50" />
          <div className="h-4 w-12 animate-pulse rounded bg-[#E6DCEB]/50" />
        </div>
        <div className="h-9 w-full animate-pulse rounded bg-[#E6DCEB]/50" />
      </div>
    </div>
  );
}

function HairCard({ styleItem }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-white shadow-sm reveal"
      style={{ borderColor: COLORS.accent }}
      title={styleItem.name}
    >
      <img
        src={styleItem.img}
        alt={styleItem.name}
        className="h-96 md:h-[28rem] w-full object-cover ring-4 transition duration-500 hover:scale-[1.02]"
        style={{ ringColor: COLORS.accent }}
      />
      <div className="p-3">
        <div className="text-sm font-semibold text-[#4A4A4A] flex items-center gap-2">
          <FaceIcon type="Oval" />
          {styleItem.name}
        </div>
        <div className="mt-1 text-xs text-[#4A4A4A]/60">
          เหมาะกับรูปหน้าที่ต้องการบาลานซ์สัดส่วน
        </div>
      </div>
    </div>
  );
}

/* ======== YouTube reels embed ======== */
function ytSearchEmbedUrl(q) {
  return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
    q
  )}&modestbranding=1&rel=0`;
}
function ytEmbedById(id) {
  return `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0`;
}
function resolveVideoId(title) {
  const t = title.toLowerCase();
  const map = [
    { match: ["personal color", "แต่งหน้าโทน", "season"], id: "rGn3IVEr7co" },
    { match: ["spring", "ลุค spring"], id: "g8Mjj0w0C1k" },
    { match: ["natural gradient", "แต่งตา", "eyeshadow"], id: "Z2PV7Jky3kc" },
    { match: ["brow", "คิ้ว", "เขียนคิ้ว"], id: "K5IRRxUsgpY" },
    { match: ["lip", "ลิป", "matte"], id: "1I2u8XUg5AY" },
  ];
  for (const row of map) if (row.match.some((k) => t.includes(k))) return row.id;
  return null;
}
function YouTubeReels({ result }) {
  if (!result) return null;
  const items = useMemo(() => buildYouTubeLinks(result), [result]);
  if (!items.length) return null;

  const trackRef = useRef(null);
  const scrollBy = (dx) => trackRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <section className={`${CARD} borderGlow`} style={{ borderColor: COLORS.accent }}>
      <SectionHeader
        title="YouTube Tutorials"
        meta={<span className="text-xs text-[#4A4A4A]/60">เลื่อนเพื่อดูหลายคลิป • คลิกเล่นได้ทันที</span>}
      />
      <div className="reels">
        <button aria-label="prev" className="reel-nav reel-nav--left" onClick={() => scrollBy(-360)}>❮</button>
        <div ref={trackRef} className="reel-track">
          {items.map((it, i) => {
            const vid = resolveVideoId(it.title);
            const src = vid ? ytEmbedById(vid) : ytSearchEmbedUrl(it.title);
            return (
              <div key={i} className="reel-card">
                <iframe
                  title={it.title}
                  className="reel-iframe"
                  src={src}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                <div className="reel-caption"><span className="line-clamp-1">{it.title}</span></div>
              </div>
            );
          })}
        </div>
        <button aria-label="next" className="reel-nav reel-nav--right" onClick={() => scrollBy(360)}>❯</button>
      </div>
    </section>
  );
}

/* ✅ persist ผลวิเคราะห์ (อ็อบเจ็กต์เต็ม + broadcast + Firestore) */
async function persistAnalysisResult(full) {
  const payload = {
    season: full?.season ?? null,
    faceShape: full?.faceShape ?? null,
    face: full?.face ?? null,
    hairLength: full?.hairLength ?? null,
    hairTexture: full?.hairTexture ?? null,
    preview: full?.preview || "",
    ts: Date.now(),
  };

  // 1) localStorage
  try {
    localStorage.setItem("auramatch:lastAnalysis", JSON.stringify(payload));
    if (payload.season)
      localStorage.setItem("auramatch:lastSeason", payload.season);
    if (payload.faceShape)
      localStorage.setItem("auramatch:lastFaceShape", payload.faceShape);
  } catch { }

  // 2) broadcast
  try {
    window.dispatchEvent(new Event("auramatch:update"));
    window.dispatchEvent(
      new CustomEvent("analysis:updated", {
        detail: { lastSeason: payload.season, lastFaceShape: payload.faceShape },
      })
    );
  } catch { }

  // 3) Firestore (optional)
  try {
    const u = auth?.currentUser;
    if (u) {
      await setDoc(
        doc(db, "users", u.uid),
        {
          lastSeason: payload.season,
          lastFaceShape: payload.faceShape,
          lastAnalysis: payload,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (e) {
    console.warn("Persist to Firestore failed:", e);
  }
}

function getLoggedUserId() {
  try {
    const u = JSON.parse(localStorage.getItem("auramatch:user") || "null");
    const raw = u?.uid || u?.user_id || u?.id;
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    const fallback = Number(localStorage.getItem("auramatch:coupon_last_uid"));
    return Number.isFinite(fallback) ? fallback : null;
  }
}

async function saveAnalysisToBackend(userId, entry) {
  if (!userId) {
    console.warn("No user_id found for analysis save.");
    return;
  }
  const payload = {
    user_id: userId,
    season: entry?.season || null,
    face_shape: entry?.faceShape || null,
    eyebrows: entry?.face?.brows || null,
    eyes: entry?.face?.eyes || null,
    nose: entry?.face?.nose || null,
    lips: entry?.face?.lips || null,
    image_path: entry?.preview || "",
    score: 100,
  };
  try {
    return await saveAnalysisHistory(payload);
  } catch (e) {
    console.warn("Save analysis failed:", e);
    return null;
  }
}

async function fetchLatestAnalysis(userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/analysis-history/${userId}`);
    const data = await res.json().catch(() => []);
    if (!res.ok || !Array.isArray(data) || data.length === 0) return null;
    const latest = data[0];
    return {
      season: latest.season || null,
      faceShape: latest.face_shape || null,
      face: {
        brows: latest.eyebrows || null,
        eyes: latest.eyes || null,
        nose: latest.nose || null,
        lips: latest.lips || null,
      },
      hairLength: null,
      hairTexture: null,
      preview: latest.image_path || "",
    };
  } catch (e) {
    console.warn("Fetch latest analysis failed:", e);
    return null;
  }
}

async function fetchAnalysisHistory(userId) {
  if (!userId) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/api/analysis-history/${userId}`);
    const data = await res.json().catch(() => []);
    if (!res.ok || !Array.isArray(data)) return [];
    return data;
  } catch (e) {
    console.warn("Fetch history failed:", e);
    return [];
  }
}

function normalizeHistoryRow(row) {
  return {
    id: row?.analysis_id || row?.id || row?.analysis_date || Math.random().toString(36),
    season: row?.season || null,
    faceShape: row?.face_shape || null,
    brows: row?.eyebrows || null,
    eyes: row?.eyes || null,
    nose: row?.nose || null,
    lips: row?.lips || null,
    preview: row?.image_path || "",
    date: row?.analysis_date || "",
  };
}

function buildHistoryRow(entry) {
  return {
    analysis_id: `local-${Date.now()}`,
    season: entry?.season || null,
    face_shape: entry?.faceShape || null,
    eyebrows: entry?.face?.brows || null,
    eyes: entry?.face?.eyes || null,
    nose: entry?.face?.nose || null,
    lips: entry?.face?.lips || null,
    analysis_date: new Date().toISOString(),
    image_path: entry?.preview || "",
  };
}

/* ---------- helper: แปลงไฟล์เป็น data URL เพื่อ persist ได้จริง ---------- */
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result); // data:image/..;base64,....
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

/* ===== History + Profile helpers (inline) ===== */
function readHistory() {
  try {
    return JSON.parse(localStorage.getItem("auramatch:analysisHistory") || "[]");
  } catch {
    return [];
  }
}
function writeHistory(list) {
  try {
    localStorage.setItem("auramatch:analysisHistory", JSON.stringify(list));
    // แจ้งทุกหน้าที่ฟังสองอีเวนต์นี้
    window.dispatchEvent(new Event("history:updated")); // เดิม
    window.dispatchEvent(new Event("history:changed")); // ใหม่
  } catch (e) {
    console.warn("writeHistory failed (likely LS quota):", e);
  }
}
function pushHistory(entry) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const u = (() => {
    try {
      return JSON.parse(localStorage.getItem("auramatch:user") || "null");
    } catch {
      return null;
    }
  })();
  const now = Date.now();
  const row = {
    id,
    ts: now,
    createdAt: now, // ✅ สำหรับ History.jsx ที่อ้าง createdAt
    season: entry?.season ?? null,
    faceShape: entry?.faceShape ?? null,
    preview: entry?.preview || "",
    face: entry?.face ?? null,
    hairLength: entry?.hairLength ?? null,
    hairTexture: entry?.hairTexture ?? null,
    uid: u?.uid || null,
  };
  const list = readHistory();
  const next = [row, ...list].slice(0, 50);
  writeHistory(next);
  return row;
}
function applyToProfile(entry) {
  try {
    const u = JSON.parse(localStorage.getItem("auramatch:user") || "null") || {};
    const updated = {
      ...u,
      lastSeason: entry?.season ?? u.lastSeason ?? null,
      lastFaceShape: entry?.faceShape ?? u.lastFaceShape ?? null,
      lastAnalysis: {
        season: entry?.season ?? null,
        faceShape: entry?.faceShape ?? null,
        face: entry?.face ?? null,
        hairLength: entry?.hairLength ?? null,
        hairTexture: entry?.hairTexture ?? null,
        preview: entry?.preview || "",
        ts: Date.now(),
      },
    };
    localStorage.setItem("auramatch:user", JSON.stringify(updated));
    window.dispatchEvent(new Event("user:updated"));
  } catch { }
}

/* ---------- shrink preview before persisting (avoid LS quota) ---------- */
function shrinkDataURL(src, maxW = 640, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve("");
    // ถ้าไม่ใช่ data: (เช่นเป็น /assets/... ) ก็ไม่ต้องย่อ
    if (!String(src).startsWith("data:")) return resolve(src);

    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const cvs = document.createElement("canvas");
      cvs.width = w;
      cvs.height = h;
      const ctx = cvs.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      try {
        const out = cvs.toDataURL("image/jpeg", quality);
        resolve(out);
      } catch (e) {
        resolve(src); // fallback
      }
    };
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

/* ---------------- Main ---------------- */
export default function Analysis() {
  useReveal();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("idle"); // idle | uploading | analyzing | done | error
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { season, face, faceShape, hairLength, hairTexture }
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const saveRequestedRef = useRef(false);

  const season = result?.season ?? null;
  const faceShape = result?.faceShape ?? null;

  const seasonPalette = season ? PALETTES[season] : [];
  const hairColorPalette = season ? HAIR_COLORS[season] : [];
  const seasonProducts = useMemo(() => (season ? PRODUCTS[season] : []), [season]);
  const hairStyles = useMemo(() => (!faceShape ? [] : HAIR_STYLE_MAP[faceShape] || []), [faceShape]);

  useEffect(() => {
    const userId = getLoggedUserId();
    if (!userId) return;
    const hydrate = async () => {
      const latest = await fetchLatestAnalysis(userId);
      const list = await fetchAnalysisHistory(userId);
      if (!latest) return;
      setResult((prev) => prev || latest);
      if (latest.preview) setPreview((prev) => prev || latest.preview);
      setStatus((prev) => (prev === "idle" ? "done" : prev));
      setHistory(list.slice(0, 8).map(normalizeHistoryRow));
      saveRequestedRef.current = true;
    };
    hydrate();
  }, []);

  useEffect(() => {
    if (status !== "done" || !result) return;
    if (saveRequestedRef.current) return;
    saveRequestedRef.current = true;
    const entry = { ...result, preview };
    setSaving(true);
    saveAnalysisToBackend(getLoggedUserId(), entry).finally(() => setSaving(false));
  }, [status, result, preview]);

  async function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      // ✅ ใช้ data URL เพื่อให้เก็บลง localStorage แล้วเอามาแสดงได้ข้ามรีเฟรช/แท็บ
      const dataUrl = await fileToDataURL(f);
      setFile(f);
      setPreview(dataUrl);
      setResult(null);
      setStatus("idle");
      setError("");
    } catch {
      setError("ไม่สามารถอ่านไฟล์ได้ ลองใหม่อีกครั้ง");
    }
  }

  async function analyzeImage() {
    if (!file && !preview) {
      setError("กรุณาอัปโหลดภาพก่อน");
      return;
    }
    try {
      saveRequestedRef.current = false;
      setError("");
      setStatus("uploading");
      await wait(400);
      setStatus("analyzing");
      const data = await analyzeImageMock(file || {});
      setResult(data);
      setStatus("done");

      // 🔽 ย่อรูปก่อนบันทึก – กัน localStorage เต็ม
      const smallPreview = await shrinkDataURL(preview, 640, 0.75);

      // ✅ บันทึกผล + ประวัติ + โปรไฟล์ + แจ้งหน้าอื่น (ใช้รูปที่ย่อแล้ว)
      const entry = { ...data, preview: smallPreview };
      await persistAnalysisResult(entry);
      pushHistory(entry);
      applyToProfile(entry);
      setHistory((prev) => [normalizeHistoryRow(buildHistoryRow(entry)), ...prev].slice(0, 8));
      setSaving(true);
      const saved = await saveAnalysisToBackend(getLoggedUserId(), entry);
      if (saved) {
        const userId = getLoggedUserId();
        const list = await fetchAnalysisHistory(userId);
        if (list.length > 0) {
          setHistory(list.slice(0, 8).map(normalizeHistoryRow));
        }
      }
      setSaving(false);
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการวิเคราะห์ ลองใหม่อีกครั้ง");
      setStatus("error");
      setSaving(false);
    }
  }

  function fillDemo() {
    // ใช้ภาพตัวอย่างที่อยู่ใน public เพื่อความเบา
    setFile(new File([""], "demo.jpg"));
    setPreview(assetPath("assets/analysis.JPG"));
    setStatus("analyzing");
    // ให้ state อัปเดตก่อนค่อยเรียก
    setTimeout(() => analyzeImage(), 0);
  }

  const press = (e) => {
    const root = e.currentTarget;
    root.classList.add("pressed");
    burstAt(root);
    setTimeout(() => root.classList.remove("pressed"), 160);
  };

  return (
    <div className="bg-white text-[#4A4A4A] font-sans selection:bg-[#FFD1DC] selection:text-[#D23669] antialiased">
      {/* HERO / UPLOAD */}
      <header className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <div
            className="h-full w-full bg-center bg-cover"
            style={{ backgroundImage: `url('${assetPath("assets/home.webp")}')` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
          <div
            className="absolute inset-0 opacity-30"
            aria-hidden="true"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,133,162,.35), transparent 45%), radial-gradient(circle at 80% 10%, rgba(210,54,105,.35), transparent 40%)",
            }}
          />
        </div>
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-10 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="reveal" style={{ transitionDelay: "60ms" }}>
              <div className="inline-flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-[#FF85A2]" />
                <span className="text-[8px] tracking-[0.2em] uppercase text-white font-black">AI BEAUTY LAB</span>
              </div>
              <h1 className="mt-5 text-4xl md:text-5xl lg:text-[3.5rem] font-[900] leading-none tracking-tighter text-white uppercase">
                Aura<span className="text-[#FF85A2]">Match</span> <br /> Analysis <span className="font-light italic text-white">Studio</span>
              </h1>
              <p className="mt-4 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-white/90 max-w-sm leading-relaxed">
                อัปโหลดภาพหน้า (มุมตรง แสงธรรมชาติ) เพื่อวิเคราะห์ Personal Color, โครงหน้า และทรงผมที่เหมาะกับคุณ
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <MagneticButton onClick={() => inputRef.current?.click()} className="text-[9px]">
                  เลือกรูปจากโทรศัพท์
                </MagneticButton>
                <MagneticButton
                  onClick={analyzeImage}
                  className="text-[9px]"
                  style={{
                    background: "#ffffff",
                    color: "#000000",
                    border: "1px solid rgba(255,255,255,.6)",
                    boxShadow: "0 10px 24px rgba(0,0,0,.18)",
                  }}
                >
                  วิเคราะห์ด้วย AI
                </MagneticButton>
                <MagneticButton
                  onClick={fillDemo}
                  className="text-[9px]"
                  style={{
                    background: "transparent",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,.4)",
                    boxShadow: "0 10px 24px rgba(0,0,0,.12)",
                  }}
                >
                  Demo Fill
                </MagneticButton>

                <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-white/70">
                รองรับกล้องมือถือ • รูปแบบ JPG/PNG • สูงสุด ~10MB
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-sm reveal" style={{ transitionDelay: "120ms" }}>
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] blur-2xl" style={{ background: "linear-gradient(45deg, rgba(255,133,162,.6), rgba(255,255,255,.1))" }} />
              <div className="aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 shadow-2xl">
                {preview ? <img src={preview} alt="preview" className="h-full w-full object-cover" /> : <img src={assetPath("assets/home.webp")} alt="placeholder" className="h-full w-full object-cover" />}
              </div>

              {/* Progress / Status */}
              <div className="mt-4">
                {status === "uploading" && <ProgressBar label="กำลังอัปโหลดภาพ…" />}
                {status === "analyzing" && <ProgressBar label="กำลังวิเคราะห์ด้วย AI…" />}
                {status === "done" && (
                  <div className="rounded-lg border border-white/20 px-3 py-2 text-[11px] text-white bg-white/10 backdrop-blur">
                    วิเคราะห์เสร็จแล้ว ✅
                  </div>
                )}
                {error && (
                  <div className="rounded-lg border border-rose-200/40 px-3 py-2 text-[11px] text-rose-100 bg-rose-500/10 backdrop-blur">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MARQUEE */}
      <div className="bg-[#D23669] py-5 overflow-hidden border-y border-white/10 relative z-20">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-white text-[10px] font-[900] tracking-[0.5em] uppercase mx-12">
              • DISCOVER YOUR SHAPE • ANALYSE YOUR COLOR • BOOST YOUR AURA •
            </span>
          ))}
        </div>
      </div>

      {/* RESULTS */}
      <main className="mx-auto max-w-[1400px] px-6 md:px-10 py-20">
        {/* Personal Color */}
        <section className={`${CARD} borderGlow`}>
          <SectionHeader
            title="Personal Color"
            meta={result?.season ? <span className="rounded-full bg-[#4A4A4A] px-3 py-1 text-xs font-semibold text-white">{result.season}</span> : null}
          />
          {/* preview thumb */}
          {preview && (
            <div className="mb-4 flex items-center gap-4 reveal">
              <div className="h-20 w-20 overflow-hidden rounded-xl border shadow-sm ring-4" style={{ borderColor: COLORS.accent, ringColor: COLORS.accent }}>
                <img src={preview} alt="your face" className="h-full w-full object-cover" />
              </div>
              <div className="text-xs text-[#4A4A4A]/60">รูปของคุณที่ใช้วิเคราะห์ (แนะนำมุมตรง แสงธรรมชาติ)</div>
            </div>
          )}
          {result?.season ? (
            <>
              <p className="text-sm text-[#4A4A4A]/75 reveal">
                จากการวิเคราะห์ คุณมีแนวโน้มอยู่ในฤดู <b>{result.season}</b> ซึ่งเหมาะกับเฉดตามพาเล็ตต์ด้านล่าง
              </p>
              <div className="mt-4"><PaletteRow colors={PALETTES[result.season]} /></div>
            </>
          ) : (
            <p className="text-sm text-[#4A4A4A]/60">ยังไม่มีข้อมูล — อัปโหลดรูปและกด “วิเคราะห์ด้วย AI”</p>
          )}
        </section>

        {/* Analysis History */}
        <section className={`${CARD} mt-8 borderGlow`}>
          <SectionHeader title="Recent Analyses" meta={<span className="text-xs text-[#4A4A4A]/60">ล่าสุด 8 รายการ</span>} />
          {history.length === 0 ? (
            <p className="text-sm text-[#4A4A4A]/60">ยังไม่มีประวัติการวิเคราะห์</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {history.map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-100 p-4 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-xl border bg-[#F8F6F4]">
                      {item.preview ? (
                        <img src={item.preview} alt="analysis" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-[#F8F6F4]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{item.season || "-"}</p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 truncate">
                        {item.faceShape || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 text-[10px] text-gray-400 uppercase tracking-widest">
                    {item.date || "recent"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Feature Analysis */}
        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className={`${CARD} borderGlow`}>
            <SectionHeader title="Feature Analysis" meta={<span className="text-xs text-[#4A4A4A]/60">วิเคราะห์โครงหน้าโดยรวม</span>} />
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Stat label="Eyebrows" value={result ? SHAPE_RECS.brows[result.face.brows] : "-"} />
              <Stat label="Eyes" value={result ? SHAPE_RECS.eyes[result.face.eyes] : "-"} />
              <Stat label="Nose" value={result ? SHAPE_RECS.nose[result.face.nose] : "-"} />
              <Stat label="Lips" value={result ? SHAPE_RECS.lips[result.face.lips] : "-"} />
            </div>
          </div>

          <div className={`${CARD} borderGlow`}>
            <SectionHeader title="Suggested Styles" meta={<span className="text-xs text-[#4A4A4A]/60">ทรง/สไตล์ที่เหมาะกับคุณ</span>} />
            <div className="mt-2 flex flex-wrap gap-2">
              {result ? (
                <>
                  <span onMouseDown={press}><RecBadge text={`Brows: ${SHAPE_RECS.brows[result.face.brows]}`} /></span>
                  <span onMouseDown={press}><RecBadge text={`Eyes: ${SHAPE_RECS.eyes[result.face.eyes]}`} /></span>
                  <span onMouseDown={press}><RecBadge text={`Nose: ${SHAPE_RECS.nose[result.face.nose]}`} /></span>
                  <span onMouseDown={press}><RecBadge text={`Lips: ${SHAPE_RECS.lips[result.face.lips]}`} /></span>
                </>
              ) : (
                <span className="text-sm text-[#4A4A4A]/60">ไม่มีข้อมูล</span>
              )}
            </div>
          </div>
        </section>

        {/* Hair Profile */}
        <section className="mt-8">
          <div className={`${CARD} borderGlow`}>
            <SectionHeader
              title="Hair Profile"
              meta={result?.faceShape ? <span className="rounded-full bg-[#4A4A4A] px-3 py-1 text-xs font-semibold text-white">Face Shape: {result.faceShape}</span> : null}
            />
            {result ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Stat label="Face Shape" value={result.faceShape} />
                <Stat label="Hair Length" value={result.hairLength} />
                <Stat label="Hair Texture" value={result.hairTexture} />
              </div>
            ) : (
              <p className="text-sm text-[#4A4A4A]/60">ยังไม่มีข้อมูล — วิเคราะห์ก่อนเพื่อดูโปรไฟล์เส้นผม</p>
            )}
          </div>
        </section>

        {/* Recommended Hairstyles */}
        <section className="mt-8">
          <div className={`${CARD} borderGlow`}>
            <SectionHeader title="Recommended Hairstyles" meta={result?.faceShape && <span className="text-xs text-[#4A4A4A]/70">อิงรูปหน้า {result.faceShape}</span>} />
            {result ? (
              (HAIR_STYLE_MAP[result.faceShape] || []).length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {(HAIR_STYLE_MAP[result.faceShape] || []).map((s) => <HairCard key={s.key} styleItem={s} />)}
                </div>
              ) : (
                <p className="text-sm text-[#4A4A4A]/60">ยังไม่มีคำแนะนำทรงผมสำหรับรูปหน้านี้</p>
              )
            ) : (
              <p className="text-sm text-[#4A4A4A]/60">ยังไม่มีข้อมูล — วิเคราะห์ก่อนเพื่อดูทรงผมที่เหมาะ</p>
            )}
            {result && (
              <div className="mt-4 flex flex-wrap gap-2">
                <RecBadge text="Tip: เพิ่มวอลุ่มบริเวณที่ต้องการบาลานซ์สัดส่วน" />
                <RecBadge text="Tip: เลือกความยาวให้พอดีกับสัดส่วนคาง/คอ" />
              </div>
            )}
          </div>
        </section>

        {/* Recommended Hair Colors */}
        <section className="mt-8">
          <div className={`${CARD} borderGlow`}>
            <SectionHeader title="Recommended Hair Colors" meta={result?.season && <span className="text-xs text-[#4A4A4A]/70">อิง Personal Color: {result.season}</span>} />
            {result?.season ? (
              <>
                <p className="text-sm text-[#4A4A4A]/75 reveal">
                  สีผมที่เข้ากับอุณหภูมิสีผิวและคอนทราสต์ของฤดู <b>{result.season}</b> (แนะนำ swatch ด้านล่าง)
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <PaletteRow colors={HAIR_COLORS[result.season]} />
                  <div className="text-xs text-[#4A4A4A]/60">
                    {HAIR_COLORS[result.season].map((c) => c.name).join(" • ")}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#4A4A4A]/60">
                อัปโหลดรูปและวิเคราะห์เพื่อดูเฉดสีผมที่เหมาะกับคุณ
              </p>
            )}
          </div>
        </section>

        {/* YouTube Tutorials */}
        {status === "done" && (
          <div className="mt-8">
            <YouTubeReels result={result} />
          </div>
        )}

        {/* Makeover Studio */}
        <MakeoverStudio base={preview || assetPath("assets/analysis.JPG")} />

        {/* Products */}
        <section className="mt-8">
          <div className={`${CARD} borderGlow`}>
            <SectionHeader
              title="Recommended Products"
              meta={
                result?.season && (
                  <span className="text-xs text-[#4A4A4A]/70">
                    สำหรับโทน {result.season}
                  </span>
                )
              }
            />
            {status === "idle" && !result?.season && (
              <p className="text-sm text-[#4A4A4A]/60">
                อัปโหลดรูปและกด “วิเคราะห์ด้วย AI” เพื่อดูสินค้าที่เหมาะกับโทนสีของคุณ
              </p>
            )}
            {status === "analyzing" && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            )}
            {status === "done" && result?.season && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {(PRODUCTS[result.season] || []).map((p, idx) => (
                  <ProductCard key={idx} p={p} />
                ))}
              </div>
            )}
            {status === "done" &&
              result?.season &&
              (PRODUCTS[result.season] || []).length === 0 && (
                <p className="text-sm text-[#4A4A4A]/60">
                  ยังไม่มีสินค้าสำหรับฤดูนี้
                </p>
              )}
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-[#4A4A4A]/60">
          *คำแนะนำนี้เพื่อการแนะนำด้านความงามทั่วไป ไม่ใช่การวินิจฉัยทางการแพทย์
        </p>
      </main>

      {/* Sticky bar (mobile) */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/90 p-3 backdrop-blur md:hidden"
        style={{ borderColor: COLORS.accent }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-1">
          <MagneticButton onClick={() => inputRef.current?.click()} className="flex-1">
            อัปโหลดรูป
          </MagneticButton>
          <MagneticButton
            onClick={analyzeImage}
            className="flex-1"
            style={{
              background: "#ffffff",
              color: COLORS.primary,
              border: "1px solid #E5E5E5",
              boxShadow: "0 4px 12px rgba(0,0,0,.06)",
            }}
          >
            วิเคราะห์
          </MagneticButton>
        </div>
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D23669; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function ProgressBar({ label }) {
  return (
    <div className="rounded-lg border p-3 reveal" style={{ borderColor: COLORS.accent, background: "#fff" }}>
      <div className="mb-1 text-xs text-[#4A4A4A]/70">{label}</div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E6DCEB]/40">
        <div className="h-2 w-1/3 animate-[progress_1.2s_ease-in-out_infinite] rounded-full" style={{ background: COLORS.primary }} />
      </div>
    </div>
  );
}
