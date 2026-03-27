// src/pages/Analysis.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Analysis.css";
import MakeoverStudio from "../components/MakeoverStudio.jsx";
import { saveAnalysisHistory, generateGeminiImage, analyzeFaceApi } from "../callapi/call_api_user";

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

function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";
  if (raw) return String(raw).replace(/\/+$/, "");
  return "";
}

const API_BASE_URL = resolveApiBaseUrl();
const GEMINI_PROMPT = import.meta.env.VITE_GEMINI_PROMPT || "Create a studio-quality beauty portrait based on the uploaded face photo. Keep the subject identity consistent, soft glam makeup, natural skin texture, clean background.";
const BASE_PATH = import.meta.env.BASE_URL || "/";
const assetPath = (p) => `${BASE_PATH}${String(p).replace(/^\/+/, "")}`;

const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
const FACE_TYPES = ["Oval", "Round", "Square", "Heart", "Diamond", "Rectangle"];
const SEASON_META = {
  Spring: { tone: "Warm • Bright", note: "Bright and vibrant, warm tone", glow: "from-[#FFF1D8] to-[#FFDDE7]" },
  Summer: { tone: "Cool • Soft", note: "Soft and gentle, cool tone", glow: "from-[#EAF2FF] to-[#F1E8FF]" },
  Autumn: { tone: "Warm • Deep", note: "Deep and warm, rich dimension", glow: "from-[#F8E8D6] to-[#F6E1CF]" },
  Winter: { tone: "Cool • Vivid", note: "Sharp and vivid, high contrast", glow: "from-[#ECECFF] to-[#E9EEF9]" },
};
const FACE_META = {
  Oval: "Balanced and soft, versatile with many styles",
  Round: "Soft and youthful, great for adding dimension",
  Square: "Strong jaw definition, looks bold and confident",
  Heart: "Prominent forehead, tapered chin, looks sweet",
  Diamond: "Defined cheekbones, sharp and charming",
  Rectangle: "Elegantly elongated, clear bone structure",
};

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
    { name: "Peach Blush", price: "289", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=peach%20blush" },
    { name: "Coral Tint Balm", price: "219", img: assetPath("product/brush2.jpg"), shopUrl: "https://shopee.co.th/search?keyword=coral%20tint%20balm" },
    { name: "Glow Cushion", price: "299", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=glow%20cushion" },
  ],
  Summer: [
    { name: "Mauve Cream Blush", price: "289", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=mauve%20cream%20blush" },
    { name: "Cool Pink Lip Oil", price: "199", img: assetPath("product/lipoil.png"), shopUrl: "https://shopee.co.th/search?keyword=lip%20oil%20cool%20pink" },
    { name: "Sheer Highlighter", price: "259", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=sheer%20highlighter" },
  ],
  Autumn: [
    { name: "Terracotta Blush", price: "289", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=terracotta%20blush" },
    { name: "Honey Bronze", price: "349", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=honey%20bronzer" },
    { name: "Matte Caramel Lip", price: "229", img: assetPath("product/lip.png"), shopUrl: "https://shopee.co.th/search?keyword=matte%20caramel%20lip" },
  ],
  Winter: [
    { name: "Berry Lip", price: "249", img: assetPath("product/lip.png"), shopUrl: "https://shopee.co.th/search?keyword=berry%20lipstick" },
    { name: "Plum Glow Blush", price: "289", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=plum%20blush" },
    { name: "Cool Contour Stick", price: "299", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=cool%20contour%20stick" },
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
  Oval: "Oval",
  Round: "Round",
  Square: "Square",
  Heart: "Heart",
  Diamond: "Diamond",
  Rectangle: "Rectangle",
  Pear: "Pear",
};
const SEASON_TH = {
  Spring: "Spring",
  Summer: "Summer",
  Autumn: "Autumn / Earth Tone",
  Winter: "Winter",
};
const EYE_QUERY = {
  natural: "natural gradient eye makeup",
  cat: "cat eye liner winged",
  dolly: "dolly eye round sweet",
};
const BROW_QUERY = {
  softArch: "soft arch brow tutorial",
  straight: "straight korean brow",
  arched: "high arch brow tutorial",
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
      title: `Makeup for ${th} tone (Personal Color)`,
      url: buildYT(`makeup ${season} personal color tutorial`),
    });
    links.push({
      title: `Lip & Blush colors for ${th} tone`,
      url: buildYT(`lip blush ${season} personal color`),
    });
  }
  if (faceShape) {
    const th = FACE_SHAPE_TH[faceShape] || faceShape;
    links.push({
      title: `Contour for ${th} face shape`,
      url: buildYT(`contour face shape ${th} how to`),
    });
  }
  if (face?.eyes)
    links.push({
      title: `Eye technique: ${EYE_QUERY[face.eyes] || "eye makeup"}`,
      url: buildYT(EYE_QUERY[face.eyes] || "eye makeup tutorial"),
    });
  if (face?.brows)
    links.push({
      title: `Brow tutorial: ${BROW_QUERY[face.brows] || "brow shape for face"}`,
      url: buildYT(
        BROW_QUERY[face.brows] || "brow shaping tutorial face shape"
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
  const openShop = () => {
    if (!p?.shopUrl) return;
    window.open(p.shopUrl, "_blank", "noopener,noreferrer");
  };

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
        <MagneticButton onClick={openShop} className="mt-3 w-full">BUY NOW</MagneticButton>
      </div>
    </article>
  );
}

function SelectedProductCard({ product, season }) {
  if (!product) return null;
  const openShop = () => {
    if (!product?.shopUrl) return;
    window.open(product.shopUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-[#F3D5E0] bg-white shadow-[0_20px_50px_rgba(210,54,105,0.14)]">
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-[#FFF4F8] to-[#FFEAF2]">
        <img
          src={product.img}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full border border-[#FFD1DC] bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#D23669]">
          Selected
        </span>
      </div>

      <div className="space-y-3 p-5">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D23669]">
          Match For {season || "Your Tone"}
        </div>
        <h4 className="text-xl font-[900] tracking-tight text-[#2F2A31]">{product.name}</h4>
        <div className="text-sm text-[#6A6570]">Estimated price</div>
        <div className="text-2xl font-[900] text-[#D23669]">THB {product.price}</div>
        <p className="text-sm text-[#5B5560]">
          This item was selected from your makeover tool. Purchase it instantly from an online store.
        </p>
        <MagneticButton onClick={openShop} className="w-full">
          BUY THIS LOOK
        </MagneticButton>
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
          Ideal for face shapes that need balanced proportions
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
    { match: ["personal color", "makeup for", "season"], id: "rGn3IVEr7co" },
    { match: ["spring", "spring look"], id: "g8Mjj0w0C1k" },
    { match: ["natural gradient", "eye makeup", "eyeshadow"], id: "Z2PV7Jky3kc" },
    { match: ["brow", "brow tutorial", "brow shaping"], id: "K5IRRxUsgpY" },
    { match: ["lip", "lip tutorial", "matte"], id: "1I2u8XUg5AY" },
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
        meta={<span className="text-xs text-[#4A4A4A]/60">Scroll to see more clips • Click to play</span>}
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

/* ✅ persist analysis result (full object + broadcast + Firestore) */
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
    id: row?.analysis_id || row?.history_id || row?.id || row?.analysis_date || Math.random().toString(36),
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

/* ---------- helper: convert file to data URL for persistent storage ---------- */
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
    // Notify all pages listening to both events
    window.dispatchEvent(new Event("history:updated")); // original
    window.dispatchEvent(new Event("history:changed")); // new
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
    createdAt: now, // ✅ for History.jsx that references createdAt
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
    // If not a data: URL (e.g. /assets/...) no need to shrink
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
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("idle"); // idle | uploading | analyzing | done | error
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { season, face, faceShape, hairLength, hairTexture }
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  const [step4Done, setStep4Done] = useState(false);
  const [selectedStudioProduct, setSelectedStudioProduct] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const inputRef = useRef(null);
  const saveRequestedRef = useRef(false);

  const [geminiImage, setGeminiImage] = useState("");
  const [geminiStatus, setGeminiStatus] = useState("idle");
  const [geminiError, setGeminiError] = useState("");

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

    // File validation
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    const MAX_SIZE_MB = 10;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Please upload an image file (JPG, PNG, WEBP) only.");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size must not exceed ${MAX_SIZE_MB} MB.`);
      e.target.value = "";
      return;
    }

    try {
      const dataUrl = await fileToDataURL(f);
      setFile(f);
      setPreview(dataUrl);
      setResult(null);
      setStep3Done(false);
      setStep4Done(false);
      setCurrentStep(1);
      setStatus("idle");
      setError("");
      await runAnalysis({ pickedFile: f, previewSrc: dataUrl, autoMode: true });
    } catch {
      setError("Unable to read the file. Please try again.");
    }
  }

  async function runAnalysis({ pickedFile = file, previewSrc = preview, autoMode = false } = {}) {
    if (!pickedFile && !previewSrc) {
      setError("Please upload an image first.");
      return;
    }
    try {
      saveRequestedRef.current = false;
      setError("");
      setStatus("uploading");
      setStep4Done(false);
      await wait(400);
      setStatus("analyzing");
      let data;
      if (pickedFile && pickedFile.size > 0) {
        try {
          const res = await analyzeFaceApi(pickedFile);
          data = {
            season: res.season,
            faceShape: res.faceShape,
            face: res.face,
            hairLength: pick(["Short", "Medium", "Long"]),
            hairTexture: pick(["Straight", "Wavy", "Curly"]),
          };
        } catch (apiErr) {
          console.warn("Gemini analyze-face failed, falling back to mock:", apiErr);
          data = await analyzeImageMock(pickedFile);
        }
      } else {
        data = await analyzeImageMock(pickedFile || {});
      }
      setResult(data);
      setStatus("done");
      setCurrentStep(2);

      // 🔽 Shrink image before saving — prevent localStorage from overflowing
      const smallPreview = await shrinkDataURL(previewSrc, 640, 0.75);

      // ✅ Save result + history + profile + notify other pages (using shrunken image)
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
      setError("An error occurred during analysis. Please try again.");
      setStatus("error");
      setSaving(false);
      if (autoMode) setCurrentStep(1);
    }
  }

  async function analyzeImage() {
    await runAnalysis();
  }

  async function runGeminiGeneration() {
    if (!file && !preview) {
      setGeminiError("Please upload an image first.");
      return;
    }
    try {
      setGeminiError("");
      setGeminiStatus("loading");

      // If file is empty (demo mode), fetch image from preview URL instead
      let imageFile = file;
      if (!imageFile || imageFile.size === 0) {
        const resp = await fetch(preview);
        const blob = await resp.blob();
        imageFile = new File([blob], "image.jpg", { type: blob.type || "image/jpeg" });
      }

      const res = await generateGeminiImage({ file: imageFile, prompt: GEMINI_PROMPT });
      setGeminiImage(res?.image || res?.data_url || "");
      setGeminiStatus("done");
    } catch (err) {
      console.error(err);
      setGeminiError("Image generation failed. Please try again.");
      setGeminiStatus("error");
    }
  }

  function fillDemo() {
    const demoFile = new File([""], "demo.jpg");
    const demoPreview = assetPath("assets/analysis.JPG");
    setFile(demoFile);
    setPreview(demoPreview);
    setResult(null);
    setStep3Done(false);
    setStep4Done(false);
    setCurrentStep(1);
    setError("");
    runAnalysis({ pickedFile: demoFile, previewSrc: demoPreview, autoMode: true });
  }

  const press = (e) => {
    const root = e.currentTarget;
    root.classList.add("pressed");
    burstAt(root);
    setTimeout(() => root.classList.remove("pressed"), 160);
  };

  const stepDone = {
    1: !!preview,
    2: !!result,
    3: step3Done,
    4: step4Done,
  };
  const canGoNext =
    (currentStep === 1 && !!preview) ||
    (currentStep === 2 && !!result) ||
    (currentStep === 3 && !!result) ||
    (currentStep === 4);

  const nextStep = () => {
    if (currentStep === 1 && !preview) return setError("Please upload a photo first.");
    if (currentStep === 2 && !result) return setError("Please analyze your photo first.");
    if (currentStep === 3) setStep3Done(true);
    if (currentStep === 4) setStep4Done(true);
    setCurrentStep((s) => Math.min(4, s + 1));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  return (
    <div className="bg-white text-[#4A4A4A] font-sans selection:bg-[#FFD1DC] selection:text-[#D23669] antialiased">
      <main className="mx-auto max-w-[1400px] px-6 md:px-10 py-20">
        <section className={`${CARD} borderGlow`}>
          <SectionHeader title="Analysis Process" meta={<span className="text-xs text-[#4A4A4A]/70">Pink circle = completed step</span>} />
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((step, idx) => (
              <React.Fragment key={step}>
                <button
                  onClick={() => setCurrentStep(step)}
                  className={`h-11 w-11 shrink-0 rounded-full border text-sm font-black transition ${
                    stepDone[step]
                      ? "bg-[#D23669] text-white border-[#D23669]"
                      : currentStep === step
                      ? "bg-[#FFF5F8] text-[#D23669] border-[#D23669]"
                      : "bg-white text-[#4A4A4A] border-[#E6DCEB]"
                  }`}
                >
                  {step}
                </button>
                {idx < 3 && (
                  <div
                    className={`h-[2px] min-w-[40px] flex-1 ${stepDone[step] ? "bg-[#D23669]" : "bg-[#E6DCEB]"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-4 text-xs uppercase tracking-[0.2em] text-[#4A4A4A]/60">
            {currentStep === 1 && "Step 1: Upload"}
            {currentStep === 2 && "Step 2: Analyze"}
            {currentStep === 3 && "Step 3: Edit + Shop Makeup"}
            {currentStep === 4 && "Step 4: Recommendations"}
          </div>
        </section>

        {currentStep === 1 && (
          <section className={`${CARD} mt-8 borderGlow`}>
            <SectionHeader title="Step 1: Upload Your Photo" />
            <div className="rounded-3xl border border-[#FFDCE6] bg-gradient-to-br from-[#FFF8FB] via-[#FFF1F6] to-[#FFEAF2] p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#D23669]">Quick Start</div>
                  <p className="mt-2 text-sm text-[#4A4A4A]/80">
                    Upload your face photo and the system will analyze it automatically — no need to press anything.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-xs text-[#4A4A4A]/70">
                  Supports photos from camera and local files
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <MagneticButton onClick={() => inputRef.current?.click()} className="text-[9px]">Choose from Phone</MagneticButton>
                <MagneticButton
                  onClick={fillDemo}
                  className="text-[9px]"
                  style={{ background: "white", color: "#4A4A4A", border: "1px solid #E6DCEB", boxShadow: "0 4px 12px rgba(0,0,0,.06)" }}
                >
                  Demo Fill
                </MagneticButton>
                <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="overflow-hidden rounded-3xl border border-[#EAD9E3] bg-[#FAF7FB] shadow-[0_18px_35px_rgba(210,54,105,0.08)]">
                <div className="aspect-[4/5] w-full">
                  {preview ? <img src={preview} alt="preview" className="h-full w-full object-cover" /> : <img src={assetPath("assets/analysis1.jpeg")} alt="placeholder" className="h-full w-full object-cover" />}
                </div>
                <div className="border-t border-[#F0E4EA] bg-white/90 px-4 py-3 text-xs text-[#4A4A4A]/65">
                  Photo should be taken straight-on, face visible, no filters
                </div>
              </div>

              <div className="space-y-3 rounded-3xl border border-[#EAD9E3] bg-[#FFFCFE] p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#D23669]">Upload Status</div>
                {status === "uploading" && <ProgressBar label="Uploading image..." />}
                {status === "analyzing" && <ProgressBar label="Analyzing with AI..." />}
                {stepDone[1] ? (
                  <div className="rounded-xl border border-[#FFD1DC] bg-[#FFF5F8] px-4 py-3 text-sm text-[#D23669] font-semibold">Upload complete</div>
                ) : (
                  <div className="rounded-xl border border-[#E6DCEB] bg-white px-4 py-3 text-sm text-[#4A4A4A]/70">No image uploaded yet</div>
                )}
                {error && <div className="rounded-lg border border-rose-200 px-3 py-2 text-[12px] text-rose-600 bg-rose-50">{error}</div>}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-[#F3D5E0] bg-gradient-to-b from-[#FFF7FA] to-[#FFFCFE] p-5 md:p-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#D23669]">How To get accurate results</h4>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
                <div className="rounded-2xl bg-white border border-[#F0E4EA] p-4 shadow-sm"><b>1)</b> Face directly toward the camera</div>
                <div className="rounded-2xl bg-white border border-[#F0E4EA] p-4 shadow-sm"><b>2)</b> Use natural or white light</div>
                <div className="rounded-2xl bg-white border border-[#F0E4EA] p-4 shadow-sm"><b>3)</b> Pull hair back to expose your face</div>
                <div className="rounded-2xl bg-white border border-[#F0E4EA] p-4 shadow-sm"><b>4)</b> Avoid filters and angled shots</div>
              </div>
            </div>
          </section>
        )}

        {currentStep === 2 && (
          <section className={`${CARD} mt-8 borderGlow`}>
            <SectionHeader title="Step 2: Analyze Face & Personal Color" />
            <div className="rounded-3xl border border-[#FFDCE6] bg-gradient-to-br from-[#FFF8FB] via-[#FFF1F6] to-[#FFEAF2] p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#D23669]">AI Face Scan</div>
                  <p className="mt-2 text-sm text-[#4A4A4A]/80">
                    The system reads skin tone, face structure, and facial features to generate more accurate recommendations for you.
                  </p>
                </div>
                <button
                  onClick={analyzeImage}
                  className="rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#4A4A4A] border-[#E6DCEB] bg-white hover:bg-[#FFF5F8]"
                >
                  Re-Analyze
                </button>
              </div>
            </div>
            {result ? (
              <div className="mt-6 space-y-6">
                <div className="rounded-3xl border border-[#EEDBE6] bg-[#FFFDFE] p-5 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`rounded-2xl border border-[#FFD1DC] bg-gradient-to-br ${SEASON_META[result.season]?.glow || "from-[#FFF0F5] to-[#FFE3EC]"} p-6`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.25em] font-black text-[#D23669]">Personal Color</div>
                        <div className="mt-2 text-3xl md:text-4xl font-[900] tracking-tight text-[#D23669]">{result.season || "-"}</div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#4A4A4A]/70">
                          {SEASON_META[result.season]?.tone || "-"}
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-full border border-white/70 shadow-sm" style={{ background: PALETTES[result.season]?.[1] || "#ffd1dc" }} />
                    </div>
                    <p className="mt-3 text-sm text-[#4A4A4A]/75">{SEASON_META[result.season]?.note || "Color tone result based on your complexion"}</p>
                  </div>
                  <div className="rounded-2xl border border-[#FFD1DC] bg-gradient-to-br from-[#FFF8FB] to-[#FFEAF2] p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.25em] font-black text-[#D23669]">Face Shape</div>
                        <div className="mt-2 text-3xl md:text-4xl font-[900] tracking-tight text-[#D23669]">{result.faceShape || "-"}</div>
                        <p className="mt-1 text-sm text-[#4A4A4A]/75">{FACE_META[result.faceShape] || "Your unique face shape"}</p>
                      </div>
                      <div className="rounded-xl border border-white/70 bg-white/70 px-2 py-1">
                        <FaceIcon type={result.faceShape || "Oval"} />
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="rounded-2xl border border-[#EEDBE6] bg-[#FFFDFE] p-5">
                    <div className="text-sm font-semibold mb-3 text-[#3B333A]">Season Palette</div>
                    <PaletteRow colors={PALETTES[result.season] || []} />
                    <div className="mt-3 text-xs text-[#4A4A4A]/65">
                      This color tone helps your skin look brighter and more balanced overall.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#EEDBE6] bg-[#FFFDFE] p-5">
                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#D23669]">Analysis Notes</div>
                    <div className="mt-3 space-y-2 text-sm text-[#4A4A4A]/75">
                      <div className="rounded-xl border border-[#F0E4EA] bg-white px-3 py-2">Season: {result.season || "-"}</div>
                      <div className="rounded-xl border border-[#F0E4EA] bg-white px-3 py-2">Face Shape: {result.faceShape || "-"}</div>
                      <div className="rounded-xl border border-[#F0E4EA] bg-white px-3 py-2">Ready to use in Step 3 and Step 4</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#EEDBE6] bg-[#FFFDFE] p-5">
                  <div className="mb-3 text-sm font-semibold text-[#3B333A]">Feature Suggestions</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="Eyebrows" value={SHAPE_RECS.brows[result.face.brows]} />
                    <Stat label="Eyes" value={SHAPE_RECS.eyes[result.face.eyes]} />
                    <Stat label="Nose" value={SHAPE_RECS.nose[result.face.nose]} />
                    <Stat label="Lips" value={SHAPE_RECS.lips[result.face.lips]} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {(status === "uploading" || status === "analyzing") ? (
                  <div className="rounded-3xl border border-[#EEDBE6] bg-[#FFFDFE] p-6 space-y-5">
                    <ProgressBar label={status === "uploading" ? "Uploading image..." : "AI is analyzing face structure and personal color..."} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-[#FFD1DC] bg-gradient-to-br from-[#FFF8FB] to-[#FFEAF2] p-6 space-y-3">
                        <div className="h-3 w-24 animate-pulse rounded bg-[#F3D5E0]" />
                        <div className="h-10 w-32 animate-pulse rounded-lg bg-[#F3D5E0]" />
                        <div className="h-3 w-40 animate-pulse rounded bg-[#F3D5E0]/60" />
                      </div>
                      <div className="rounded-2xl border border-[#FFD1DC] bg-gradient-to-br from-[#FFF8FB] to-[#FFEAF2] p-6 space-y-3">
                        <div className="h-3 w-20 animate-pulse rounded bg-[#F3D5E0]" />
                        <div className="h-10 w-28 animate-pulse rounded-lg bg-[#F3D5E0]" />
                        <div className="h-3 w-36 animate-pulse rounded bg-[#F3D5E0]/60" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[1,2,3,4].map(i => <div key={i} className="h-7 w-7 animate-pulse rounded-md bg-[#F3D5E0]" />)}
                    </div>
                    <p className="text-xs text-center text-[#4A4A4A]/50 animate-pulse">Gemini AI is reading your face...</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#EEDBE6] bg-[#FFFDFE] p-5">
                    <p className="text-sm text-[#4A4A4A]/60">Upload your photo in Step 1 and the results will appear here automatically.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {currentStep === 3 && (
          <section className={`${CARD} mt-8 borderGlow`}>
            <SectionHeader title="Step 3: Edit + Shop Makeup" />
            <p className="text-sm text-[#4A4A4A]/75">
              Apply makeup to your photo instantly and shop cosmetics suited to your color tone.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-3xl border border-[#F3D5E0] bg-gradient-to-b from-[#FFF7FA] to-[#FFFDFE] p-4">
                <MakeoverStudio
                  base={preview || assetPath("assets/analysis.JPG")}
                  onProductSelect={(p) => setSelectedStudioProduct(p || null)}
                />
              </div>

              <aside className="h-fit rounded-3xl border border-[#F3D5E0] bg-gradient-to-b from-[#FFF9FC] to-white p-4 xl:sticky xl:top-24">
                <div className="mb-3 text-[11px] font-black uppercase tracking-[0.24em] text-[#D23669]">
                  Instant Shop
                </div>
                <h4 className="text-xl font-[900] tracking-tight text-[#2F2A31]">Selected Product</h4>
                {selectedStudioProduct ? (
                  <div className="mt-3">
                    <SelectedProductCard product={selectedStudioProduct} season={result?.season} />
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-[#E6DCEB] bg-white p-5 text-sm text-[#4A4A4A]/70">
                    Select brows, eyes, or lips in the Makeover Studio and the product card will appear here automatically.
                  </div>
                )}
              </aside>
            </div>
            <div className="mt-5 rounded-xl border border-[#E6DCEB] bg-[#FFF7FA] px-4 py-3 text-sm text-[#4A4A4A]/75">
              Select makeup from the studio &gt; View details &gt; Press BUY THIS LOOK to go to the purchase page instantly.
            </div>

            {/* ===== Gemini AI Image Generation ===== */}
            <div className="mt-6 rounded-3xl border border-[#F3D5E0] bg-gradient-to-b from-[#FFF7FA] to-[#FFFDFE] p-5">
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#D23669] mb-1">AI Makeover</div>
              <h4 className="text-lg font-[900] tracking-tight text-[#2F2A31] mb-2">Generate a Makeup Look with Gemini AI</h4>
              <p className="text-sm text-[#4A4A4A]/70 mb-4">AI will create a makeup photo from your image, taking about 10–20 seconds.</p>
              <button
                onClick={runGeminiGeneration}
                disabled={geminiStatus === "loading"}
                className="rounded-full px-6 py-2.5 text-sm font-black tracking-[0.12em] uppercase bg-[#D23669] text-white border border-[#D23669] hover:bg-[#B52E58] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {geminiStatus === "loading" ? "Generating image..." : "✨ Generate with AI"}
              </button>
              {geminiError && (
                <p className="mt-3 text-sm text-red-500">{geminiError}</p>
              )}
              {geminiStatus === "loading" && (
                <div className="mt-4 rounded-2xl border border-[#F3D5E0] bg-[#FFF7FA] p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-[#D23669] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <span className="text-sm font-semibold text-[#D23669]">Gemini AI is generating your makeup look</span>
                  </div>
                  <div className="space-y-2 text-xs text-[#4A4A4A]/60">
                    <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#D23669] animate-pulse" />Analyzing face...</div>
                    <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#D23669]/50 animate-pulse" style={{animationDelay:"0.3s"}} />Selecting palette for your tone...</div>
                    <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#D23669]/30 animate-pulse" style={{animationDelay:"0.6s"}} />Creating editorial-style image...</div>
                  </div>
                  <div className="aspect-[4/3] w-full max-w-sm rounded-xl bg-gradient-to-br from-[#F3D5E0] to-[#E6DCEB] animate-pulse" />
                  <p className="text-[11px] text-[#4A4A4A]/50 text-center">Takes approximately 10–20 seconds. Please wait.</p>
                </div>
              )}
              {geminiImage && geminiStatus === "done" && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-[#D23669] mb-2 uppercase tracking-widest">AI Result</p>
                  <img
                    src={geminiImage}
                    alt="Gemini AI Makeover"
                    className="w-full max-w-sm rounded-2xl border border-[#F3D5E0] shadow-md"
                  />
                  <a
                    href={geminiImage}
                    download="ai-makeover.png"
                    className="mt-3 inline-block rounded-full px-5 py-2 text-xs font-black tracking-[0.15em] uppercase bg-white text-[#D23669] border border-[#D23669] hover:bg-[#FFF0F5] transition"
                  >
                    Download Image
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => setStep3Done((v) => !v)}
                className={`rounded-full px-5 py-2 text-xs font-black tracking-[0.15em] uppercase border transition ${
                  step3Done ? "bg-[#D23669] text-white border-[#D23669]" : "bg-white text-[#4A4A4A] border-[#E6DCEB]"
                }`}
              >
                {step3Done ? "Undo Step 3 completion" : "Mark Step 3 as done"}
              </button>
              {step3Done && <span className="text-sm font-semibold text-[#D23669]">Step 3 saved</span>}
            </div>
          </section>
        )}

        {currentStep === 4 && (
          <section className={`${CARD} mt-8 borderGlow`}>
            <SectionHeader title="Step 4: Recommendations" meta={<span className="text-xs text-[#4A4A4A]/70">Cosmetics • Hair Color • Hairstyle • Tutorial Clips • Outfit Colors</span>} />
            {result ? (
              <div className="space-y-8">
                <div className="rounded-3xl border border-[#FFD1DC] bg-gradient-to-br from-[#FFF8FB] via-[#FFF1F6] to-[#FFE9F2] p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#D23669]">Your Signature Look</div>
                      <h4 className="mt-2 text-2xl md:text-3xl font-[900] tracking-tight text-[#3A3138]">
                        {result.season} Tone • {result.faceShape} Shape
                      </h4>
                      <p className="mt-2 text-sm text-[#4A4A4A]/75">
                        The look that suits you right now, with recommendations for cosmetics, hair color, and hairstyles in the same tone.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-xs text-[#4A4A4A]/70">
                      Analyzed from Personal Color and face structure
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div className="rounded-2xl border border-[#EEDBE6] bg-[#FFFDFE] p-5">
                    <h4 className="text-lg font-bold uppercase text-[#3B333A]">Suggested Styles</h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span onMouseDown={press}><RecBadge text={`Brows: ${SHAPE_RECS.brows[result.face.brows]}`} /></span>
                      <span onMouseDown={press}><RecBadge text={`Eyes: ${SHAPE_RECS.eyes[result.face.eyes]}`} /></span>
                      <span onMouseDown={press}><RecBadge text={`Nose: ${SHAPE_RECS.nose[result.face.nose]}`} /></span>
                      <span onMouseDown={press}><RecBadge text={`Lips: ${SHAPE_RECS.lips[result.face.lips]}`} /></span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#EEDBE6] bg-[#FFFDFE] p-5">
                    <h4 className="text-lg font-bold uppercase text-[#3B333A]">Hair Colors</h4>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <PaletteRow colors={HAIR_COLORS[result.season] || []} />
                      <div className="text-xs text-[#4A4A4A]/60">{(HAIR_COLORS[result.season] || []).map((c) => c.name).join(" • ")}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#EEDBE6] bg-[#FFFDFE] p-5">
                  <h4 className="text-lg font-bold uppercase text-[#3B333A]">Hairstyles For {result.faceShape}</h4>
                  {(HAIR_STYLE_MAP[result.faceShape] || []).length > 0 ? (
                    <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                      {(HAIR_STYLE_MAP[result.faceShape] || []).map((s) => <HairCard key={s.key} styleItem={s} />)}
                    </div>
                  ) : (
                    <p className="text-sm text-[#4A4A4A]/60 mt-2">No hairstyle recommendations available for this face shape yet.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-[#EEDBE6] bg-[#FFFDFE] p-5">
                  <h4 className="text-lg font-bold uppercase text-[#3B333A]">Recommended Products</h4>
                  <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {(PRODUCTS[result.season] || []).map((p, idx) => <ProductCard key={idx} p={p} />)}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#EEDBE6] bg-[#FFFDFE] p-5">
                  <h4 className="text-lg font-bold uppercase text-[#3B333A]">Outfit Colors ({result.season})</h4>
                  <div className="mt-3">
                    <PaletteRow colors={PALETTES[result.season] || []} />
                  </div>
                </div>

                <YouTubeReels result={result} />

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep4Done((v) => !v)}
                    className={`rounded-full px-5 py-2 text-xs font-black tracking-[0.15em] uppercase border transition ${
                      step4Done ? "bg-[#D23669] text-white border-[#D23669]" : "bg-white text-[#4A4A4A] border-[#E6DCEB]"
                    }`}
                  >
                    {step4Done ? "Undo Step 4 completion" : "Mark Step 4 as done"}
                  </button>
                  <button
                    onClick={() => navigate("/cosmetics")}
                    className="rounded-full bg-[#111] text-white px-5 py-2 text-xs font-black tracking-[0.15em] uppercase"
                  >
                    Go to Cosmetics
                  </button>
                  {step4Done && <span className="text-sm font-semibold text-[#D23669]">Step 4 saved</span>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#4A4A4A]/60">Complete Step 2 first and the system will recommend cosmetics, hair color, hairstyles, clips, and outfit colors.</p>
            )}
          </section>
        )}

        <section className="mt-6 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="rounded-full border px-5 py-2 text-xs font-black uppercase tracking-[0.15em] disabled:opacity-40"
            style={{ borderColor: "#E6DCEB" }}
          >
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={!canGoNext || currentStep === 4}
            className="rounded-full bg-[#D23669] text-white px-5 py-2 text-xs font-black uppercase tracking-[0.15em] disabled:opacity-40"
          >
            Next
          </button>
        </section>

        

        <p className="mt-6 text-center text-xs text-[#4A4A4A]/60">
          *These recommendations are for general beauty guidance only and are not a medical diagnosis.
        </p>
      </main>

      {/* Sticky bar (mobile) */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/90 p-3 backdrop-blur md:hidden"
        style={{ borderColor: COLORS.accent }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-1">
          <MagneticButton onClick={() => inputRef.current?.click()} className="flex-1">
            Step 1
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
            Step 2
          </MagneticButton>
        </div>
      </div>

      <style>{`
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
