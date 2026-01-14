import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { lsGet, onBus } from "../utils/storage";
import { subscribeLikes } from "../utils/likes";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip
} from "recharts";
import { Link } from "react-router-dom";

/* ---------- 1. Config & Mapping ---------- */
const BASE_PATH = "/AURAMATCH-VER2/";

const MAP = {
  brows: { softArch: "Soft arch", straight: "Straight", arched: "High arch" },
  eyes: { natural: "Natural gradient", cat: "Cat-eye lift", dolly: "Dolly eye" },
  nose: { softContour: "Soft contour", definedContour: "Defined contour", natural: "Natural" },
  lips: { gradient: "Gradient lip", full: "Full bold", soft: "Soft blur" },
};

const pretty = (val, group) => (MAP[group] || {})[val] || val || "-";

/* ---------- 2. Main Component ---------- */
export default function AccountProfile() {
  const [last, setLast] = useState(() => lsGet("auramatch:lastAnalysis", null));
  const [favs, setFavs] = useState([]);
  const [me, setMe] = useState(() => lsGet("auramatch:user", { name: "User", email: "" }));
  const [openEdit, setOpenEdit] = useState(false);
  const [copied, setCopied] = useState(false);

  // ✅ ฟังก์ชันจัดการ Path รูปภาพให้ขึ้นแน่นอน
  const getImageUrl = useCallback((path) => {
    if (!path || path === "null") return "https://images.unsplash.com/photo-1596462502278-27bfac4033c8?q=80&w=1000";
    if (path.startsWith('http')) return path; 
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_PATH}${cleanPath}`;
  }, []);

  // ฟังการอัปเดตข้อมูล
  useEffect(() => {
    const handleUpdate = () => {
      setLast(lsGet("auramatch:lastAnalysis", null));
      setMe(lsGet("auramatch:user", { name: "User", email: "" }));
    };
    window.addEventListener("analysis:updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("analysis:updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // เชื่อมต่อระบบ Likes
  useEffect(() => {
    const unsubscribe = subscribeLikes((data) => {
      setFavs(data);
    });
    return () => unsubscribe();
  }, []);

  const coupon = lsGet("auramatch:coupon", { code: "WELCOME-ATELIER", daysLeft: 7, discount: 10 });
  const trend = [
    { d: "Mon", count: 12 }, { d: "Tue", count: 18 }, { d: "Wed", count: 25 },
    { d: "Thu", count: 22 }, { d: "Fri", count: 35 }, { d: "Sat", count: 48 }, { d: "Sun", count: 40 },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-light pb-20 pt-28 px-6 selection:bg-[#C5A358]/20">
      <div className="mx-auto max-w-6xl space-y-12">
        
        {/* Profile Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
          <div className="flex items-center gap-8">
            <div className="relative group cursor-pointer" onClick={() => setOpenEdit(true)}>
              <div className="h-32 w-32 overflow-hidden rounded-full border border-gray-100 bg-white p-1">
                {me?.avatar ? (
                  <img src={me.avatar} alt="avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <div className="h-full w-full rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-3xl font-serif italic">
                    {(me?.name?.[0] || "U").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] uppercase tracking-widest font-bold">
                Change
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] tracking-[0.5em] font-bold uppercase text-[#C5A358]">Atelier Member</span>
              <h1 className="text-5xl font-serif italic leading-none">{me?.name ?? "User"}</h1>
              <p className="text-xs text-gray-400 tracking-widest uppercase">{me?.email}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => setOpenEdit(true)} className="px-8 py-3 border border-[#1A1A1A] text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#1A1A1A] hover:text-white transition-all">
              Settings
            </button>
            <Link to="/analysis" className="px-8 py-3 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.3em] font-bold border border-[#1A1A1A] hover:bg-transparent hover:text-[#1A1A1A] transition-all">
              Re-Analyze
            </Link>
          </div>
        </header>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-8 border border-gray-100 bg-white space-y-6">
            <h2 className="text-[11px] font-bold tracking-[0.3em] uppercase border-b border-gray-50 pb-4">Beauty Identity</h2>
            {last ? (
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-gray-50 pb-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">Personal Color</span>
                  <span className="font-serif italic text-lg text-[#C5A358]">{last.season}</span>
                </div>
                <div className="flex justify-between items-end border-b border-gray-50 pb-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">Face Shape</span>
                  <span className="text-sm font-bold uppercase tracking-wider">{last.faceShape}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {['brows', 'eyes', 'nose', 'lips'].map(feat => (
                    <div key={feat}>
                      <p className="text-[9px] text-gray-300 uppercase tracking-tighter mb-1">{feat}</p>
                      <p className="text-[11px] font-medium">{pretty(last.face?.[feat], feat)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-xs italic text-gray-400 mb-4">No analysis data yet.</p>
                <Link to="/analysis" className="text-[10px] text-[#C5A358] font-bold border-b border-[#C5A358] pb-1 uppercase tracking-widest">Start Analysis</Link>
              </div>
            )}
          </div>

          <div className="p-8 border border-gray-100 bg-white space-y-6">
            <h2 className="text-[11px] font-bold tracking-[0.3em] uppercase border-b border-gray-50 pb-4">Activity Trend</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="d" hide />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '0px' }}
                    itemStyle={{ color: '#FFF', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#C5A358" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-8 bg-[#1A1A1A] text-white space-y-8 relative overflow-hidden">
            <div className="absolute -right-6 -top-10 text-[140px] font-serif italic text-white/5 pointer-events-none">A</div>
            <div className="relative z-10">
              <h2 className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#C5A358] mb-8">Exclusive Privilege</h2>
              <div className="space-y-4">
                <p className="text-3xl font-serif italic">Welcome Atelier</p>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs tracking-[0.2em] font-mono">{coupon.code}</span>
                  <button onClick={handleCopy} className="text-[9px] uppercase tracking-widest font-bold text-[#C5A358] hover:text-white transition-colors">
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-[9px] text-gray-500 tracking-widest uppercase">{coupon.daysLeft} Days Remaining • {coupon.discount}% Off</p>
              </div>
            </div>
          </div>
        </div>

        {/* Favorites Section - ปรับปรุงการแสดงผลรูปภาพ */}
        <section className="space-y-10 pt-10">
          <div className="flex items-end justify-between border-b border-gray-100 pb-4">
            <h2 className="text-[11px] font-bold tracking-[0.4em] uppercase">Curated Favorites</h2>
            <Link to="/looks" className="text-[10px] text-[#C5A358] font-bold uppercase tracking-widest hover:translate-x-1 transition-transform">Browse Collection →</Link>
          </div>

          {favs.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-gray-100 bg-white/50">
              <p className="text-[11px] text-gray-400 uppercase tracking-widest font-serif italic">Your curation is currently empty.</p>
            </div>
          ) : (
            <div className="flex gap-8 overflow-x-auto pb-10 no-scrollbar snap-x">
              {favs.map((f) => (
                <div key={f.id} className="min-w-[280px] group cursor-pointer snap-start">
                  <div className="aspect-[3/4] overflow-hidden bg-gray-50 mb-4 relative">
                    <img 
                      src={getImageUrl(f.img || f.image_url)} 
                      alt={f.title} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000"; }}
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#C5A358]">{f.season} selection</span>
                    <h3 className="text-base font-serif italic leading-tight">{f.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <EditAvatarModal open={openEdit} onClose={() => setOpenEdit(false)} me={me} onSaved={(next) => setMe(next)} />
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

/* ---------- 3. Modal Component ---------- */
function EditAvatarModal({ open, onClose, me, onSaved }) {
  const [preview, setPreview] = useState(me?.avatar || "");
  const fileInputRef = useRef(null);

  useEffect(() => { 
    if (open) setPreview(me?.avatar || ""); 
  }, [me?.avatar, open]);

  const onSave = () => {
    const current = lsGet("auramatch:user", { name: "User", email: "" });
    const next = { ...current, avatar: preview };
    localStorage.setItem("auramatch:user", JSON.stringify(next));
    window.dispatchEvent(new Event("storage"));
    onSaved?.(next);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#FDFCFB] border border-gray-100 shadow-2xl p-10 space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase">Update Portrait</h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest italic">Personalize your Atelier presence</p>
        </div>

        <div className="flex justify-center">
          <div className="h-44 w-44 rounded-full border border-gray-100 p-1 bg-white overflow-hidden">
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full rounded-full object-cover shadow-inner" />
            ) : (
              <div className="h-full w-full rounded-full bg-gray-50 flex items-center justify-center text-[10px] text-gray-300 uppercase tracking-widest">No Portrait</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(file);
              }
            }}
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="w-full py-4 border border-dashed border-gray-200 text-[10px] uppercase tracking-[0.2em] font-bold hover:border-[#C5A358] transition-colors"
          >
            Upload New File
          </button>
        </div>

        <div className="flex gap-4 pt-4">
          <button onClick={onClose} className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={onSave} className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest bg-[#1A1A1A] text-white hover:bg-[#C5A358] transition-all">Save Changes</button>
        </div>
      </div>
    </div>
  );
}