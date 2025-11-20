// src/components/MakeoverStudio.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import MagneticButton from "./MagneticButton.jsx";
import SectionHeader from "./SectionHeader.jsx";
import "./MakeoverStudio.css";

/* ---------- DATA (ใช้ labelKey ไว้เรียก t() ) ---------- */
// 🎨 คิ้ว
const BROWS = [
  { key: "none", labelKey: "makeover.brows.none", img: "" },
  { key: "soft", labelKey: "makeover.brows.softArch", img: "/overlays/hair/brow-soft.jpg" },
  { key: "straight", labelKey: "makeover.brows.straight", img: "/overlays/hair/brow-straight.jpg" },
  { key: "arch", labelKey: "makeover.brows.highArch", img: "/overlays/hair/brow-arch.jpg" },
  { key: "thin", labelKey: "makeover.brows.thin", img: "/overlays/hair/thin.jpg" },
  { key: "curve1", labelKey: "makeover.brows.curve", img: "/overlays/hair/curve.jpg" },
  { key: "curve2", labelKey: "makeover.brows.curve", img: "/overlays/hair/curve.jpg" },
  { key: "curve3", labelKey: "makeover.brows.curve", img: "/overlays/hair/curve.jpg" },
  { key: "curve4", labelKey: "makeover.brows.curve", img: "/overlays/hair/curve.jpg" },
  { key: "curve5", labelKey: "makeover.brows.curve", img: "/overlays/hair/curve.jpg" },
  { key: "curve6", labelKey: "makeover.brows.curve", img: "/overlays/hair/curve.jpg" },
  { key: "curve7", labelKey: "makeover.brows.curve", img: "/overlays/hair/curve.jpg" },
];

// 👀 ตา
const EYES = [
  { key: "none", labelKey: "makeover.eyes.none", img: "" },
  { key: "natural1", labelKey: "makeover.eyes.natural", img: "/overlays/hair/eye-natural.jpg" },
  { key: "cat", labelKey: "makeover.eyes.catEye", img: "/overlays/hair/eye-cat.jpg" },
  { key: "dolly1", labelKey: "makeover.eyes.dolly", img: "/overlays/hair/eye-dolly.jpg" },
  { key: "dolly2", labelKey: "makeover.eyes.dolly", img: "/overlays/hair/eye-dolly.jpg" },
  { key: "dolly3", labelKey: "makeover.eyes.dolly", img: "/overlays/hair/eye-dolly.jpg" },
  { key: "dolly4", labelKey: "makeover.eyes.dolly", img: "/overlays/hair/eye-dolly.jpg" },
  { key: "dolly5", labelKey: "makeover.eyes.dolly", img: "/overlays/hair/eye-dolly.jpg" },
  { key: "dolly6", labelKey: "makeover.eyes.dolly", img: "/overlays/hair/eye-dolly.jpg" },
  { key: "dolly7", labelKey: "makeover.eyes.dolly", img: "/overlays/hair/eye-dolly.jpg" },
  { key: "natural2", labelKey: "makeover.eyes.natural", img: "/overlays/hair/eye-natural.jpg" },
  { key: "natural3", labelKey: "makeover.eyes.natural", img: "/overlays/hair/eye-natural.jpg" },
];

// 💇‍♀️ ผม
const HAIRSTYLES = [
  { key: "none", labelKey: "makeover.hairstyle.none", img: "" },
  { key: "long", labelKey: "makeover.hairstyle.longLayer", img: "/overlays/hair/hair-long.png" },
  { key: "bob", labelKey: "makeover.hairstyle.bobCut", img: "/overlays/hair/hair-bob.png" },
  { key: "bangs1", labelKey: "makeover.hairstyle.airyBangs", img: "/overlays/hair/hair-bangs.png" },
  { key: "bangs2", labelKey: "makeover.hairstyle.airyBangs", img: "/overlays/hair/hair-bangs.png" },
  { key: "bangs3", labelKey: "makeover.hairstyle.airyBangs", img: "/overlays/hair/hair-bangs.png" },
  { key: "bangs4", labelKey: "makeover.hairstyle.airyBangs", img: "/overlays/hair/hair-bangs.png" },
  { key: "bangs5", labelKey: "makeover.hairstyle.airyBangs", img: "/overlays/hair/hair-bangs.png" },
];

// 👄 ปาก
const LIPS = [
  { key: "none", labelKey: "makeover.lips.none", img: "" },
  { key: "red", labelKey: "makeover.lips.red", img: "/overlays/hair/lip1.png" },
  { key: "pink1", labelKey: "makeover.lips.pink", img: "/overlays/hair/lip2.png" },
  { key: "nude1", labelKey: "makeover.lips.nude", img: "/overlays/hair/lip3.png" },
  { key: "nude2", labelKey: "makeover.lips.nude", img: "/overlays/hair/lip3.png" },
  { key: "nude3", labelKey: "makeover.lips.nude", img: "/overlays/hair/lip3.png" },
  { key: "nude4", labelKey: "makeover.lips.nude", img: "/overlays/hair/lip3.png" },
  { key: "nude5", labelKey: "makeover.lips.nude", img: "/overlays/hair/lip3.png" },
  { key: "pink2", labelKey: "makeover.lips.pink", img: "/overlays/hair/lip2.png" },
  { key: "pink3", labelKey: "makeover.lips.pink", img: "/overlays/hair/lip2.png" },
  { key: "pink4", labelKey: "makeover.lips.pink", img: "/overlays/hair/lip2.png" },
  { key: "pink5", labelKey: "makeover.lips.pink", img: "/overlays/hair/lip2.png" },
];

// 🎨 สีผม
const HAIR_COLORS = [
  { key: "none", labelKey: "makeover.hairColor.none", name: "None", filter: "none" },
  {
    key: "brown",
    labelKey: "makeover.hairColor.brown",
    name: "Brown",
    filter: "brightness(0.95) sepia(0.25) saturate(1.2)",
  },
  {
    key: "blonde",
    labelKey: "makeover.hairColor.blonde",
    name: "Blonde",
    filter: "brightness(1.2) sepia(0.35) saturate(1.5)",
  },
  {
    key: "black",
    labelKey: "makeover.hairColor.black",
    name: "Black",
    filter: "brightness(0.7) saturate(0.8)",
  },
];

const TABS = [
  { id: "Brows", labelKey: "makeover.tabs.brows" },
  { id: "Eyes", labelKey: "makeover.tabs.eyes" },
  { id: "Lips", labelKey: "makeover.tabs.lips" },
  { id: "Hairstyle", labelKey: "makeover.tabs.hairstyle" },
  { id: "HairColor", labelKey: "makeover.tabs.hairColor" },
];

/* ---------- SMALL UI ---------- */
function Tab({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-1.5 text-sm font-medium border transition ${
        active ? "bg-[#75464A] text-white" : "bg-white text-[#75464A]"
      }`}
    >
      {children}
    </button>
  );
}

function Option({ label, img, active, onClick, noneLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-2 overflow-hidden text-xs transition h-full flex flex-col items-center justify-center gap-2 ${
        active ? "ring-2 ring-[#75464A]" : ""
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
        <div className="h-16 grid place-items-center text-[11px] text-[#75464A]/60">
          {noneLabel}
        </div>
      )}
      <div className="text-center">{label}</div>
    </button>
  );
}

/* ---------- MAIN ---------- */
export default function MakeoverStudio({ base = "/assets/analysis.JPG" }) {
  const { t } = useTranslation();

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

  const noneText = t("makeover.common.none");

  return (
    <section className="rounded-3xl border bg-white/70 p-5 shadow-sm mt-8">
      <SectionHeader
        title={t("makeover.title")}
        meta={
          <span className="text-xs text-[#75464A]/60">
            {t("makeover.subtitle")}
          </span>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: PREVIEW */}
        <div className="relative aspect-[4/5] rounded-2xl border overflow-hidden bg-white">
          <img
            src={base}
            alt={t("makeover.baseAlt")}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {brow?.img && (
            <img
              src={brow.img}
              alt={t(brow.labelKey)}
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
          {eye?.img && (
            <img
              src={eye.img}
              alt={t(eye.labelKey)}
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
          {lips?.img && (
            <img
              src={lips.img}
              alt={t(lips.labelKey)}
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
          {hair?.img && (
            <img
              src={hair.img}
              alt={t(hair.labelKey)}
              className="absolute inset-0 w-full h-full object-contain"
              style={{ filter: hairColor?.filter || "none" }}
            />
          )}
        </div>

        {/* RIGHT: CONTROL PANEL */}
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {TABS.map((tTab) => (
              <Tab
                key={tTab.id}
                active={tab === tTab.id}
                onClick={() => setTab(tTab.id)}
              >
                {t(tTab.labelKey)}
              </Tab>
            ))}
          </div>

          {tab === "Brows" && (
            <div className="grid grid-cols-3 gap-2">
              {BROWS.map((b) => (
                <Option
                  key={b.key}
                  label={t(b.labelKey)}
                  img={b.img}
                  active={brow?.key === b.key}
                  onClick={() => setBrow(b)}
                  noneLabel={noneText}
                />
              ))}
            </div>
          )}

          {tab === "Eyes" && (
            <div className="grid grid-cols-3 gap-2">
              {EYES.map((e) => (
                <Option
                  key={e.key}
                  label={t(e.labelKey)}
                  img={e.img}
                  active={eye?.key === e.key}
                  onClick={() => setEye(e)}
                  noneLabel={noneText}
                />
              ))}
            </div>
          )}

          {tab === "Lips" && (
            <div className="grid grid-cols-3 gap-2">
              {LIPS.map((l) => (
                <Option
                  key={l.key}
                  label={t(l.labelKey)}
                  img={l.img}
                  active={lips?.key === l.key}
                  onClick={() => setLips(l)}
                  noneLabel={noneText}
                />
              ))}
            </div>
          )}

          {tab === "Hairstyle" && (
            <div className="grid grid-cols-3 gap-2">
              {HAIRSTYLES.map((h) => (
                <Option
                  key={h.key}
                  label={t(h.labelKey)}
                  img={h.img}
                  active={hair?.key === h.key}
                  onClick={() => setHair(h)}
                  noneLabel={noneText}
                />
              ))}
            </div>
          )}

          {tab === "HairColor" && (
            <div className="grid grid-cols-3 gap-2">
              {HAIR_COLORS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setHairColor(c)}
                  className={`h-16 rounded-xl border flex items-center justify-center text-sm ${
                    hairColor?.key === c.key ? "ring-2 ring-[#75464A]" : ""
                  }`}
                  title={t(c.labelKey)}
                >
                  {t(c.labelKey)}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center gap-2">
            <MagneticButton onClick={resetAll}>
              {t("makeover.buttons.reset")}
            </MagneticButton>
            <MagneticButton
              style={{
                background: "#fff",
                color: "#75464A",
                border: "1px solid #E6DCEB",
                boxShadow: "0 4px 12px rgba(0,0,0,.06)",
              }}
              onClick={() =>
                alert(t("makeover.buttons.savedAlert"))
              }
            >
              {t("makeover.buttons.save")}
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
