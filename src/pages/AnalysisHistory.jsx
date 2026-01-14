import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

/* ---------- Helpers ---------- */
function readHistory() {
  try {
    // ดึงข้อมูลล่าสุดเสมอจาก localStorage
    return JSON.parse(localStorage.getItem("auramatch:analysisHistory") || "[]");
  } catch {
    return [];
  }
}

function formatDate(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

export default function AnalysisHistory() {
  const [items, setItems] = useState([]);
  const [filterSeason, setFilterSeason] = useState("ALL");
  const [filterFace, setFilterFace] = useState("ALL");
  const [sort, setSort] = useState("newest");

  // ฟังก์ชันโหลดข้อมูลที่ดึงจาก LocalStorage โดยตรง
  const loadHistory = useCallback(() => {
    const list = readHistory();
    const normalized = list.map((it) => ({
      ...it,
      // ตรวจสอบ fallback ของเวลา
      createdAt: it.createdAt || it.ts || Date.now(),
    }));

    // เรียงลำดับข้อมูล
    normalized.sort((a, b) =>
      sort === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
    );
    setItems(normalized);
  }, [sort]);

  useEffect(() => {
    // 1. โหลดครั้งแรกเมื่อเข้าหน้า
    loadHistory();

    // 2. ฟัง Event "history:changed" (สำหรับกรณีเปลี่ยนในหน้าเดียวกันหรือผ่านฟังก์ชัน)
    const onHistoryChanged = () => {
      loadHistory();
    };

    // 3. ฟัง Event "storage" (สำคัญ! ทำให้เรียลไทม์แม้จะเปิดหลาย Tab หรือเปลี่ยนจากหน้าอื่น)
    const onStorageChanged = (e) => {
      if (e.key === "auramatch:analysisHistory") {
        loadHistory();
      }
    };

    window.addEventListener("history:changed", onHistoryChanged);
    window.addEventListener("storage", onStorageChanged);

    return () => {
      window.removeEventListener("history:changed", onHistoryChanged);
      window.removeEventListener("storage", onStorageChanged);
    };
  }, [loadHistory]);

  const filtered = items.filter((it) => {
    if (filterSeason !== "ALL" && it.season !== filterSeason) return false;
    if (filterFace !== "ALL" && it.faceShape !== filterFace) return false;
    return true;
  });

  const deleteOne = (id) => {
    if (!window.confirm("Remove this record from your history?")) return;
    const currentHistory = readHistory();
    const next = currentHistory.filter((it) => it.id !== id);
    localStorage.setItem("auramatch:analysisHistory", JSON.stringify(next));
    
    // ส่งสัญญาณบอกตัวเองและ Component อื่นๆ (เช่น Navbar) ให้รู้ว่าข้อมูลเปลี่ยน
    window.dispatchEvent(new Event("history:changed"));
  };

  const clearAll = () => {
    if (!window.confirm("Are you sure you want to clear all history?")) return;
    localStorage.removeItem("auramatch:analysisHistory");
    window.dispatchEvent(new Event("history:changed"));
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-light pb-20 pt-28 px-6">
      <div className="mx-auto max-w-6xl">
        {/* ส่วน Header และตัวกรองคงเดิมตามที่คุณส่งมา */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-gray-100 pb-10">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.6em] font-bold uppercase text-[#C5A358]">The Archive</span>
            <h1 className="text-5xl md:text-6xl font-serif italic leading-none tracking-tight">Analysis History.</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={clearAll} className="px-6 py-3 border border-gray-200 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-red-50 hover:text-red-500 transition-all">
              Clear Archive
            </button>
            <Link to="/analysis" className="px-8 py-3 bg-[#1A1A1A] text-white text-[9px] uppercase tracking-[0.3em] font-bold border border-[#1A1A1A] hover:bg-transparent hover:text-[#1A1A1A] transition-all">
              New Analysis
            </Link>
          </div>
        </header>

        {/* Filters Bar ... (เหมือนเดิม) */}

        {/* Gallery Grid */}
        {filtered.length === 0 ? (
          <div className="py-40 text-center border border-dashed border-gray-200 bg-white/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-serif italic">Your personal archive is currently empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {filtered.map((it) => (
              <div key={it.id || it.createdAt} className="group relative">
                {/* Delete Button */}
                <button 
                  onClick={() => deleteOne(it.id)}
                  className="absolute -top-3 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-all p-2 text-gray-300 hover:text-red-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Portrait Display */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 mb-8 border border-gray-100 shadow-sm">
                  <img 
                    src={it.preview || it.image || "/assets/analysis.JPG"} 
                    alt="portrait" 
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  />
                </div>

                {/* Info ... (เหมือนเดิม) */}
                <div className="space-y-4 px-1">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C5A358]">{it.season} Selection</span>
                    <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">{formatDate(it.createdAt)}</span>
                  </div>
                  <h3 className="text-3xl font-serif italic tracking-tight">{it.faceShape}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}