// src/components/MakeoverStudio.jsx
import React, { useState } from "react";
import MagneticButton from "./MagneticButton.jsx";
import SectionHeader from "./SectionHeader.jsx";
import "./MakeoverStudio.css";

const BASE_PATH = import.meta.env.BASE_URL || "/";
const assetPath = (p) => `${BASE_PATH}${String(p).replace(/^\/+/, "")}`;

/* ---------- DATA ---------- */
// 🎨 คิ้ว
const BROWS = [
    { key: "none", name: "None", img: "" },
    { key: "soft", name: "Soft Arch", img: assetPath("overlays/hair/brow-soft.jpg") },
    { key: "straight", name: "Straight", img: assetPath("overlays/hair/brow-straight.jpg") },
    { key: "arch", name: "High Arch", img: assetPath("overlays/hair/brow-arch.jpg") },
    { key: "thin", name: "Thin", img: assetPath("overlays/hair/thin.jpg") },
    { key: "curve", name: "Curve", img: assetPath("overlays/hair/curve.jpg") },
];

// 👀 ตา
const EYES = [
    { key: "none", name: "None", img: "" },
    { key: "natural", name: "Natural", img: assetPath("overlays/hair/eye-natural.jpg") },
    { key: "cat", name: "Cat Eye", img: assetPath("overlays/hair/eye-cat.jpg") },
    { key: "dolly", name: "Dolly", img: assetPath("overlays/hair/eye-dolly.jpg") },
];

// 💇‍♀️ ผม
const HAIRSTYLES = [
    { key: "none", name: "None", img: "" },
    { key: "long", name: "Long Layer", img: assetPath("overlays/hair/hair-long.png") },
    { key: "bob", name: "Bob Cut", img: assetPath("overlays/hair/hair-bob.png") },
    { key: "bangs", name: "Airy Bangs", img: assetPath("overlays/hair/hair-bangs.png") },
];

// 👄 ปาก
const LIPS = [
    { key: "none", name: "None", img: "" },
    { key: "red", name: "Red Lip", img: assetPath("overlays/hair/lip1.png") },
    { key: "pink", name: "Pink Gloss", img: assetPath("overlays/hair/lip2.png") },
    { key: "nude", name: "Nude Matte", img: assetPath("overlays/hair/lip3.png") },
];

// 🎨 สีผม
const HAIR_COLORS = [
    { key: "none", name: "None", filter: "none" },
    { key: "brown", name: "Brown", filter: "brightness(0.95) sepia(0.25) saturate(1.2)" },
    { key: "blonde", name: "Blonde", filter: "brightness(1.2) sepia(0.35) saturate(1.5)" },
    { key: "black", name: "Black", filter: "brightness(0.7) saturate(0.8)" },
];

/* ---------- SMALL UI ---------- */
function Tab({ active, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium border transition ${active ? "bg-[#75464A] text-white" : "bg-white text-[#75464A]"
                }`}
        >
            {children}
        </button>
    );
}

function Option({ label, img, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl border p-2 overflow-hidden text-xs transition h-full flex flex-col items-center justify-center gap-2 ${active ? "ring-2 ring-[#75464A]" : ""
                }`}
            title={label}
        >
            {img ? (
                <img
                    src={img}
                    alt={label}
                    className="object-contain h-16"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                />
            ) : (
                <div className="h-16 grid place-items-center text-[11px] text-[#75464A]/60">None</div>
            )}
            <div className="text-center">{label}</div>
        </button>
    );
}

/* ---------- MAIN ---------- */
export default function MakeoverStudio({ base = assetPath("assets/analysis.JPG") }) {
    const [tab, setTab] = useState("Brows");
    const [brow, setBrow] = useState(BROWS[0]);
    const [eye, setEye] = useState(EYES[0]);
    const [hair, setHair] = useState(HAIRSTYLES[0]);
    const [lips, setLips] = useState(LIPS[0]);
    const [hairColor, setHairColor] = useState(HAIR_COLORS[0]);

    const resetAll = () => {
        setBrow(BROWS[0]);
        setEye(EYES[0]);
        setHair(HAIRSTYLES[0]);
        setLips(LIPS[0]);
        setHairColor(HAIR_COLORS[0]);
    };

    return (
        <section className="rounded-3xl border bg-white/70 p-5 shadow-sm mt-8">
            <SectionHeader
                title="Makeover Studio"
                meta={<span className="text-xs text-[#75464A]/60">เลือกคิ้ว–ตา–ปาก–ทรงผม–สีผม</span>}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT: PREVIEW */}
                <div className="relative aspect-[4/5] rounded-2xl border overflow-hidden bg-white">
                    <img src={base} alt="base face" className="absolute inset-0 w-full h-full object-cover" />
                    {brow?.img && <img src={brow.img} alt={brow.name} className="absolute inset-0 w-full h-full object-contain" />}
                    {eye?.img && <img src={eye.img} alt={eye.name} className="absolute inset-0 w-full h-full object-contain" />}
                    {lips?.img && <img src={lips.img} alt={lips.name} className="absolute inset-0 w-full h-full object-contain" />}
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
                <div>
                    <div className="flex gap-2 mb-4 flex-wrap">
                        {["Brows", "Eyes", "Lips", "Hairstyle", "HairColor"].map((t) => (
                            <Tab key={t} active={tab === t} onClick={() => setTab(t)}>
                                {t}
                            </Tab>
                        ))}
                    </div>

                    {tab === "Brows" && (
                        <div className="grid grid-cols-3 gap-2">
                            {BROWS.map((b) => (
                                <Option key={b.key} label={b.name} img={b.img} active={brow?.key === b.key} onClick={() => setBrow(b)} />
                            ))}
                        </div>
                    )}

                    {tab === "Eyes" && (
                        <div className="grid grid-cols-3 gap-2">
                            {EYES.map((e) => (
                                <Option key={e.key} label={e.name} img={e.img} active={eye?.key === e.key} onClick={() => setEye(e)} />
                            ))}
                        </div>
                    )}

                    {tab === "Lips" && (
                        <div className="grid grid-cols-3 gap-2">
                            {LIPS.map((l) => (
                                <Option key={l.key} label={l.name} img={l.img} active={lips?.key === l.key} onClick={() => setLips(l)} />
                            ))}
                        </div>
                    )}

                    {tab === "Hairstyle" && (
                        <div className="grid grid-cols-3 gap-2">
                            {HAIRSTYLES.map((h) => (
                                <Option key={h.key} label={h.name} img={h.img} active={hair?.key === h.key} onClick={() => setHair(h)} />
                            ))}
                        </div>
                    )}

                    {tab === "HairColor" && (
                        <div className="grid grid-cols-3 gap-2">
                            {HAIR_COLORS.map((c) => (
                                <button
                                    key={c.key}
                                    onClick={() => setHairColor(c)}
                                    className={`h-16 rounded-xl border flex items-center justify-center text-sm ${hairColor?.key === c.key ? "ring-2 ring-[#75464A]" : ""
                                        }`}
                                    title={c.name}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 flex items-center gap-2">
                        <MagneticButton onClick={resetAll}>รีเซ็ต</MagneticButton>
                        <MagneticButton
                            style={{ background: "#fff", color: "#75464A", border: "1px solid #E6DCEB", boxShadow: "0 4px 12px rgba(0,0,0,.06)" }}
                            onClick={() => alert("บันทึกการแต่งหน้าเรียบร้อย!")}
                        >
                            บันทึกผลลัพธ์
                        </MagneticButton>
                    </div>
                </div>
            </div>
        </section>
    );
}
