// src/pages/Analysis.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import "./Analysis.css";
import MakeoverStudio from "../components/MakeoverStudio.jsx";
import { useTranslation } from "react-i18next";

/* ✅ persist realtime */
import { auth } from "../lib/firebase";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
const db = getFirestore();

/* ====== BRAND COLORS ====== */
const COLORS = {
  base: "#FADCDC",
  accent: "#E6DCEB",
  primary: "#75464A",
  hover: "#D85E79",
};

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
    { name: "Peach Blush", price: "289", img: "/assets/brush1.jpg" },
    { name: "Coral Tint Balm", price: "219", img: "/assets/brush2.jpg" },
    { name: "Glow Cushion", price: "299", img: "/assets/contour.png" },
  ],
  Summer: [
    { name: "Mauve Cream Blush", price: "289", img: "/assets/brush1.jpg" },
    { name: "Cool Pink Lip Oil", price: "199", img: "/assets/brush1.jpg" },
    { name: "Sheer Highlighter", price: "259", img: "/assets/brush1.jpg" },
  ],
  Autumn: [
    { name: "Terracotta Blush", price: "289", img: "/assets/brush1.jpg" },
    { name: "Honey Bronze", price: "349", img: "/assets/brush1.jpg" },
    { name: "Matte Caramel Lip", price: "229", img: "/assets/brush1.jpg" },
  ],
  Winter: [
    { name: "Berry Lip", price: "249", img: "/assets/brush1.jpg" },
    { name: "Plum Glow Blush", price: "289", img: "/assets/brush1.jpg" },
    { name: "Cool Contour Stick", price: "299", img: "/assets/brush1.jpg" },
  ],
};

/* ---------------- Hairstyles by face shape ---------------- */
const HAIR_STYLE_MAP = {
  Oval: [
    { key: "long-layers", name: "Long Layers", img: "/hair/LongLayers.jpg" },
    { key: "soft-wave-lob", name: "Soft Wave Lob", img: "/hair/Soft%20Wave%20Lob.jpg" },
    { key: "curtain-bangs", name: "Curtain Bangs", img: "/hair/Curtain%20Bangs.jpg" },
  ],
  Round: [
    { key: "layered-wolf", name: "Soft Wolf Cut", img: "/hair/SoftWolfCut.jpg" },
    { key: "long-straight", name: "Long Straight with Volume", img: "/hair/Long%20StraightwithVolume.jpg" },
    { key: "side-bangs", name: "Side-swept Bangs", img: "/hair/Side-sweptBangs.jpg" },
  ],
  Square: [
    { key: "textured-bob", name: "Textured Bob", img: "/hair/TexturedBob.jpg" },
    { key: "soft-curl", name: "Soft C-curl", img: "/hair/SoftC-curl.jpg" },
    { key: "round-layers", name: "Round Layers", img: "/hair/roundlayers.jpg" },
  ],
  Heart: [
    { key: "face-framing", name: "Face-framing Layers", img: "/hair/Face-framing%20Layers.jpg" },
    { key: "airy-bangs", name: "Airy Bangs", img: "/hair/Airy%20Bangs.jpg" },
    { key: "s-wave", name: "S-wave Medium", img: "/hair/S-wave%20Medium.jpg" },
  ],
  Diamond: [
    { key: "lob-wave", name: "Lob Wave", img: "/hair/lob-wave.jpg" },
    { key: "curtain-bangs", name: "Curtain Bangs", img: "/hair/curtain-bangs.jpg" },
    { key: "long-soft", name: "Long Soft Layers", img: "/hair/Long-layers.jpg" },
  ],
  Rectangle: [
    { key: "soft-waves", name: "Soft Waves", img: "/hair/soft-waves.jpg" },
    { key: "bouncy-lob", name: "Bouncy Lob", img: "/hair/bouncy-lob.jpg" },
    { key: "oval-bangs", name: "Oval Bang Curve", img: "/hair/oval-bang.jpg" },
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

/* ---------- YouTube helpers (ใช้ข้อความไทยเป็น query ได้เหมือนเดิม) ---------- */
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
const CARD = "rounded-2xl border bg-white/70 p-5 shadow-sm";

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
      const r = el.getBoundingClientClientRect?.() ?? el.getBoundingClientRect();
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
      className={`rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition will-change-transform hover:-translate-y-0.5 hover:shadow-md active:scale-[.98] overflow-hidden ${className}`}
      style={{
        background: "#FFB3C6",
        color: COLORS.primary,
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

/* ===== Section Header ===== */
function SectionHeader({ title, meta }) {
  return (
    <div className="mb-6">
      <div className="relative mb-4 flex items-center">
        <h3 className="text-lg md:text-xl font-semibold text-[#75464A] whitespace-nowrap text-left reveal">
          {title}
        </h3>
        <div className="h-[2px] flex-1 ml-[10px] headerLine" />
      </div>
      {meta && <div className="flex items-center justify-start">{meta}</div>}
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
      <div className="text-xs text-[#75464A]/70">{label}</div>
      <div className="text-sm font-semibold text-[#75464A]">{value}</div>
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
  const { t } = useTranslation();
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
        <div className="text-xs text-[#75464A]/60">
          {t("analysis.products.badge")}
        </div>
        <div className="mt-1 flex items-start justify-between">
          <h4 className="font-semibold text-[#75464A]">{p.name}</h4>
          <span className="text-sm text-[#75464A]">
            {t("analysis.products.pricePrefix")} {p.price}
          </span>
        </div>
        <MagneticButton className="mt-3 w-full">
          {t("analysis.products.buyNow")}
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
  const { t } = useTranslation();
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
        <div className="text-sm font-semibold text-[#75464A] flex items-center gap-2">
          <FaceIcon type="Oval" />
          {styleItem.name}
        </div>
        <div className="mt-1 text-xs text-[#75464A]/60">
          {t("analysis.hair.cardNote")}
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
  const { t } = useTranslation();
  if (!result) return null;
  const items = useMemo(() => buildYouTubeLinks(result), [result]);
  if (!items.length) return null;

  const trackRef = useRef(null);
  const scrollBy = (dx) =>
    trackRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <section
      className={`${CARD} borderGlow`}
      style={{ borderColor: COLORS.accent }}
    >
      <SectionHeader
        title={t("analysis.section.youtube")}
        meta={
          <span className="text-xs text-[#75464A]/60">
            {t("analysis.youtube.meta")}
          </span>
        }
      />
      <div className="reels">
        <button
          aria-label={t("analysis.youtube.prev")}
          className="reel-nav reel-nav--left"
          onClick={() => scrollBy(-360)}
        >
          ❮
        </button>
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
                <div className="reel-caption">
                  <span className="line-clamp-1">{it.title}</span>
                </div>
              </div>
            );
          })}
        </div>
        <button
          aria-label={t("analysis.youtube.next")}
          className="reel-nav reel-nav--right"
          onClick={() => scrollBy(360)}
        >
          ❯
        </button>
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
  } catch {}

  // 2) broadcast
  try {
    window.dispatchEvent(new Event("auramatch:update"));
    window.dispatchEvent(
      new CustomEvent("analysis:updated", {
        detail: {
          lastSeason: payload.season,
          lastFaceShape: payload.faceShape,
        },
      })
    );
  } catch {}

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

/* ---------- helper: แปลงไฟล์เป็น data URL เพื่อ persist ได้จริง ---------- */
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

/* ===== History + Profile helpers (inline) ===== */
function readHistory() {
  try {
    return JSON.parse(
      localStorage.getItem("auramatch:analysisHistory") || "[]"
    );
  } catch {
    return [];
  }
}
function writeHistory(list) {
  try {
    localStorage.setItem("auramatch:analysisHistory", JSON.stringify(list));
    window.dispatchEvent(new Event("history:updated"));
    window.dispatchEvent(new Event("history:changed"));
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
    createdAt: now,
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
    const u =
      JSON.parse(localStorage.getItem("auramatch:user") || "null") || {};
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
  } catch {}
}

/* ---------- shrink preview before persisting (avoid LS quota) ---------- */
function shrinkDataURL(src, maxW = 640, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve("");
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
        resolve(src);
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
  const { t } = useTranslation();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("idle"); // idle | uploading | analyzing | done | error
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const season = result?.season ?? null;
  const faceShape = result?.faceShape ?? null;

  const seasonPalette = season ? PALETTES[season] : [];
  const hairColorPalette = season ? HAIR_COLORS[season] : [];
  const seasonProducts = useMemo(
    () => (season ? PRODUCTS[season] : []),
    [season]
  );
  const hairStyles = useMemo(
    () => (!faceShape ? [] : HAIR_STYLE_MAP[faceShape] || []),
    [faceShape]
  );

  useEffect(() => {
    document.title = t("analysis.pageTitle");
  }, [t]);

  async function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const dataUrl = await fileToDataURL(f);
      setFile(f);
      setPreview(dataUrl);
      setResult(null);
      setStatus("idle");
      setError("");
    } catch {
      setError(t("analysis.error.readFile"));
    }
  }

  async function analyzeImage() {
    if (!file && !preview) {
      setError(t("analysis.error.noFile"));
      return;
    }
    try {
      setError("");
      setStatus("uploading");
      await wait(400);
      setStatus("analyzing");
      const data = await analyzeImageMock(file || {});
      setResult(data);
      setStatus("done");

      const smallPreview = await shrinkDataURL(preview, 640, 0.75);
      const entry = { ...data, preview: smallPreview };
      await persistAnalysisResult(entry);
      pushHistory(entry);
      applyToProfile(entry);
    } catch (err) {
      console.error(err);
      setError(t("analysis.error.analyzeFailed"));
      setStatus("error");
    }
  }

  function fillDemo() {
    setFile(new File([""], "demo.jpg"));
    setPreview("/assets/analysis.JPG");
    setStatus("analyzing");
    setTimeout(() => analyzeImage(), 0);
  }

  const press = (e) => {
    const root = e.currentTarget;
    root.classList.add("pressed");
    burstAt(root);
    setTimeout(() => root.classList.remove("pressed"), 160);
  };

  return (
    <div
      className="min-h-screen siteBG"
      style={{
        fontFamily:
          "Poppins, ui-sans-serif, system-ui, -apple-system",
      }}
    >
      {/* Floating gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-[-200px] z-0 h-[420px] opacity-60 blur-3xl"
        style={{
          background: `radial-gradient(800px 300px at 50% 0, ${COLORS.base}55, transparent 70%), radial-gradient(600px 300px at 70% 20%, ${COLORS.accent}66, transparent 70%)`,
        }}
      />

      {/* HERO / UPLOAD */}
      <section className="relative z-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-14">
          <div className="reveal" style={{ transitionDelay: "60ms" }}>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-sm tagPulse"
              style={{ borderColor: COLORS.accent, color: COLORS.primary }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS.hover }}
              />
              {t("analysis.hero.badge")}
            </div>

            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#75464A] md:text-4xl">
              {t("analysis.hero.title")}
            </h1>
            <p className="mt-3 text-sm text-[#75464A]/75">
              {t("analysis.hero.desc")}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <MagneticButton onClick={() => inputRef.current?.click()}>
                {t("analysis.hero.btnUpload")}
              </MagneticButton>
              <MagneticButton
                onClick={analyzeImage}
                style={{
                  background: "#ffffff",
                  color: COLORS.primary,
                  border: `1px solid ${COLORS.accent}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,.06)",
                }}
              >
                {t("analysis.hero.btnAnalyze")}
              </MagneticButton>
              <MagneticButton
                onClick={fillDemo}
                style={{
                  background: "#ffffff",
                  color: COLORS.primary,
                  border: `1px solid ${COLORS.accent}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,.06)",
                }}
              >
                {t("analysis.hero.btnDemo")}
              </MagneticButton>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onPick}
              />
            </div>
            <p className="mt-2 text-xs text-[#75464A]/60">
              {t("analysis.hero.meta")}
            </p>
          </div>

          <div
            className="relative mx-auto w-full max-w-sm reveal"
            style={{ transitionDelay: "120ms" }}
          >
            <div
              className="absolute -inset-4 -z-10 animate-pulse rounded-[2rem] blur-xl"
              style={{
                background: `linear-gradient(45deg, ${COLORS.base}, ${COLORS.accent})`,
              }}
            />
            <div
              className="aspect-[4/5] w-full overflow-hidden rounded-[2rem] border bg-[#FADCDC33] shadow-xl"
              style={{ borderColor: COLORS.accent }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt={t("analysis.hero.previewAlt")}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src="/assets/home.webp"
                  alt={t("analysis.hero.placeholderAlt")}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="mt-3">
              {status === "uploading" && (
                <ProgressBar label={t("analysis.status.uploading")} />
              )}
              {status === "analyzing" && (
                <ProgressBar label={t("analysis.status.analyzing")} />
              )}
              {status === "done" && (
                <div
                  className="rounded-lg border px-3 py-2 text-sm text-[#2f7a2f] bg-green-50"
                  style={{ borderColor: COLORS.accent }}
                >
                  {t("analysis.status.done")}
                </div>
              )}
              {error && (
                <div
                  className="rounded-lg border px-3 py-2 text-sm text-[#7a2f2f] bg-rose-50"
                  style={{ borderColor: COLORS.accent }}
                >
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <main className="mx-auto max-w-6xl px-4 pb-12">
        {/* Personal Color */}
        <section className={`${CARD} borderGlow`}>
          <SectionHeader
            title={t("analysis.section.personalColor")}
            meta={
              result?.season ? (
                <span className="rounded-full bg-[#75464A] px-3 py-1 text-xs font-semibold text-white">
                  {t("analysis.personal.badge", { season: result.season })}
                </span>
              ) : null
            }
          />
          {preview && (
            <div className="mb-4 flex items-center gap-4 reveal">
              <div
                className="h-20 w-20 overflow-hidden rounded-xl border shadow-sm ring-4"
                style={{
                  borderColor: COLORS.accent,
                  ringColor: COLORS.accent,
                }}
              >
                <img
                  src={preview}
                  alt={t("analysis.personal.previewAlt")}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-xs text-[#75464A]/60">
                {t("analysis.personal.previewNote")}
              </div>
            </div>
          )}
          {result?.season ? (
            <>
              <p className="text-sm text-[#75464A]/75 reveal">
                {t("analysis.personal.desc", { season: result.season })}
              </p>
              <div className="mt-4">
                <PaletteRow colors={PALETTES[result.season]} />
              </div>
            </>
          ) : (
            <p className="text-sm text-[#75464A]/60">
              {t("analysis.personal.empty")}
            </p>
          )}
        </section>

        {/* Feature Analysis */}
        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className={`${CARD} borderGlow`}>
            <SectionHeader
              title={t("analysis.section.feature")}
              meta={
                <span className="text-xs text-[#75464A]/60">
                  {t("analysis.feature.meta")}
                </span>
              }
            />
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Stat
                label={t("analysis.feature.eyebrows")}
                value={
                  result ? SHAPE_RECS.brows[result.face.brows] : t("analysis.generic.none")
                }
              />
              <Stat
                label={t("analysis.feature.eyes")}
                value={
                  result ? SHAPE_RECS.eyes[result.face.eyes] : t("analysis.generic.none")
                }
              />
              <Stat
                label={t("analysis.feature.nose")}
                value={
                  result ? SHAPE_RECS.nose[result.face.nose] : t("analysis.generic.none")
                }
              />
              <Stat
                label={t("analysis.feature.lips")}
                value={
                  result ? SHAPE_RECS.lips[result.face.lips] : t("analysis.generic.none")
                }
              />
            </div>
          </div>

          <div className={`${CARD} borderGlow`}>
            <SectionHeader
              title={t("analysis.section.styles")}
              meta={
                <span className="text-xs text-[#75464A]/60">
                  {t("analysis.styles.meta")}
                </span>
              }
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {result ? (
                <>
                  <span onMouseDown={press}>
                    <RecBadge
                      text={t("analysis.styles.brows", {
                        style: SHAPE_RECS.brows[result.face.brows],
                      })}
                    />
                  </span>
                  <span onMouseDown={press}>
                    <RecBadge
                      text={t("analysis.styles.eyes", {
                        style: SHAPE_RECS.eyes[result.face.eyes],
                      })}
                    />
                  </span>
                  <span onMouseDown={press}>
                    <RecBadge
                      text={t("analysis.styles.nose", {
                        style: SHAPE_RECS.nose[result.face.nose],
                      })}
                    />
                  </span>
                  <span onMouseDown={press}>
                    <RecBadge
                      text={t("analysis.styles.lips", {
                        style: SHAPE_RECS.lips[result.face.lips],
                      })}
                    />
                  </span>
                </>
              ) : (
                <span className="text-sm text-[#75464A]/60">
                  {t("analysis.generic.noData")}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Hair Profile */}
        <section className="mt-8">
          <div className={`${CARD} borderGlow`}>
            <SectionHeader
              title={t("analysis.section.hairProfile")}
              meta={
                result?.faceShape ? (
                  <span className="rounded-full bg-[#75464A] px-3 py-1 text-xs font-semibold text-white">
                    {t("analysis.hair.faceBadge", {
                      shape: result.faceShape,
                    })}
                  </span>
                ) : null
              }
            />
            {result ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Stat
                  label={t("analysis.hair.faceShape")}
                  value={result.faceShape}
                />
                <Stat
                  label={t("analysis.hair.length")}
                  value={result.hairLength}
                />
                <Stat
                  label={t("analysis.hair.texture")}
                  value={result.hairTexture}
                />
              </div>
            ) : (
              <p className="text-sm text-[#75464A]/60">
                {t("analysis.hair.empty")}
              </p>
            )}
          </div>
        </section>

        {/* Recommended Hairstyles */}
        <section className="mt-8">
          <div className={`${CARD} borderGlow`}>
            <SectionHeader
              title={t("analysis.section.hairStyles")}
              meta={
                result?.faceShape && (
                  <span className="text-xs text-[#75464A]/70">
                    {t("analysis.hairStyles.meta", {
                      shape: result.faceShape,
                    })}
                  </span>
                )
              }
            />
            {result ? (
              (HAIR_STYLE_MAP[result.faceShape] || []).length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {(HAIR_STYLE_MAP[result.faceShape] || []).map((s) => (
                    <HairCard key={s.key} styleItem={s} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#75464A]/60">
                  {t("analysis.hairStyles.noStyles")}
                </p>
              )
            ) : (
              <p className="text-sm text-[#75464A]/60">
                {t("analysis.hairStyles.empty")}
              </p>
            )}
            {result && (
              <div className="mt-4 flex flex-wrap gap-2">
                <RecBadge text={t("analysis.hairStyles.tip1")} />
                <RecBadge text={t("analysis.hairStyles.tip2")} />
              </div>
            )}
          </div>
        </section>

        {/* Recommended Hair Colors */}
        <section className="mt-8">
          <div className={`${CARD} borderGlow`}>
            <SectionHeader
              title={t("analysis.section.hairColors")}
              meta={
                result?.season && (
                  <span className="text-xs text-[#75464A]/70">
                    {t("analysis.hairColors.meta", {
                      season: result.season,
                    })}
                  </span>
                )
              }
            />
            {result?.season ? (
              <>
                <p className="text-sm text-[#75464A]/75 reveal">
                  {t("analysis.hairColors.desc", { season: result.season })}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <PaletteRow colors={HAIR_COLORS[result.season]} />
                  <div className="text-xs text-[#75464A]/60">
                    {HAIR_COLORS[result.season]
                      .map((c) => c.name)
                      .join(" • ")}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#75464A]/60">
                {t("analysis.hairColors.empty")}
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
        <MakeoverStudio base={preview || "/assets/analysis.JPG"} />

        {/* Products */}
        <section className="mt-8">
          <div className={`${CARD} borderGlow`}>
            <SectionHeader
              title={t("analysis.section.products")}
              meta={
                result?.season && (
                  <span className="text-xs text-[#75464A]/70">
                    {t("analysis.products.meta", {
                      season: result.season,
                    })}
                  </span>
                )
              }
            />
            {status === "idle" && !result?.season && (
              <p className="text-sm text-[#75464A]/60">
                {t("analysis.products.empty")}
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
                <p className="text-sm text-[#75464A]/60">
                  {t("analysis.products.noneForSeason")}
                </p>
              )}
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-[#75464A]/60">
          {t("analysis.disclaimer")}
        </p>
      </main>

      {/* Sticky bar (mobile) */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/90 p-3 backdrop-blur md:hidden"
        style={{ borderColor: COLORS.accent }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-1">
          <MagneticButton
            onClick={() => inputRef.current?.click()}
            className="flex-1"
          >
            {t("analysis.sticky.upload")}
          </MagneticButton>
          <MagneticButton
            onClick={analyzeImage}
            className="flex-1"
            style={{
              background: "#ffffff",
              color: COLORS.primary,
              border: `1px solid ${COLORS.accent}`,
              boxShadow: "0 4px 12px rgba(0,0,0,.06)",
            }}
          >
            {t("analysis.sticky.analyze")}
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label }) {
  return (
    <div
      className="rounded-lg border p-3 reveal"
      style={{ borderColor: COLORS.accent, background: "#fff" }}
    >
      <div className="mb-1 text-xs text-[#75464A]/70">{label}</div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E6DCEB]/40">
        <div
          className="h-2 w-1/3 animate-[progress_1.2s_ease-in-out_infinite] rounded-full"
          style={{ background: COLORS.primary }}
        />
      </div>
    </div>
  );
}
