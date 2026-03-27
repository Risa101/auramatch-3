import React, { useEffect, useRef, useState, useCallback } from "react";
import { lsGet } from "../utils/storage";
import { subscribeLikes } from "../utils/likes";
import { Link, useNavigate } from "react-router-dom";
import {
  Edit3, Plus, Copy, Check, Sparkles, Zap, Camera,
  History, Tag, Heart, ChevronRight, Star, Clock, User
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

const SEASON_LABEL = { Spring: "Spring", Summer: "Summer", Autumn: "Autumn", Winter: "Winter" };

export default function AccountProfile() {
  const [favs, setFavs]         = useState([]);
  const likedLooks    = favs.filter(f => f.type === "look" || !f.type);
  const likedProducts = favs.filter(f => f.type === "product");
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
    <div className="min-h-screen bg-[#F8F4F5] text-[#3A3437] antialiased pb-24">

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-[#1A0D12] via-[#2D1020] to-[#1A0D12] pt-28 pb-10">
        <div className="max-w-5xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Avatar */}
          <div className="relative shrink-0 cursor-pointer group" onClick={() => setOpenEdit(true)}>
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-white/15 shadow-2xl">
              {(me?.photoURL || me?.avatar) ? (
                <img src={me.photoURL || me.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#D23669] to-[#FF85A2] flex items-center justify-center text-white text-5xl font-black">
                  {(me?.name?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={22} className="text-white" />
            </div>
          </div>

          {/* Name */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[9px] font-black tracking-[0.35em] uppercase text-[#FF85A2] mb-1">Aura Member</p>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">{me?.name || "Guest"}</h1>
            <p className="mt-1.5 text-sm text-white/40 font-medium">{me?.email || ""}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setOpenEdit(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 bg-white/5 text-white text-xs font-semibold hover:bg-white/10 transition-all">
              <Edit3 size={13} /> Edit
            </button>
            <Link to="/analysis"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#D23669] text-white text-xs font-semibold hover:bg-[#FF85A2] transition-all">
              <Zap size={13} fill="currentColor" /> Re-Analyze
            </Link>
          </div>
        </div>

        {/* Stat pills */}
        <div className="max-w-5xl mx-auto px-5 md:px-8 mt-6 flex gap-3 overflow-x-auto no-scrollbar">
          {[
            { icon: <Star size={13}/>, label: "Analyses", value: history.length },
            { icon: <Heart size={13}/>, label: "Favorites", value: likedLooks.length + likedProducts.length },
            { icon: <Tag size={13}/>, label: "Coupons", value: promos.length },
            { icon: <Clock size={13}/>, label: "Last Scan", value: last ? new Date(last.analysis_date || last.created_at).toLocaleDateString("th-TH", { day:"numeric", month:"short" }) : "—" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-2xl px-4 py-2.5 whitespace-nowrap flex-shrink-0">
              <span className="text-[#FF85A2]">{s.icon}</span>
              <div>
                <p className="text-[9px] text-white/40 font-semibold uppercase tracking-widest">{s.label}</p>
                <p className="text-sm font-black text-white leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* ── ROW 1: My Aura + Beauty Profile ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* My Aura — season + palette */}
          <div className="bg-white rounded-3xl border border-[#EDE0E5] shadow-sm p-6">
            <SectionLabel>My Aura Type</SectionLabel>
            {last?.season ? (
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-3xl font-black text-[#D23669] tracking-tight leading-none">{last.season}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{SEASON_LABEL[last.season] || last.season}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {(palette?.colors || []).map((c, i) => (
                      <div key={i} className="w-8 h-8 rounded-xl shadow-sm border border-white/60" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                {palette?.desc && (
                  <p className="text-xs text-gray-500 bg-[#FFF8FA] rounded-2xl px-4 py-3 border border-[#F5E8EC] leading-relaxed">{palette.desc}</p>
                )}
                <Link to="/history" className="flex items-center justify-between group">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#D23669] transition-colors">View all analysis history</span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-[#D23669] transition-colors" />
                </Link>
              </div>
            ) : (
              <EmptyState icon={<Sparkles size={22}/>} msg="No analysis results yet">
                <Link to="/analysis" className="mt-3 inline-block bg-[#D23669] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#FF85A2] transition-all">Start Analysis</Link>
              </EmptyState>
            )}
          </div>

          {/* Beauty Profile — face + features */}
          <div className="bg-white rounded-3xl border border-[#EDE0E5] shadow-sm p-6">
            <SectionLabel>Beauty Profile</SectionLabel>
            {last ? (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center py-2.5 border-b border-[#F5EEF0]">
                  <span className="text-xs font-semibold text-gray-400">Face Shape</span>
                  <span className="text-sm font-black text-[#3A3437] uppercase">{last.face_shape || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-[#F5EEF0]">
                  <span className="text-xs font-semibold text-gray-400">Skin Tone</span>
                  <span className="text-sm font-black text-[#3A3437]">{last.skin_tone || "—"}</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {[
                    { key: "brows", label: "Eyebrows", val: last.eyebrows },
                    { key: "eyes", label: "Eyes", val: last.eyes },
                    { key: "nose", label: "Nose", val: last.nose },
                    { key: "lips", label: "Lips", val: last.lips },
                  ].map((f) => (
                    <div key={f.key} className="bg-[#FFF8FA] rounded-2xl px-3.5 py-3 border border-[#F5E8EC]">
                      <p className="text-[9px] font-black text-[#D23669] uppercase tracking-widest mb-1">{f.label}</p>
                      <p className="text-[11px] font-bold text-[#3A3437] leading-tight">{pretty(f.val, f.key)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState icon={<User size={22}/>} msg="No Beauty Profile data yet" />
            )}
          </div>
        </div>

        {/* ── ROW 2: Coupons ── */}
        <div className="bg-white rounded-3xl border border-[#EDE0E5] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>My Discount Coupons</SectionLabel>
            <Link to="/coupons" className="text-[10px] font-black uppercase tracking-widest text-[#D23669] hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>

          {promos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {promos.map((p) => {
                const isCopied = copiedId === p.promotion_id;
                return (
                  <div key={p.promotion_id} className="border border-dashed border-[#EEDDE4] rounded-2xl p-4 bg-[#FFF8FA] flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      {p.brand_logo ? (
                        <img src={imgUrl(p.brand_logo)} alt={p.brand_name} className="w-8 h-8 object-contain rounded-xl bg-white p-1 border border-[#EEDDE4]" />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-[#D23669]/10 flex items-center justify-center">
                          <Tag size={14} className="text-[#D23669]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-[#D23669] uppercase truncate">{p.brand_name || "Aura"}</p>
                        <p className="text-[9px] text-gray-400 truncate">{p.promo_name || p.title}</p>
                      </div>
                      {Number(p.discount_percent) > 0 && (
                        <span className="text-xs font-black text-[#D23669] bg-white border border-[#EEDDE4] px-2 py-0.5 rounded-full whitespace-nowrap">-{p.discount_percent}%</span>
                      )}
                    </div>
                    <div className="bg-white border border-[#EEDDE4] rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                      <code className="text-sm font-black tracking-widest text-[#D23669] font-mono truncate">{p.coupon_code}</code>
                      <button onClick={() => handleCopy(p.promotion_id, p.coupon_code)}
                        className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${isCopied ? "bg-green-500 text-white" : "bg-[#FFF0F5] text-[#D23669] hover:bg-[#D23669] hover:text-white"}`}>
                        {isCopied ? <Check size={13}/> : <Copy size={13}/>}
                      </button>
                    </div>
                    {p.end_date && (
                      <p className="text-[9px] text-gray-400 text-right">
                        Expires {new Date(p.end_date).toLocaleDateString("en-US", { day:"numeric", month:"short", year:"2-digit" })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<Tag size={22}/>} msg="No available coupons yet">
              <Link to="/coupons" className="mt-3 inline-block border border-[#D23669] text-[#D23669] text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#D23669] hover:text-white transition-all">All Coupons</Link>
            </EmptyState>
          )}
        </div>

        {/* ── ROW 3: Liked Looks ── */}
        <div className="bg-white rounded-3xl border border-[#EDE0E5] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>Liked Looks</SectionLabel>
            <Link to="/looks" className="text-[10px] font-black uppercase tracking-widest text-[#D23669] hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>

          {likedLooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {likedLooks.slice(0, 4).map((f) => (
                <div key={f.id} className="group cursor-pointer">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#FFF5F8] border border-[#EDE0E5] relative shadow-sm group-hover:shadow-lg transition-all duration-300">
                    <img
                      src={imgUrl(f.img || f.image_url)}
                      alt={f.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = "/assets/home2.webp"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {f.season && (
                      <span className="absolute top-2.5 left-2.5 bg-[#D23669] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                        {f.season}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#3A3437] truncate leading-tight">{f.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Heart size={22}/>} msg="No liked looks yet">
              <Link to="/looks" className="mt-3 inline-block border border-[#D23669] text-[#D23669] text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#D23669] hover:text-white transition-all">View All Looks</Link>
            </EmptyState>
          )}
        </div>

        {/* ── ROW 3b: Liked Products ── */}
        <div className="bg-white rounded-3xl border border-[#EDE0E5] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>Liked Products</SectionLabel>
            <Link to="/cosmetics" className="text-[10px] font-black uppercase tracking-widest text-[#D23669] hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>

          {likedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {likedProducts.slice(0, 4).map((f) => (
                <div key={f.id} className="group cursor-pointer">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-[#FFF5F8] border border-[#EDE0E5] relative shadow-sm group-hover:shadow-lg transition-all duration-300">
                    <img
                      src={imgUrl(f.img || f.image_url)}
                      alt={f.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = "/assets/home2.webp"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {f.category && (
                      <span className="absolute top-2.5 left-2.5 bg-[#D23669] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                        {f.category}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#3A3437] truncate leading-tight">{f.title}</p>
                  {f.price && <p className="text-xs font-black text-[#D23669]">฿{parseFloat(f.price).toLocaleString()}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Heart size={22}/>} msg="No liked products yet">
              <Link to="/cosmetics" className="mt-3 inline-block border border-[#D23669] text-[#D23669] text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#D23669] hover:text-white transition-all">All Products</Link>
            </EmptyState>
          )}
        </div>

        {/* ── ROW 4: Quick Links ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: "/history", icon: <History size={18}/>, label: "Analysis History", sub: `${history.length} times`, color: "text-purple-600", bg: "bg-purple-50" },
            { to: "/coupons", icon: <Tag size={18}/>, label: "All Coupons", sub: `${promos.length} available`, color: "text-[#D23669]", bg: "bg-rose-50" },
            { to: "/cosmetics", icon: <Sparkles size={18}/>, label: "All Products", sub: `${likedProducts.length} liked`, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((item) => (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-4 bg-white rounded-2xl border border-[#EDE0E5] px-5 py-4 hover:shadow-md hover:border-[#D23669]/30 transition-all group">
              <div className={`w-10 h-10 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} flex-shrink-0`}>{item.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#3A3437] leading-tight">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </div>
              <ChevronRight size={15} className="text-gray-300 group-hover:text-[#D23669] transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>

      </div>

      {/* ── Edit Modal ── */}
      <EditModal open={openEdit} onClose={() => setOpenEdit(false)} me={me} onSaved={setMe} />

      <style>{`.no-scrollbar::-webkit-scrollbar { display:none; }`}</style>
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D23669]">{children}</p>;
}

function EmptyState({ icon, msg, children }) {
  return (
    <div className="text-center py-10">
      <div className="w-12 h-12 mx-auto bg-[#FFF0F5] rounded-2xl flex items-center justify-center text-[#D23669] mb-3">{icon}</div>
      <p className="text-sm font-semibold text-gray-400">{msg}</p>
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#EDE0E5] p-7 shadow-2xl space-y-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#D23669]">Account</p>
          <h3 className="text-2xl font-black text-[#3A3437] tracking-tight mt-0.5">Edit Profile</h3>
        </div>

        {/* Avatar picker */}
        <div className="flex justify-center">
          <div className="relative cursor-pointer group" onClick={() => fileRef.current?.click()}>
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#EDE0E5] shadow">
              {preview ? (
                <img src={imgUrl(preview)} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#D23669] to-[#FF85A2] flex items-center justify-center text-white text-4xl font-black">
                  {(me?.name?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
          </div>
        </div>

        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500">Display Name</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Display Name"
            className="w-full border border-[#EDE0E5] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#D23669] focus:ring-2 focus:ring-[#D23669]/20 transition-all"
          />
        </div>

        {err && <p className="text-xs text-red-500 font-semibold">{err}</p>}

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 border border-[#EDE0E5] rounded-full text-xs font-semibold text-gray-500 hover:border-[#D23669] hover:text-[#D23669] transition-all">
            Cancel
          </button>
          <button onClick={onSave} disabled={saving}
            className="flex-1 py-2.5 bg-[#D23669] text-white rounded-full text-xs font-semibold hover:bg-[#BD2D5D] transition-all disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
