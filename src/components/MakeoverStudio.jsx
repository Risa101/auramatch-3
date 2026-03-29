// src/components/MakeoverStudio.jsx
import React, { useState } from "react";
import "./MakeoverStudio.css";

import { imgUrl } from "../utils/imgUrl.js";
const assetPath = (p) => imgUrl(`/${String(p).replace(/^\/+/, "")}`);

/* ---------- DATA ---------- */
const BROWS = [
    { key: "none", name: "None", img: "" },
    { key: "soft", name: "Soft Arch", img: assetPath("overlays/hair/brow-soft.jpg") },
    { key: "straight", name: "Straight", img: assetPath("overlays/hair/brow-straight.jpg") },
    { key: "arch", name: "High Arch", img: assetPath("overlays/hair/brow-arch.jpg") },
    { key: "thin", name: "Thin", img: assetPath("overlays/hair/thin.jpg") },
    { key: "curve", name: "Curve", img: assetPath("overlays/hair/curve.jpg") },
];

const EYES = [
    { key: "none", name: "None", img: "" },
    { key: "natural", name: "Natural", img: assetPath("overlays/hair/eye-natural.jpg") },
    { key: "cat", name: "Cat Eye", img: assetPath("overlays/hair/eye-cat.jpg") },
    { key: "dolly", name: "Dolly", img: assetPath("overlays/hair/eye-dolly.jpg") },
];

const HAIRSTYLES = [
    { key: "none", name: "None", img: "" },
    { key: "long", name: "Long Layer", img: assetPath("overlays/hair/hair-long.png") },
    { key: "bob", name: "Bob Cut", img: assetPath("overlays/hair/hair-bob.png") },
    { key: "bangs", name: "Airy Bangs", img: assetPath("overlays/hair/hair-bangs.png") },
];

const LIPS = [
    { key: "none", name: "None", img: "" },
    { key: "red", name: "Red Lip", img: assetPath("overlays/hair/lip1.png") },
    { key: "pink", name: "Pink Gloss", img: assetPath("overlays/hair/lip2.png") },
    { key: "nude", name: "Nude Matte", img: assetPath("overlays/hair/lip3.png") },
];

const HAIR_COLORS = [
    { key: "none", name: "None", filter: "none" },
    { key: "brown", name: "Brown", filter: "brightness(0.95) sepia(0.25) saturate(1.2)" },
    { key: "blonde", name: "Blonde", filter: "brightness(1.2) sepia(0.35) saturate(1.5)" },
    { key: "black", name: "Black", filter: "brightness(0.7) saturate(0.8)" },
];

const TABS = ["Brows", "Eyes", "Lips", "Hairstyle", "HairColor"];

/* ---------- MAIN ---------- */
export default function MakeoverStudio({ base = assetPath("assets/analysis.JPG"), onProductSelect, onSave }) {
    const [tab, setTab] = useState("Brows");
    const [brow, setBrow] = useState(BROWS[0]);
    const [eye, setEye] = useState(EYES[0]);
    const [hair, setHair] = useState(HAIRSTYLES[0]);
    const [lips, setLips] = useState(LIPS[0]);
    const [hairColor, setHairColor] = useState(HAIR_COLORS[0]);
    const [savedMsg, setSavedMsg] = useState(false);

    const emitSelectedProduct = (product) => {
        if (!product || !onProductSelect) return;
        onProductSelect(product);
    };

    const BROW_PRODUCTS = {
        soft: { name: "Soft Arch Brow Pencil", price: "259", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=soft%20arch%20brow%20pencil" },
        straight: { name: "Straight Brow Definer", price: "239", img: assetPath("product/brush2.jpg"), shopUrl: "https://shopee.co.th/search?keyword=straight%20brow%20definer" },
        arch: { name: "High Arch Brow Kit", price: "289", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=high%20arch%20brow%20kit" },
        thin: { name: "Slim Brow Liner", price: "199", img: assetPath("product/brush2.jpg"), shopUrl: "https://shopee.co.th/search?keyword=slim%20brow%20liner" },
        curve: { name: "Curve Brow Sculpt", price: "279", img: assetPath("product/brush1.jpg"), shopUrl: "https://shopee.co.th/search?keyword=curve%20brow%20sculpt" },
    };
    const EYE_PRODUCTS = {
        natural: { name: "Natural Eye Palette", price: "399", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=natural%20eye%20palette" },
        cat: { name: "Cat Eye Liner", price: "229", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=cat%20eye%20liner" },
        dolly: { name: "Dolly Lash Mascara", price: "259", img: assetPath("product/contour.png"), shopUrl: "https://shopee.co.th/search?keyword=dolly%20lash%20mascara" },
    };
    const LIP_PRODUCTS = {
        red: { name: "Red Lip Tint", price: "249", img: assetPath("product/lip.png"), shopUrl: "https://shopee.co.th/search?keyword=red%20lip%20tint" },
        pink: { name: "Pink Gloss", price: "229", img: assetPath("product/lipoil.png"), shopUrl: "https://shopee.co.th/search?keyword=pink%20lip%20gloss" },
        nude: { name: "Nude Matte Lip", price: "239", img: assetPath("product/lip.png"), shopUrl: "https://shopee.co.th/search?keyword=nude%20matte%20lip" },
    };

    const resetAll = () => {
        setBrow(BROWS[0]);
        setEye(EYES[0]);
        setHair(HAIRSTYLES[0]);
        setLips(LIPS[0]);
        setHairColor(HAIR_COLORS[0]);
    };

    const currentItems = { Brows: BROWS, Eyes: EYES, Lips: LIPS, Hairstyle: HAIRSTYLES }[tab];

    return (
        <div className="bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#E8E0DC]">
                {/* LEFT: PREVIEW */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F7F4F2]">
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
                <div className="bg-white p-6 flex flex-col gap-5">
                    {/* Tab bar */}
                    <div className="flex flex-wrap gap-px border border-[#E8E0DC]">
                        {TABS.map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTab(t)}
                                className={`flex-1 py-2 text-[9px] font-[500] uppercase tracking-[0.2em] transition-all ${
                                    tab === t
                                        ? "bg-[#1A1A1A] text-white"
                                        : "bg-white text-[#888] hover:text-[#1A1A1A]"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Options grid */}
                    {tab === "HairColor" ? (
                        <div className="grid grid-cols-4 gap-px bg-[#E8E0DC]">
                            {HAIR_COLORS.map((c) => (
                                <button
                                    key={c.key}
                                    onClick={() => setHairColor(c)}
                                    className={`bg-white py-4 text-[10px] font-[400] uppercase tracking-[0.15em] transition-all ${
                                        hairColor?.key === c.key
                                            ? "bg-[#1A1A1A] text-white"
                                            : "text-[#888] hover:text-[#1A1A1A]"
                                    }`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-px bg-[#E8E0DC]">
                            {(currentItems || []).map((item) => {
                                const isActive =
                                    (tab === "Brows" && brow?.key === item.key) ||
                                    (tab === "Eyes" && eye?.key === item.key) ||
                                    (tab === "Lips" && lips?.key === item.key) ||
                                    (tab === "Hairstyle" && hair?.key === item.key);
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        title={item.name}
                                        onClick={() => {
                                            if (tab === "Brows") { setBrow(item); emitSelectedProduct(BROW_PRODUCTS[item.key]); }
                                            if (tab === "Eyes") { setEye(item); emitSelectedProduct(EYE_PRODUCTS[item.key]); }
                                            if (tab === "Lips") { setLips(item); emitSelectedProduct(LIP_PRODUCTS[item.key]); }
                                            if (tab === "Hairstyle") setHair(item);
                                        }}
                                        className={`bg-white overflow-hidden flex flex-col items-center gap-2 p-3 transition-all ${
                                            isActive ? "outline outline-2 outline-[#1A1A1A] outline-offset-[-2px]" : ""
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
                                        <span className="text-[9px] uppercase tracking-[0.15em] text-[#555] font-[400]">{item.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 border-t border-[#E8E0DC] pt-5">
                        <button
                            onClick={resetAll}
                            className="flex-1 border border-[#E8E0DC] text-[#888] py-2.5 text-[10px] font-[500] uppercase tracking-[0.2em] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => {
                                const state = { brow, eye, lips, hair, hairColor };
                                if (onSave) onSave(state);
                                window.dispatchEvent(new CustomEvent("makeover:saved", { detail: state }));
                                setSavedMsg(true);
                                setTimeout(() => setSavedMsg(false), 2000);
                            }}
                            className="flex-1 bg-[#1A1A1A] text-white py-2.5 text-[10px] font-[600] uppercase tracking-[0.2em] hover:bg-[#D23669] transition-all"
                        >
                            {savedMsg ? "Saved" : "Save Look"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
