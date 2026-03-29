import React, { useEffect, useRef, useState, useCallback } from "react";
import { lsGet } from "../utils/storage";
import { subscribeLikes } from "../utils/likes";
import { Link, useNavigate } from "react-router-dom";
import {
  Edit3, Plus, Copy, Check, Sparkles, Zap, Camera,
  History, Tag, Heart, ChevronRight, Star, Clock, User, ArrowRight
} from "lucide-react";
import { getAnalysisHistory, getPromotions, getdataBrands } from "../callapi/call_api_user";
import { PERSONAL_COLORS } from "../data/personalColors";
import apiClient from "../api/client";
import { imgUrl } from "../utils/imgUrl";

const FEATURE_MAP = {
  brows: { softArch: "Soft Arch", straight: "Straight", arched: "High Arch" },
  eyes: { natural: "Natural Gradient", cat: "Cat-Eye Lift", dolly: "Dolly Eye" },
  nose: { softContour: "Soft Contour", definedContour: "Defined Contour", natural: "Natural" },
  lips: { gradient: "Gradient Lip", full: "Full Bold", soft: "Soft Blur" },
};
const pretty = (val, group) => (FEATURE_MAP[group] || {})[val] || val || "—";

const SEASON_ACCENT = {
  Spring:  { border: "#FF85A2", bg: "#FFF5F8", text: "#D23669", gradient: "from-[#FFE4EE] to-[#FFF5F8]" },
  Summer:  { border: "#93C5FD", bg: "#EFF6FF", text: "#3B82F6", gradient: "from-[#DBEAFE] to-[#EFF6FF]" },
  Autumn:  { border: "#FDBA74", bg: "#FFF7ED", text: "#EA580C", gradient: "from-[#FED7AA] to-[#FFF7ED]" },
  Winter:  { border: "#C4B5FD", bg: "#F5F3FF", text: "#7C3AED", gradient: "from-[#DDD6FE] to-[#F5F3FF]" },
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
  const seasonAccent = SEASON_ACCENT[last?.season] || null;

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

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] antialiased pb-24">

      {/* ── HERO ── */}
      <div className="relative bg-white border-b border-[#E8E0DC] mt-[60px] lg:mt-[180px] overflow-hidden">
        {/* Season palette strip at top of hero */}
        {palette?.colors && (
          <div className="flex h-1">
            {palette.colors.map((c, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: c }} />
            ))}
          </div>
        )}

        <div className="max-w-5xl mx-auto px-5 md:px-8 pt-12 pb-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">

            {/* Avatar */}
            <div className="relative shrink-0 cursor-pointer group" onClick={() => setOpenEdit(true)}>
              <div className="w-28 h-28 overflow-hidden border-2" style={{ borderColor: seasonAccent?.border || "#E8E0DC" }}>
                {(me?.photoURL || me?.avatar) ? (
                  <img src={me.photoURL || me.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#D23669] to-[#FF85A2] flex items-center justify-center text-white text-5xl font-black">
                    {(me?.name?.[0] || "U").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-[#1A1A1A]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={20} className="text-white" />
              </div>
            </div>

            {/* Name + season */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-[9px] tracking-[0.5em] uppercase text-[#888] font-[300] mb-2">Aura Member</p>
              <h1 className="text-4xl md:text-6xl font-[200] text-[#1A1A1A] leading-none mb-3">
                {(() => {
                  const parts = (me?.name || "Guest").split(" ");
                  if (parts.length === 1) return <span className="font-[700] italic">{parts[0]}</span>;
                  return <>{parts.slice(0, -1).join(" ")} <span className="font-[700] italic">{parts[parts.length - 1]}</span></>;
                })()}
              </h1>
              <p className="text-[11px] tracking-[0.25em] text-[#888] font-[300] mb-4">{me?.email || ""}</p>

              {/* Season badge */}
              {last?.season && (
                <div className="inline-flex items-center gap-2" style={{ color: seasonAccent?.text || "#888" }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seasonAccent?.border || "#E8E0DC" }} />
                  <span className="text-[10px] tracking-[0.4em] uppercase font-[500]">{last.season} Type</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <button onClick={() => setOpenEdit(true)}
                className="flex items-center justify-center gap-2 border border-[#E8E0DC] text-[#1A1A1A] text-[10px] font-[500] uppercase tracking-[0.2em] px-6 py-2.5 hover:bg-[#D23669] hover:text-white hover:border-[#D23669] transition-all">
                <Edit3 size={12} /> Edit Profile
              </button>
              <Link to="/analysis"
                className="flex items-center justify-center gap-2 bg-[#D23669] text-white text-[10px] font-[600] uppercase tracking-[0.2em] px-6 py-2.5 hover:bg-[#FF85A2] transition-all">
                <Zap size={12} fill="currentColor" /> New Analysis
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="border-t border-[#E8E0DC] pt-6 mt-8 grid grid-cols-4 gap-6">
            {[
              { label: "Analyses", value: history.length },
              { label: "Favorites", value: likedLooks.length + likedProducts.length + likedTrends.length },
              { label: "Coupons", value: promos.length },
              { label: "Last Scan", value: last ? new Date(last.analysis_date || last.created_at).toLocaleDateString("en-US", { day:"numeric", month:"short" }) : "—" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-[200] text-[#1A1A1A] leading-none">{s.value}</p>
                <p className="text-[8px] tracking-[0.35em] uppercase text-[#888] mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-14 space-y-16">

        {/* ── My Aura ── */}
        <section>
          <SectionHeader label="personal color" title="My Aura Type" linkTo="/history" linkLabel="View History →" />

          {last?.season ? (
            <div className={`bg-gradient-to-br ${seasonAccent?.gradient || "from-[#F7F4F2] to-white"} border border-[#E8E0DC]`}>
              <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  {/* Season name */}
                  <div className="flex-1">
                    <p className="text-[9px] tracking-[0.45em] uppercase mb-2" style={{ color: seasonAccent?.text || "#888" }}>Your Season</p>
                    <p className="text-6xl md:text-8xl font-[200] text-[#1A1A1A] leading-none italic">{last.season}</p>
                    {palette?.desc && (
                      <p className="text-[13px] text-[#555] leading-relaxed mt-4 max-w-xs font-[300]">{palette.desc}</p>
                    )}
                  </div>

                  {/* Palette swatches */}
                  <div className="flex flex-col gap-3">
                    <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300]">Your Palette</p>
                    <div className="flex gap-2">
                      {(palette?.colors || []).map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                          <div className="w-10 h-10 md:w-12 md:h-12 shadow-sm" style={{ backgroundColor: c }} />
                          <span className="text-[7px] font-mono text-[#888] uppercase">{c}</span>
                        </div>
                      ))}
                    </div>
                    {last.face_shape && (
                      <div className="mt-2 border-t border-[#E8E0DC] pt-3">
                        <span className="text-[9px] tracking-[0.3em] uppercase text-[#888]">Face · </span>
                        <span className="text-[9px] tracking-[0.3em] uppercase font-[600] text-[#1A1A1A]">{last.face_shape}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState icon={<Sparkles size={22}/>} msg="No analysis results yet">
              <Link to="/analysis" className="mt-4 inline-block bg-[#D23669] text-white px-8 py-3 text-[10px] font-[600] uppercase tracking-[0.25em] hover:bg-[#FF85A2] transition-all">Start Analysis</Link>
            </EmptyState>
          )}
        </section>

        {/* ── Beauty Profile ── */}
        <section>
          <SectionHeader label="analysis results" title="Beauty Profile" />

          {last ? (
            <div className="border border-[#E8E0DC] bg-white">
              <div className="grid grid-cols-2 border-b border-[#E8E0DC]">
                <div className="p-5 border-r border-[#E8E0DC]">
                  <p className="text-[9px] tracking-[0.35em] uppercase text-[#888] font-[300] mb-1.5">Face Shape</p>
                  <p className="text-xl font-[600] text-[#1A1A1A] uppercase">{last.face_shape || "—"}</p>
                </div>
                <div className="p-5">
                  <p className="text-[9px] tracking-[0.35em] uppercase text-[#888] font-[300] mb-1.5">Skin Tone</p>
                  <p className="text-xl font-[600] text-[#1A1A1A]">{last.skin_tone || "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4">
                {[
                  { key: "brows", label: "Eyebrows", val: last.eyebrows },
                  { key: "eyes", label: "Eyes", val: last.eyes },
                  { key: "nose", label: "Nose", val: last.nose },
                  { key: "lips", label: "Lips", val: last.lips },
                ].map((f, i) => (
                  <div key={f.key} className={`p-5 ${i < 3 ? "border-r border-[#E8E0DC]" : ""}`}>
                    <p className="text-[9px] tracking-[0.35em] uppercase text-[#888] font-[300] mb-1.5">{f.label}</p>
                    <p className="text-sm font-[600] text-[#1A1A1A]">{pretty(f.val, f.key)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState icon={<User size={22}/>} msg="No Beauty Profile data yet" />
          )}
        </section>

        {/* ── Coupons ── */}
        <section>
          <SectionHeader label="exclusive offers" title="My Coupons" linkTo="/coupons" linkLabel="View All →" />

          {promos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {promos.map((p) => {
                const isCopied = copiedId === p.promotion_id;
                return (
                  <div key={p.promotion_id} className="border border-[#E8E0DC] bg-white p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      {p.brand_logo ? (
                        <img src={imgUrl(p.brand_logo)} alt={p.brand_name} className="w-10 h-10 object-contain border border-[#E8E0DC] p-1.5" />
                      ) : (
                        <div className="w-10 h-10 border border-[#E8E0DC] flex items-center justify-center bg-[#F7F4F2]">
                          <Tag size={14} className="text-[#888]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] tracking-[0.35em] uppercase text-[#888] font-[300] truncate">{p.brand_name || "Aura"}</p>
                        <p className="text-xs font-[500] text-[#1A1A1A] truncate">{p.promo_name || p.title}</p>
                      </div>
                      {Number(p.discount_percent) > 0 && (
                        <span className="text-sm font-[700] text-[#D23669] whitespace-nowrap">−{p.discount_percent}%</span>
                      )}
                    </div>

                    <div className="bg-[#F7F4F2] border border-[#E8E0DC] px-3 py-2.5 flex items-center justify-between gap-2">
                      <code className="font-mono text-base font-[700] text-[#1A1A1A] tracking-widest truncate">{p.coupon_code}</code>
                      <button onClick={() => handleCopy(p.promotion_id, p.coupon_code)}
                        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center transition-all ${isCopied ? "bg-[#D23669] text-white" : "bg-white border border-[#E8E0DC] hover:bg-[#D23669] hover:text-white text-[#1A1A1A]"}`}>
                        {isCopied ? <Check size={13}/> : <Copy size={13}/>}
                      </button>
                    </div>

                    {p.end_date && (
                      <p className="text-[9px] text-[#888] tracking-[0.2em] uppercase">
                        Expires {new Date(p.end_date).toLocaleDateString("en-US", { day:"numeric", month:"short", year:"2-digit" })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<Tag size={22}/>} msg="No available coupons yet">
              <Link to="/coupons" className="mt-4 inline-block border border-[#D23669] text-[#D23669] px-8 py-3 text-[10px] font-[600] uppercase tracking-[0.25em] hover:bg-[#D23669] hover:text-white transition-all">All Coupons</Link>
            </EmptyState>
          )}
        </section>

        {/* ── Liked Looks ── */}
        <section>
          <SectionHeader label="your saves" title="Liked Looks" linkTo="/looks" linkLabel="View All →" />

          {likedLooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {likedLooks.slice(0, 4).map((f) => (
                <div key={f.id} className="group cursor-pointer">
                  <div className="aspect-[3/4] overflow-hidden relative bg-[#F7F4F2]">
                    <img
                      src={imgUrl(f.img || f.image_url)}
                      alt={f.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={e => { e.target.src = "/assets/home2.webp"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {f.season && (
                      <span className="absolute top-2.5 left-2.5 text-[8px] uppercase tracking-[0.2em] bg-[#1A1A1A]/80 backdrop-blur-sm text-white px-2 py-0.5">
                        {f.season}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#555] font-[400] mt-2 truncate">{f.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Heart size={22}/>} msg="No liked looks yet">
              <Link to="/looks" className="mt-4 inline-block border border-[#D23669] text-[#D23669] px-8 py-3 text-[10px] font-[600] uppercase tracking-[0.25em] hover:bg-[#D23669] hover:text-white transition-all">View All Looks</Link>
            </EmptyState>
          )}
        </section>

        {/* ── Saved Trends ── */}
        {likedTrends.length > 0 && (
          <section>
            <SectionHeader label="trending now" title="Saved Trends" linkTo="/looks" linkLabel="View All →" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {likedTrends.slice(0, 4).map((f) => (
                <Link to="/looks" key={f.id} className="group cursor-pointer block">
                  <div className="aspect-[3/4] overflow-hidden relative bg-[#F7F4F2]">
                    <img
                      src={imgUrl(f.img || f.image_url)}
                      alt={f.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      onError={e => { e.target.src = "/assets/home2.webp"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute top-2.5 left-2.5 text-[8px] uppercase tracking-[0.2em] bg-[#D23669]/90 text-white px-2 py-0.5">Trend</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#555] font-[400] mt-2 truncate">{f.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Liked Products ── */}
        <section>
          <SectionHeader label="your wishlist" title="Liked Products" linkTo="/cosmetics" linkLabel="View All →" />

          {likedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {likedProducts.slice(0, 4).map((f) => (
                <div key={f.id} className="group cursor-pointer">
                  <div className="aspect-square overflow-hidden relative bg-[#F7F4F2]">
                    <img
                      src={imgUrl(f.img || f.image_url)}
                      alt={f.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={e => { e.target.src = "/assets/home2.webp"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {f.category && (
                      <span className="absolute top-2.5 left-2.5 text-[8px] uppercase tracking-[0.2em] bg-[#1A1A1A]/80 backdrop-blur-sm text-white px-2 py-0.5">
                        {f.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#555] font-[400] mt-2 truncate">{f.title}</p>
                  {f.price && <p className="text-[11px] font-[600] text-[#1A1A1A] mt-0.5">฿{parseFloat(f.price).toLocaleString()}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Heart size={22}/>} msg="No liked products yet">
              <Link to="/cosmetics" className="mt-4 inline-block border border-[#D23669] text-[#D23669] px-8 py-3 text-[10px] font-[600] uppercase tracking-[0.25em] hover:bg-[#D23669] hover:text-white transition-all">All Products</Link>
            </EmptyState>
          )}
        </section>

        {/* ── Quick Links ── */}
        <section>
          <SectionHeader label="navigate" title="Quick Links" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#E8E0DC]">
            {[
              { to: "/history", icon: <History size={20}/>, label: "Analysis History", sub: `${history.length} scans` },
              { to: "/coupons", icon: <Tag size={20}/>, label: "All Coupons", sub: `${promos.length} available` },
              { to: "/cosmetics", icon: <Sparkles size={20}/>, label: "All Products", sub: `${likedProducts.length} liked` },
            ].map((item) => (
              <Link key={item.to} to={item.to}
                className="bg-white p-7 hover:bg-[#FFF5F8] border-b-2 border-transparent hover:border-[#D23669] transition-all duration-300 group flex flex-col justify-between min-h-[140px]">
                <div className="text-[#888] group-hover:text-[#D23669] transition-colors">{item.icon}</div>
                <div>
                  <p className="text-sm font-[600] text-[#1A1A1A] transition-colors">{item.label}</p>
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#888] mt-1">{item.sub}</p>
                </div>
                <span className="text-lg text-[#888] group-hover:text-[#D23669] transition-all group-hover:translate-x-1 inline-block">→</span>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* ── Edit Modal ── */}
      <EditModal open={openEdit} onClose={() => setOpenEdit(false)} me={me} onSaved={setMe} />
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
function SectionHeader({ label, title, linkTo, linkLabel }) {
  return (
    <div className="flex items-end justify-between mb-6 pb-4 border-b border-[#E8E0DC]">
      <div>
        <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-1">{label}</p>
        <h2 className="text-2xl font-[700] text-[#1A1A1A]">{title}</h2>
      </div>
      {linkTo && (
        <Link to={linkTo} className="text-[10px] tracking-[0.2em] uppercase text-[#888] hover:text-[#D23669] transition-colors flex items-center gap-1">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function EmptyState({ icon, msg, children }) {
  return (
    <div className="text-center py-16 border border-dashed border-[#E8E0DC] bg-white">
      <div className="flex items-center justify-center text-[#C0B8B4] mb-3">{icon}</div>
      <p className="text-[12px] text-[#888] font-[300] uppercase tracking-[0.25em]">{msg}</p>
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
    } catch { setErr("Failed to save. Please try again."); }
    finally { setSaving(false); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border border-[#E8E0DC] max-w-sm w-full p-8 space-y-6 shadow-2xl">
        <div>
          <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-1">Account</p>
          <h3 className="text-2xl font-[200] text-[#1A1A1A]">Edit <span className="font-[700] italic">Profile</span></h3>
        </div>

        <div className="flex justify-center">
          <div className="relative cursor-pointer group" onClick={() => fileRef.current?.click()}>
            <div className="w-24 h-24 overflow-hidden border-2 border-[#E8E0DC]">
              {preview ? (
                <img src={imgUrl(preview)} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#D23669] to-[#FF85A2] flex items-center justify-center text-white text-4xl font-black">
                  {(me?.name?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
          </div>
        </div>

        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />

        <div>
          <label className="block text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-2">Display Name</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Display Name"
            className="border border-[#E8E0DC] px-4 py-3 text-sm w-full focus:outline-none focus:border-[#1A1A1A] transition-all"
          />
        </div>

        {err && <p className="text-xs text-red-500">{err}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} disabled={saving}
            className="flex-1 border border-[#E8E0DC] text-[#888] py-3 text-[10px] font-[500] uppercase tracking-[0.2em] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all">
            Cancel
          </button>
          <button onClick={onSave} disabled={saving}
            className="flex-1 bg-[#D23669] text-white py-3 text-[10px] font-[600] uppercase tracking-[0.2em] hover:bg-[#FF85A2] transition-all disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
