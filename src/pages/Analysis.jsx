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
const GEMINI_PROMPT = import.meta.env.VITE_GEMINI_PROMPT || "Apply natural everyday makeup to this exact face photo. Do NOT change the person's face shape, bone structure, skin tone, eye shape, nose, lips shape, or any facial features — the person's identity must remain 100% identical. Only add: light foundation to even skin tone, soft blush on cheeks, subtle neutral eyeshadow, defined brows following their natural arch, thin eyeliner, mascara, and a natural lip tint. The result must look like the same real person wearing light makeup. Keep the same lighting, angle, background, and photo style. Photo-realistic output only.";
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
    { key: "long-layers",   name: "Long Layers",        img: assetPath("hair/LongLayers.jpg"),                  length: "long" },
    { key: "soft-wave-lob", name: "Soft Wave Lob",       img: assetPath("hair/Soft%20Wave%20Lob.jpg"),           length: "medium" },
    { key: "curtain-bangs", name: "Curtain Bangs",       img: assetPath("hair/Curtain%20Bangs.jpg"),             length: "short" },
  ],
  Round: [
    { key: "layered-wolf",  name: "Soft Wolf Cut",              img: assetPath("hair/SoftWolfCut.jpg"),                    length: "medium" },
    { key: "long-straight", name: "Long Straight with Volume",  img: assetPath("hair/Long%20StraightwithVolume.jpg"),      length: "long" },
    { key: "side-bangs",    name: "Side-swept Bangs",           img: assetPath("hair/Side-sweptBangs.jpg"),                length: "short" },
  ],
  Square: [
    { key: "textured-bob",  name: "Textured Bob",   img: assetPath("hair/TexturedBob.jpg"),     length: "short" },
    { key: "soft-curl",     name: "Soft C-curl",    img: assetPath("hair/SoftC-curl.jpg"),      length: "medium" },
    { key: "round-layers",  name: "Round Layers",   img: assetPath("hair/roundlayers.jpg"),     length: "long" },
  ],
  Heart: [
    { key: "face-framing",  name: "Face-framing Layers", img: assetPath("hair/Face-framing%20Layers.jpg"),  length: "long" },
    { key: "airy-bangs",    name: "Airy Bangs",           img: assetPath("hair/Airy%20Bangs.jpg"),           length: "short" },
    { key: "s-wave",        name: "S-wave Medium",        img: assetPath("hair/S-wave%20Medium.jpg"),        length: "medium" },
  ],
  Diamond: [
    { key: "lob-wave",      name: "Lob Wave",           img: assetPath("hair/lob-wave.jpg"),      length: "medium" },
    { key: "curtain-bangs", name: "Curtain Bangs",      img: assetPath("hair/curtain-bangs.jpg"), length: "short" },
    { key: "long-soft",     name: "Long Soft Layers",   img: assetPath("hair/Long-layers.jpg"),   length: "long" },
  ],
  Rectangle: [
    { key: "soft-waves",    name: "Soft Waves",         img: assetPath("hair/soft-waves.jpg"),    length: "long" },
    { key: "bouncy-lob",    name: "Bouncy Lob",         img: assetPath("hair/bouncy-lob.jpg"),    length: "medium" },
    { key: "oval-bangs",    name: "Oval Bang Curve",    img: assetPath("hair/oval-bang.jpg"),     length: "short" },
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


/* ===== Magnetic Button (kept for future use) ===== */
function _MagneticButton({ children, className = "", style, ...props }) {
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


function SelectedProductCard({ product, season }) {
  if (!product) return null;
  const openShop = () => {
    if (!product?.shopUrl) return;
    window.open(product.shopUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="border border-[#E8E0DC] bg-white overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F7F4F2]">
        <img
          src={product.img}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
        />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3">
          <span className="text-[8px] tracking-[0.4em] uppercase text-white/80 font-[300] bg-black/30 px-2 py-1 backdrop-blur-sm">
            Selected
          </span>
          <span className="text-[8px] tracking-[0.3em] uppercase text-white/70 font-[300] bg-black/20 px-2 py-1 backdrop-blur-sm">
            {season}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 border-t border-[#E8E0DC]">
        <p className="text-[9px] tracking-[0.4em] uppercase text-[#D23669] font-[300] mb-2">
          Match for {season || "Your Tone"}
        </p>
        <h4 className="text-lg font-[500] tracking-[0.02em] text-[#1A1A1A] mb-1">{product.name}</h4>
        <div className="w-full h-px bg-[#E8E0DC] my-3" />
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-1">Estimated price</p>
        <p className="text-2xl font-[200] tracking-[0.03em] text-[#1A1A1A] mb-3">
          THB <span className="font-[600]">{product.price}</span>
        </p>
        <p className="text-[11px] font-[300] text-[#888] leading-relaxed mb-4">
          Selected from your makeover studio. Purchase from an online store.
        </p>
        <button
          onClick={openShop}
          className="w-full bg-[#1A1A1A] text-white py-3 text-[10px] font-[600] uppercase tracking-[0.3em] hover:bg-[#D23669] transition-all duration-300"
        >
          Buy This Look
        </button>
      </div>
    </article>
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
    <section>
      <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">Tutorials</p>
      <h3 className="text-[2rem] md:text-[2.8rem] font-[200] leading-[1] text-[#1A1A1A] uppercase mb-8">
        YouTube<br /><span className="font-[700] italic">Tutorials</span>
      </h3>
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

    // อัปเดต auramatch:user ให้โปรไฟล์อ่านได้ทันที
    const rawUser = JSON.parse(localStorage.getItem("auramatch:user") || "null");
    if (rawUser) {
      const updatedUser = {
        ...rawUser,
        lastSeason: payload.season,
        lastFaceShape: payload.faceShape,
        lastAnalysis: payload,
      };
      localStorage.setItem("auramatch:user", JSON.stringify(updatedUser));
    }
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

/* ---------- helper: crop image to face portrait ---------- */
async function cropFacePortrait(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      const { naturalWidth: W, naturalHeight: H } = img;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Try native FaceDetector API (Chrome/Edge)
      if ('FaceDetector' in window) {
        try {
          const detector = new window.FaceDetector({ maxDetectedFaces: 1, fastMode: true });
          const faces = await detector.detect(img);
          if (faces.length > 0) {
            const { x, y, width, height } = faces[0].boundingBox;
            const faceSize = Math.max(width, height);
            const pad = faceSize * 0.6;
            const cx = x + width / 2;
            const cy = y + height / 2;
            const cropSize = Math.round(faceSize + pad * 2);
            const cx0 = Math.max(0, Math.round(cx - cropSize / 2));
            const cy0 = Math.max(0, Math.round(cy - cropSize * 0.45));
            const cw = Math.min(cropSize, W - cx0);
            const ch = Math.min(cropSize, H - cy0);
            const side = Math.min(cw, ch);
            canvas.width = side;
            canvas.height = side;
            ctx.drawImage(img, cx0, cy0, side, side, 0, 0, side, side);
            resolve(canvas.toDataURL('image/jpeg', 0.92));
            return;
          }
        } catch { /* fall through */ }
      }

      // Fallback: upper-center square crop (face is usually in upper-center)
      const side = Math.min(W, H);
      const sx = Math.round((W - side) / 2);
      const sy = Math.round(H * 0.02); // start 2% from top
      const actualSide = Math.min(side, H - sy);
      canvas.width = actualSide;
      canvas.height = actualSide;
      ctx.drawImage(img, sx, sy, actualSide, actualSide, 0, 0, actualSide, actualSide);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataUrl); // if load fails, return original
    img.src = dataUrl;
  });
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
  const [, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedStudioProduct, setSelectedStudioProduct] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const inputRef = useRef(null);
  const saveRequestedRef = useRef(false);

  const [geminiImage, setGeminiImage] = useState("");
  const [geminiStatus, setGeminiStatus] = useState("idle");
  const [geminiError, setGeminiError] = useState("");



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
      const portrait = await cropFacePortrait(dataUrl);
      setFile(f);
      setPreview(portrait);
      setResult(null);
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

      // Auto-generate Gemini image in background (only if not already done)
      if (geminiStatus === "idle") {
        runGeminiGeneration({ pickedFile, previewSrc });
      }

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

  async function runGeminiGeneration({ pickedFile: passedFile, previewSrc: passedPreview } = {}) {
    const targetFile = passedFile || file;
    const targetPreview = passedPreview || preview;
    if (!targetFile && !targetPreview) {
      setGeminiError("Please upload an image first.");
      return;
    }
    try {
      setGeminiError("");
      setGeminiStatus("loading");

      let imageFile = targetFile;
      if (!imageFile || imageFile.size === 0) {
        const resp = await fetch(targetPreview);
        const blob = await resp.blob();
        imageFile = new File([blob], "image.jpg", { type: blob.type || "image/jpeg" });
      }

      const res = await generateGeminiImage({ file: imageFile, prompt: GEMINI_PROMPT });
      setGeminiImage(res?.image || res?.data_url || "");
      setGeminiStatus("done");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || err?.message || "";
      if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
        setGeminiError("Gemini API quota exceeded. Please wait a moment and try again.");
      } else {
        setGeminiError("Image generation failed. Please try again.");
      }
      setGeminiStatus("error");
    }
  }

  function fillDemo() {
    const demoFile = new File([""], "demo.jpg");
    const demoPreview = assetPath("assets/analysis.JPG");
    setFile(demoFile);
    setPreview(demoPreview);
    setResult(null);
    setCurrentStep(1);
    setError("");
    runAnalysis({ pickedFile: demoFile, previewSrc: demoPreview, autoMode: true });
  }


  const stepDone = {
    1: !!preview,
    2: !!result,
  };
  const canGoNext =
    (currentStep === 1 && !!preview) ||
    (currentStep === 2);

  const nextStep = () => {
    if (currentStep === 1 && !preview) return setError("Please upload a photo first.");
    setCurrentStep((s) => Math.min(2, s + 1));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  return (
    <div className="bg-white text-[#1A1A1A] font-sans selection:bg-[#FFD1DC] selection:text-[#D23669] antialiased">
      <main className="mx-auto max-w-[1400px] px-6 md:px-10 pt-[60px] lg:pt-[180px] pb-32">

        {/* ── STEP INDICATOR ── */}
        <div className="flex border border-[#E8E0DC] mb-14 overflow-hidden">
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex-1 flex items-center gap-5 px-6 py-5 text-left transition-all duration-300 relative ${
              currentStep === 1 ? "bg-[#FFF5F8]" : "bg-white hover:bg-[#FAFAF8]"
            }`}
          >
            {/* Active indicator */}
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300 ${currentStep === 1 ? "bg-[#D23669]" : "bg-transparent"}`} />

            <span className={`text-4xl font-[200] leading-none transition-colors ${currentStep === 1 ? "text-[#D23669]" : "text-[#C0B8B4]"}`}>01</span>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] tracking-[0.5em] uppercase font-[300] text-[#888] mb-0.5">Step One</p>
              <p className={`text-sm font-[600] uppercase tracking-[0.05em] transition-colors ${currentStep === 1 ? "text-[#1A1A1A]" : "text-[#888]"}`}>Upload Photo</p>
            </div>
            {stepDone[1] && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7.5" stroke="#D23669" />
                <path d="M4.5 8l2.5 2.5 4-4" stroke="#D23669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Divider */}
          <div className="w-px bg-[#E8E0DC] shrink-0" />

          {/* Step 2 */}
          <button
            onClick={() => setCurrentStep(2)}
            className={`flex-1 flex items-center gap-5 px-6 py-5 text-left transition-all duration-300 relative ${
              currentStep === 2 ? "bg-[#FFF5F8]" : "bg-white hover:bg-[#FAFAF8]"
            }`}
          >
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300 ${currentStep === 2 ? "bg-[#D23669]" : "bg-transparent"}`} />

            <span className={`text-4xl font-[200] leading-none transition-colors ${currentStep === 2 ? "text-[#D23669]" : "text-[#C0B8B4]"}`}>02</span>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] tracking-[0.5em] uppercase font-[300] text-[#888] mb-0.5">Step Two</p>
              <p className={`text-sm font-[600] uppercase tracking-[0.05em] transition-colors ${currentStep === 2 ? "text-[#1A1A1A]" : "text-[#888]"}`}>Results & Styling</p>
            </div>
            {stepDone[2] && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7.5" stroke="#D23669" />
                <path d="M4.5 8l2.5 2.5 4-4" stroke="#D23669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        {/* ── STEP 1: UPLOAD ── */}
        {currentStep === 1 && (
          <div>
            <div className="border-t border-[#E8E0DC] pt-10 mb-12" data-aos="fade-up">
              <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-4">Step 01</p>
              <h2 className="text-[3rem] md:text-[4.5rem] font-[200] tracking-[0.02em] text-[#1A1A1A] leading-[1] uppercase">
                Upload<br />
                <span className="font-[700] italic">Your Photo</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              {/* Photo preview */}
              <div className="overflow-hidden bg-[#F7F4F2]" style={{ aspectRatio: "4/5" }}>
                {preview ? (
                  <img src={preview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="h-full w-full flex flex-col items-center justify-center cursor-pointer select-none"
                    onClick={() => inputRef.current?.click()}
                  >
                    <svg viewBox="0 0 200 270" className="w-[50%] max-w-[180px]" fill="none">
                      <path d="M20 60 L20 20 L60 20" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                      <path d="M180 60 L180 20 L140 20" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                      <path d="M20 200 L20 250 L60 250" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                      <path d="M180 200 L180 250 L140 250" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                      <ellipse cx="100" cy="118" rx="64" ry="82" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="8 5" opacity="0.25"/>
                    </svg>
                    <p className="mt-6 text-[10px] tracking-[0.35em] uppercase text-[#888] font-[300]">Align face within guide</p>
                    <p className="mt-2 text-[9px] text-[#aaa] tracking-wide">Face · Shoulders · Straight-on</p>
                    <div className="mt-6 border border-[#1A1A1A] px-6 py-2">
                      <p className="text-[9px] tracking-[0.3em] uppercase text-[#1A1A1A] font-[500]">Tap to upload</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: instructions + status */}
              <div className="space-y-8 pt-2">
                <div className="border-t border-[#E8E0DC] pt-6">
                  <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-5">Quick Start</p>
                  <p className="text-sm text-[#555] font-[300] leading-relaxed mb-6">
                    Upload your face photo and the system will analyze it automatically — no need to press anything else.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => inputRef.current?.click()}
                      className="bg-[#1A1A1A] text-white px-8 py-3 text-[10px] font-[600] uppercase tracking-[0.25em] hover:bg-[#D23669] transition-all duration-300"
                    >
                      Choose Photo
                    </button>
                    <button
                      onClick={fillDemo}
                      className="border border-[#E8E0DC] text-[#1A1A1A] px-8 py-3 text-[10px] font-[500] uppercase tracking-[0.25em] hover:border-[#1A1A1A] transition-all duration-300"
                    >
                      Demo
                    </button>
                  </div>
                  <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
                </div>

                {(status === "uploading" || status === "analyzing") && (
                  <div className="border-t border-[#E8E0DC] pt-6">
                    <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">Status</p>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-[300] text-[#555] tracking-wide">
                        {status === "uploading" ? "Uploading image..." : "AI is analyzing your face..."}
                      </span>
                    </div>
                  </div>
                )}
                {stepDone[1] && status !== "uploading" && status !== "analyzing" && (
                  <div className="border-t border-[#E8E0DC] pt-6">
                    <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-2">Status</p>
                    <p className="text-xs font-[300] text-[#1A1A1A]">Photo uploaded — analysis complete</p>
                  </div>
                )}
                {error && (
                  <div className="border-l-2 border-[#D23669] pl-4 text-xs text-[#D23669] font-[300]">{error}</div>
                )}

                <div className="border-t border-[#E8E0DC] pt-6 space-y-3">
                  <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-4">For Best Results</p>
                  {[
                    "Face directly toward the camera",
                    "Use natural or white light",
                    "Pull hair back to expose your face",
                    "Avoid filters and angled shots",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs font-[300] text-[#555]">
                      <span className="text-[10px] font-[500] text-[#aaa] shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: RESULTS ── */}
        {currentStep === 2 && (
          <div>
            <div className="border-t border-[#E8E0DC] pt-10 mb-12 flex flex-wrap items-end justify-between gap-4" data-aos="fade-up">
              <div>
                <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-4">Step 02</p>
                <h2 className="text-[3rem] md:text-[4.5rem] font-[200] tracking-[0.02em] text-[#1A1A1A] leading-[1] uppercase">
                  Your<br />
                  <span className="font-[700] italic">Results</span>
                </h2>
              </div>
              <button
                onClick={analyzeImage}
                className="border border-[#E8E0DC] text-[#888] px-5 py-2 text-[10px] font-[500] uppercase tracking-[0.2em] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all"
              >
                Re-Analyze
              </button>
            </div>

            {result ? (
              <div>
                {/* ── RESULT HERO: Photo + Season + Face Shape ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-px bg-[#E8E0DC]" data-aos="fade-up">

                  {/* Left: uploaded photo */}
                  <div className="relative overflow-hidden bg-[#F7F4F2] aspect-[3/4] lg:aspect-auto">
                    <img src={preview} alt="Your photo" className="w-full h-full object-cover object-top" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <p className="text-[8px] tracking-[0.45em] uppercase text-white/60 font-[300] mb-1">Your Photo</p>
                      <p className="text-white text-sm font-[500] uppercase tracking-[0.2em]">{result.faceShape} Face</p>
                    </div>
                  </div>

                  {/* Right: Season + Face Shape stacked */}
                  <div className="flex flex-col gap-px bg-[#E8E0DC]">

                    {/* Season card */}
                    <div className={`bg-gradient-to-br ${SEASON_META[result.season]?.glow || "from-[#FFF0F5] to-white"} p-8 md:p-10 flex-1`}>
                      <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-4">Personal Color Season</p>
                      <h3 className="text-[3rem] md:text-[4rem] font-[200] tracking-[0.04em] text-[#1A1A1A] leading-[1] uppercase mb-1">
                        {result.season || "—"}
                      </h3>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-[#D23669] font-[500] mb-6">
                        {SEASON_META[result.season]?.tone || ""}
                      </p>
                      {/* Palette swatches — larger */}
                      <div className="flex gap-1.5 mb-4">
                        {(PALETTES[result.season] || []).map((c) => (
                          <div key={c} className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 md:w-12 md:h-12 shadow-sm" style={{ background: c }} title={c} />
                            <div className="w-1 h-1 rounded-full bg-[#C0B8B4]" />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs font-[300] text-[#555] leading-relaxed">{SEASON_META[result.season]?.note || ""}</p>
                    </div>

                    {/* Face Shape card with image */}
                    <div className="bg-white p-0 flex-1 overflow-hidden">
                      <div className="grid grid-cols-[1fr_1.2fr] h-full gap-px bg-[#E8E0DC]">
                        {/* Face shape illustration — Female & Male SVG */}
                        <div className="relative flex flex-col items-center justify-center bg-[#FDF9F7] min-h-[220px] p-5 gap-4">
                          {(() => {
                            const S = { strokeWidth: "1.8", fill: "#FFF0F5", stroke: "#3A3437" };
                            const G = { stroke: "#D23669", strokeWidth: "0.7", strokeDasharray: "3 3", fill: "none" };
                            const AX = { stroke: "#D23669", strokeWidth: "0.5", strokeDasharray: "2 4", opacity: "0.35" };

                            // Female SVGs — softer curves, tapered jaw
                            const female = {
                              Oval:      <svg viewBox="0 0 80 110" className="w-full" fill="none"><ellipse cx="40" cy="55" rx="26" ry="43" {...S}/><ellipse cx="40" cy="55" rx="17" ry="28" {...G}/><line x1="40" y1="12" x2="40" y2="98" {...AX}/><line x1="14" y1="55" x2="66" y2="55" {...AX}/></svg>,
                              Round:     <svg viewBox="0 0 80 90" className="w-full" fill="none"><circle cx="40" cy="45" r="32" {...S}/><circle cx="40" cy="45" r="20" {...G}/><line x1="40" y1="13" x2="40" y2="77" {...AX}/><line x1="8" y1="45" x2="72" y2="45" {...AX}/></svg>,
                              Square:    <svg viewBox="0 0 80 100" className="w-full" fill="none"><path d="M16 18 Q16 12 22 12 L58 12 Q64 12 64 18 L64 82 Q64 90 58 92 L22 92 Q16 90 16 82 Z" {...S}/><path d="M24 28 L56 28 L56 82 L24 82 Z" {...G}/><line x1="40" y1="12" x2="40" y2="92" {...AX}/><line x1="16" y1="50" x2="64" y2="50" {...AX}/></svg>,
                              Heart:     <svg viewBox="0 0 80 110" className="w-full" fill="none"><path d="M40 98 Q16 76 13 50 Q11 24 25 16 Q35 10 40 22 Q45 10 55 16 Q69 24 67 50 Q64 76 40 98 Z" {...S}/><path d="M40 84 Q24 66 22 46 Q21 30 30 24 Q36 20 40 30 Q44 20 50 24 Q59 30 58 46 Q56 66 40 84 Z" {...G}/><line x1="40" y1="10" x2="40" y2="98" {...AX}/><line x1="13" y1="36" x2="67" y2="36" {...AX}/></svg>,
                              Diamond:   <svg viewBox="0 0 80 110" className="w-full" fill="none"><path d="M40 10 Q52 20 62 42 Q68 58 62 78 Q52 96 40 102 Q28 96 18 78 Q12 58 18 42 Q28 20 40 10 Z" {...S}/><path d="M40 24 Q49 32 56 46 Q60 58 56 72 Q49 86 40 92 Q31 86 24 72 Q20 58 24 46 Q31 32 40 24 Z" {...G}/><line x1="40" y1="10" x2="40" y2="102" {...AX}/><line x1="12" y1="56" x2="68" y2="56" {...AX}/></svg>,
                              Rectangle: <svg viewBox="0 0 80 120" className="w-full" fill="none"><path d="M18 16 Q18 10 24 10 L56 10 Q62 10 62 16 L62 100 Q62 110 56 112 L24 112 Q18 110 18 100 Z" {...S}/><path d="M26 24 L54 24 L54 102 L26 102 Z" {...G}/><line x1="40" y1="10" x2="40" y2="112" {...AX}/><line x1="18" y1="58" x2="62" y2="58" {...AX}/></svg>,
                              Triangle:  <svg viewBox="0 0 80 110" className="w-full" fill="none"><path d="M30 12 Q40 8 50 12 Q58 16 60 28 Q64 50 66 72 Q68 90 58 100 Q50 106 40 106 Q30 106 22 100 Q12 90 14 72 Q16 50 20 28 Q22 16 30 12 Z" {...S}/><path d="M33 22 L47 22 Q54 26 56 40 Q60 58 60 76 Q60 90 52 96 L40 98 L28 96 Q20 90 20 76 Q20 58 24 40 Q26 26 33 22 Z" {...G}/><line x1="40" y1="8" x2="40" y2="106" {...AX}/><line x1="14" y1="58" x2="66" y2="58" {...AX}/></svg>,
                            };

                            // Male SVGs — wider jaw, squarer chin, broader forehead
                            const male = {
                              Oval:      <svg viewBox="0 0 80 110" className="w-full" fill="none"><path d="M14 55 Q14 12 40 12 Q66 12 66 55 Q66 82 58 96 Q50 106 40 106 Q30 106 22 96 Q14 82 14 55 Z" {...S}/><ellipse cx="40" cy="52" rx="18" ry="28" {...G}/><line x1="40" y1="12" x2="40" y2="106" {...AX}/><line x1="14" y1="55" x2="66" y2="55" {...AX}/></svg>,
                              Round:     <svg viewBox="0 0 80 90" className="w-full" fill="none"><path d="M10 42 Q10 10 40 10 Q70 10 70 42 Q70 68 60 78 Q52 86 40 86 Q28 86 20 78 Q10 68 10 42 Z" {...S}/><circle cx="40" cy="44" r="20" {...G}/><line x1="40" y1="10" x2="40" y2="86" {...AX}/><line x1="10" y1="44" x2="70" y2="44" {...AX}/></svg>,
                              Square:    <svg viewBox="0 0 80 100" className="w-full" fill="none"><path d="M12 14 L68 14 L68 76 Q68 92 56 94 L24 94 Q12 92 12 76 Z" {...S}/><path d="M20 22 L60 22 L60 82 L20 82 Z" {...G}/><line x1="40" y1="14" x2="40" y2="94" {...AX}/><line x1="12" y1="50" x2="68" y2="50" {...AX}/></svg>,
                              Heart:     <svg viewBox="0 0 80 110" className="w-full" fill="none"><path d="M13 20 L67 20 Q70 30 68 50 Q64 76 40 98 Q16 76 12 50 Q10 30 13 20 Z" {...S}/><path d="M20 28 L60 28 Q62 38 60 52 Q56 72 40 88 Q24 72 20 52 Q18 38 20 28 Z" {...G}/><line x1="40" y1="14" x2="40" y2="98" {...AX}/><line x1="13" y1="36" x2="67" y2="36" {...AX}/></svg>,
                              Diamond:   <svg viewBox="0 0 80 110" className="w-full" fill="none"><path d="M40 10 L66 40 Q72 58 66 78 L52 100 L28 100 L14 78 Q8 58 14 40 Z" {...S}/><path d="M40 24 L56 44 Q60 58 56 72 L46 90 L34 90 L24 72 Q20 58 24 44 Z" {...G}/><line x1="40" y1="10" x2="40" y2="100" {...AX}/><line x1="10" y1="56" x2="70" y2="56" {...AX}/></svg>,
                              Rectangle: <svg viewBox="0 0 80 120" className="w-full" fill="none"><path d="M14 12 L66 12 L66 98 Q66 110 52 112 L28 112 Q14 110 14 98 Z" {...S}/><path d="M22 22 L58 22 L58 100 L22 100 Z" {...G}/><line x1="40" y1="12" x2="40" y2="112" {...AX}/><line x1="14" y1="58" x2="66" y2="58" {...AX}/></svg>,
                              Triangle:  <svg viewBox="0 0 80 110" className="w-full" fill="none"><path d="M28 12 Q40 8 52 12 Q58 16 60 26 L68 72 Q70 90 58 100 L22 100 Q10 90 12 72 L20 26 Q22 16 28 12 Z" {...S}/><path d="M32 20 L48 20 Q54 24 56 36 L62 70 Q64 84 54 92 L26 92 Q16 84 18 70 L24 36 Q26 24 32 20 Z" {...G}/><line x1="40" y1="8" x2="40" y2="100" {...AX}/><line x1="12" y1="56" x2="68" y2="56" {...AX}/></svg>,
                            };

                            const shape = result.faceShape;
                            return (
                              <div className="flex gap-5 items-end w-full justify-center">
                                <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[70px]">
                                  {female[shape] || female.Oval}
                                  <p className="text-[7px] tracking-[0.35em] uppercase text-[#D23669] font-[300]">Female</p>
                                </div>
                                <div className="w-px self-stretch bg-[#E8E0DC]" />
                                <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[70px]">
                                  {male[shape] || male.Oval}
                                  <p className="text-[7px] tracking-[0.35em] uppercase text-[#4A7B9D] font-[300]">Male</p>
                                </div>
                              </div>
                            );
                          })()}
                          <p className="text-[7px] tracking-[0.4em] uppercase text-[#888] font-[300]">Face Shape Reference</p>
                        </div>
                        {/* Face shape info */}
                        <div className="bg-white p-6 flex flex-col justify-center">
                          <h3 className="text-[2rem] md:text-[2.6rem] font-[200] tracking-[0.03em] text-[#1A1A1A] leading-[1] uppercase mb-3">
                            {result.faceShape || "—"}
                          </h3>
                          <p className="text-xs font-[300] text-[#555] leading-relaxed mb-4">{FACE_META[result.faceShape] || ""}</p>
                          {/* Key traits */}
                          {result.faceShape && (() => {
                            const traits = {
                              Oval:      ["Balanced proportions", "Soft jawline", "Versatile styling"],
                              Round:     ["Soft contours", "Full cheeks", "Youthful look"],
                              Square:    ["Strong jaw", "Wide forehead", "Bold structure"],
                              Heart:     ["Broad forehead", "Pointed chin", "High cheekbones"],
                              Diamond:   ["Narrow forehead", "Wide cheekbones", "Narrow chin"],
                              Rectangle: ["Elongated face", "Defined jaw", "Equal widths"],
                              Triangle:  ["Narrow top", "Wide jaw", "Strong base"],
                            };
                            return (traits[result.faceShape] || []).map((t) => (
                              <div key={t} className="flex items-center gap-2 mb-1.5">
                                <div className="w-1 h-1 rounded-full bg-[#D23669] flex-shrink-0" />
                                <p className="text-[10px] text-[#888] font-[300] tracking-[0.1em]">{t}</p>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── FACE FEATURE ANALYSIS ── */}
                <div className="mt-10" data-aos="fade-up">
                  <div className="flex items-end justify-between mb-8 border-t border-[#E8E0DC] pt-10">
                    <div>
                      <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-2">Makeup Blueprint</p>
                      <h3 className="text-[2rem] md:text-[2.8rem] font-[200] leading-[1] text-[#1A1A1A] uppercase">
                        Feature<br /><span className="font-[700] italic">Analysis</span>
                      </h3>
                    </div>
                    <p className="text-xs font-[300] text-[#888] max-w-[200px] text-right leading-relaxed hidden md:block">
                      Personalized makeup technique based on your facial features
                    </p>
                  </div>

                  {/* Feature cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#E8E0DC]">
                    {[
                      { label: "Brows", value: SHAPE_RECS.brows[result.face?.brows], accent: "#C17A43" },
                      { label: "Eyes",  value: SHAPE_RECS.eyes[result.face?.eyes],   accent: "#4A7B9D" },
                      { label: "Nose",  value: SHAPE_RECS.nose[result.face?.nose],   accent: "#7B6A4A" },
                      { label: "Lips",  value: SHAPE_RECS.lips[result.face?.lips],   accent: "#D23669" },
                    ].map((item) => (
                      <div key={item.label} className="bg-white p-5">
                        <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-2">{item.label}</p>
                        <p className="text-sm font-[500] text-[#1A1A1A] leading-snug">{item.value || "—"}</p>
                        <div className="mt-4 w-6 h-[2px]" style={{ background: item.accent }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Makeover */}
                <div className="border-t border-[#E8E0DC] pt-10 mt-10" data-aos="fade-up">
                  <div className="mb-6">
                    <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">AI Makeover</p>
                    <h3 className="text-[2rem] md:text-[3rem] font-[200] leading-[1] text-[#1A1A1A] uppercase">
                      Gemini<br /><span className="font-[700] italic">Beauty Portrait</span>
                    </h3>
                  </div>
                  {geminiError && <p className="text-xs text-[#D23669] mb-4">{geminiError}</p>}

                  {/* 2-col balanced: Before/After  |  Product picks */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#E8E0DC]">

                    {/* Left: portrait panel — always same height as right */}
                    <div className="bg-white flex flex-col">
                      {geminiStatus === "done" && geminiImage ? (
                        <>
                          <div className="grid grid-cols-2 gap-px bg-[#E8E0DC] flex-1">
                            <div className="bg-white flex flex-col">
                              <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] p-3 pb-2">Before</p>
                              <img src={preview} alt="Original" className="w-full flex-1 object-cover object-top" />
                            </div>
                            <div className="bg-white flex flex-col">
                              <p className="text-[9px] tracking-[0.3em] uppercase text-[#D23669] font-[300] p-3 pb-2">After</p>
                              <img src={geminiImage} alt="AI Makeover" className="w-full flex-1 object-cover object-top" />
                            </div>
                          </div>
                          <div className="border-t border-[#E8E0DC] p-4 flex items-center justify-between">
                            <a href={geminiImage} download="ai-makeover.png"
                              className="text-[10px] font-[500] uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#D23669] transition-colors">
                              Download →
                            </a>
                            <button onClick={runGeminiGeneration}
                              className="text-[9px] font-[500] uppercase tracking-[0.2em] text-[#888] hover:text-[#1A1A1A] transition-colors">
                              Regenerate
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-10 min-h-[280px]">
                          {geminiStatus === "loading" ? (
                            <>
                              <div className="w-5 h-5 border border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                              <p className="text-xs font-[300] text-[#888]">Creating your look...</p>
                            </>
                          ) : (
                            <>
                              <div className="w-16 h-16 border border-[#E8E0DC] flex items-center justify-center text-[#C0B8B4]">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-[300] text-[#888] mb-4">Generate an AI beauty portrait<br />from your uploaded photo</p>
                                <button onClick={runGeminiGeneration}
                                  className="bg-[#1A1A1A] text-white px-8 py-3 text-[10px] font-[600] uppercase tracking-[0.3em] hover:bg-[#D23669] transition-all duration-300">
                                  Generate
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Season product picks */}
                    <div className="bg-white p-6 flex flex-col">
                      <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-1">{result.season} Picks</p>
                      <h4 className="text-lg font-[200] text-[#1A1A1A] uppercase tracking-[0.03em] mb-1">
                        Cosmetics for<br /><span className="font-[600] italic">Your Aura</span>
                      </h4>
                      <div className="w-8 h-px bg-[#D23669] mb-5 mt-2" />
                      <div className="flex-1 divide-y divide-[#E8E0DC]">
                        {(PRODUCTS[result.season] || []).map((p, idx) => (
                          <div key={idx} className="flex items-center gap-4 py-4 group">
                            <div className="w-14 h-14 overflow-hidden bg-[#F7F4F2] shrink-0">
                              <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-300" onError={(e) => { e.target.src = assetPath("assets/home2.webp"); }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-[500] uppercase tracking-[0.15em] text-[#1A1A1A] truncate">{p.name}</p>
                              <p className="text-xs font-[300] text-[#888] mt-0.5">฿{p.price}</p>
                            </div>
                            <a href={p.shopUrl} target="_blank" rel="noreferrer"
                              className="text-[9px] font-[600] uppercase tracking-[0.2em] text-[#D23669] hover:text-[#1A1A1A] transition-colors shrink-0">
                              Shop →
                            </a>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => navigate("/cosmetics")}
                        className="mt-4 w-full border border-[#1A1A1A] text-[#1A1A1A] py-2.5 text-[9px] font-[600] uppercase tracking-[0.3em] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300">
                        Browse All Products
                      </button>
                    </div>
                  </div>
                </div>



                {/* Makeover Studio */}
                <div className="border-t border-[#E8E0DC] pt-10 mt-10" data-aos="fade-up">
                  <div className="mb-6">
                    <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">Virtual Try-On</p>
                    <h3 className="text-[2rem] md:text-[2.8rem] font-[200] leading-[1] text-[#1A1A1A] uppercase">
                      Makeover<br /><span className="font-[700] italic">Studio</span>
                    </h3>
                  </div>

                  {/* Studio + product panel */}
                  <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-px bg-[#E8E0DC]">
                    <div className="bg-white p-2">
                      <MakeoverStudio
                        base={preview || assetPath("assets/analysis.JPG")}
                        onProductSelect={(p) => setSelectedStudioProduct(p || null)}
                      />
                    </div>
                    <div className="bg-white p-5 flex flex-col">
                      <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-4">Selected Product</p>
                      {selectedStudioProduct ? (
                        <SelectedProductCard product={selectedStudioProduct} season={result?.season} />
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-10">
                          <div className="w-10 h-10 border border-[#E8E0DC] flex items-center justify-center text-[#C0B8B4]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h4"/></svg>
                          </div>
                          <p className="text-[11px] font-[300] text-[#888] leading-relaxed">
                            Tap a swatch in the studio<br />to see the product here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hairstyles */}
                <div className="border-t border-[#E8E0DC] pt-10 mt-10" data-aos="fade-up">
                  <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                    <div>
                      <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">Hair Recommendations</p>
                      <h3 className="text-[2rem] md:text-[2.8rem] font-[200] leading-[1] text-[#1A1A1A] uppercase">
                        Hairstyles for<br /><span className="font-[700] italic">{result.faceShape}</span>
                      </h3>
                    </div>
                    <p className="text-xs font-[300] text-[#888] max-w-[200px] text-right leading-relaxed hidden md:block">
                      Recommended cuts and styles that flatter your face shape
                    </p>
                  </div>

                  {(() => {
                    const allStyles = HAIR_STYLE_MAP[result.faceShape] || [];
                    const shortMed = allStyles.filter((s) => s.length === "short" || s.length === "medium");
                    const longStyles = allStyles.filter((s) => s.length === "long");
                    const HairCard = ({ s }) => (
                      <div key={s.key} className="bg-white overflow-hidden group">
                        <div className="aspect-[3/4] overflow-hidden relative">
                          <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" />
                          <div className="absolute top-2 left-2">
                            <span className="text-[8px] tracking-[0.3em] uppercase font-[300] px-2 py-0.5 bg-white/80 text-[#1A1A1A] backdrop-blur-sm">
                              {s.length === "short" ? "Short" : s.length === "medium" ? "Medium" : "Long"}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 border-t border-[#E8E0DC]">
                          <p className="text-xs font-[500] uppercase tracking-[0.2em] text-[#1A1A1A]">{s.name}</p>
                        </div>
                      </div>
                    );
                    if (allStyles.length === 0) return <p className="text-sm font-[300] text-[#888]">No recommendations available for this face shape yet.</p>;
                    return (
                      <div className="space-y-10">
                        {shortMed.length > 0 && (
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <p className="text-[9px] tracking-[0.4em] uppercase text-[#1A1A1A] font-[500]">Short &amp; Medium</p>
                              <div className="flex-1 h-px bg-[#E8E0DC]" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-[#E8E0DC]">
                              {shortMed.map((s) => <HairCard key={s.key} s={s} />)}
                            </div>
                          </div>
                        )}
                        {longStyles.length > 0 && (
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <p className="text-[9px] tracking-[0.4em] uppercase text-[#1A1A1A] font-[500]">Long</p>
                              <div className="flex-1 h-px bg-[#E8E0DC]" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-[#E8E0DC]">
                              {longStyles.map((s) => <HairCard key={s.key} s={s} />)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* YouTube Tutorials */}
                <div className="border-t border-[#E8E0DC] pt-10 mt-10">
                  <YouTubeReels result={result} />
                </div>

                {/* Saving indicator */}
                {saving && (
                  <div className="border-t border-[#E8E0DC] pt-6 mt-6">
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#888] font-[300]">Saving...</span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {(status === "uploading" || status === "analyzing") ? (
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-[300] text-[#555] tracking-wide">
                        {status === "uploading" ? "Uploading image..." : "AI is analyzing face structure and personal color..."}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#E8E0DC]">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white p-8 space-y-4">
                          <div className="h-2.5 w-20 animate-pulse bg-[#E8E0DC] rounded" />
                          <div className="h-12 w-36 animate-pulse bg-[#E8E0DC] rounded" />
                          <div className="h-2.5 w-40 animate-pulse bg-[#E8E0DC] rounded" />
                          <div className="flex gap-2">{[1,2,3,4].map((j) => <div key={j} className="w-8 h-8 animate-pulse bg-[#E8E0DC]" />)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-[300] text-[#888]">Upload your photo in Step 1 and the results will appear here automatically.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── PREV / NEXT ── */}
        <div className="mt-16 flex items-center justify-between border-t border-[#E8E0DC] pt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="border border-[#E8E0DC] text-[#888] px-6 py-2.5 text-[10px] font-[500] uppercase tracking-[0.2em] disabled:opacity-30 hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={!canGoNext || currentStep === 2}
            className="bg-[#1A1A1A] text-white px-8 py-2.5 text-[10px] font-[600] uppercase tracking-[0.25em] disabled:opacity-30 hover:bg-[#D23669] transition-all"
          >
            Next
          </button>
        </div>

        <p className="mt-8 text-center text-[9px] tracking-[0.2em] text-[#aaa] font-[300]">
          *These recommendations are for general beauty guidance only and are not a medical diagnosis.
        </p>
      </main>

      {/* Sticky bar (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E0DC] bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-1">
          <button
            onClick={() => inputRef.current?.click()}
            className="flex-1 bg-[#1A1A1A] text-white py-3 text-[10px] font-[600] uppercase tracking-[0.2em] hover:bg-[#D23669] transition-all"
          >
            Upload Photo
          </button>
          <button
            onClick={analyzeImage}
            className="flex-1 border border-[#E8E0DC] text-[#1A1A1A] py-3 text-[10px] font-[600] uppercase tracking-[0.2em] hover:border-[#1A1A1A] transition-all"
          >
            Analyze
          </button>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #1A1A1A; border-radius: 0; }
      `}</style>
    </div>
  );
}

