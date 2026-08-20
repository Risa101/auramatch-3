// src/components/MakeoverStudio.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./MakeoverStudio.css";

import { imgUrl } from "../utils/imgUrl.js";
import { detectFaceLandmarksMP } from "../utils/faceLandmarkerMP";
import { MakeupRenderer } from "../utils/makeupRenderer";
import { contourPlacements, noseContourPlacements } from "../utils/makeupGeometry";
import { applyFoundationTint } from "../utils/foundationTint";
const assetPath = (p) => imgUrl(`/${String(p).replace(/^\/+/, "")}`);

/* ---------- DATA ---------- */
const BROWS = [
    { key: "none", name: "ไม่เลือก", img: "" },
    { key: "soft", name: "คิ้วโค้งอ่อน", img: assetPath("overlays/hair/brow-soft.jpg") },
    { key: "straight", name: "Straight", img: assetPath("overlays/hair/brow-straight.jpg") },
    { key: "arch", name: "คิ้วโก่งสูง", img: assetPath("overlays/hair/brow-arch.jpg") },
    { key: "thin", name: "Thin", img: assetPath("overlays/hair/thin.jpg") },
    { key: "curve", name: "Curve", img: assetPath("overlays/hair/curve.jpg") },
];

const SEASON_LIST = ["Spring", "Summer", "Autumn", "Winter"];
// Thai display labels — SEASON_LIST itself stays English since its values are
// used as identifiers (BY_SEASON dict keys, normalizeSeason, matching against
// the `personalColor` prop from the analysis result), not just display text.
const SEASON_LABELS_TH = { Spring: "ฤดูใบไม้ผลิ", Summer: "ฤดูร้อน", Autumn: "ฤดูใบไม้ร่วง", Winter: "ฤดูหนาว" };
const NONE_SHADE = { key: "none", name: "ไม่เลือก", color: null };
function normalizeSeason(s) {
    if (!s) return null;
    return SEASON_LIST.find((x) => x.toLowerCase() === String(s).toLowerCase()) || null;
}

// Eyeshadow is rendered live on the user's own photo too (same engine as
// Lips — real color on the real eyelid, not a swap to someone else's eye photo).
// Personal-color palette: 6 shades per season, matched to that season's
// undertone (warm/cool) and depth — see project brief for the source list.
const EYES_BY_SEASON = {
    Spring: [
        { key: "spring-champagne", name: "แชมเปญ", color: "#E9D6B0" },
        { key: "spring-light-gold", name: "ทองอ่อน", color: "#DCB975" },
        { key: "spring-peach", name: "พีช", color: "#EFC0A0" },
        { key: "spring-warm-beige", name: "เบจโทนอุ่น", color: "#D8B593" },
        { key: "spring-light-brown", name: "น้ำตาลอ่อน", color: "#B98860" },
        { key: "spring-soft-coral", name: "คอรัลอ่อน", color: "#E9A489" },
    ],
    Summer: [
        { key: "summer-cool-beige", name: "เบจโทนเย็น", color: "#CBBBAE" },
        { key: "summer-taupe", name: "เทาอมน้ำตาล", color: "#A99C93" },
        { key: "summer-soft-gray", name: "เทาอ่อน", color: "#B4AFAE" },
        { key: "summer-rose-brown", name: "น้ำตาลกุหลาบ", color: "#A9807E" },
        { key: "summer-mauve", name: "ม่วงอมชมพู", color: "#9E7C87" },
        { key: "summer-lavender", name: "ลาเวนเดอร์", color: "#B6A6C4" },
    ],
    Autumn: [
        { key: "autumn-warm-brown", name: "น้ำตาลโทนอุ่น", color: "#7A5335" },
        { key: "autumn-bronze", name: "บรอนซ์", color: "#8C5A2B" },
        { key: "autumn-copper", name: "ทองแดง", color: "#A15A2C" },
        { key: "autumn-olive", name: "เขียวมะกอก", color: "#6B6538" },
        { key: "autumn-camel", name: "น้ำตาลคาเมล", color: "#B08858" },
        { key: "autumn-chocolate-brown", name: "น้ำตาลช็อกโกแลต", color: "#4A3222" },
    ],
    Winter: [
        { key: "winter-black", name: "ดำ", color: "#1C1B1E" },
        { key: "winter-charcoal", name: "เทาถ่าน", color: "#3B3A3F" },
        { key: "winter-cool-brown", name: "น้ำตาลโทนเย็น", color: "#5A4438" },
        { key: "winter-silver", name: "เงิน", color: "#A8A8AC" },
        { key: "winter-deep-plum", name: "พลัมเข้ม", color: "#4A2440" },
        { key: "winter-navy", name: "น้ำเงินกรมท่า", color: "#232C4A" },
    ],
};

const HAIRSTYLES = [
    { key: "none", name: "ไม่เลือก", img: "" },
    { key: "long", name: "Long Layer", img: assetPath("overlays/hair/hair-long.png") },
    { key: "bob", name: "Bob Cut", img: assetPath("overlays/hair/hair-bob.png") },
    { key: "bangs", name: "Airy Bangs", img: assetPath("overlays/hair/hair-bangs.png") },
];

// Lips are rendered live on the user's own photo (see MakeupRenderer) — real
// color tint on the real mouth, not a swap to someone else's lip photo.
const LIPS_BY_SEASON = {
    Spring: [
        { key: "spring-peach", name: "พีช", color: "#F4A98C" },
        { key: "spring-coral", name: "คอรัล", color: "#F2795C" },
        { key: "spring-warm-pink", name: "ชมพูโทนอุ่น", color: "#F08C9B" },
        { key: "spring-apricot", name: "แอปริคอต", color: "#F2A46E" },
        { key: "spring-salmon", name: "แซลมอน", color: "#F58C7A" },
        { key: "spring-warm-red", name: "แดงโทนอุ่น", color: "#E2503A" },
    ],
    Summer: [
        { key: "summer-rose-pink", name: "ชมพูกุหลาบ", color: "#D98CA0" },
        { key: "summer-dusty-pink", name: "ชมพูหม่น", color: "#C98F94" },
        { key: "summer-mauve", name: "ม่วงอมชมพู", color: "#B07C8C" },
        { key: "summer-soft-berry", name: "เบอร์รี่อ่อน", color: "#A9647A" },
        { key: "summer-cool-pink", name: "ชมพูโทนเย็น", color: "#D97A93" },
        { key: "summer-rose", name: "กุหลาบ", color: "#C06A80" },
    ],
    Autumn: [
        { key: "autumn-terracotta", name: "เทอร์ราคอตตา", color: "#B85C45" },
        { key: "autumn-brick-red", name: "แดงอิฐ", color: "#9C3F32" },
        { key: "autumn-burnt-orange", name: "ส้มไหม้", color: "#C05A2C" },
        { key: "autumn-brown-red", name: "แดงน้ำตาล", color: "#8A3B2E" },
        { key: "autumn-warm-nude", name: "นู้ดโทนอุ่น", color: "#B57156" },
        { key: "autumn-cinnamon", name: "อบเชย", color: "#A05A3A" },
    ],
    Winter: [
        { key: "winter-true-red", name: "แดงสด", color: "#C21E2F" },
        { key: "winter-berry", name: "เบอร์รี่", color: "#8E2846" },
        { key: "winter-burgundy", name: "เบอร์กันดี", color: "#6E1F31" },
        { key: "winter-wine", name: "ไวน์", color: "#5C1A2C" },
        { key: "winter-plum", name: "พลัม", color: "#6B2C50" },
        { key: "winter-cool-red", name: "แดงโทนเย็น", color: "#B01F35" },
    ],
};

const HAIR_COLORS = [
    { key: "none", name: "ไม่เลือก", filter: "none" },
    { key: "brown", name: "Brown", filter: "brightness(0.95) sepia(0.25) saturate(1.2)" },
    { key: "blonde", name: "Blonde", filter: "brightness(1.2) sepia(0.35) saturate(1.5)" },
    { key: "black", name: "ดำ", filter: "brightness(0.7) saturate(0.8)" },
];

// Blush is rendered live too — same engine, same cheek-landmark placement
// auramatchgenz already ships and tests (blushPlacements in makeupGeometry.js).
const BLUSH_BY_SEASON = {
    Spring: [
        { key: "spring-peach", name: "พีช", color: "#F4A98C" },
        { key: "spring-apricot", name: "แอปริคอต", color: "#F2A46E" },
        { key: "spring-coral", name: "คอรัล", color: "#F2795C" },
        { key: "spring-warm-pink", name: "ชมพูโทนอุ่น", color: "#F08C9B" },
    ],
    Summer: [
        { key: "summer-cool-pink", name: "ชมพูโทนเย็น", color: "#D97A93" },
        { key: "summer-rose", name: "กุหลาบ", color: "#C06A80" },
        { key: "summer-dusty-rose", name: "กุหลาบหม่น", color: "#B87E88" },
        { key: "summer-soft-mauve", name: "ม่วงอมชมพูอ่อน", color: "#AD8590" },
    ],
    Autumn: [
        { key: "autumn-terracotta", name: "เทอร์ราคอตตา", color: "#B85C45" },
        { key: "autumn-burnt-peach", name: "พีชโทนไหม้", color: "#C67A54" },
        { key: "autumn-warm-brown", name: "น้ำตาลโทนอุ่น", color: "#8C5A3C" },
        { key: "autumn-cinnamon", name: "อบเชย", color: "#A05A3A" },
        { key: "autumn-coral-brown", name: "น้ำตาลคอรัล", color: "#B06848" },
    ],
    Winter: [
        { key: "winter-cool-pink", name: "ชมพูโทนเย็น", color: "#D8637E" },
        { key: "winter-raspberry", name: "ราสป์เบอร์รี่", color: "#A32448" },
        { key: "winter-berry", name: "เบอร์รี่", color: "#8E2846" },
        { key: "winter-rose", name: "กุหลาบ", color: "#B84A66" },
        { key: "winter-plum-pink", name: "Plum Pink", color: "#8C3F63" },
    ],
};

// Brow color — same personal-color palette pattern as Lips/Eyes/Blush above,
// but shades stay in the brown/black family (brow pencil/pomade shades),
// not the season's full color range.
const BROW_COLOR_BY_SEASON = {
    Spring: [
        { key: "spring-light-brown", name: "น้ำตาลอ่อน", color: "#A9784C" },
        { key: "spring-warm-brown", name: "น้ำตาลโทนอุ่น", color: "#8B5A2E" },
        { key: "spring-honey-brown", name: "น้ำตาลน้ำผึ้ง", color: "#A6743A" },
        { key: "spring-golden-brown", name: "น้ำตาลทอง", color: "#96652E" },
        { key: "spring-soft-caramel", name: "คาราเมลอ่อน", color: "#B98750" },
    ],
    Summer: [
        { key: "summer-ash-brown", name: "น้ำตาลแอช", color: "#7D6A5D" },
        { key: "summer-soft-taupe", name: "เทาอมน้ำตาลอ่อน", color: "#8C7A6E" },
        { key: "summer-cool-brown", name: "น้ำตาลโทนเย็น", color: "#6E5B4F" },
        { key: "summer-light-ash-brown", name: "น้ำตาลแอชอ่อน", color: "#9C8B7E" },
        { key: "summer-soft-gray-brown", name: "น้ำตาลเทาอ่อน", color: "#7A6B60" },
    ],
    Autumn: [
        { key: "autumn-medium-brown", name: "น้ำตาลกลาง", color: "#6B4A30" },
        { key: "autumn-warm-brown", name: "น้ำตาลโทนอุ่น", color: "#5E3E26" },
        { key: "autumn-chestnut", name: "น้ำตาลเกาลัด", color: "#5A3824" },
        { key: "autumn-dark-brown", name: "น้ำตาลเข้ม", color: "#4A2E1C" },
        { key: "autumn-chocolate-brown", name: "น้ำตาลช็อกโกแลต", color: "#3E2818" },
    ],
    Winter: [
        { key: "winter-dark-ash-brown", name: "น้ำตาลแอชเข้ม", color: "#3A2E28" },
        { key: "winter-espresso", name: "น้ำตาลเอสเพรสโซ", color: "#2E2019" },
        { key: "winter-cool-dark-brown", name: "น้ำตาลเข้มโทนเย็น", color: "#33241C" },
        { key: "winter-deep-brown", name: "น้ำตาลเข้มลึก", color: "#291C15" },
        { key: "winter-soft-black", name: "ดำนุ่ม", color: "#211815" },
    ],
};

// Brow SHAPE is a style pick, not a color — six illustrated presets. Icons are
// small inline SVG "brow line" sketches (no photo assets exist for this).
const BROW_SHAPES = [
    { key: "straight", name: "คิ้วตรง", style: "ให้ลุคเป็นธรรมชาติและดูอ่อนเยาว์", path: "M6,15 Q32,13 58,15" },
    { key: "soft-arch", name: "คิ้วโค้งอ่อน", style: "ให้ลุคหวานและดูสง่างาม", path: "M6,17 Q24,9 32,10 Q44,11 58,16" },
    { key: "high-arch", name: "คิ้วโก่งสูง", style: "ให้ลุคคมและโดดเด่น", path: "M6,18 Q20,8 30,7 Q40,9 58,17" },
    { key: "rounded", name: "คิ้วโค้งมน", style: "ให้ลุคนุ่มนวลและอ่อนหวาน", path: "M6,16 Q32,5 58,16" },
    { key: "natural", name: "คิ้วธรรมชาติ", style: "ให้ลุคเป็นธรรมชาติและเข้ากับใบหน้า", path: "M6,16 Q28,11 40,11 Q50,12 58,15" },
    { key: "angled", name: "คิ้วทรงมีมุม", style: "ให้ลุคชัดเจนและดูมั่นใจ", path: "M6,16 L28,10 L58,14" },
];
const NONE_BROW_SHAPE = { key: "none", name: "ไม่เลือก" };

// Which shapes suit each Personal Color season / detected face shape — union
// of the two (when a face shape result is available) drives the "Recommended" badge.
const RECOMMENDED_SHAPES_BY_SEASON = {
    Spring: ["straight", "soft-arch", "natural"],
    Summer: ["soft-arch", "rounded", "natural"],
    Autumn: ["natural", "soft-arch", "angled"],
    Winter: ["high-arch", "angled", "straight"],
};
const RECOMMENDED_SHAPES_BY_FACE = {
    Oval: ["soft-arch", "natural"],
    Round: ["high-arch", "angled"],
    Square: ["soft-arch", "rounded"],
    Heart: ["soft-arch", "rounded"],
    Long: ["straight", "soft-arch"],
    Rectangle: ["straight", "soft-arch"],
    Diamond: ["rounded", "soft-arch"],
};
function BrowShapeIcon({ path, active }) {
    return (
        <svg viewBox="0 0 64 24" width="52" height="20" fill="none">
            <path d={path} stroke={active ? "#D23669" : "#3A3437"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Contour is a plain 2D-canvas shadow overlay, NOT the WebGL shader (kept
// isolated so it can't break the already-verified Lips/Eyes/Blush layers).
// A shading tone, not a color choice — options are intensity presets, not
// shades. See makeupGeometry.js::contourPlacements for the geometry notes.
const CONTOUR_COLOR = "#7A5245";
const CONTOUR = [
    { key: "none", name: "ไม่เลือก", color: null, intensity: 0 },
    { key: "soft", name: "นุ่มนวล", color: CONTOUR_COLOR, intensity: 0.18 },
    { key: "defined", name: "ชัดเจน", color: CONTOUR_COLOR, intensity: 0.32 },
];

// Foundation is a BASE layer, not an overlay — baked into the photo texture
// before lips/eyes/blush/contour render on top (see foundationTint.js).
const FOUNDATION = [
    { key: "none", name: "ไม่เลือก", color: null, intensity: 0 },
    { key: "light", name: "อ่อน", color: "#E8C4A0", intensity: 0.16 },
    { key: "natural", name: "ธรรมชาติ", color: "#D4A574", intensity: 0.16 },
    { key: "tan", name: "แทน", color: "#B8825A", intensity: 0.16 },
];

// Brows / Hairstyle / HairColor stay hidden for now — they still use the old
// "swap to an unrelated stock photo" overlay, which we haven't ported to the
// real landmark-based engine yet. Lips/Eyes/Blush are ported from
// auramatchgenz's tested code; Contour/Foundation are new (unported,
// less-verified) additions built on genz's anchor points.
const TABS = ["Looks", "Foundation", "Lips", "Eyes", "Blush", "Brows", "Contour"];
// Thai display labels for the tab bar — TABS itself stays English since its
// values are used as identifiers throughout (tab === "Lips", the `layer`
// lookup keys, etc.), not just display text.
const TAB_LABELS = { Looks: "ลุค", Foundation: "รองพื้น", Lips: "ลิป", Eyes: "ดวงตา", Blush: "บลัชออน", Brows: "คิ้ว", Contour: "คอนทัวร์" };

// Full-face preset looks (Meitu-style "apply everything at once") — Lips/Eyes/
// Blush are picked by INDEX into the active season's palette (not a fixed key),
// since those three are now season-specific — the same "Natural Glow" preset
// resolves to different actual shades depending on the user's personal color.
// Indices are kept within the smallest per-season list length (Blush has 4-5
// shades depending on season) so every preset resolves in every season.
const LOOKS = [
    { key: "natural-glow", name: "เนเชอรัลโกลว์", foundation: "light", lipsIdx: 0, eyesIdx: 0, blushIdx: 0, contour: "none" },
    { key: "soft-romantic", name: "ซอฟต์โรแมนติก", foundation: "natural", lipsIdx: 2, eyesIdx: 1, blushIdx: 1, contour: "soft" },
    { key: "bold-glam", name: "โบลด์แกลม", foundation: "tan", lipsIdx: 5, eyesIdx: 5, blushIdx: 2, contour: "defined" },
    { key: "sunkissed", name: "ซันคิสท์", foundation: "tan", lipsIdx: 4, eyesIdx: 4, blushIdx: 3, contour: "soft" },
];

/* ---------- MAIN ---------- */
export default function MakeoverStudio({ base = assetPath("assets/analysis.JPG"), onProductSelect, onSave, personalColor, faceShape }) {
    const [tab, setTab] = useState("Looks");
    const [brow, setBrow] = useState(BROWS[0]);
    const [browColor, setBrowColor] = useState(NONE_SHADE);
    const [browShape, setBrowShape] = useState(NONE_BROW_SHAPE);
    const [eye, setEye] = useState(NONE_SHADE);
    const [blush, setBlush] = useState(NONE_SHADE);
    const [contour, setContour] = useState(CONTOUR[0]);
    const [foundation, setFoundation] = useState(FOUNDATION[0]);
    const [hair, setHair] = useState(HAIRSTYLES[0]);
    const [lips, setLips] = useState(NONE_SHADE);
    const [hairColor, setHairColor] = useState(HAIR_COLORS[0]);
    const [savedMsg, setSavedMsg] = useState(false);

    // ── Personal Color (Spring/Summer/Autumn/Winter) — drives which Lips/Eyes/
    // Blush shades are offered. Auto-set from the analysis result when present;
    // falls back to a manual picker (defaulting to Spring) when it isn't.
    const hasPersonalColor = !!normalizeSeason(personalColor);
    const [activeSeason, setActiveSeason] = useState(() => normalizeSeason(personalColor) || "Spring");
    useEffect(() => {
        const normalized = normalizeSeason(personalColor);
        if (normalized) setActiveSeason(normalized);
    }, [personalColor]);
    const activeLips = useMemo(
        () => (LIPS_BY_SEASON[activeSeason] || []).map((s) => ({ ...s, season: activeSeason })),
        [activeSeason]
    );
    const activeEyes = useMemo(
        () => (EYES_BY_SEASON[activeSeason] || []).map((s) => ({ ...s, season: activeSeason })),
        [activeSeason]
    );
    const activeBlush = useMemo(
        () => (BLUSH_BY_SEASON[activeSeason] || []).map((s) => ({ ...s, season: activeSeason })),
        [activeSeason]
    );
    const activeBrowColors = useMemo(
        () => (BROW_COLOR_BY_SEASON[activeSeason] || []).map((s) => ({ ...s, season: activeSeason })),
        [activeSeason]
    );
    // Recommended brow SHAPES — union of season-based and face-shape-based
    // suggestions (face shape only contributes when a real analysis result
    // has one). Shape itself isn't reset on season change (unlike color) —
    // "Natural Brow" is still a valid pick regardless of season.
    const recommendedShapeKeys = useMemo(() => {
        const seasonRecs = RECOMMENDED_SHAPES_BY_SEASON[activeSeason] || [];
        const faceRecs = RECOMMENDED_SHAPES_BY_FACE[faceShape] || [];
        return new Set([...seasonRecs, ...faceRecs]);
    }, [activeSeason, faceShape]);
    // Season changed (manually or from a fresh analysis result) — clear any
    // Lips/Eyes/Blush/Brow-color pick from the previous season so a stale
    // cross-season shade never stays "selected" (Foundation/Contour/Brow-shape
    // aren't season-specific).
    useEffect(() => {
        setLips(NONE_SHADE);
        setEye(NONE_SHADE);
        setBlush(NONE_SHADE);
        setBrowColor(NONE_SHADE);
        emitSelectedProducts(buildFullSelection({ lips: NONE_SHADE, eye: NONE_SHADE, blush: NONE_SHADE, browColor: NONE_SHADE }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSeason]);

    // ── Live lip-tint rendering (ported from auramatchgenz's makeup studio) ──
    // MediaPipe landmarks + a WebGL shader that recolors while preserving the
    // photo's own shading, instead of layering a different person's lip photo.
    const canvasRef = useRef(null);
    const rendererRef = useRef(null);
    const imageRef = useRef(null);
    const landmarksRef = useRef(null);
    const [studioStatus, setStudioStatus] = useState("loading"); // loading | ready | no_face | error
    const [glOk, setGlOk] = useState(true);

    // Load the base photo + detect landmarks whenever it changes.
    useEffect(() => {
        let cancelled = false;
        setStudioStatus("loading");
        rendererRef.current?.dispose?.();
        rendererRef.current = null;
        const img = new window.Image();
        img.onload = () => {
            if (cancelled) return;
            imageRef.current = img;
            detectFaceLandmarksMP(img)
                .then((lm) => {
                    if (cancelled) return;
                    landmarksRef.current = lm;
                    setStudioStatus(lm ? "ready" : "no_face");
                })
                .catch(() => {
                    if (!cancelled) setStudioStatus("error");
                });
        };
        img.onerror = () => {
            if (!cancelled) setStudioStatus("error");
        };
        img.src = base;
        return () => {
            cancelled = true;
        };
    }, [base]);

    // Build (or rebuild) the WebGL scene — runs on first ready AND whenever
    // foundation changes, since foundation is baked into the photo texture
    // itself (the base layer), not a render-time overlay like the others.
    useEffect(() => {
        if (studioStatus !== "ready") return;
        const canvas = canvasRef.current;
        const img = imageRef.current;
        const landmarks = landmarksRef.current;
        if (!canvas || !img || !landmarks) return;

        try {
            if (!rendererRef.current) rendererRef.current = new MakeupRenderer(canvas);
            const source = applyFoundationTint(img, landmarks, foundation.color, foundation.intensity);
            rendererRef.current.setScene(source, landmarks);
            canvas.width = rendererRef.current.photoW;
            canvas.height = rendererRef.current.photoH;
            setGlOk(true);
        } catch (err) {
            console.error("[MakeoverStudio] WebGL init/scene failed:", err);
            setGlOk(false);
        }
    }, [studioStatus, foundation]);

    // Redraw whenever a render-time shade changes (cheap — reuses the already-uploaded scene).
    useEffect(() => {
        if (!rendererRef.current || !glOk) return;
        rendererRef.current.render({
            lips: { enabled: !!lips.color, color: lips.color || "#000000", intensity: lips.color ? 0.55 : 0 },
            blush: { enabled: !!blush.color, color: blush.color || "#000000", intensity: blush.color ? 0.35 : 0 },
            eyeshadow: { enabled: !!eye.color, color: eye.color || "#000000", intensity: eye.color ? 0.5 : 0 },
        });
    }, [lips, eye, blush, foundation, glOk]);

    // ── Contour: separate 2D overlay canvas, deliberately NOT touching the
    // WebGL shader above (new/unverified geometry — see makeupGeometry.js).
    // A soft radial shadow (multiply blend) below the cheekbone, same
    // gradient technique genz already uses for blush, just placed lower.
    const contourCanvasRef = useRef(null);
    useEffect(() => {
        const canvas = contourCanvasRef.current;
        const img = imageRef.current;
        const landmarks = landmarksRef.current;
        if (!canvas || studioStatus !== "ready" || !img || !landmarks) return;

        const w = img.naturalWidth;
        const h = img.naturalHeight;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, w, h);
        if (!contour.intensity) return;

        ctx.globalCompositeOperation = "multiply";
        // Nose strips run softer than the cheek hollow — subtler placement, less room for error.
        const zones = [
            ...contourPlacements(landmarks, w, h).map((c) => ({ ...c, alpha: contour.intensity })),
            ...noseContourPlacements(landmarks, w, h).map((c) => ({ ...c, alpha: contour.intensity * 0.7 })),
        ];
        for (const c of zones) {
            const grad = ctx.createRadialGradient(c.center.x, c.center.y, 0, c.center.x, c.center.y, c.radius);
            grad.addColorStop(0, `${contour.color}${Math.round(c.alpha * 255).toString(16).padStart(2, "0")}`);
            grad.addColorStop(1, `${contour.color}00`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(c.center.x, c.center.y, c.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }, [studioStatus, contour]);

    useEffect(() => () => rendererRef.current?.dispose?.(), []);

    const showLiveCanvas = studioStatus === "ready" && glOk;

    // Always an array — a single swatch pick emits a 1-item array, a full Look emits all of them.
    const emitSelectedProducts = (products) => {
        if (!onProductSelect) return;
        onProductSelect(products);
    };

    const BROW_PRODUCTS = {
        soft: { name: "Soft Arch Brow Pencil", price: "259", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=soft%20arch%20brow%20pencil" },
        straight: { name: "Straight Brow Definer", price: "239", img: assetPath("product/brush2.jpg"), shopUrl: "https://shopee.co.th/search?keyword=straight%20brow%20definer" },
        arch: { name: "High Arch Brow Kit", price: "289", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=high%20arch%20brow%20kit" },
        thin: { name: "Slim Brow Liner", price: "199", img: assetPath("product/brush2.jpg"), shopUrl: "https://shopee.co.th/search?keyword=slim%20brow%20liner" },
        curve: { name: "Curve Brow Sculpt", price: "279", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=curve%20brow%20sculpt" },
    };
    // Lips/Eyes/Blush now carry 4-6 shades per season instead of a handful of
    // fixed options — generate their product entries from the palette data
    // instead of hand-writing ~50 near-identical objects.
    const buildSeasonProductMap = (bySeasonShades, { imgs, priceBase, keyword }) => {
        const map = {};
        Object.values(bySeasonShades).forEach((shades) => {
            shades.forEach((s, i) => {
                const name = `${s.name} ${keyword}`;
                map[s.key] = {
                    name,
                    price: String(priceBase + (i % 3) * 20),
                    img: assetPath(`product/${imgs[i % imgs.length]}`),
                    shopUrl: `https://shopee.co.th/search?keyword=${encodeURIComponent(name)}`,
                };
            });
        });
        return map;
    };
    const EYE_PRODUCTS = buildSeasonProductMap(EYES_BY_SEASON, { imgs: ["contour.png"], priceBase: 329, keyword: "อายแชโดว์" });
    const LIP_PRODUCTS = buildSeasonProductMap(LIPS_BY_SEASON, { imgs: ["lip.png", "lipoil.png"], priceBase: 229, keyword: "ลิปทินท์" });
    const BLUSH_PRODUCTS = buildSeasonProductMap(BLUSH_BY_SEASON, { imgs: ["brush1.jpg", "brush2.jpg"], priceBase: 279, keyword: "บลัชออน" });
    const BROW_COLOR_PRODUCTS = buildSeasonProductMap(BROW_COLOR_BY_SEASON, { imgs: ["brush1.jpg", "brush2.jpg"], priceBase: 259, keyword: "ดินสอเขียนคิ้ว" });
    const CONTOUR_PRODUCTS = {
        soft: { name: "แท่งคอนทัวร์นุ่มนวล", price: "299", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=contour%20stick" },
        defined: { name: "พาเลตคอนทัวร์คมชัด", price: "349", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=contour%20palette" },
    };
    const FOUNDATION_PRODUCTS = {
        light: { name: "รองพื้นสีอ่อน", price: "459", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=light%20foundation" },
        natural: { name: "รองพื้นโทนธรรมชาติ", price: "459", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=natural%20foundation" },
        tan: { name: "รองพื้นสีแทน", price: "459", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=tan%20foundation" },
    };

    // Builds the FULL cross-category selection (Foundation+Lips+Eyes+Blush+Contour)
    // from current state, with `overrides` applied for the layer that just changed
    // (state setters are async, so the just-picked value isn't in state yet).
    // Each product is tagged with category + shade info so the cart section
    // (Analysis.jsx) can render/replace-by-category correctly.
    const buildFullSelection = (overrides = {}) => {
        const f = overrides.foundation ?? foundation;
        const l = overrides.lips ?? lips;
        const e = overrides.eye ?? eye;
        const b = overrides.blush ?? blush;
        const c = overrides.contour ?? contour;
        const brc = overrides.browColor ?? browColor;
        const brs = overrides.browShape ?? browShape;
        const withShade = (product, category, shade) =>
            product ? { ...product, category, shadeKey: shade.key, shadeName: shade.name, shadeColor: shade.color } : null;
        return [
            f.color && withShade(FOUNDATION_PRODUCTS[f.key], "Foundation", f),
            l.color && withShade(LIP_PRODUCTS[l.key], "Lips", l),
            e.color && withShade(EYE_PRODUCTS[e.key], "Eyes", e),
            b.color && withShade(BLUSH_PRODUCTS[b.key], "Blush", b),
            brc.color && withShade(BROW_COLOR_PRODUCTS[brc.key], "Brows", brc),
            // Brow SHAPE isn't a product — no price/img — but still belongs in the
            // Look, so it's carried as an unpriced entry the cart renders differently.
            brs?.key && brs.key !== "none" && { name: brs.name, category: "Brows", isShapeOnly: true, shadeName: brs.name, shopUrl: null },
            c.color && withShade(CONTOUR_PRODUCTS[c.key], "Contour", c),
        ].filter(Boolean);
    };

    // Set every layer at once from a Look preset, then hand back the full
    // shopping list for it (skips "none" layers — they have no product).
    // Lips/Eyes/Blush resolve by index into the CURRENT season's palette.
    const applyLook = (look) => {
        const f = FOUNDATION.find((x) => x.key === look.foundation) || FOUNDATION[0];
        const l = activeLips[look.lipsIdx] || NONE_SHADE;
        const e = activeEyes[look.eyesIdx] || NONE_SHADE;
        const b = activeBlush[look.blushIdx] || NONE_SHADE;
        const c = CONTOUR.find((x) => x.key === look.contour) || CONTOUR[0];
        setFoundation(f);
        setLips(l);
        setEye(e);
        setBlush(b);
        setContour(c);
        emitSelectedProducts(buildFullSelection({ foundation: f, lips: l, eye: e, blush: b, contour: c }));
    };

    const resetAll = () => {
        setBrow(BROWS[0]);
        setBrowColor(NONE_SHADE);
        setBrowShape(NONE_BROW_SHAPE);
        setEye(NONE_SHADE);
        setHair(HAIRSTYLES[0]);
        setLips(NONE_SHADE);
        setBlush(NONE_SHADE);
        setContour(CONTOUR[0]);
        setFoundation(FOUNDATION[0]);
        setHairColor(HAIR_COLORS[0]);
        emitSelectedProducts([]);
    };

    const currentItems = { Brows: BROWS, Eyes: activeEyes, Lips: activeLips, Hairstyle: HAIRSTYLES }[tab];

    return (
        <div className="bg-gradient-to-b from-white to-[#FFFAFB] rounded-3xl p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT: PREVIEW */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-[#F5E3E8] shadow-[0_10px_40px_-10px_rgba(210,54,105,0.15)] bg-[#F7F4F2]">
                    <img
                        src={base}
                        alt="base face"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ visibility: showLiveCanvas ? "hidden" : "visible" }}
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ visibility: showLiveCanvas ? "visible" : "hidden" }}
                    />
                    <canvas
                        ref={contourCanvasRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ visibility: showLiveCanvas ? "visible" : "hidden" }}
                    />
                    {studioStatus === "loading" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                            <span className="text-[9px] tracking-[0.3em] uppercase text-[#8A7A80]">กำลังค้นหาใบหน้า…</span>
                        </div>
                    )}
                    {studioStatus === "no_face" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 p-4 text-center">
                            <span className="text-[9px] tracking-[0.2em] uppercase text-[#D23669]">ไม่พบใบหน้า — ลองใช้รูปที่หันหน้าตรงและชัดเจนกว่านี้</span>
                        </div>
                    )}
                    {studioStatus === "error" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 p-4 text-center">
                            <span className="text-[9px] tracking-[0.2em] uppercase text-[#D23669]">โหลดระบบแต่งหน้าไม่สำเร็จ (โปรดตรวจสอบการเชื่อมต่อ)</span>
                        </div>
                    )}
                    {studioStatus === "ready" && !glOk && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 p-4 text-center">
                            <span className="text-[9px] tracking-[0.2em] uppercase text-[#D23669]">อุปกรณ์นี้ไม่รองรับ WebGL</span>
                        </div>
                    )}
                    {brow?.img && <img src={brow.img} alt={brow.name} className="absolute inset-0 w-full h-full object-contain" />}
                    {hair?.img && (
                        <img
                            src={hair.img}
                            alt={hair.name}
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{ filter: hairColor?.filter || "none" }}
                        />
                    )}
                </div>

                {/* RIGHT: CONTROL PANEL */}
                <div className="bg-white rounded-3xl border border-[#F5E3E8] shadow-[0_10px_40px_-10px_rgba(210,54,105,0.08)] p-6 flex flex-col gap-5">
                    {/* Tab bar */}
                    <div className="flex flex-wrap gap-1.5 bg-[#FFF7F9] rounded-2xl p-1.5">
                        {TABS.map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTab(t)}
                                className={`flex-1 py-2 rounded-xl text-[9px] font-[600] uppercase tracking-[0.2em] transition-all ${
                                    tab === t
                                        ? "bg-gradient-to-r from-[#D23669] to-[#C2255A] text-white shadow-sm"
                                        : "bg-transparent text-[#8A7A80] hover:text-[#D23669]"
                                }`}
                            >
                                {TAB_LABELS[t] || t}
                            </button>
                        ))}
                    </div>

                    {/* Options grid */}
                    {tab === "HairColor" ? (
                        <div className="grid grid-cols-4 gap-3">
                            {HAIR_COLORS.map((c) => (
                                <button
                                    key={c.key}
                                    onClick={() => setHairColor(c)}
                                    className={`rounded-xl py-4 text-[10px] font-[400] uppercase tracking-[0.15em] transition-all border ${
                                        hairColor?.key === c.key
                                            ? "bg-gradient-to-r from-[#D23669] to-[#C2255A] text-white border-[#D23669]"
                                            : "bg-white border-[#F5E3E8] text-[#8A7A80] hover:border-[#D23669] hover:text-[#D23669]"
                                    }`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    ) : tab === "Looks" ? (
                        <div className="grid grid-cols-2 gap-3">
                            {LOOKS.map((look) => {
                                const lookLips = activeLips[look.lipsIdx];
                                const lookEyes = activeEyes[look.eyesIdx];
                                const lookBlush = activeBlush[look.blushIdx];
                                const isActive =
                                    foundation.key === look.foundation &&
                                    lips.key === lookLips?.key &&
                                    eye.key === lookEyes?.key &&
                                    blush.key === lookBlush?.key &&
                                    contour.key === look.contour;
                                const swatchColors = [
                                    FOUNDATION.find((x) => x.key === look.foundation)?.color,
                                    lookLips?.color,
                                    lookEyes?.color,
                                    lookBlush?.color,
                                    CONTOUR.find((x) => x.key === look.contour)?.color,
                                ].filter(Boolean);
                                return (
                                    <button
                                        key={look.key}
                                        type="button"
                                        onClick={() => applyLook(look)}
                                        className={`rounded-2xl border flex flex-col items-start gap-3 p-4 text-left transition-all ${
                                            isActive ? "border-[#D23669] ring-2 ring-[#D23669]/20 bg-[#FFF7F9]" : "border-[#F5E3E8] bg-white hover:border-[#F0B8C6]"
                                        }`}
                                    >
                                        <div className="flex -space-x-1.5">
                                            {swatchColors.map((c, i) => (
                                                <div key={i} className="h-6 w-6 rounded-full border-2 border-white" style={{ background: c }} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] uppercase tracking-[0.15em] text-[#1A1A1A] font-[500]">{look.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : tab === "Lips" || tab === "Eyes" || tab === "Blush" || tab === "Brows" || tab === "Contour" || tab === "Foundation" ? (
                        <div>
                            {/* Personal Color indicator / season picker — Lips/Eyes/Blush/Brows only,
                                Foundation & Contour aren't season-specific. */}
                            {(tab === "Lips" || tab === "Eyes" || tab === "Blush" || tab === "Brows") && (
                                hasPersonalColor ? (
                                    <div className="flex items-center justify-between rounded-xl bg-[#FFF7F9] border border-[#F5E3E8] px-4 py-2.5 mb-3">
                                        <div>
                                            <p className="text-[8px] tracking-[0.3em] uppercase text-[#B08B95] font-[500]">สีประจำตัวของคุณ</p>
                                            <p className="text-xs font-[700] uppercase tracking-[0.15em] text-[#D23669]">{SEASON_LABELS_TH[activeSeason] || activeSeason}</p>
                                        </div>
                                        <span className="text-[8px] tracking-[0.2em] uppercase text-[#8A7A80]">จับคู่อัตโนมัติ</span>
                                    </div>
                                ) : (
                                    <div className="mb-3">
                                        <p className="text-[8px] tracking-[0.3em] uppercase text-[#8A7A80] font-[500] mb-2">เลือกสีประจำตัวของคุณ</p>
                                        <div className="flex gap-1.5">
                                            {SEASON_LIST.map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setActiveSeason(s)}
                                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-[600] uppercase tracking-[0.1em] border transition-all ${
                                                        activeSeason === s
                                                            ? "bg-gradient-to-r from-[#D23669] to-[#C2255A] text-white border-transparent"
                                                            : "bg-white text-[#8A7A80] border-[#F5E3E8] hover:border-[#D23669] hover:text-[#D23669]"
                                                    }`}
                                                >
                                                    {SEASON_LABELS_TH[s] || s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}

                            {tab === "Brows" && (
                                <p className="text-[9px] tracking-[0.3em] uppercase text-[#1A1A1A] font-[600] mb-2">สีคิ้ว</p>
                            )}
                            <div className="grid grid-cols-3 gap-3">
                                {(() => {
                                    const layer = {
                                        Foundation: [FOUNDATION, foundation, setFoundation, "foundation", FOUNDATION_PRODUCTS, false],
                                        Lips: [activeLips, lips, setLips, "lips", LIP_PRODUCTS, true],
                                        Eyes: [activeEyes, eye, setEye, "eye", EYE_PRODUCTS, true],
                                        Blush: [activeBlush, blush, setBlush, "blush", BLUSH_PRODUCTS, true],
                                        Brows: [activeBrowColors, browColor, setBrowColor, "browColor", BROW_COLOR_PRODUCTS, true],
                                        Contour: [CONTOUR, contour, setContour, "contour", CONTOUR_PRODUCTS, false],
                                    }[tab];
                                    const [rawItems, current, setCurrent, overrideKey, products, isSeasonal] = layer;
                                    const items = isSeasonal ? [NONE_SHADE, ...rawItems] : rawItems;
                                    return items.map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            title={item.name}
                                            onClick={() => {
                                                setCurrent(item);
                                                emitSelectedProducts(buildFullSelection({ [overrideKey]: item }));
                                            }}
                                            className={`rounded-2xl border overflow-hidden flex flex-col items-center gap-1.5 p-3 transition-all ${
                                                current?.key === item.key ? "border-[#D23669] ring-2 ring-[#D23669]/20 bg-[#FFF7F9]" : "border-[#F5E3E8] bg-white hover:border-[#F0B8C6]"
                                            }`}
                                        >
                                            <div
                                                className="h-14 w-14 rounded-full border border-[#F0DEE3]"
                                                style={{ background: item.color || "#fff" }}
                                            />
                                            <span className="text-[9px] uppercase tracking-[0.15em] text-[#605858] font-[400] text-center leading-tight">{item.name}</span>
                                            {isSeasonal && item.color && (
                                                <span className="text-[7px] uppercase tracking-[0.15em] text-[#D23669] font-[600]">{SEASON_LABELS_TH[item.season] || item.season}</span>
                                            )}
                                            {isSeasonal && item.color && products[item.key] && (
                                                <span className="text-[8px] text-[#8A7A80] font-[500]">฿{products[item.key].price}</span>
                                            )}
                                        </button>
                                    ));
                                })()}
                            </div>

                            {/* BROW SHAPE — a style pick, not a product: illustrated cards,
                                no price, independent from Brow Color above. Recommended
                                shapes (by season + detected face shape) get a badge. */}
                            {tab === "Brows" && (
                                <div className="mt-5 pt-5 border-t border-[#F5E3E8]">
                                    <p className="text-[9px] tracking-[0.3em] uppercase text-[#1A1A1A] font-[600] mb-3">ทรงคิ้ว</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[NONE_BROW_SHAPE, ...BROW_SHAPES].map((shape) => {
                                            const isActive = browShape?.key === shape.key;
                                            const isRecommended = recommendedShapeKeys.has(shape.key);
                                            return (
                                                <button
                                                    key={shape.key}
                                                    type="button"
                                                    title={shape.name}
                                                    onClick={() => {
                                                        setBrowShape(shape);
                                                        emitSelectedProducts(buildFullSelection({ browShape: shape }));
                                                    }}
                                                    className={`relative rounded-2xl border overflow-hidden flex flex-col items-center gap-1.5 p-3 transition-all ${
                                                        isActive ? "border-[#D23669] ring-2 ring-[#D23669]/20 bg-[#FFF7F9]" : "border-[#F5E3E8] bg-white hover:border-[#F0B8C6]"
                                                    }`}
                                                >
                                                    {isRecommended && shape.key !== "none" && (
                                                        <span className="absolute top-1.5 right-1.5 text-[6px] font-[700] uppercase tracking-[0.1em] text-white bg-gradient-to-r from-[#D23669] to-[#C2255A] px-1.5 py-0.5 rounded-full">
                                                            เหมาะกับคุณ
                                                        </span>
                                                    )}
                                                    {shape.path ? (
                                                        <BrowShapeIcon path={shape.path} active={isActive} />
                                                    ) : (
                                                        <div className="h-5 flex items-center text-[10px] text-[#aaa]">—</div>
                                                    )}
                                                    <span className="text-[9px] uppercase tracking-[0.15em] text-[#605858] font-[400] text-center leading-tight">{shape.name}</span>
                                                    {shape.style && (
                                                        <span className="text-[7px] uppercase tracking-[0.15em] text-[#B08B95] font-[500]">{shape.style}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {(currentItems || []).map((item) => {
                                const isActive =
                                    (tab === "Brows" && brow?.key === item.key) ||
                                    (tab === "Hairstyle" && hair?.key === item.key);
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        title={item.name}
                                        onClick={() => {
                                            if (tab === "Brows") { setBrow(item); emitSelectedProducts(BROW_PRODUCTS[item.key] ? [BROW_PRODUCTS[item.key]] : []); }
                                            if (tab === "Hairstyle") setHair(item);
                                        }}
                                        className={`rounded-2xl border overflow-hidden flex flex-col items-center gap-2 p-3 transition-all ${
                                            isActive ? "border-[#D23669] ring-2 ring-[#D23669]/20 bg-[#FFF7F9]" : "border-[#F5E3E8] bg-white hover:border-[#F0B8C6]"
                                        }`}
                                    >
                                        {item.img ? (
                                            <img
                                                src={item.img}
                                                alt={item.name}
                                                className="h-14 w-full object-contain"
                                                onError={(e) => (e.currentTarget.style.display = "none")}
                                            />
                                        ) : (
                                            <div className="h-14 w-full grid place-items-center text-[10px] text-[#aaa]">—</div>
                                        )}
                                        <span className="text-[9px] uppercase tracking-[0.15em] text-[#605858] font-[400]">{item.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 border-t border-[#F5E3E8] pt-5">
                        <button
                            onClick={resetAll}
                            className="flex-1 rounded-xl border border-[#F0DEE3] text-[#8A7A80] py-2.5 text-[10px] font-[500] uppercase tracking-[0.2em] hover:border-[#D23669] hover:text-[#D23669] transition-all"
                        >
                            รีเซ็ต
                        </button>
                        <button
                            onClick={() => {
                                const state = { brow, browColor, browShape, eye, lips, hair, hairColor };
                                if (onSave) onSave(state);
                                window.dispatchEvent(new CustomEvent("makeover:saved", { detail: state }));
                                setSavedMsg(true);
                                setTimeout(() => setSavedMsg(false), 2000);
                            }}
                            className="flex-1 rounded-xl bg-gradient-to-r from-[#D23669] to-[#C2255A] text-white py-2.5 text-[10px] font-[600] uppercase tracking-[0.2em] shadow-[0_8px_24px_-6px_rgba(210,54,105,0.5)] hover:shadow-[0_10px_28px_-4px_rgba(210,54,105,0.6)] transition-all"
                        >
                            {savedMsg ? "บันทึกแล้ว" : "บันทึกลุค"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
