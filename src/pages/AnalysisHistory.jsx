import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Filter, Calendar, Sparkles } from "lucide-react";
import { lsGet } from "../utils/storage";
// ตรวจสอบว่า Path และชื่อฟังก์ชันตรงกับในไฟล์ call_api_user.js
import { getAnalysisHistory, deleteAnalysis } from "../callapi/call_api_user";

/* ---------- 1. Helpers ---------- */
function formatDate(dateStr) {
  try {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

const PAGE_SIZE = 9;

export default function AnalysisHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeason, setFilterSeason] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  
  // ดึงข้อมูล User (ใช้ค่า Default เผื่อกรณี localStorage ว่าง)
  const me = lsGet("auramatch:user", null);
  const userId = me?.uid || me?.user_id || me?.id || null;

  const normalizeItem = (row) => {
    const imagePath = row?.image_path || row?.preview || "";
    return {
      id: row?.history_id || row?.analysis_id || row?.id,
      season: row?.season,
      face_shape: row?.face_shape,
      created_at: row?.analysis_date || row?.created_at,
      image_path: imagePath,
    };
  };

  const resolveImageSrc = (value) => {
    if (!value) return "";
    if (value.startsWith("data:") || value.startsWith("http")) return value;
    return value.startsWith("/") ? value : `/${value}`;
  };

  // 2. Load Data from Database
  const loadHistory = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getAnalysisHistory(userId);
      
      // ป้องกัน Error ถ้า data ไม่ใช่ Array
      const safeData = Array.isArray(data) ? data : (data?.data || []);

      const normalized = safeData.map(normalizeItem);
      const sortedData = [...normalized].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return sort === "newest" ? dateB - dateA : dateA - dateB;
      });
      
      setItems(sortedData);
    } catch (err) {
      console.error("Failed to load history:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId, sort]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const handleHistoryChanged = () => loadHistory();
    window.addEventListener("history:changed", handleHistoryChanged);
    window.addEventListener("history:updated", handleHistoryChanged);
    return () => {
      window.removeEventListener("history:changed", handleHistoryChanged);
      window.removeEventListener("history:updated", handleHistoryChanged);
    };
  }, [loadHistory]);

  // 3. Filters + Pagination
  const filtered = items.filter((it) => {
    if (filterSeason !== "ALL" && it.season !== filterSeason) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 4. Delete Logic
  const deleteOne = async (analysisId) => {
    if (!window.confirm("Remove this masterpiece from your archive?")) return;
    try {
      // เรียกใช้ฟังก์ชันที่ import มา
      const success = await deleteAnalysis(analysisId);
      if (success) {
        loadHistory(); // Reload ข้อมูลใหม่
      } else {
        alert("Could not delete. Please try again.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete analysis");
    }
  };

  const clearAll = () => {
    alert("Full archive clearing is restricted for safety. Please delete items individually.");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] pb-40 pt-32 px-10 selection:bg-[#D4AF37]/20">
      <div className="mx-auto max-w-7xl">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none flex items-center justify-start">
            <h2 className="text-[15vw] font-serif italic uppercase leading-none -ml-10">Archive</h2>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4">
               <span className="text-[10px] tracking-[0.8em] font-black uppercase text-[#D4AF37]">Personal Heritage</span>
               <div className="h-px w-20 bg-[#D4AF37]/30" />
            </div>
            <h1 className="text-6xl md:text-8xl font-serif italic leading-none tracking-tighter">Analysis <br/>History.</h1>
          </div>

          <div className="flex gap-4 relative z-10">
            <button onClick={clearAll} className="px-8 py-4 border border-gray-200 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all bg-white shadow-sm">
              Clear Archive
            </button>
            <Link to="/analysis" className="px-10 py-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.4em] font-black hover:bg-[#D4AF37] transition-all shadow-xl flex items-center gap-3">
              <Plus size={14} /> New Scan
            </Link>
          </div>
        </header>

        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center gap-10 mb-20 py-8 border-y border-gray-100">
           <div className="flex items-center gap-4">
              <Filter size={14} className="text-[#D4AF37]" />
              <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">Filters:</span>
           </div>
           
           <select
              value={filterSeason}
              onChange={(e) => { setFilterSeason(e.target.value); setPage(1); }}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none border-b border-transparent focus:border-[#D4AF37] pb-1 cursor-pointer"
           >
              <option value="ALL">All Seasons</option>
              {["Spring", "Summer", "Autumn", "Winter"].map(s => <option key={s} value={s}>{s}</option>)}
           </select>

           <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none border-b border-transparent focus:border-[#D4AF37] pb-1 cursor-pointer"
           >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Chronological</option>
           </select>
        </div>

        {/* GALLERY GRID */}
        {loading ? (
          <div className="py-48 text-center text-gray-400 uppercase tracking-widest animate-pulse">Loading Archive...</div>
        ) : filtered.length === 0 ? (
          <div className="py-48 text-center border border-dashed border-gray-200 bg-white/40 backdrop-blur-sm rounded-sm">
            <Sparkles size={30} className="mx-auto mb-6 text-gray-200" />
            <p className="text-[11px] text-gray-400 uppercase tracking-[0.6em] font-serif italic">The archive is waiting for your portrait</p>
            <Link to="/analysis" className="mt-8 inline-block px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest">Begin Analysis</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-32">
            {paginated.map((it) => (
              <div key={it.id} className="group relative">
                
                {/* Delete Button */}
                <button 
                  onClick={() => deleteOne(it.id)}
                  className="absolute -top-4 -right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-white shadow-xl rounded-full p-4 text-gray-300 hover:text-red-500 hover:scale-110"
                >
                  <Trash2 size={16} />
                </button>

                {/* Portrait Display */}
                <div className="relative aspect-[3/4] overflow-hidden bg-white mb-10 shadow-sm border border-white group-hover:shadow-2xl transition-all duration-1000">
                  <img 
                    src={resolveImageSrc(it.image_path) || "https://via.placeholder.com/300x400"} 
                    alt="portrait" 
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-[2s] group-hover:scale-110"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/300x400?text=No+Image"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute bottom-6 left-6 z-10">
                     <span className="bg-white/90 backdrop-blur-md px-4 py-2 text-[9px] font-black uppercase tracking-[0.3em] shadow-sm">
                        {it.face_shape} Shape
                     </span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${it.season?.toLowerCase().includes('spring') ? 'bg-green-300' : it.season?.toLowerCase().includes('summer') ? 'bg-blue-300' : it.season?.toLowerCase().includes('autumn') ? 'bg-orange-300' : 'bg-indigo-300'}`} />
                        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#D4AF37]">{it.season} Selection</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                        <Calendar size={10} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{formatDate(it.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start pt-2">
                    <h3 className="text-3xl font-serif italic tracking-tight leading-none group-hover:text-[#D4AF37] transition-colors">Refinement Result</h3>
                    <Link to="/analysis" className="p-3 border border-gray-100 rounded-full hover:bg-black hover:text-white transition-all">
                        <Sparkles size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-20 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2.5 border border-gray-200 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-[#1A1A1A] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 text-[10px] font-black uppercase tracking-widest border transition-all ${
                  p === page
                    ? "bg-[#D4AF37] text-white border-[#D4AF37]"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-5 py-2.5 border border-gray-200 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-[#1A1A1A] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400;1,700&family=Plus+Jakarta+Sans:wght@200;400;600;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
}
