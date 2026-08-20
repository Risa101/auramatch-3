// src/pages/Analysis.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Analysis.css";
import MakeoverStudio from "../components/MakeoverStudio.jsx";
import { saveAnalysisHistory, generateGeminiImage, analyzeFaceApi, analyzeSeasonML, analyzeColorEngine, analyzeUndertone } from "../callapi/call_api_user";
import { detectFaceShape, loadFaceModels } from "../utils/faceShapeDetector";
import { logAiCall } from "../utils/aiLogger";
import { imgUrl } from "../utils/imgUrl";

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
  Spring: { tone: "อบอุ่น • สดใส", note: "โทนอบอุ่น สดใส และอ่อนโยน", glow: "from-[#FFF1D8] to-[#FFDDE7]" },
  Summer: { tone: "เย็น • นุ่มนวล", note: "โทนเย็น นุ่มนวล และละมุน", glow: "from-[#EAF2FF] to-[#F1E8FF]" },
  Autumn: { tone: "อบอุ่น • เข้ม", note: "โทนอุ่น เข้ม และมีความเป็นธรรมชาติ", glow: "from-[#F8E8D6] to-[#F6E1CF]" },
  Winter: { tone: "เย็น • คมชัด", note: "โทนเย็น เข้ม ชัด และโดดเด่น", glow: "from-[#ECECFF] to-[#E9EEF9]" },
};
// Display labels for SEASONS/FACE_TYPES — those arrays stay English since their
// values double as lookup keys (SEASON_META[season], PRODUCTS[season], etc.)
const SEASON_LABELS_TH = { Spring: "ฤดูใบไม้ผลิ", Summer: "ฤดูร้อน", Autumn: "ฤดูใบไม้ร่วง", Winter: "ฤดูหนาว" };
const FACE_TYPE_LABELS_TH = { Oval: "รูปไข่", Round: "กลม", Square: "เหลี่ยม", Heart: "หัวใจ", Diamond: "เพชร", Rectangle: "ยาว" };
// Display labels for the `category` tag MakeoverStudio attaches to each cart
// item (Foundation/Lips/Eyes/Blush/Brows/Contour) — stays English at the
// source since it's also half of the cart item's dedupe key (cartKey()).
const CATEGORY_LABELS_TH = { Foundation: "รองพื้น", Lips: "ลิป", Eyes: "ดวงตา", Blush: "บลัชออน", Brows: "คิ้ว", Contour: "คอนทัวร์" };
const FACE_META = {
  Oval: "สมส่วนและนุ่มนวล เข้ากับสไตล์ได้หลากหลาย",
  Round: "อ่อนโยนและดูเด็ก เพิ่มมิติให้ใบหน้าได้ง่าย",
  Square: "กรามชัดเจน ดูมั่นใจและโดดเด่น",
  Heart: "หน้าผากเด่น คางเรียว ดูน่ารักสดใส",
  Diamond: "โหนกแก้มชัด คมและมีเสน่ห์",
  Rectangle: "ใบหน้าเรียวยาวสง่างาม โครงหน้าชัดเจน",
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
// Values are display labels (also used as SHAPE_RECS_EXPLAIN lookup keys below) —
// the outer/inner KEYS (brows/eyes/nose/lips, softArch/straight/arched, ...) stay
// English since they're driven by the ML/API response shape, not display text.
const SHAPE_RECS = {
  brows: { softArch: "คิ้วโค้งอ่อน", straight: "คิ้วตรง", arched: "คิ้วโก่งสูง" },
  eyes: { natural: "อายไล่สีธรรมชาติ", cat: "อายไลเนอร์ยกหางตา", dolly: "ตาโตกลมหวาน" },
  nose: { softContour: "คอนทัวร์นุ่มนวล", definedContour: "คอนทัวร์คมชัด", natural: "ธรรมชาติ" },
  lips: { gradient: "ลิปไล่สี", full: "ลิปเต็มปากสีเข้ม", soft: "ลิปเบลอนุ่มนวล" },
};

// คำอธิบายภาษาไทยแบบเข้าใจง่าย สำหรับผู้ใช้ที่ไม่เชี่ยวชาญด้านการแต่งหน้า
const SHAPE_RECS_EXPLAIN = {
  "คิ้วโค้งอ่อน": "คิ้วโค้งมนนุ่มนวล ไม่หักมุม ดูเป็นธรรมชาติ",
  "คิ้วตรง": "คิ้วเส้นตรง ไม่มีส่วนโค้ง ดูทันสมัยและคม",
  "คิ้วโก่งสูง": "คิ้วโค้งสูงชัดเจน ช่วยให้ใบหน้าดูมีมิติ",
  "อายไล่สีธรรมชาติ": "แต่งตาไล่สีอ่อนไปเข้มแบบธรรมชาติ",
  "อายไลเนอร์ยกหางตา": "เขียนอายไลเนอร์ยกหางตา ให้ดวงตาดูเรียวยาว",
  "ตาโตกลมหวาน": "แต่งตาโตกลม ให้ดวงตาดูใสและเด่น",
  "คอนทัวร์นุ่มนวล": "คอนทัวร์จมูกเบาๆ ไม่ชัดมาก ดูเป็นธรรมชาติ",
  "คอนทัวร์คมชัด": "คอนทัวร์จมูกชัดเจน ช่วยให้จมูกดูโด่งขึ้น",
  "ธรรมชาติ": "ไม่ต้องคอนทัวร์ เน้นความเป็นธรรมชาติ",
  "ลิปไล่สี": "ทาปากไล่สี เข้มตรงกลาง อ่อนที่ขอบปาก",
  "ลิปเต็มปากสีเข้ม": "ทาปากเต็มทั้งปาก สีเข้มชัดเจน",
  "ลิปเบลอนุ่มนวล": "ทาปากแบบเบลอขอบ ให้ดูฟุ้งนุ่มนวล",
};

// Committee feedback: the Gemini-generated portrait doesn't look natural yet
// (too red / not presentation-ready) — hidden until the prompt/pipeline is
// improved. Flip back to true to bring it back.
const SHOW_GEMINI_MAKEOVER = false;

// Hairstyle recommendation cards, hidden per request. Flip back to true to bring it back.
const SHOW_HAIRSTYLES = false;

/* ---------------- Products (sample) ---------------- */
const PRODUCTS = {
  Spring: [
    { name: "บลัชออนพีช", price: "289", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=peach%20blush" },
    { name: "ทินท์บาล์มคอรัล", price: "219", img: assetPath("product/brush2.jpg"), shopUrl: "https://shopee.co.th/search?keyword=coral%20tint%20balm" },
    { name: "คุชชั่นเปล่งประกาย", price: "299", img: assetPath("product/cushion.png"), shopUrl: "https://shopee.co.th/search?keyword=glow%20cushion" },
    { name: "ลิปออยล์แอปริคอต", price: "259", img: assetPath("product/lipoil.png"), shopUrl: "https://shopee.co.th/search?keyword=apricot%20lip%20oil" },
    { name: "บรอนเซอร์ซันคิสท์", price: "279", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=sunkissed%20bronzer" },
  ],
  Summer: [
    { name: "บลัชออนครีมม่วงอมชมพู", price: "289", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=mauve%20cream%20blush" },
    { name: "ลิปออยล์ชมพูโทนเย็น", price: "199", img: assetPath("product/lipoil.png"), shopUrl: "https://shopee.co.th/search?keyword=lip%20oil%20cool%20pink" },
    { name: "ไฮไลท์เตอร์เนื้อบาง", price: "259", img: assetPath("product/jovinafd.jpg"), shopUrl: "https://shopee.co.th/search?keyword=sheer%20highlighter" },
    { name: "คุชชั่นโรสมิสต์", price: "299", img: assetPath("product/cushion.png"), shopUrl: "https://shopee.co.th/search?keyword=rose%20cushion" },
    { name: "ลิปทินท์เบอร์รี่อ่อน", price: "229", img: assetPath("product/cathydolllip.webp"), shopUrl: "https://shopee.co.th/search?keyword=berry%20lip%20tint" },
  ],
  Autumn: [
    { name: "บลัชออนเทอร์ราคอตตา", price: "289", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=terracotta%20blush" },
    { name: "บรอนเซอร์น้ำผึ้ง", price: "349", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=honey%20bronzer" },
    { name: "ลิปแมตต์คาราเมล", price: "229", img: assetPath("product/lip.png"), shopUrl: "https://shopee.co.th/search?keyword=matte%20caramel%20lip" },
    { name: "รองพื้นคุชชั่นสีอำพัน", price: "319", img: assetPath("product/cushion.png"), shopUrl: "https://shopee.co.th/search?keyword=amber%20cushion" },
    { name: "ลิปออยล์กลิ่นสไปซ์", price: "259", img: assetPath("product/lipoil.png"), shopUrl: "https://shopee.co.th/search?keyword=spice%20lip%20oil" },
  ],
  Winter: [
    { name: "ลิปสติกเบอร์รี่", price: "249", img: assetPath("product/lip.png"), shopUrl: "https://shopee.co.th/search?keyword=berry%20lipstick" },
    { name: "บลัชออนพลัมโกลว์", price: "289", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=plum%20blush" },
    { name: "แท่งคอนทัวร์โทนเย็น", price: "299", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=cool%20contour%20stick" },
    { name: "คุชชั่นสีพอร์ซเลน", price: "319", img: assetPath("product/cushion.png"), shopUrl: "https://shopee.co.th/search?keyword=porcelain%20cushion" },
    { name: "ลิปออยล์ไวน์", price: "259", img: assetPath("product/lipoil.png"), shopUrl: "https://shopee.co.th/search?keyword=wine%20lip%20oil" },
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
// Thai versions for on-screen display only — the English strings above stay
// as-is since they're used to build the actual YouTube search query and to
// match a curated video id in resolveVideoId() (English keyword matching).
const EYE_QUERY_TH = {
  natural: "แต่งตาไล่สีธรรมชาติ",
  cat: "อายไลเนอร์ยกหางตาแบบแคทอาย",
  dolly: "แต่งตาโตกลมหวาน",
};
const BROW_QUERY_TH = {
  softArch: "สอนเขียนคิ้วโค้งอ่อน",
  straight: "คิ้วทรงตรงสไตล์เกาหลี",
  arched: "สอนเขียนคิ้วโก่งสูง",
};
const buildYT = (q) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
function buildYouTubeLinks(result) {
  if (!result) return [];
  const links = [];
  const { season, faceShape, face } = result;
  if (season) {
    const th = SEASON_TH[season] || season;
    const seasonTh = SEASON_LABELS_TH[season] || season;
    links.push({
      title: `Makeup for ${th} tone (Personal Color)`,
      titleTh: `เมกอัพสำหรับโทนสี ${seasonTh} (Personal Color)`,
      url: buildYT(`makeup ${season} personal color tutorial`),
    });
    links.push({
      title: `Lip & Blush colors for ${th} tone`,
      titleTh: `สีลิปและบลัชออนสำหรับโทน ${seasonTh}`,
      url: buildYT(`lip blush ${season} personal color`),
    });
  }
  if (faceShape) {
    const th = FACE_SHAPE_TH[faceShape] || faceShape;
    const faceTh = FACE_TYPE_LABELS_TH[faceShape] || faceShape;
    links.push({
      title: `Contour for ${th} face shape`,
      titleTh: `คอนทัวร์สำหรับรูปหน้า${faceTh}`,
      url: buildYT(`contour face shape ${th} how to`),
    });
  }
  if (face?.eyes)
    links.push({
      title: `Eye technique: ${EYE_QUERY[face.eyes] || "eye makeup"}`,
      titleTh: `เทคนิคแต่งตา: ${EYE_QUERY_TH[face.eyes] || "แต่งตา"}`,
      url: buildYT(EYE_QUERY[face.eyes] || "eye makeup tutorial"),
    });
  if (face?.brows)
    links.push({
      title: `Brow tutorial: ${BROW_QUERY[face.brows] || "brow shape for face"}`,
      titleTh: `สอนแต่งคิ้ว: ${BROW_QUERY_TH[face.brows] || "ทรงคิ้วที่เหมาะกับใบหน้า"}`,
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
    <article className="rounded-2xl border border-[#F5E3E8] bg-white overflow-hidden shadow-[0_8px_30px_-10px_rgba(210,54,105,0.12)]">
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F7F4F2]">
        <img
          src={product.img}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
        />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3">
          <span className="text-[8px] tracking-[0.4em] uppercase text-white/80 font-[300] bg-black/30 px-2 py-1 backdrop-blur-sm">
            เลือกแล้ว
          </span>
          <span className="text-[8px] tracking-[0.3em] uppercase text-white/70 font-[300] bg-black/20 px-2 py-1 backdrop-blur-sm">
            {SEASON_LABELS_TH[season] || season}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 border-t border-[#F5E3E8]">
        <p className="text-[9px] tracking-[0.4em] uppercase text-[#D23669] font-[300] mb-2">
          เหมาะสำหรับ {SEASON_LABELS_TH[season] || season || "สีประจำตัวของคุณ"}
        </p>
        <h4 className="text-lg font-[500] tracking-[0.02em] text-[#1A1A1A] mb-1">{product.name}</h4>
        <div className="w-full h-px bg-[#F5E3E8] my-3" />
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-1">ราคาโดยประมาณ</p>
        <p className="text-2xl font-[200] tracking-[0.03em] text-[#1A1A1A] mb-3">
          ฿<span className="font-[600]">{product.price}</span>
        </p>
        <p className="text-xs font-[300] text-[#888] leading-relaxed mb-4">
          เลือกจากสตูดิโอแต่งหน้าของคุณ สั่งซื้อได้จากร้านค้าออนไลน์
        </p>
        <button
          onClick={openShop}
          className="w-full rounded-xl bg-gradient-to-r from-[#D23669] to-[#C2255A] text-white py-3 text-[10px] font-[600] uppercase tracking-[0.3em] shadow-[0_8px_24px_-6px_rgba(210,54,105,0.5)] hover:shadow-[0_10px_28px_-4px_rgba(210,54,105,0.6)] transition-all duration-300"
        >
          ซื้อลุคนี้เลย
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

  // Show just the single most relevant clip instead of a scrollable row.
  const it = items[0];
  const vid = resolveVideoId(it.title);
  const src = vid ? ytEmbedById(vid) : ytSearchEmbedUrl(it.title);

  return (
    <section>
      <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">บทเรียน</p>
      <h3 className="text-2xl md:text-3xl font-[200] leading-[1] text-[#1A1A1A] uppercase mb-8">
        วิดีโอ<br /><span className="font-[700] italic">สอนแต่งหน้า</span>
      </h3>
      <div className="reel-card w-full">
        <iframe
          title={it.titleTh || it.title}
          className="reel-iframe w-full h-[70vh] md:h-[720px]"
          src={src}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <div className="reel-caption"><span className="line-clamp-1">{it.titleTh || it.title}</span></div>
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
    const token = localStorage.getItem("auramatch:token") || "";
    const res = await fetch(`${API_BASE_URL}/api/analysis-history/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
    const token = localStorage.getItem("auramatch:token") || "";
    const res = await fetch(`${API_BASE_URL}/api/analysis-history/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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

// แปลง File → HTMLImageElement (สำหรับ face-api.js)
function fileToImgElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject;
    img.src = url;
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
  const [selectedStudioProducts, setSelectedStudioProducts] = useState([]);
  // ── "Your Selected Products" cart (built on top of selectedStudioProducts,
  // which the Makeover Studio keeps in sync with every shade/Look pick) ──
  const [cartQty, setCartQty] = useState({}); // { [cartKey]: qty }
  const [removedCartKeys, setRemovedCartKeys] = useState(() => new Set());
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
      setError("กรุณาอัปโหลดไฟล์รูปภาพ (JPG, PNG, WEBP) เท่านั้น");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`ขนาดไฟล์ต้องไม่เกิน ${MAX_SIZE_MB} MB`);
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
      setError("ไม่สามารถอ่านไฟล์ได้ กรุณาลองใหม่อีกครั้ง");
    }
  }

  async function runAnalysis({ pickedFile = file, previewSrc = preview, autoMode = false } = {}) {
    if (!pickedFile && !previewSrc) {
      setError("กรุณาอัปโหลดรูปภาพก่อน");
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
        // ── Gemini: วิเคราะห์ season + สีผิว ──
        const geminiStart = Date.now();
        try {
          const res = await analyzeFaceApi(pickedFile);
          data = {
            season: res.season,
            faceShape: res.faceShape,
            face: res.face,
            hairLength: pick(["Short", "Medium", "Long"]),
            hairTexture: pick(["Straight", "Wavy", "Curly"]),
          };
          logAiCall({
            modelUsed: "Gemini",
            task: "seasonal_color",
            input: { fileName: pickedFile.name, fileSize: pickedFile.size },
            output: { season: res.season, faceShape: res.faceShape },
            processingMs: Date.now() - geminiStart,
            success: true,
            userId: auth.currentUser?.uid || null,
          });
        } catch (apiErr) {
          console.warn("Gemini analyze-face failed, falling back to mock:", apiErr);
          logAiCall({
            modelUsed: "Gemini",
            task: "seasonal_color",
            input: { fileName: pickedFile.name },
            output: null,
            processingMs: Date.now() - geminiStart,
            success: false,
            errorMessage: apiErr?.message || "unknown error",
            userId: auth.currentUser?.uid || null,
          });
          data = await analyzeImageMock(pickedFile);
        }

        // ── RandomForest ML: วิเคราะห์ season จาก skin tone ──
        try {
          const mlStart = Date.now();
          const mlResult = await analyzeSeasonML(pickedFile);
          if (mlResult?.season) {
            console.log("[RandomForest] season:", mlResult.season, "confidence:", mlResult.confidence);
            data.season = mlResult.season;
            data.seasonConfidence = mlResult.confidence;
            data.skinRgb = mlResult.skin_rgb;
            logAiCall({
              modelUsed: "RandomForest",
              task: "seasonal_color",
              input: mlResult.skin_rgb,
              output: mlResult.season,
              confidence: mlResult.confidence,
              processingMs: Date.now() - mlStart,
              success: true,
              userId: auth.currentUser?.uid || null,
            });
          }
        } catch (mlErr) {
          console.warn("[RandomForest] season prediction failed:", mlErr);
        }
        // ──────────────────────────────────────────────────────

        // ── Color Engine (auramatchgenz): MediaPipe + CIELAB, ละเอียดสุด ──
        // ถ้า service ไม่รัน (เช่นตอน production ที่ยังไม่ได้ host) จะ 503
        // แล้ว fallback ไปใช้ค่าจาก RandomForest/Gemini ที่ตั้งไว้ก่อนหน้าโดยอัตโนมัติ
        try {
          const colorEngineStart = Date.now();
          const ceResult = await analyzeColorEngine(pickedFile);
          if (ceResult?.valid && ceResult?.season) {
            console.log("[ColorEngine] season:", ceResult.season, "subTone:", ceResult.sub_tone, "confidence:", ceResult.confidence);
            data.season = ceResult.season;
            data.seasonConfidence = ceResult.confidence;
            data.subTone = ceResult.sub_tone;
            data.warmCool = ceResult.warm_cool;
            data.skinLab = ceResult.skin_lab;
            logAiCall({
              modelUsed: "ColorEngine",
              task: "seasonal_color",
              input: ceResult.skin_lab,
              output: ceResult.season,
              confidence: ceResult.confidence,
              processingMs: Date.now() - colorEngineStart,
              success: true,
              userId: auth.currentUser?.uid || null,
            });
          }
        } catch (ceErr) {
          console.warn("[ColorEngine] analysis failed, keeping previous season estimate:", ceErr);
        }
        // ──────────────────────────────────────────────────────

        // ── Skin Undertone (classical CV, พอร์ตจาก detection_skin_for_cream(2).ipynb
        // — ไม่ใช่ ML model) + สินค้าบลัชออนจริงจาก DB ที่ตรงกับ undertone นั้น ──
        try {
          const undertoneStart = Date.now();
          const utResult = await analyzeUndertone(pickedFile);
          if (utResult?.success) {
            console.log("[Undertone] tone:", utResult.undertone, "ITA:", utResult.ita, "L*:", utResult.l_star);
            data.skinUndertone = utResult.undertone;
            data.skinUndertoneIta = utResult.ita;
            data.skinUndertoneLstar = utResult.l_star;
            data.blushProducts = utResult.recommended_products || [];
            logAiCall({
              modelUsed: "UndertoneCV",
              task: "skin_undertone",
              input: { skin_pixel_count: utResult.skin_pixel_count },
              output: utResult.undertone,
              processingMs: Date.now() - undertoneStart,
              success: true,
              userId: auth.currentUser?.uid || null,
            });
          }
        } catch (utErr) {
          console.warn("[Undertone] analysis failed:", utErr);
        }
        // ──────────────────────────────────────────────────────

        // ── face-api.js: detect face shape จาก landmark เอง ──
        const faceStart = Date.now();
        try {
          await loadFaceModels();
          const imgEl = await fileToImgElement(pickedFile);
          const faceResult = await detectFaceShape(imgEl);
          if (faceResult.shape) {
            console.log("[face-api.js] detected shape:", faceResult.shape, "ratios:", faceResult.ratios);
            data.faceShape = faceResult.shape;
            data.faceShapeConfidence = faceResult.confidence;
            data.faceShapeRatios = faceResult.ratios;
            logAiCall({
              modelUsed: "face-api.js",
              task: "face_shape",
              input: faceResult.ratios,
              output: faceResult.shape,
              confidence: faceResult.confidence,
              processingMs: Date.now() - faceStart,
              success: true,
              userId: auth.currentUser?.uid || null,
            });
          }
        } catch (faceErr) {
          console.warn("[face-api.js] face shape detection failed:", faceErr);
          logAiCall({
            modelUsed: "face-api.js",
            task: "face_shape",
            input: {},
            output: null,
            processingMs: Date.now() - faceStart,
            success: false,
            errorMessage: faceErr?.message || "unknown error",
            userId: auth.currentUser?.uid || null,
          });
        }
        // ──────────────────────────────────────────────────────
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
      setError("เกิดข้อผิดพลาดระหว่างการวิเคราะห์ กรุณาลองใหม่อีกครั้ง");
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
      setGeminiError("กรุณาอัปโหลดรูปภาพก่อน");
      return;
    }
    const geminiImgStart = Date.now();
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
      logAiCall({
        modelUsed: "Gemini",
        task: "makeup_generation",
        input: { promptLength: GEMINI_PROMPT.length },
        output: "image_generated",
        processingMs: Date.now() - geminiImgStart,
        success: true,
        userId: auth.currentUser?.uid || null,
      });
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || err?.message || "";
      if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
        setGeminiError("การใช้งาน Gemini API เกินโควตา กรุณารอสักครู่แล้วลองใหม่อีกครั้ง");
      } else {
        setGeminiError("สร้างภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
      setGeminiStatus("error");
      logAiCall({
        modelUsed: "Gemini",
        task: "makeup_generation",
        input: { promptLength: GEMINI_PROMPT.length },
        output: null,
        processingMs: Date.now() - geminiImgStart,
        success: false,
        errorMessage: msg || "unknown error",
        userId: auth.currentUser?.uid || null,
      });
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
    if (currentStep === 1 && !preview) return setError("กรุณาอัปโหลดรูปภาพก่อน");
    setCurrentStep((s) => Math.min(2, s + 1));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  // ── "Your Selected Products" cart — derived from selectedStudioProducts
  // (live picker state from Makeover Studio) + local qty/remove overrides.
  // Keyed by category+name so re-picking a shade in the same category
  // replaces it instead of duplicating, matching how the studio itself works.
  const cartKey = (p) => `${p.category || "Item"}::${p.name}`;
  const cartItems = selectedStudioProducts
    .map((p) => {
      const key = cartKey(p);
      return { ...p, key, qty: cartQty[key] ?? 1 };
    })
    .filter((item) => !removedCartKeys.has(item.key));
  // Brow SHAPE entries (isShapeOnly) are part of the Look but not a purchasable
  // product — a style pick, not a shade — so they're excluded from item count/total.
  const cartCount = cartItems.filter((item) => !item.isShapeOnly).reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.qty, 0);

  const changeCartQty = (key, delta) => {
    setCartQty((prev) => ({ ...prev, [key]: Math.max(1, (prev[key] ?? 1) + delta) }));
  };
  const removeFromCart = (key) => {
    setRemovedCartKeys((prev) => new Set(prev).add(key));
  };
  const buyAllInCart = () => {
    cartItems.forEach((item) => {
      if (item.shopUrl) window.open(item.shopUrl, "_blank", "noopener,noreferrer");
    });
  };

  // Shared between the (currently hidden) Gemini grid and the standalone
  // fallback below — the season-matched product list itself isn't affected
  // by the Gemini portrait quality issue, so it stays visible either way.
  const ProductPicksPanel = () => (
    <>
      <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-1">แนะนำสำหรับ{SEASON_LABELS_TH[result?.season] || result?.season}</p>
      <h4 className="text-xl md:text-2xl font-[200] text-[#1A1A1A] uppercase tracking-[0.02em] mb-1">
        เครื่องสำอาง<br /><span className="font-[600] italic">สำหรับออร่าคุณ</span>
      </h4>
      <div className="w-8 h-px bg-[#D23669] mb-8 mt-3" />

      {/* Same card language as the Cosmetics catalog page — image, match badge, name + price + shop link */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-px bg-[#F5E3E8] rounded-2xl overflow-hidden border border-[#F5E3E8] shadow-[0_8px_30px_-10px_rgba(210,54,105,0.12)]">
        {(PRODUCTS[result?.season] || []).map((p, idx) => (
          <a
            key={idx}
            href={p.shopUrl}
            target="_blank"
            rel="noreferrer"
            className="group bg-white block"
          >
            <div className="relative aspect-square overflow-hidden bg-[#F7F4F2]">
              <img
                src={p.img}
                alt={p.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                onError={(e) => { e.target.src = assetPath("assets/home2.webp"); }}
              />
              <div className="absolute top-2 left-2 bg-[#D23669] text-white text-[7px] font-[600] px-1.5 py-0.5 uppercase tracking-[0.1em]">
                {SEASON_LABELS_TH[result?.season] || result?.season}
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
            </div>
            <div className="p-2.5 border-t border-[#F5E3E8]">
              <h3 className="text-[10px] font-[500] text-[#1A1A1A] leading-snug mb-1.5 line-clamp-1 uppercase tracking-[0.03em]">{p.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs font-[600] text-[#1A1A1A]">฿{p.price}</span>
                <span className="text-[8px] font-[600] uppercase tracking-[0.15em] text-[#D23669] group-hover:text-[#1A1A1A] transition-colors">
                  ช้อปเลย →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      <button onClick={() => navigate("/cosmetics")}
        className="mt-8 w-full rounded-xl border border-[#D23669] text-[#D23669] py-2.5 text-[9px] font-[600] uppercase tracking-[0.3em] hover:bg-gradient-to-r hover:from-[#D23669] hover:to-[#C2255A] hover:text-white hover:border-transparent transition-all duration-300">
        ดูสินค้าทั้งหมด
      </button>
    </>
  );

  return (
    <div className="bg-gradient-to-b from-white via-[#FFFAFB] to-white text-[#1A1A1A] font-sans selection:bg-[#FFD1DC] selection:text-[#D23669] antialiased">
      <main className="mx-auto max-w-[1400px] px-6 md:px-10 pt-[60px] lg:pt-[180px] pb-32">

        {/* ── STEP INDICATOR ── */}
        <div className="flex rounded-2xl border border-[#F5E3E8] mb-14 overflow-hidden shadow-[0_8px_30px_-12px_rgba(210,54,105,0.12)]">
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
              <p className="text-[8px] tracking-[0.5em] uppercase font-[300] text-[#888] mb-0.5">ขั้นตอนที่ 1</p>
              <p className={`text-sm font-[600] uppercase tracking-[0.05em] transition-colors ${currentStep === 1 ? "text-[#1A1A1A]" : "text-[#888]"}`}>อัปโหลดรูปภาพ</p>
            </div>
            {stepDone[1] && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7.5" stroke="#D23669" />
                <path d="M4.5 8l2.5 2.5 4-4" stroke="#D23669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Divider */}
          <div className="w-px bg-[#F5E3E8] shrink-0" />

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
              <p className="text-[8px] tracking-[0.5em] uppercase font-[300] text-[#888] mb-0.5">ขั้นตอนที่ 2</p>
              <p className={`text-sm font-[600] uppercase tracking-[0.05em] transition-colors ${currentStep === 2 ? "text-[#1A1A1A]" : "text-[#888]"}`}>ผลลัพธ์และการแต่งหน้า</p>
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
            <div className="border-t border-[#F5E3E8] pt-8 mb-8" data-aos="fade-up">
              <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-4">ขั้นตอนที่ 01</p>
              <h2 className="text-3xl md:text-5xl font-[200] tracking-[0.02em] text-[#1A1A1A] leading-[1] uppercase">
                อัปโหลด<br />
                <span className="font-[700] italic">รูปภาพของคุณ</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              {/* Photo preview */}
              <div className="overflow-hidden rounded-3xl border border-[#F5E3E8] shadow-[0_10px_40px_-10px_rgba(210,54,105,0.15)] bg-[#F7F4F2]" style={{ aspectRatio: "4/5" }}>
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
                    <p className="mt-6 text-xs tracking-[0.2em] uppercase text-[#888] font-[300]">จัดใบหน้าให้อยู่ในกรอบ</p>
                    <p className="mt-2 text-xs text-[#aaa] tracking-wide">ใบหน้า · ไหล่ · หันหน้าตรง</p>
                    <div className="mt-6 rounded-xl border border-[#D23669] px-6 py-2">
                      <p className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] font-[500]">แตะเพื่ออัปโหลด</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: instructions + status */}
              <div className="space-y-8 pt-2">
                <div className="border-t border-[#F5E3E8] pt-6">
                  <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-5">เริ่มต้นใช้งาน</p>
                  <p className="text-sm text-[#555] font-[300] leading-relaxed mb-6">
                    อัปโหลดรูปใบหน้าของคุณ ระบบจะวิเคราะห์ให้อัตโนมัติ ไม่ต้องกดอะไรเพิ่ม
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => inputRef.current?.click()}
                      className="rounded-xl bg-gradient-to-r from-[#D23669] to-[#C2255A] text-white px-8 py-3 text-[10px] font-[600] uppercase tracking-[0.25em] shadow-[0_8px_24px_-6px_rgba(210,54,105,0.5)] hover:shadow-[0_10px_28px_-4px_rgba(210,54,105,0.6)] transition-all duration-300"
                    >
                      เลือกรูปภาพ
                    </button>
                    <button
                      onClick={fillDemo}
                      className="rounded-xl border border-[#F0DEE3] text-[#1A1A1A] px-8 py-3 text-[10px] font-[500] uppercase tracking-[0.25em] hover:border-[#D23669] hover:text-[#D23669] transition-all duration-300"
                    >
                      รูปตัวอย่าง
                    </button>
                  </div>
                  <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
                </div>

                {(status === "uploading" || status === "analyzing") && (
                  <div className="border-t border-[#F5E3E8] pt-6">
                    <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">สถานะ</p>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-[300] text-[#555] tracking-wide">
                        {status === "uploading" ? "กำลังอัปโหลดรูปภาพ..." : "AI กำลังวิเคราะห์ใบหน้าของคุณ..."}
                      </span>
                    </div>
                  </div>
                )}
                {stepDone[1] && status !== "uploading" && status !== "analyzing" && (
                  <div className="border-t border-[#F5E3E8] pt-6">
                    <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-2">สถานะ</p>
                    <p className="text-xs font-[300] text-[#1A1A1A]">อัปโหลดรูปแล้ว — วิเคราะห์เสร็จสมบูรณ์</p>
                  </div>
                )}
                {error && (
                  <div className="border-l-2 border-[#D23669] pl-4 text-xs text-[#D23669] font-[300]">{error}</div>
                )}

                <div className="border-t border-[#F5E3E8] pt-6 space-y-3">
                  <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-4">เพื่อผลลัพธ์ที่ดีที่สุด</p>
                  {[
                    "หันหน้าตรงเข้าหากล้อง",
                    "ใช้แสงธรรมชาติหรือแสงขาว",
                    "รวบผมให้เห็นใบหน้าชัดเจน",
                    "หลีกเลี่ยงฟิลเตอร์และมุมเอียง",
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
            <div className="border-t border-[#F5E3E8] pt-6 mb-6 flex flex-wrap items-end justify-between gap-4" data-aos="fade-up">
              <div>
                <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-3">ขั้นตอนที่ 02</p>
                <h2 className="text-2xl md:text-4xl font-[200] tracking-[0.02em] text-[#1A1A1A] leading-[1] uppercase">
                  ผลลัพธ์<br />
                  <span className="font-[700] italic">ของคุณ</span>
                </h2>
              </div>
              <button
                onClick={analyzeImage}
                className="rounded-xl border border-[#F0DEE3] text-[#8A7A80] px-5 py-2 text-[10px] font-[500] uppercase tracking-[0.2em] hover:border-[#D23669] hover:text-[#D23669] transition-all"
              >
                วิเคราะห์ใหม่
              </button>
            </div>

            {result ? (
              <div>
                {/* ── RESULT HERO: Photo + Season + Face Shape ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-px bg-[#F5E3E8] rounded-3xl overflow-hidden border border-[#F5E3E8] shadow-[0_10px_40px_-10px_rgba(210,54,105,0.15)]" data-aos="fade-up">

                  {/* Left: uploaded photo */}
                  <div className="relative overflow-hidden bg-[#F7F4F2] aspect-[3/4] lg:aspect-auto">
                    <img src={preview} alt="Your photo" className="w-full h-full object-cover object-top" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <p className="text-[8px] tracking-[0.45em] uppercase text-white/60 font-[300] mb-1">รูปภาพของคุณ</p>
                      <p className="text-white text-sm font-[500] uppercase tracking-[0.2em]">ใบหน้าทรง{FACE_TYPE_LABELS_TH[result.faceShape] || result.faceShape}</p>
                    </div>
                  </div>

                  {/* Right: Season + Face Shape stacked */}
                  <div className="flex flex-col gap-px bg-[#F5E3E8]">

                    {/* Season card */}
                    <div className={`bg-gradient-to-br ${SEASON_META[result.season]?.glow || "from-[#FFF0F5] to-white"} p-5 md:p-6 flex-1`}>
                      <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-3">ฤดูสีประจำตัว (Personal Color)</p>
                      <h3 className="text-2xl md:text-3xl font-[200] tracking-[0.04em] text-[#1A1A1A] leading-[1] uppercase mb-1">
                        {SEASON_LABELS_TH[result.season] || result.season || "—"}
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
                      <div className="grid grid-cols-[1fr_1.2fr] h-full gap-px bg-[#F5E3E8]">
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
                                  <p className="text-[7px] tracking-[0.35em] uppercase text-[#D23669] font-[300]">หญิง</p>
                                </div>
                                <div className="w-px self-stretch bg-[#F5E3E8]" />
                                <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[70px]">
                                  {male[shape] || male.Oval}
                                  <p className="text-[7px] tracking-[0.35em] uppercase text-[#4A7B9D] font-[300]">ชาย</p>
                                </div>
                              </div>
                            );
                          })()}
                          <p className="text-[7px] tracking-[0.4em] uppercase text-[#888] font-[300]">รูปแบบทรงหน้า</p>
                        </div>
                        {/* Face shape info */}
                        <div className="bg-white p-6 flex flex-col justify-center">
                          <h3 className="text-xl md:text-2xl font-[200] tracking-[0.03em] text-[#1A1A1A] leading-[1] uppercase mb-2">
                            {FACE_TYPE_LABELS_TH[result.faceShape] || result.faceShape || "—"}
                          </h3>
                          <p className="text-xs font-[300] text-[#555] leading-relaxed mb-4">{FACE_META[result.faceShape] || ""}</p>
                          {/* Key traits */}
                          {result.faceShape && (() => {
                            const traits = {
                              Oval:      ["สัดส่วนสมดุล", "แนวกรามนุ่มนวล", "แต่งได้หลายสไตล์"],
                              Round:     ["เส้นโค้งนุ่มนวล", "แก้มเต็ม", "ดูอ่อนเยาว์"],
                              Square:    ["กรามชัดเจน", "หน้าผากกว้าง", "โครงหน้าหนักแน่น"],
                              Heart:     ["หน้าผากกว้าง", "คางแหลม", "โหนกแก้มสูง"],
                              Diamond:   ["หน้าผากแคบ", "โหนกแก้มกว้าง", "คางแคบ"],
                              Rectangle: ["ใบหน้ายาว", "กรามชัดเจน", "ความกว้างเท่ากันตลอดแนว"],
                              Triangle:  ["ด้านบนแคบ", "กรามกว้าง", "ฐานหนักแน่น"],
                            };
                            return (traits[result.faceShape] || []).map((t) => (
                              <div key={t} className="flex items-center gap-2 mb-1.5">
                                <div className="w-1 h-1 rounded-full bg-[#D23669] flex-shrink-0" />
                                <p className="text-xs text-[#888] font-[300] tracking-[0.05em]">{t}</p>
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
                  <div className="flex items-end justify-between mb-8 border-t border-[#F5E3E8] pt-10">
                    <div>
                      <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-2">แนวทางการแต่งหน้า</p>
                      <h3 className="text-xl md:text-2xl font-[200] leading-[1] text-[#1A1A1A] uppercase">
                        วิเคราะห์<br /><span className="font-[700] italic">องค์ประกอบใบหน้า</span>
                      </h3>
                    </div>
                    <p className="text-xs font-[300] text-[#888] max-w-[200px] text-right leading-relaxed hidden md:block">
                      เทคนิคแต่งหน้าเฉพาะบุคคลตามองค์ประกอบใบหน้าของคุณ
                    </p>
                  </div>

                  {/* Feature cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#F5E3E8] rounded-2xl overflow-hidden border border-[#F5E3E8] shadow-[0_8px_30px_-10px_rgba(210,54,105,0.12)]">
                    {[
                      { label: "คิ้ว", value: SHAPE_RECS.brows[result.face?.brows], accent: "#C17A43" },
                      { label: "ดวงตา",  value: SHAPE_RECS.eyes[result.face?.eyes],   accent: "#4A7B9D" },
                      { label: "จมูก",  value: SHAPE_RECS.nose[result.face?.nose],   accent: "#7B6A4A" },
                      { label: "ริมฝีปาก",  value: SHAPE_RECS.lips[result.face?.lips],   accent: "#D23669" },
                    ].map((item) => (
                      <div key={item.label} className="bg-white p-5">
                        <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-2">{item.label}</p>
                        <p className="text-sm font-[500] text-[#1A1A1A] leading-snug">{item.value || "—"}</p>
                        {item.value && SHAPE_RECS_EXPLAIN[item.value] && (
                          <p className="text-xs text-[#888] font-[300] leading-snug mt-1.5">{SHAPE_RECS_EXPLAIN[item.value]}</p>
                        )}
                        <div className="mt-4 w-6 h-[2px]" style={{ background: item.accent }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Skin Undertone (AI) + สินค้าบลัชออนจริงจาก DB — พอร์ตจาก
                    detection_skin_for_cream(2).ipynb (classical CV: YCrCb skin-mask +
                    Lab/ITA undertone, ไม่ใช่ ML model) ตัวคำแนะนำสินค้าดึงจากฐานข้อมูล
                    products จริงตาม undertone ที่ตรวจได้ ไม่มีค่าตายตัว (hardcode) ── */}
                {result.blushProducts?.length > 0 && (
                  <div className="mt-10" data-aos="fade-up">
                    <div className="flex items-end justify-between mb-8 border-t border-[#F5E3E8] pt-10">
                      <div>
                        <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-2">AI วิเคราะห์สีผิว</p>
                        <h3 className="text-xl md:text-2xl font-[200] leading-[1] text-[#1A1A1A] uppercase">
                          บลัชออน<br /><span className="font-[700] italic">ที่เหมาะกับผิวคุณ</span>
                        </h3>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300]">Undertone ที่ตรวจพบ</p>
                        <p className="text-lg font-[600] text-[#D23669] uppercase">
                          {{ cool: "โทนเย็น", warm: "โทนอุ่น", neutral: "โทนกลาง", unknown: "ไม่ระบุ" }[result.skinUndertone] || result.skinUndertone}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-[#F5E3E8] rounded-2xl overflow-hidden border border-[#F5E3E8] shadow-[0_8px_30px_-10px_rgba(210,54,105,0.12)]">
                      {result.blushProducts.map((p) => (
                        <a
                          key={p.product_id}
                          href={p.shop_url || undefined}
                          target={p.shop_url ? "_blank" : undefined}
                          rel={p.shop_url ? "noreferrer" : undefined}
                          className={`group bg-white block ${p.shop_url ? "" : "pointer-events-none"}`}
                        >
                          <div className="relative aspect-square overflow-hidden bg-[#F7F4F2]">
                            <img
                              src={imgUrl(p.image_url)}
                              alt={p.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                              onError={(e) => { e.target.src = assetPath("assets/home2.webp"); }}
                            />
                            <div className="absolute top-2 left-2 bg-[#D23669] text-white text-[7px] font-[600] px-1.5 py-0.5 uppercase tracking-[0.1em]">
                              {p.suitable_for_color || result.skinUndertone}
                            </div>
                          </div>
                          <div className="p-2.5 border-t border-[#F5E3E8]">
                            <h3 className="text-[10px] font-[500] text-[#1A1A1A] leading-snug mb-1.5 line-clamp-1 uppercase tracking-[0.03em]">{p.name}</h3>
                            {p.shades && (
                              <p className="text-[9px] text-[#888] font-[300] mb-1.5 line-clamp-1">{p.shades}</p>
                            )}
                            <span className="text-xs font-[600] text-[#1A1A1A]">฿{p.price != null ? p.price.toLocaleString() : "—"}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                    <p className="mt-4 text-[10px] text-[#aaa] font-[300] tracking-[0.05em]">
                      คำนวณ undertone จากค่าความสว่างผิว (L* = {result.skinUndertoneLstar?.toFixed?.(1) ?? "—"}) และมุม ITA ({result.skinUndertoneIta?.toFixed?.(1) ?? "—"}°) ของบริเวณผิวในรูปภาพ แล้วดึงสินค้าที่ตรงกันจากคลังสินค้าจริง
                    </p>
                  </div>
                )}

                {/* AI Makeover — Gemini Beauty Portrait hidden (committee feedback:
                    output doesn't look natural yet). Product picks stay visible. */}
                {SHOW_GEMINI_MAKEOVER && (
                  <div className="border-t border-[#F5E3E8] pt-6 mt-6" data-aos="fade-up">
                    <div className="mb-6">
                      <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">AI Makeover</p>
                      <h3 className="text-xl md:text-2xl font-[200] leading-[1] text-[#1A1A1A] uppercase">
                        Gemini<br /><span className="font-[700] italic">Beauty Portrait</span>
                      </h3>
                    </div>
                    {geminiError && <p className="text-xs text-[#D23669] mb-4">{geminiError}</p>}

                    {/* 2-col balanced: Before/After  |  Product picks */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#F5E3E8] rounded-3xl overflow-hidden border border-[#F5E3E8] shadow-[0_10px_40px_-10px_rgba(210,54,105,0.12)]">

                      {/* Left: portrait panel — always same height as right */}
                      <div className="bg-white flex flex-col">
                        {geminiStatus === "done" && geminiImage ? (
                          <>
                            <div className="grid grid-cols-2 gap-px bg-[#F5E3E8] flex-1">
                              <div className="bg-white flex flex-col">
                                <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] p-3 pb-2">Before</p>
                                <img src={preview} alt="Original" className="w-full flex-1 object-cover object-top" />
                              </div>
                              <div className="bg-white flex flex-col">
                                <p className="text-[9px] tracking-[0.3em] uppercase text-[#D23669] font-[300] p-3 pb-2">After</p>
                                <img src={geminiImage} alt="AI Makeover" className="w-full flex-1 object-cover object-top" />
                              </div>
                            </div>
                            <div className="border-t border-[#F5E3E8] p-4 flex items-center justify-between">
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
                                <div className="w-16 h-16 border border-[#F5E3E8] flex items-center justify-center text-[#C0B8B4]">
                                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-[300] text-[#888] mb-4">Generate an AI beauty portrait<br />from your uploaded photo</p>
                                  <button onClick={runGeminiGeneration}
                                    className="rounded-xl bg-gradient-to-r from-[#D23669] to-[#C2255A] text-white px-8 py-3 text-[10px] font-[600] uppercase tracking-[0.3em] shadow-[0_8px_24px_-6px_rgba(210,54,105,0.5)] hover:shadow-[0_10px_28px_-4px_rgba(210,54,105,0.6)] transition-all duration-300">
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
                        <ProductPicksPanel />
                      </div>
                    </div>
                  </div>
                )}

                {/* Cosmetics for Your Aura — standalone, full-width, when Gemini portrait is hidden */}
                {!SHOW_GEMINI_MAKEOVER && (
                  <div className="border-t border-[#F5E3E8] pt-6 mt-6" data-aos="fade-up">
                    <div className="bg-white p-6">
                      <ProductPicksPanel />
                    </div>
                  </div>
                )}

                {/* Makeover Studio */}
                <div className="border-t border-[#F5E3E8] pt-6 mt-6" data-aos="fade-up">
                  <div className="mb-6">
                    <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">ลองแต่งหน้าเสมือนจริง</p>
                    <h3 className="text-xl md:text-2xl font-[200] leading-[1] text-[#1A1A1A] uppercase">
                      สตูดิโอ<br /><span className="font-[700] italic">แต่งหน้า</span>
                    </h3>
                  </div>

                  {/* Studio + product panel */}
                  <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-px bg-[#F5E3E8] rounded-3xl overflow-hidden border border-[#F5E3E8] shadow-[0_10px_40px_-10px_rgba(210,54,105,0.12)]">
                    <div className="bg-white p-2">
                      <MakeoverStudio
                        base={preview || assetPath("assets/analysis.JPG")}
                        onProductSelect={(products) => setSelectedStudioProducts(Array.isArray(products) ? products : (products ? [products] : []))}
                        personalColor={result?.season}
                        faceShape={result?.faceShape}
                      />
                    </div>
                    <div className="bg-white p-5 flex flex-col">
                      <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-4">
                        {selectedStudioProducts.length > 1 ? `เครื่องสำอาง ${selectedStudioProducts.length} รายการสำหรับลุคนี้` : "สินค้าที่เลือก"}
                      </p>
                      {selectedStudioProducts.length === 1 ? (
                        <SelectedProductCard product={selectedStudioProducts[0]} season={result?.season} />
                      ) : selectedStudioProducts.length > 1 ? (
                        <div className="flex flex-col gap-2">
                          {selectedStudioProducts.map((p, i) => (
                            <a
                              key={i}
                              href={p.shopUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 border border-[#F5E3E8] p-2 hover:border-[#1A1A1A] transition-colors"
                            >
                              <div className="w-12 h-12 overflow-hidden bg-[#F7F4F2] shrink-0">
                                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-[500] text-[#1A1A1A] truncate uppercase tracking-[0.02em]">{p.name}</p>
                                <p className="text-[10px] text-[#888] mt-0.5">฿{p.price}</p>
                              </div>
                            </a>
                          ))}
                          <p className="text-[9px] text-[#aaa] font-[300] mt-1">เหมาะสำหรับ {SEASON_LABELS_TH[result?.season] || result?.season}</p>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-10">
                          <div className="w-10 h-10 border border-[#F5E3E8] flex items-center justify-center text-[#C0B8B4]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h4"/></svg>
                          </div>
                          <p className="text-xs font-[300] text-[#888] leading-relaxed">
                            แตะเฉดสีในสตูดิโอ<br />เพื่อดูสินค้าตรงนี้
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── YOUR SELECTED PRODUCTS — everything picked across Looks/
                    Foundation/Lips/Eyes/Blush/Contour in the studio above,
                    gathered into one basket for this Look. ── */}
                <div className="border-t border-[#F5E3E8] pt-6 mt-6" data-aos="fade-up">
                  <div className="mb-6">
                    <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">ลุคการแต่งหน้าของคุณ</p>
                    <h3 className="text-xl md:text-2xl font-[200] leading-[1] text-[#1A1A1A] uppercase">
                      เครื่องสำอาง<br /><span className="font-[700] italic">ที่คุณเลือก</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-6">
                    {/* Left: product cards */}
                    <div className="rounded-3xl border border-[#F5E3E8] bg-white shadow-[0_10px_40px_-10px_rgba(210,54,105,0.1)] p-5 md:p-6">
                      {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center gap-3 py-16">
                          <div className="w-12 h-12 rounded-full border border-[#F5E3E8] flex items-center justify-center text-[#D8A9B8]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                          </div>
                          <p className="text-sm font-[500] text-[#1A1A1A]">ยังไม่มีเครื่องสำอางที่เลือก</p>
                          <p className="text-xs font-[300] text-[#888]">เลือกผลิตภัณฑ์เพื่อสร้างลุคของคุณ</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {cartItems.map((item) => (
                            <div key={item.key} className="rounded-2xl border border-[#F5E3E8] bg-white overflow-hidden flex flex-col">
                              <div className="relative aspect-square bg-[#F7F4F2]">
                                {item.isShapeOnly ? (
                                  <div className="w-full h-full flex items-center justify-center bg-[#FFF7F9]">
                                    <svg width="40" height="20" viewBox="0 0 64 24" fill="none"><path d="M6,17 Q24,9 32,10 Q44,11 58,16" stroke="#D23669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  </div>
                                ) : (
                                  <img
                                    src={item.img}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = assetPath("assets/home2.webp"); }}
                                  />
                                )}
                                <span className="absolute top-2 left-2 bg-white/90 text-[7px] font-[600] uppercase tracking-[0.15em] text-[#D23669] px-1.5 py-0.5 rounded-full">
                                  {CATEGORY_LABELS_TH[item.category] || item.category}
                                </span>
                                <button
                                  onClick={() => removeFromCart(item.key)}
                                  aria-label={`ลบ ${item.name}`}
                                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-[#888] hover:bg-[#D23669] hover:text-white transition-colors"
                                >
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                                </button>
                              </div>
                              <div className="p-3 flex flex-col gap-1.5 flex-1">
                                <p className="text-[10px] font-[500] text-[#1A1A1A] leading-snug line-clamp-2 uppercase tracking-[0.02em]">{item.name}</p>
                                {item.shadeColor && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full border border-[#F0DEE3] shrink-0" style={{ background: item.shadeColor }} />
                                    <span className="text-[9px] text-[#888] font-[300] truncate">{item.shadeName}</span>
                                  </div>
                                )}
                                {item.isShapeOnly ? (
                                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#B08B95] font-[600] mt-auto">ทรงที่เลือก</p>
                                ) : (
                                  <>
                                    <p className="text-xs font-[600] text-[#1A1A1A] mt-auto">฿{parseFloat(item.price || 0).toLocaleString()}</p>
                                    <div className="flex items-center rounded-full border border-[#F0DEE3] w-fit mt-1.5">
                                      <button onClick={() => changeCartQty(item.key, -1)} className="w-6 h-6 flex items-center justify-center text-[#888] hover:text-[#D23669] transition-colors">−</button>
                                      <span className="w-5 text-center text-[10px] font-[600] text-[#1A1A1A]">{item.qty}</span>
                                      <button onClick={() => changeCartQty(item.key, 1)} className="w-6 h-6 flex items-center justify-center text-[#888] hover:text-[#D23669] transition-colors">+</button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: order summary */}
                    <div className="rounded-3xl border border-[#F5E3E8] bg-[#FFFAFB] shadow-[0_10px_40px_-10px_rgba(210,54,105,0.1)] p-5 md:p-6 flex flex-col">
                      <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-4">สรุปรายการ</p>
                      <div className="flex items-center justify-between text-xs text-[#555] font-[300] mb-2">
                        <span>จำนวนสินค้า</span>
                        <span>{cartCount} ชิ้น</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#555] font-[300] mb-4 pb-4 border-b border-[#F5E3E8]">
                        <span>ยอดรวมสินค้า</span>
                        <span>฿{cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A] font-[600]">ยอดรวม</span>
                        <span className="text-xl font-[600] text-[#D23669]">฿{cartTotal.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={buyAllInCart}
                        disabled={cartItems.length === 0}
                        className="w-full rounded-xl bg-gradient-to-r from-[#D23669] to-[#C2255A] text-white py-3 text-[10px] font-[600] uppercase tracking-[0.25em] shadow-[0_8px_24px_-6px_rgba(210,54,105,0.5)] hover:shadow-[0_10px_28px_-4px_rgba(210,54,105,0.6)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                      >
                        ซื้อทั้งหมด
                      </button>
                      <p className="text-[9px] text-[#aaa] font-[300] mt-3 text-center leading-relaxed">
                        ระบบจะเปิดลิงก์ร้านค้าของสินค้าแต่ละชิ้น เพื่อชำระเงินที่หน้าร้านค้าปลายทาง
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hairstyles */}
                {SHOW_HAIRSTYLES && (
                <div className="border-t border-[#F5E3E8] pt-6 mt-6" data-aos="fade-up">
                  <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                    <div>
                      <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">Hair Recommendations</p>
                      <h3 className="text-xl md:text-2xl font-[200] leading-[1] text-[#1A1A1A] uppercase">
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
                        <div className="p-4 border-t border-[#F5E3E8]">
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
                              <div className="flex-1 h-px bg-[#F5E3E8]" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-[#F5E3E8] rounded-2xl overflow-hidden border border-[#F5E3E8] shadow-[0_8px_30px_-10px_rgba(210,54,105,0.12)]">
                              {shortMed.map((s) => <HairCard key={s.key} s={s} />)}
                            </div>
                          </div>
                        )}
                        {longStyles.length > 0 && (
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <p className="text-[9px] tracking-[0.4em] uppercase text-[#1A1A1A] font-[500]">Long</p>
                              <div className="flex-1 h-px bg-[#F5E3E8]" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-[#F5E3E8] rounded-2xl overflow-hidden border border-[#F5E3E8] shadow-[0_8px_30px_-10px_rgba(210,54,105,0.12)]">
                              {longStyles.map((s) => <HairCard key={s.key} s={s} />)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                )}

                {/* YouTube Tutorials */}
                <div className="border-t border-[#F5E3E8] pt-6 mt-6">
                  <YouTubeReels result={result} />
                </div>

                {/* Saving indicator */}
                {saving && (
                  <div className="border-t border-[#F5E3E8] pt-6 mt-6">
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#888] font-[300]">กำลังบันทึก...</span>
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
                        {status === "uploading" ? "กำลังอัปโหลดรูปภาพ..." : "AI กำลังวิเคราะห์โครงหน้าและสีประจำตัว..."}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#F5E3E8] rounded-2xl overflow-hidden border border-[#F5E3E8] shadow-[0_8px_30px_-10px_rgba(210,54,105,0.12)]">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white p-8 space-y-4">
                          <div className="h-2.5 w-20 animate-pulse bg-[#F5E3E8] rounded" />
                          <div className="h-12 w-36 animate-pulse bg-[#F5E3E8] rounded" />
                          <div className="h-2.5 w-40 animate-pulse bg-[#F5E3E8] rounded" />
                          <div className="flex gap-2">{[1,2,3,4].map((j) => <div key={j} className="w-8 h-8 animate-pulse bg-[#F5E3E8]" />)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-[300] text-[#888]">อัปโหลดรูปภาพในขั้นตอนที่ 1 แล้วผลลัพธ์จะแสดงที่นี่โดยอัตโนมัติ</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── PREV / NEXT ── */}
        <div className="mt-16 flex items-center justify-between border-t border-[#F5E3E8] pt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="rounded-xl border border-[#F0DEE3] text-[#8A7A80] px-6 py-2.5 text-[10px] font-[500] uppercase tracking-[0.2em] disabled:opacity-30 hover:border-[#D23669] hover:text-[#D23669] transition-all"
          >
            ย้อนกลับ
          </button>
          <button
            onClick={nextStep}
            disabled={!canGoNext || currentStep === 2}
            className="rounded-xl bg-gradient-to-r from-[#D23669] to-[#C2255A] text-white px-8 py-2.5 text-[10px] font-[600] uppercase tracking-[0.25em] disabled:opacity-30 shadow-[0_8px_24px_-6px_rgba(210,54,105,0.5)] hover:shadow-[0_10px_28px_-4px_rgba(210,54,105,0.6)] transition-all"
          >
            ถัดไป
          </button>
        </div>

        <p className="mt-8 text-center text-[9px] tracking-[0.2em] text-[#aaa] font-[300]">
          *คำแนะนำนี้เป็นเพียงแนวทางด้านความงามทั่วไป ไม่ใช่การวินิจฉัยทางการแพทย์
        </p>
      </main>

      {/* Sticky bar (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#F5E3E8] bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-1">
          <button
            onClick={() => inputRef.current?.click()}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#D23669] to-[#C2255A] text-white py-3 text-[10px] font-[600] uppercase tracking-[0.2em] shadow-[0_8px_24px_-6px_rgba(210,54,105,0.5)] hover:shadow-[0_10px_28px_-4px_rgba(210,54,105,0.6)] transition-all"
          >
            อัปโหลดรูปภาพ
          </button>
          <button
            onClick={analyzeImage}
            className="flex-1 rounded-xl border border-[#F0DEE3] text-[#1A1A1A] py-3 text-[10px] font-[600] uppercase tracking-[0.2em] hover:border-[#D23669] hover:text-[#D23669] transition-all"
          >
            วิเคราะห์
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

