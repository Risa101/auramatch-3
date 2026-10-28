import React, { useEffect, useRef, useState, useCallback } from "react";
import { lsGet } from "../utils/storage";
import { subscribeLikes } from "../utils/likes";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { Copy, Check, Sparkles, Camera, Tag, Heart, User, X } from "lucide-react";
import { getAnalysisHistory, getPromotions, getdataBrands } from "../callapi/call_api_user";
import { PERSONAL_COLORS } from "../data/personalColors";
import apiClient from "../api/client";
import { imgUrl } from "../utils/imgUrl";

const FEATURE_MAP = {
  brows: { softArch: "คิ้วโค้งอ่อน", straight: "คิ้วตรง", arched: "คิ้วโก่งสูง" },
  eyes: { natural: "อายไล่สีธรรมชาติ", cat: "อายไลเนอร์ยกหางตา", dolly: "ตาโตกลมหวาน" },
  nose: { softContour: "คอนทัวร์นุ่มนวล", definedContour: "คอนทัวร์คมชัด", natural: "ธรรมชาติ" },
  lips: { gradient: "ลิปไล่สี", full: "ลิปเต็มปากสีเข้ม", soft: "ลิปเบลอนุ่มนวล" },
};
const pretty = (val, group) => (FEATURE_MAP[group] || {})[val] || val || "—";
const SEASON_LABELS_TH = { Spring: "ฤดูใบไม้ผลิ", Summer: "ฤดูร้อน", Autumn: "ฤดูใบไม้ร่วง", Winter: "ฤดูหนาว" };
const FACE_TYPE_LABELS_TH = { Oval: "รูปไข่", Round: "กลม", Square: "เหลี่ยม", Heart: "หัวใจ", Diamond: "เพชร", Triangle: "สามเหลี่ยม", Rectangle: "ยาว" };

// Same illustrations as the "Which Shape Are You?" strip on the home page
const FACE_SHAPE_IMAGES = {
  Oval: "/assets/ovalface.jpeg",
  Round: "/assets/roundface.jpg",
  Square: "/assets/recface.jpg",
  Heart: "/assets/heartface.jpg",
  Diamond: "/assets/diamondface.jpg",
  Triangle: "/assets/triagle.jpg",
  Rectangle: "/assets/rectangular.jpg",
};

// Season tag lines from the home page "Discover Your Season" panel
const SEASON_TAGS = {
  Spring: "Warm, Bright & Vitality",
  Summer: "Cool, Soft & Elegant",
  Autumn: "Warm, Rich & Earthy",
  Winter: "Cool, Vivid & Sharp",
};

export default function AccountProfile() {
  const [favs, setFavs]         = useState([]);
  const likedLooks    = favs.filter(f => f.type === "look" || !f.type);
  const likedProducts = favs.filter(f => f.type === "product");
  const likedTrends   = favs.filter(f => f.type === "trend");
  const [openEdit, setOpenEdit]  = useState(false);
  const [history, setHistory]    = useState([]);
  const [last, setLast]          = useState(null);
  const [promos, setPromos]      = useState([]);
  const [copiedId, setCopiedId]  = useState(null);
  const [me, setMe] = useState(() => lsGet("auramatch:user", { id: 1, name: "User", email: "" }));

  const palette = PERSONAL_COLORS.find(p => p.season?.toLowerCase() === last?.season?.toLowerCase());

  // ── Load data ──
  const load = useCallback(async () => {
    const userId = me?.uid || me?.user_id || me?.id;

    try {
      const lsAnalysis = JSON.parse(localStorage.getItem("auramatch:lastAnalysis") || "null");
      const lsUser = JSON.parse(localStorage.getItem("auramatch:user") || "null");
      const localLast = lsUser?.lastAnalysis || lsAnalysis;
      if (localLast?.season) setLast(prev => prev ?? localLast);
    } catch {}

    if (userId) {
      try {
        const data = await getAnalysisHistory(userId);
        const arr = Array.isArray(data) ? data : [];
        setHistory(arr);
        if (arr.length > 0) setLast(arr[0]);
      } catch {}
    }
    try {
      const [promoData, brandData] = await Promise.all([getPromotions(), getdataBrands()]);
      const active = (Array.isArray(promoData) ? promoData : [])
        .filter(p => p.status === "active" && p.coupon_code)
        .slice(0, 3)
        .map(p => {
          const b = (Array.isArray(brandData) ? brandData : []).find(b => Number(b.brand_id) === Number(p.brand_id));
          return { ...p, brand_name: b?.brand_name || null, brand_logo: b?.logo_path || null };
        });
      setPromos(active);
    } catch {}
  }, [me?.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    AOS.init({ duration: 1200, easing: "ease-out-back", once: true });
  }, []);

  useEffect(() => {
    const subscribeLikesUnsub = subscribeLikes(setFavs);
    return subscribeLikesUnsub;
  }, []);

  useEffect(() => {
    const onUpdate = () => { setMe(lsGet("auramatch:user", {})); load(); };
    window.addEventListener("analysis:updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => { window.removeEventListener("analysis:updated", onUpdate); window.removeEventListener("storage", onUpdate); };
  }, [load]);

  const handleCopy = (id, code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const nameParts = (me?.name || "ผู้เยี่ยมชม").split(" ");
  const stats = [
    { label: "ครั้งที่วิเคราะห์", value: history.length },
    { label: "รายการโปรด", value: likedLooks.length + likedProducts.length + likedTrends.length },
    { label: "คูปอง", value: promos.length },
    { label: "วิเคราะห์ล่าสุด", value: last ? new Date(last.analysis_date || last.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) : "—" },
  ];

  return (
    <div className="bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#FFDCE6] selection:text-[#C85A7D] antialiased pt-[60px] lg:pt-[180px] pb-24">

      {/* --- HERO --- */}
      <header className="relative overflow-hidden bg-[#FBF2F4]">
        <div className="absolute -left-32 -top-32 w-[420px] h-[420px] rounded-full bg-[#F7C9D6]/50 blur-3xl pointer-events-none" />
        <div className="absolute right-[10%] -bottom-40 w-[380px] h-[380px] rounded-full bg-[#EBD9B4]/40 blur-3xl pointer-events-none" />

        <div className="relative max-w-[1100px] mx-auto px-6 md:px-10 py-12 md:py-14 grid md:grid-cols-[1fr_auto] items-center gap-10">
          <div data-aos="fade-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-[#C5A358]" />
              <p className="text-[9px] tracking-[0.45em] uppercase text-[#C5A358] font-[500]">AuraMatch · Member</p>
            </div>

            <div className="flex items-center gap-5">
              <button type="button" onClick={() => setOpenEdit(true)} aria-label="เปลี่ยนรูปโปรไฟล์"
                className="relative w-[76px] h-[76px] shrink-0 rounded-full p-[3px] bg-gradient-to-br from-[#D23669] via-[#F3A6BC] to-[#C5A358] shadow-[0_10px_30px_rgba(210,54,105,0.25)] group">
                <span className="block w-full h-full rounded-full overflow-hidden bg-white ring-2 ring-white">
                  {(me?.photoURL || me?.avatar) ? (
                    <img src={imgUrl(me.photoURL || me.avatar)} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full bg-[#FFF0F4] flex items-center justify-center text-[#D23669] text-3xl font-['Cormorant_Garamond',serif] italic">
                      {(me?.name?.[0] || "U").toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="absolute inset-[3px] rounded-full bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={16} className="text-white" />
                </span>
              </button>

              <div className="min-w-0">
                <h1 className="font-['Cormorant_Garamond',serif] text-[2.6rem] md:text-[3.4rem] leading-[1.15] pb-1 font-[500] text-[#2B2226] truncate">
                  {nameParts.length > 1 && <>{nameParts.slice(0, -1).join(" ")} </>}
                  <span className="italic text-[#D23669]">{nameParts[nameParts.length - 1]}</span>
                </h1>
                {me?.email && <p className="mt-2 text-[11px] tracking-[0.15em] text-[#9A8A90] font-[300] truncate">{me.email}</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/analysis"
                className="rounded-full bg-[#D23669] hover:bg-[#B92D5B] text-white px-7 py-3 text-[9px] font-[600] uppercase tracking-[0.25em] shadow-[0_8px_20px_rgba(210,54,105,0.25)] transition-colors">
                วิเคราะห์ใหม่
              </Link>
              <button onClick={() => setOpenEdit(true)}
                className="rounded-full border border-[#2B2226]/20 bg-white/60 backdrop-blur text-[#2B2226] px-7 py-3 text-[9px] font-[500] uppercase tracking-[0.25em] hover:border-[#2B2226] transition-colors">
                แก้ไขโปรไฟล์
              </button>
            </div>
          </div>

          {/* Arch portrait (home page photo) */}
          <div className="hidden md:block relative" data-aos="fade-up" data-aos-delay="120">
            <div className="absolute -inset-3 rounded-t-full border border-[#C5A358]/50" />
            <div className="relative w-[230px] h-[290px] rounded-t-full overflow-hidden shadow-[0_20px_50px_rgba(43,34,38,0.18)]">
              <img src="/assets/makeup.jpeg" alt="" fetchpriority="high" decoding="async"
                className="w-full h-full object-cover object-[60%_center] transition-opacity duration-700 opacity-0"
                onLoad={(e) => e.currentTarget.classList.replace("opacity-0", "opacity-100")} />
            </div>
            {last?.season && (
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-[9px] tracking-[0.3em] uppercase text-[#2B2226] shadow-md">
                {last.season} Aura
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="relative border-t border-[#EADBDF] bg-white/50 backdrop-blur-sm">
          <div className="max-w-[1100px] mx-auto px-6 md:px-10 grid grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className={`py-5 text-center ${i < 3 ? "border-r border-[#EADBDF]" : ""}`}>
                <p className="font-['Cormorant_Garamond',serif] text-[1.7rem] md:text-[2rem] leading-none text-[#2B2226] [font-variant-numeric:lining-nums]">{s.value}</p>
                <p className="text-[8px] md:text-[9px] tracking-[0.25em] uppercase text-[#9A8A90] font-[300] mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-6 md:px-10">

        {/* --- MY AURA --- */}
        <section className="mt-16">
          <SectionHeader no="01" eyebrow="Color Harmony" title="My" accent="Aura" linkTo="/history" linkLabel="ดูประวัติ" />

          {last?.season ? (
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-5" data-aos="fade-up">
              {/* Season card, tinted with the season's own palette */}
              <div className="relative overflow-hidden rounded-2xl p-7 md:p-8 flex gap-6 border border-white shadow-[0_10px_40px_rgba(43,34,38,0.06)]"
                style={{ background: `linear-gradient(135deg, ${(palette?.colors?.[0] || "#F5E3E8")}55 0%, #FFFFFF 60%, ${(palette?.colors?.[2] || "#F5E3E8")}33 100%)` }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] tracking-[0.35em] uppercase text-[#9A8A90] font-[400]">ฤดูของคุณ</p>
                  <h3 className="font-['Cormorant_Garamond',serif] italic text-[3.4rem] md:text-[4.2rem] leading-[1.15] pb-1 text-[#2B2226] mt-1">{last.season}</h3>
                  <p className="text-[9px] tracking-[0.25em] uppercase text-[#C5A358] font-[500] mt-2">
                    {SEASON_LABELS_TH[last.season] || ""}{SEASON_TAGS[last.season] ? ` · ${SEASON_TAGS[last.season]}` : ""}
                  </p>
                  {palette?.desc && (
                    <p className="text-[12px] font-[300] text-[#5E5257] leading-relaxed mt-5 max-w-sm">{palette.desc}</p>
                  )}
                  {palette?.colors && (
                    <div className="flex items-center gap-4 mt-6">
                      <div className="flex -space-x-2.5">
                        {palette.colors.map((c) => (
                          <span key={c} title={c} className="h-9 w-9 rounded-full ring-[3px] ring-white shadow-sm" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <span className="text-[9px] tracking-[0.3em] uppercase text-[#9A8A90]">Your Palette</span>
                    </div>
                  )}
                </div>

                {/* Face shape in a small arch, same illustration as the home page */}
                <div className="w-[96px] md:w-[110px] shrink-0 flex flex-col items-center text-center self-center">
                  <div className="w-full aspect-[3/4] rounded-t-full bg-white overflow-hidden ring-1 ring-[#C5A358]/40">
                    {FACE_SHAPE_IMAGES[last.face_shape] ? (
                      <img src={FACE_SHAPE_IMAGES[last.face_shape]} alt={last.face_shape} className="w-full h-full object-contain p-2 pt-4" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#C0B8B4]"><User size={20} /></div>
                    )}
                  </div>
                  <p className="text-[8px] tracking-[0.3em] uppercase text-[#9A8A90] mt-2.5">รูปหน้า</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-lg leading-tight text-[#2B2226]">{last.face_shape || "—"}</p>
                </div>
              </div>

              {/* Beauty profile list */}
              <div className="rounded-2xl bg-white border border-[#F0E6E9] p-6 md:p-7 shadow-[0_10px_40px_rgba(43,34,38,0.04)]">
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#9A8A90] mb-3">Beauty Profile</p>
                <dl className="divide-y divide-[#F3EBEE]">
                  {[
                    { label: "ทรงหน้า", val: FACE_TYPE_LABELS_TH[last.face_shape] || last.face_shape || "—" },
                    { label: "โทนผิว", val: last.skin_tone || "—" },
                    { label: "คิ้ว", val: pretty(last.eyebrows, "brows") },
                    { label: "ดวงตา", val: pretty(last.eyes, "eyes") },
                    { label: "จมูก", val: pretty(last.nose, "nose") },
                    { label: "ริมฝีปาก", val: pretty(last.lips, "lips") },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center justify-between gap-4 py-3">
                      <dt className="text-[11px] text-[#9A8A90] font-[300]">{f.label}</dt>
                      <dd className="text-[12px] font-[500] text-[#2B2226] text-right truncate">{f.val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ) : (
            <EmptyState icon={<Sparkles size={18} />} msg="ยังไม่มีผลการวิเคราะห์">
              <Link to="/analysis" className="mt-5 inline-block rounded-full bg-[#D23669] hover:bg-[#B92D5B] text-white px-7 py-3 text-[9px] font-[600] uppercase tracking-[0.25em] transition-colors">เริ่มวิเคราะห์</Link>
            </EmptyState>
          )}
        </section>

        {/* --- COUPONS --- */}
        <section className="mt-16">
          <SectionHeader no="02" eyebrow="Privileges" title="My" accent="Coupons" linkTo="/coupons" linkLabel="ดูทั้งหมด" />

          {promos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {promos.map((p, i) => {
                const isCopied = copiedId === p.promotion_id;
                return (
                  <div key={p.promotion_id} data-aos="fade-up" data-aos-delay={i * 60}
                    className="relative flex rounded-2xl bg-white border border-[#F0E6E9] shadow-[0_10px_30px_rgba(43,34,38,0.05)] hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(210,54,105,0.12)] transition-all duration-300">
                    {/* Ticket stub */}
                    <div className="w-[78px] shrink-0 rounded-l-2xl bg-gradient-to-b from-[#D23669] to-[#E8668F] text-white flex flex-col items-center justify-center">
                      {Number(p.discount_percent) > 0 ? (
                        <>
                          <span className="font-['Cormorant_Garamond',serif] text-[1.9rem] leading-none [font-variant-numeric:lining-nums]">{p.discount_percent}%</span>
                          <span className="text-[7px] tracking-[0.3em] uppercase mt-1 opacity-80">Off</span>
                        </>
                      ) : (
                        <Tag size={18} />
                      )}
                    </div>
                    {/* Perforation */}
                    <div className="relative w-0 border-l border-dashed border-[#EADBDF]">
                      <span className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-[#FDFCFB] border border-[#F0E6E9]" />
                      <span className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-[#FDFCFB] border border-[#F0E6E9]" />
                    </div>

                    <div className="flex-1 min-w-0 p-4 flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {p.brand_logo && <img src={imgUrl(p.brand_logo)} alt={p.brand_name} className="w-5 h-5 object-contain rounded-full" />}
                        <p className="text-[8px] tracking-[0.3em] uppercase text-[#C5A358] font-[500] truncate">{p.brand_name || "Aura"}</p>
                      </div>
                      <p className="text-[12px] font-[500] text-[#2B2226] leading-snug line-clamp-2">{p.promo_name || p.title}</p>
                      <div className="flex items-center justify-between gap-2 mt-auto">
                        <code className="font-mono text-[12px] font-[600] tracking-[0.15em] text-[#2B2226] truncate">{p.coupon_code}</code>
                        <button onClick={() => handleCopy(p.promotion_id, p.coupon_code)} aria-label="คัดลอกโค้ด"
                          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isCopied ? "bg-[#D23669] text-white" : "bg-[#FBF2F4] text-[#D23669] hover:bg-[#D23669] hover:text-white"}`}>
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                      {p.end_date && (
                        <p className="text-[8px] text-[#9A8A90] tracking-[0.2em] uppercase font-[300]">
                          ใช้ได้ถึง {new Date(p.end_date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<Tag size={18} />} msg="ยังไม่มีคูปองที่ใช้ได้">
              <OutlineLink to="/coupons">คูปองทั้งหมด</OutlineLink>
            </EmptyState>
          )}
        </section>

        {/* --- SAVED LOOKS --- */}
        <section className="mt-16">
          <SectionHeader no="03" eyebrow="Curated Style" title="Saved" accent="Looks" linkTo="/looks" linkLabel="ดูทั้งหมด" />
          {likedLooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {likedLooks.slice(0, 4).map((f, i) => (
                <LookCard key={f.id} item={f} delay={i * 60} tag={SEASON_LABELS_TH[f.season] || f.season} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<Heart size={18} />} msg="ยังไม่มีลุคที่ถูกใจ">
              <OutlineLink to="/looks">ดูลุคทั้งหมด</OutlineLink>
            </EmptyState>
          )}
        </section>

        {/* --- SAVED TRENDS --- */}
        {likedTrends.length > 0 && (
          <section className="mt-16">
            <SectionHeader no="04" eyebrow="Trending" title="Saved" accent="Trends" linkTo="/looks" linkLabel="ดูทั้งหมด" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {likedTrends.slice(0, 4).map((f, i) => (
                <Link to="/looks" key={f.id} className="block">
                  <LookCard item={f} delay={i * 60} tag="เทรนด์" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* --- SAVED PRODUCTS --- */}
        <section className="mt-16">
          <SectionHeader no={likedTrends.length > 0 ? "05" : "04"} eyebrow="Wishlist" title="Saved" accent="Products" linkTo="/cosmetics" linkLabel="ดูทั้งหมด" />
          {likedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {likedProducts.slice(0, 4).map((f, i) => (
                <Link to="/cosmetics" key={f.id} data-aos="fade-up" data-aos-delay={i * 60} className="group block">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#FBF2F4] to-[#F6EEE9]">
                    <img src={imgUrl(f.img || f.image_url)} alt={f.title} loading="lazy" decoding="async"
                      className="w-full h-full object-contain p-6 mix-blend-multiply group-hover:scale-[1.06] transition-transform duration-700"
                      onError={e => { e.target.src = "/assets/home2.webp"; }} />
                    <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                      <Heart size={12} className="fill-[#D23669] text-[#D23669]" />
                    </span>
                  </div>
                  <div className="pt-3 px-1">
                    {f.category && <p className="text-[8px] tracking-[0.25em] uppercase text-[#C5A358] font-[500]">{f.category}</p>}
                    <h5 className="text-[12px] font-[500] text-[#2B2226] leading-snug truncate group-hover:text-[#D23669] transition-colors">{f.title}</h5>
                    {f.price && <p className="text-[11px] text-[#9A8A90] mt-0.5">฿{parseFloat(f.price).toLocaleString()}</p>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Heart size={18} />} msg="ยังไม่มีสินค้าที่ถูกใจ">
              <OutlineLink to="/cosmetics">สินค้าทั้งหมด</OutlineLink>
            </EmptyState>
          )}
        </section>

        {/* --- QUICK LINKS --- */}
        <section className="mt-16 flex flex-wrap justify-center gap-3" data-aos="fade-up">
          {[
            { to: "/history", label: "ประวัติการวิเคราะห์", sub: history.length },
            { to: "/coupons", label: "คูปองทั้งหมด", sub: promos.length },
            { to: "/cosmetics", label: "ร้านค้า", sub: likedProducts.length },
          ].map((item) => (
            <Link key={item.to} to={item.to}
              className="group inline-flex items-center gap-3 rounded-full bg-white border border-[#F0E6E9] pl-5 pr-2 py-2 hover:border-[#D23669] transition-colors">
              <span className="text-[10px] font-[500] uppercase tracking-[0.2em] text-[#2B2226] group-hover:text-[#D23669] transition-colors">{item.label}</span>
              <span className="min-w-7 h-7 px-2 rounded-full bg-[#FBF2F4] text-[#D23669] text-[11px] flex items-center justify-center">{item.sub}</span>
            </Link>
          ))}
        </section>
      </div>

      {/* ── Edit Modal ── */}
      <EditModal open={openEdit} onClose={() => setOpenEdit(false)} me={me} onSaved={setMe} />
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
// Editorial section header: gold index number, eyebrow, serif title with italic accent
function SectionHeader({ no, eyebrow, title, accent, linkTo, linkLabel }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6" data-aos="fade-up">
      <div className="flex items-end gap-4">
        <span className="font-['Cormorant_Garamond',serif] italic text-[2.2rem] leading-none text-[#C5A358]/70">{no}</span>
        <div>
          <p className="text-[9px] tracking-[0.35em] uppercase text-[#9A8A90] mb-1">{eyebrow}</p>
          <h2 className="font-['Cormorant_Garamond',serif] text-[1.9rem] md:text-[2.2rem] leading-none text-[#2B2226]">
            {title} <span className="italic text-[#D23669]">{accent}</span>
          </h2>
        </div>
      </div>
      {linkTo && (
        <Link to={linkTo}
          className="shrink-0 text-[9px] tracking-[0.2em] uppercase text-[#2B2226] border-b border-[#2B2226]/40 pb-0.5 hover:text-[#D23669] hover:border-[#D23669] transition-colors">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

// Arch-framed look card (echoes the hero portrait)
function LookCard({ item, delay, tag }) {
  return (
    <div data-aos="fade-up" data-aos-delay={delay} className="group cursor-pointer">
      <div className="relative aspect-[3/4] rounded-t-full overflow-hidden bg-[#F5EEF0] shadow-[0_10px_30px_rgba(43,34,38,0.08)]">
        <img src={imgUrl(item.img || item.image_url)} alt={item.title} loading="lazy" decoding="async"
          className="w-full h-full object-cover object-top group-hover:scale-[1.06] transition-transform duration-700"
          onError={e => { e.target.src = "/assets/home2.webp"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B2226]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="pt-3 text-center">
        {tag && <p className="text-[8px] tracking-[0.3em] uppercase text-[#C5A358] font-[500]">{tag}</p>}
        <h4 className="font-['Cormorant_Garamond',serif] italic text-[1.05rem] text-[#2B2226] truncate group-hover:text-[#D23669] transition-colors">{item.title}</h4>
      </div>
    </div>
  );
}

function OutlineLink({ to, children }) {
  return (
    <Link to={to}
      className="mt-5 inline-block rounded-full border border-[#2B2226]/25 px-6 py-2.5 text-[9px] tracking-[0.25em] uppercase font-[500] text-[#2B2226] hover:border-[#D23669] hover:text-[#D23669] transition-colors">
      {children}
    </Link>
  );
}

function EmptyState({ icon, msg, children }) {
  return (
    <div className="text-center py-10 rounded-2xl bg-white border border-dashed border-[#EADBDF]" data-aos="fade-up">
      <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-[#FBF2F4] flex items-center justify-center text-[#D23669]">{icon}</div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-[#9A8A90] font-[300]">{msg}</p>
      {children}
    </div>
  );
}

// ── Edit Profile Modal ─────────────────────────────────────────────────────────
function EditModal({ open, onClose, me, onSaved }) {
  const [preview,  setPreview]  = useState("");
  const [username, setUsername] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setPreview(me?.photoURL || me?.avatar || "");
      setUsername(me?.name || me?.username || "");
      setErr("");
    }
  }, [open, me]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    try {
      const form = new FormData();
      form.append("avatar", file);
      const res = await apiClient.post("/api/upload/avatar", form, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data?.avatar_url) setPreview(res.data.avatar_url);
    } catch {}
  };

  const onSave = async () => {
    setSaving(true); setErr("");
    try {
      const payload = {};
      const trimmed = username.trim();
      if (trimmed) payload.username = trimmed;
      if (preview) payload.avatar = preview;
      const res = await apiClient.put("/api/user/me", payload);
      const updated = res.data?.user || {};
      const next = {
        ...me,
        name: updated.username || trimmed || me?.name,
        username: updated.username || trimmed || me?.username,
        photoURL: updated.avatar || preview || me?.photoURL,
        avatar: updated.avatar || preview || me?.avatar,
      };
      localStorage.setItem("auramatch:user", JSON.stringify(next));
      window.dispatchEvent(new Event("auth:changed"));
      onSaved?.(next);
      onClose();
    } catch { setErr("บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"); }
    finally { setSaving(false); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 bg-white max-w-sm w-full p-8 md:p-10 space-y-7">
        <button onClick={onClose} aria-label="ปิด"
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-black/30 hover:bg-black text-white transition-colors duration-200">
          <X size={16} />
        </button>

        <div>
          <p className="text-[9px] tracking-[0.35em] uppercase text-[#aaa] font-[300] mb-3">Account</p>
          <h3 className="text-[1.8rem] font-[200] text-[#1A1A1A] leading-[1.05]">แก้ไข <span className="font-[700] italic">โปรไฟล์</span></h3>
        </div>

        <div className="flex justify-center">
          <button type="button" className="relative group" onClick={() => fileRef.current?.click()} aria-label="เลือกรูปโปรไฟล์">
            <span className="block w-24 h-24 rounded-full overflow-hidden border border-[#E8E0DC]">
              {preview ? (
                <img src={imgUrl(preview)} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full bg-[#D23669] flex items-center justify-center text-white text-4xl font-[200]">
                  {(me?.name?.[0] || "U").toUpperCase()}
                </span>
              )}
            </span>
            <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </span>
          </button>
        </div>

        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />

        <div>
          <label className="block text-[9px] tracking-[0.35em] uppercase text-[#888] font-[300] mb-2">ชื่อที่แสดง</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="ชื่อที่แสดง"
            className="border-b border-[#E8E0DC] px-0 py-3 text-sm w-full focus:outline-none focus:border-[#1A1A1A] transition-all"
          />
        </div>

        {err && <p className="text-xs text-red-500">{err}</p>}

        <div className="flex gap-3 pt-2 border-t border-[#E8E0DC]">
          <button onClick={onClose} disabled={saving}
            className="flex-1 border border-[#1A1A1A] text-[#1A1A1A] py-3.5 text-[10px] font-[400] uppercase tracking-[0.2em] hover:bg-[#1A1A1A] hover:text-white transition-all mt-4">
            ยกเลิก
          </button>
          <button onClick={onSave} disabled={saving}
            className="flex-1 bg-[#1A1A1A] text-white py-3.5 text-[10px] font-[400] uppercase tracking-[0.2em] hover:bg-[#D23669] transition-colors duration-200 disabled:opacity-50 mt-4">
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}
