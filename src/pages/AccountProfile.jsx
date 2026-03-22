import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { lsGet, onBus } from "../utils/storage";
import { subscribeLikes } from "../utils/likes";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip
} from "recharts";
import { Link } from "react-router-dom";
import { Edit3, Plus, ExternalLink, Calendar, ShieldCheck, Copy, Check, Sparkles, Zap } from "lucide-react";
import { getAnalysisHistory } from "../callapi/call_api_user"; 

const BASE_PATH = "/";

const MAP = {
  brows: { softArch: "Soft arch", straight: "Straight", arched: "High arch" },
  eyes: { natural: "Natural gradient", cat: "Cat-eye lift", dolly: "Dolly eye" },
  nose: { softContour: "Soft contour", definedContour: "Defined contour", natural: "Natural" },
  lips: { gradient: "Gradient lip", full: "Full bold", soft: "Soft blur" },
};

const pretty = (val, group) => (MAP[group] || {})[val] || val || "-";

export default function AccountProfile() {
  const [favs, setFavs] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // -- Database State --
  const [history, setHistory] = useState([]); 
  const [last, setLast] = useState(null);     
  const [me, setMe] = useState(() => lsGet("auramatch:user", { id: 1, name: "User", email: "CONNECTED PROFILE" })); 

  const getImageUrl = useCallback((path) => {
    if (!path || path === "null" || path === "/placeholder.png") {
      return "https://images.unsplash.com/photo-1596462502278-27bfac4033c8?q=80&w=1000";
    }
    if (path.startsWith('http') || path.startsWith('data:')) return path; 
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_PATH}${cleanPath}`;
  }, []);

  // 1. ดึงข้อมูลจาก MySQL ผ่าน API
  const loadDatabaseData = useCallback(async () => {
    const userId = me?.uid || me?.user_id || me?.id;
    if (userId) {
      try {
        const data = await getAnalysisHistory(userId);
        setHistory(data);
        if (data && data.length > 0) {
          setLast(data[0]); // รายการล่าสุดจาก Database (SQL)
        }
      } catch (err) {
        console.error("Failed to fetch analysis history:", err);
      }
    }
  }, [me?.id]);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // 2. จัดการ Event การอัปเดตข้อมูล (ของเดิม)
  useEffect(() => {
    const handleUpdate = () => {
      // เมื่อมีการอัปเดต ให้ดึงทั้งจาก LocalStorage และ Database ใหม่
      setMe(lsGet("auramatch:user", { id: 1, name: "User", email: "" }));
      loadDatabaseData(); 
    };
    window.addEventListener("analysis:updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("analysis:updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadDatabaseData]);

  useEffect(() => {
    const unsubscribe = subscribeLikes((data) => setFavs(data));
    return () => unsubscribe();
  }, []);

  const coupon = lsGet("auramatch:coupon", { code: "GLAM-ACCESS-2024", daysLeft: 7, discount: 15 });
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
    <div className="min-h-screen bg-[#FFFDFD] text-black pb-40 selection:bg-[#FF8E9E] selection:text-white font-sans overflow-x-hidden">
      
      {/* 1. BRUTALIST HERO HEADER */}
      <header className="pt-40 pb-20 px-6 border-b-[12px] border-black relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="relative group" onClick={() => setOpenEdit(true)}>
            <div className="h-56 w-56 overflow-hidden rounded-[40px] border-[6px] border-black bg-white shadow-[12px_12px_0px_0px_#FF8E9E] relative z-10 transition-transform duration-500 group-hover:scale-105 cursor-pointer">
              {(me?.photoURL || me?.avatar) ? (
                <img src={me.photoURL || me.avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[#FF8E9E] flex items-center justify-center text-black text-7xl font-black italic">
                  {(me?.name?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 z-20 bg-black text-white border-4 border-white rounded-full p-4 hover:bg-[#FF8E9E] transition-colors shadow-lg">
              <Edit3 size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 bg-black text-white px-6 py-2 rounded-full">
              <Sparkles size={14} className="text-[#FF8E9E]" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase italic">Aura Elite Member</span>
            </div>
            <h1 className="text-7xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
              {me?.name ?? "Guest User"}
            </h1>
            <p className="text-sm font-black text-[#FF8E9E] tracking-[0.4em] uppercase italic border-l-8 border-black pl-6 inline-block">
              {me?.email || "CONNECTED PROFILE"}
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <button onClick={() => setOpenEdit(true)} className="px-10 py-5 bg-white border-4 border-black text-[11px] uppercase tracking-[0.3em] font-black italic shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              Edit Identity
            </button>
            <Link to="/analysis" className="px-10 py-5 bg-black text-white text-[11px] uppercase tracking-[0.3em] font-black italic shadow-[6px_6px_0px_0px_#FF8E9E] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3">
              <Zap size={16} fill="currentColor" /> Re-Analyze Aura
            </Link>
          </div>
        </div>
        <div className="absolute top-10 right-[-5%] opacity-5 text-[20vw] font-black italic select-none pointer-events-none">PROFILE</div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* 2. STATS & INFO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Beauty ID - Biological Blueprint (เชื่อมต่อ SQL แล้ว) */}
          <div className="p-10 bg-white border-[6px] border-black rounded-[40px] shadow-[15px_15px_0px_0px_#000] relative group overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-[0.03] text-[15rem] font-black italic">ID</div>
            <h2 className="text-xs font-black tracking-[0.4em] uppercase border-b-4 border-black pb-6 mb-8 italic">Biological Blueprint</h2>
            {last ? (
              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-end border-b-2 border-gray-100 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Color Palette</span>
                  <span className="font-black italic text-3xl text-[#FF8E9E] drop-shadow-[2px_2px_0px_#000]">{last.season || "N/A"}</span>
                </div>
                <div className="flex justify-between items-end border-b-2 border-gray-100 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Geometry</span>
                  <span className="text-xl font-black uppercase italic">{last.face_shape || "N/A"}</span>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  {[
                    { key: 'brows', label: 'brows', val: last.eyebrows },
                    { key: 'eyes', label: 'eyes', val: last.eyes },
                    { key: 'nose', label: 'nose', val: last.nose },
                    { key: 'lips', label: 'lips', val: last.lips }
                  ].map(feat => (
                    <div key={feat.key} className="bg-[#FFF0F2] p-4 rounded-2xl border-2 border-black">
                      <p className="text-[8px] font-black text-[#FF8E9E] uppercase tracking-widest mb-1">{feat.label}</p>
                      <p className="text-[10px] font-black uppercase tracking-tight">{pretty(feat.val, feat.key)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm font-black italic uppercase text-gray-400 mb-6">Aura data not initialized.</p>
                <Link to="/analysis" className="inline-block text-[10px] bg-black text-white px-6 py-3 font-black uppercase italic">Scan Face</Link>
              </div>
            )}
          </div>

          {/* Activity Trend - Style Energy */}
          <div className="p-10 bg-white border-[6px] border-black rounded-[40px] shadow-[15px_15px_0px_0px_#FF8E9E]">
            <div className="flex justify-between items-center border-b-4 border-black pb-6 mb-8">
                <h2 className="text-xs font-black tracking-[0.4em] uppercase italic">Style Energy</h2>
                <Calendar size={18} />
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="d" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '15px', padding: '15px' }}
                    itemStyle={{ color: '#FF8E9E', fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', fontStyle: 'italic' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Line type="step" dataKey="count" stroke="#FF8E9E" strokeWidth={6} dot={{ r: 0 }} activeDot={{ r: 8, fill: '#000', stroke: '#FF8E9E', strokeWidth: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-8 text-[10px] font-black uppercase italic bg-black text-white py-2 text-center rounded-xl">+12% Energy Increase</p>
          </div>

          {/* Privilege - Atelier Reward */}
          <div className="p-10 bg-black text-white border-[6px] border-black rounded-[40px] shadow-[15px_15px_0px_0px_#000] relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 text-[12rem] font-black italic text-[#FF8E9E] opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700">A</div>
            <h2 className="text-xs font-black tracking-[0.4em] uppercase text-[#FF8E9E] mb-12 italic relative z-10">Atelier Reward</h2>
            <div className="space-y-6 relative z-10">
              <p className="text-5xl font-black uppercase italic leading-[0.9] tracking-tighter">THE <br/><span className="text-[#FF8E9E]">ARCHIVE</span> ACCESS</p>
              <div className="flex items-center justify-between bg-white/10 border-4 border-dashed border-white/20 p-6 mt-10 backdrop-blur-sm group-hover:border-[#FF8E9E] transition-all">
                <span className="text-lg font-black tracking-[0.2em] font-mono">{coupon.code}</span>
                <button onClick={handleCopy} className="p-3 bg-[#FF8E9E] text-black hover:bg-white transition-colors">
                  {copied ? <Check size={20} strokeWidth={4} /> : <Copy size={20} strokeWidth={4} />}
                </button>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase italic">
                  <span className="text-[#FF8E9E]">{coupon.discount}% EXCLUSIVE SAVING</span>
                  <span className="opacity-50">{coupon.daysLeft} DAYS VALID</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CURATED FAVORITES */}
        <section className="mt-40 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b-[6px] border-black pb-10 gap-6">
            <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF8E9E] italic">Curated Selection</span>
                <h2 className="text-6xl font-black uppercase italic tracking-tighter">My Boutique.</h2>
            </div>
            <Link to="/looks" className="text-xs font-black uppercase italic tracking-[0.3em] bg-[#FFF0F2] border-4 border-black px-8 py-4 shadow-[5px_5px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              Explore More Looks
            </Link>
          </div>

          {favs.length === 0 ? (
            <div className="py-40 text-center border-[6px] border-dashed border-black rounded-[60px] bg-white">
              <p className="text-xl font-black uppercase italic text-gray-400 tracking-widest">Your collection is empty.</p>
              <Link to="/looks" className="mt-8 inline-block bg-black text-white px-12 py-5 font-black uppercase italic tracking-widest shadow-[8px_8px_0px_0px_#FF8E9E]">Start Curation</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {favs.slice(0, 4).map((f) => (
                <div key={f.id} className="group cursor-pointer">
                  <div className="aspect-[3/4] overflow-hidden bg-white border-[6px] border-black rounded-[40px] mb-8 relative shadow-[10px_10px_0px_0px_#000] group-hover:shadow-[10px_10px_0px_0px_#FF8E9E] transition-all">
                    <img 
                      src={getImageUrl(f.img || f.image_url)} 
                      alt={f.title} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-black text-xs font-black tracking-[0.3em] uppercase italic px-6 py-3 border-4 border-black">View</span>
                    </div>
                  </div>
                  <div className="space-y-2 px-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF8E9E] italic">{f.season || "Universal"}</p>
                    <h3 className="text-2xl font-black uppercase italic leading-none group-hover:text-[#FF8E9E] transition-colors">{f.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 4. REFINED MODAL */}
      <EditAvatarModal open={openEdit} onClose={() => setOpenEdit(false)} me={me} onSaved={(next) => setMe(next)} />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,900;1,900&display=swap');
        body { font-family: 'Montserrat', sans-serif; }
      `}</style>
    </div>
  );
}

function EditAvatarModal({ open, onClose, me, onSaved }) {
  const [preview, setPreview] = useState(me?.photoURL || me?.avatar || "");
  const fileInputRef = useRef(null);

  useEffect(() => { if (open) setPreview(me?.photoURL || me?.avatar || ""); }, [me?.photoURL, me?.avatar, open]);

  const onSave = () => {
    const next = { ...me, photoURL: preview };
    localStorage.setItem("auramatch:user", JSON.stringify(next));
    window.dispatchEvent(new Event("storage"));
    onSaved?.(next);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
      <div className="w-full max-w-lg bg-white border-[10px] border-black rounded-[60px] p-12 space-y-12 relative animate-in zoom-in duration-300 shadow-[20px_20px_0px_0px_#FF8E9E]">
        <div className="text-center">
          <h3 className="text-xs font-black tracking-[0.5em] uppercase text-[#FF8E9E] italic mb-2">Visual ID</h3>
          <p className="text-4xl font-black uppercase italic tracking-tighter">Edit Portrait</p>
        </div>

        <div className="flex justify-center">
          <div className="h-64 w-64 rounded-[50px] border-[6px] border-black p-2 bg-white overflow-hidden shadow-[12px_12px_0px_0px_#000] group relative">
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
            ) : (
              <div className="h-full w-full bg-[#FFF0F2] flex items-center justify-center text-xs font-black uppercase italic text-gray-300">No Image</div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Plus className="text-white" size={40} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setPreview(reader.result);
              reader.readAsDataURL(file);
            }
          }} />
          <button onClick={() => fileInputRef.current?.click()} className="w-full py-5 bg-[#FFF0F2] border-4 border-black text-xs font-black uppercase italic shadow-[5px_5px_0px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
            Upload New Profile
          </button>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-5 border-4 border-black font-black uppercase italic text-xs">Cancel</button>
          <button onClick={onSave} className="flex-1 py-5 bg-black text-white border-4 border-black font-black uppercase italic text-xs shadow-[5px_5px_0px_0px_#FF8E9E]">Save Changes</button>
        </div>
      </div>
    </div>
  );
}