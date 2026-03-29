import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Filter, Sparkles, X, Calendar } from "lucide-react";
import { lsGet } from "../utils/storage";
import { getAnalysisHistory, deleteAnalysis } from "../callapi/call_api_user";

function formatDate(dateStr) {
  try {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  } catch { return "-"; }
}

function formatShort(dateStr) {
  try {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch { return "-"; }
}

const PAGE_SIZE = 9;

const SEASON_STYLE = {
  Spring:  { border: "#FF85A2", bg: "#FFF5F8", text: "#D23669", light: "#FFE4EE", dot: "bg-[#FF85A2]" },
  Summer:  { border: "#93C5FD", bg: "#EFF6FF", text: "#3B82F6", light: "#DBEAFE", dot: "bg-[#93C5FD]" },
  Autumn:  { border: "#FDBA74", bg: "#FFF7ED", text: "#EA580C", light: "#FED7AA", dot: "bg-[#FDBA74]" },
  Winter:  { border: "#C4B5FD", bg: "#F5F3FF", text: "#7C3AED", light: "#DDD6FE", dot: "bg-[#C4B5FD]" },
};

const FEATURE_MAP = {
  brows: { softArch: "Soft arch", straight: "Straight", arched: "High arch" },
  eyes:  { natural: "Natural gradient", cat: "Cat-eye lift", dolly: "Dolly eye" },
  nose:  { softContour: "Soft contour", definedContour: "Defined contour", natural: "Natural" },
  lips:  { gradient: "Gradient lip", full: "Full bold", soft: "Soft blur" },
};
const pretty = (val, group) => (FEATURE_MAP[group] || {})[val] || val || "-";

export default function AnalysisHistory() {
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterSeason, setFilterSeason] = useState("ALL");
  const [sort, setSort]                 = useState("newest");
  const [page, setPage]                 = useState(1);
  const [detail, setDetail]             = useState(null);

  const me = lsGet("auramatch:user", null);
  const userId = me?.uid || me?.user_id || me?.id || null;

  const normalizeItem = (row) => ({
    id:         row?.history_id || row?.analysis_id || row?.id,
    season:     row?.season,
    face_shape: row?.face_shape,
    skin_tone:  row?.skin_tone,
    eyebrows:   row?.eyebrows,
    eyes:       row?.eyes,
    nose:       row?.nose,
    lips:       row?.lips,
    score:      row?.score,
    created_at: row?.analysis_date || row?.created_at,
    image_path: row?.image_path || row?.preview || "",
  });

  const resolveImageSrc = (value) => {
    if (!value) return "";
    if (value.startsWith("data:") || value.startsWith("http")) return value;
    return value.startsWith("/") ? value : `/${value}`;
  };

  const loadHistory = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getAnalysisHistory(userId);
      const safeData = Array.isArray(data) ? data : (data?.data || []);
      const sorted = safeData.map(normalizeItem).sort((a, b) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return sort === "newest" ? db - da : da - db;
      });
      setItems(sorted);
    } catch (err) {
      console.error("Failed to load history:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId, sort]);

  useEffect(() => { loadHistory(); }, [loadHistory]);
  useEffect(() => {
    const h = () => loadHistory();
    window.addEventListener("history:changed", h);
    window.addEventListener("history:updated", h);
    window.addEventListener("analysis:updated", h);
    return () => {
      window.removeEventListener("history:changed", h);
      window.removeEventListener("history:updated", h);
      window.removeEventListener("analysis:updated", h);
    };
  }, [loadHistory]);

  useEffect(() => {
    document.body.style.overflow = detail ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [detail]);

  const filtered = items.filter(it => filterSeason === "ALL" || it.season === filterSeason);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const seasonCounts = items.reduce((acc, it) => {
    if (it.season) acc[it.season] = (acc[it.season] || 0) + 1;
    return acc;
  }, {});
  const topSeason = Object.entries(seasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const deleteOne = async (analysisId) => {
    if (detail?.id === analysisId) setDetail(null);
    if (!window.confirm("Remove this item from history?")) return;
    const prev = items;
    setItems(cur => cur.filter(it => it.id !== analysisId));
    try {
      const ok = await deleteAnalysis(analysisId);
      if (!ok) { setItems(prev); alert("Delete failed. Please try again."); }
    } catch { setItems(prev); alert("An error occurred."); }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] antialiased pb-32 overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-[#E8E0DC] mt-[60px] lg:mt-[180px] overflow-hidden relative">
        {/* Top season palette strip */}
        {topSeason && SEASON_STYLE[topSeason] && (
          <div className="h-1 w-full" style={{ backgroundColor: SEASON_STYLE[topSeason].border }} />
        )}

        <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-14 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <p className="text-[9px] tracking-[0.6em] uppercase text-[#888] font-[300] mb-4">Personal Archive</p>
              <h1 className="text-5xl md:text-8xl font-[200] text-[#1A1A1A] leading-none">
                Analysis<br/><span className="font-[700] italic">History</span>
              </h1>
              {items.length > 0 && (
                <p className="text-[11px] tracking-[0.25em] text-[#888] font-[300] mt-4">
                  {items.length} scan{items.length !== 1 ? "s" : ""} · {topSeason ? `Mostly ${topSeason}` : "All seasons"}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Link to="/analysis"
                className="inline-flex items-center gap-2 bg-[#D23669] text-white px-7 py-3 text-[10px] font-[600] uppercase tracking-[0.25em] hover:bg-[#FF85A2] transition-all">
                <Plus size={13} /> New Scan
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-10">

        {/* ── STATS ── */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E8E0DC] mb-10">
            <div className="bg-white p-6">
              <p className="text-[9px] tracking-[0.35em] uppercase text-[#888] font-[300] mb-3">Total Scans</p>
              <p className="text-4xl font-[200] text-[#1A1A1A] leading-none">{items.length}</p>
            </div>
            <div className="bg-white p-6">
              <p className="text-[9px] tracking-[0.35em] uppercase text-[#888] font-[300] mb-3">Dominant Type</p>
              {topSeason ? (
                <p className="text-2xl font-[700] italic leading-none" style={{ color: SEASON_STYLE[topSeason]?.text || "#1A1A1A" }}>
                  {topSeason}
                </p>
              ) : <p className="text-2xl font-[200] text-[#888] leading-none">—</p>}
            </div>
            {Object.entries(seasonCounts).slice(0, 2).map(([season, count]) => {
              const sc = SEASON_STYLE[season] || {};
              return (
                <div key={season} className="bg-white p-6" style={{ borderTop: `3px solid ${sc.border || "#E8E0DC"}` }}>
                  <p className="text-[9px] tracking-[0.35em] uppercase font-[300] mb-3" style={{ color: sc.text || "#888" }}>{season}</p>
                  <p className="text-4xl font-[200] text-[#1A1A1A] leading-none">{count}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── FILTER BAR ── */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-5 border-b border-[#E8E0DC]">
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-[#888]" />
            <span className="text-[9px] font-[600] uppercase tracking-[0.4em] text-[#1A1A1A]">Filter</span>
          </div>

          {/* Season pills */}
          <div className="flex flex-wrap gap-2">
            {["ALL", "Spring", "Summer", "Autumn", "Winter"].map(s => {
              const active = filterSeason === s;
              return (
                <button key={s} onClick={() => { setFilterSeason(s); setPage(1); }}
                  className={`text-[9px] uppercase tracking-[0.25em] px-3 py-1.5 border transition-all font-[500] ${
                    active
                      ? "bg-[#D23669] text-white border-[#D23669]"
                      : "bg-white text-[#888] border-[#E8E0DC] hover:border-[#D23669] hover:text-[#D23669]"
                  }`}>
                  {s === "ALL" ? "All" : s}
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="bg-white text-[10px] font-[400] uppercase tracking-[0.2em] outline-none border border-[#E8E0DC] px-3 py-1.5 focus:border-[#1A1A1A] cursor-pointer text-[#1A1A1A] transition-colors">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#888] font-[300] whitespace-nowrap">{filtered.length} results</span>
          </div>
        </div>

        {/* ── GALLERY ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-8 h-8 border border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#888] mt-5">Loading Archive...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-40 text-center border border-dashed border-[#E8E0DC] bg-white">
            <Sparkles size={28} className="mx-auto mb-5 text-[#C0B8B4]" />
            <p className="text-[11px] text-[#888] uppercase tracking-[0.3em] font-[300] mb-6">No items in history</p>
            <Link to="/analysis" className="inline-block bg-[#D23669] text-white px-8 py-3 text-[10px] font-[600] uppercase tracking-[0.25em] hover:bg-[#FF85A2] transition-all">
              Start New Analysis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((it) => {
              const sc = SEASON_STYLE[it.season] || SEASON_STYLE.Spring;
              return (
                <div key={it.id} className="bg-white border border-[#E8E0DC] group overflow-hidden hover:shadow-lg transition-all duration-300"
                  style={{ borderTop: `3px solid ${sc.border}` }}>

                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F4F2]">
                    <img
                      src={resolveImageSrc(it.image_path) || ""}
                      alt="portrait"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    {!resolveImageSrc(it.image_path) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={28} className="text-[#C0B8B4]" />
                      </div>
                    )}

                    {/* Score badge */}
                    {it.score && (
                      <span className="absolute top-3 left-3 bg-[#1A1A1A]/80 backdrop-blur-sm text-white px-2.5 py-1 text-[9px] uppercase tracking-[0.2em]">
                        Score {it.score}
                      </span>
                    )}

                    {/* Delete btn */}
                    <button onClick={() => deleteOne(it.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all w-8 h-8 bg-white/90 backdrop-blur-sm border border-[#E8E0DC] flex items-center justify-center text-[#888] hover:bg-[#1A1A1A] hover:text-white">
                      <Trash2 size={13} />
                    </button>

                    {/* Face shape bottom label */}
                    {it.face_shape && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-6">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-white font-[500]">{it.face_shape} Face</span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      {/* Season pill */}
                      <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.25em] font-[600] px-2.5 py-1 rounded-sm"
                        style={{ backgroundColor: sc.light, color: sc.text }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.border }} />
                        {it.season || "Unknown"}
                      </span>
                      <span className="text-[9px] tracking-[0.2em] uppercase text-[#888] font-[300]">
                        {formatShort(it.created_at)}
                      </span>
                    </div>

                    {/* Feature tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {it.eyebrows && <span className="text-[8px] uppercase tracking-[0.1em] bg-[#F7F4F2] text-[#888] px-2 py-0.5 border border-[#E8E0DC]">{pretty(it.eyebrows,'brows')}</span>}
                      {it.eyes     && <span className="text-[8px] uppercase tracking-[0.1em] bg-[#F7F4F2] text-[#888] px-2 py-0.5 border border-[#E8E0DC]">{pretty(it.eyes,'eyes')}</span>}
                      {it.lips     && <span className="text-[8px] uppercase tracking-[0.1em] bg-[#F7F4F2] text-[#888] px-2 py-0.5 border border-[#E8E0DC]">{pretty(it.lips,'lips')}</span>}
                    </div>

                    <button onClick={() => setDetail(it)}
                      className="w-full flex items-center justify-between pt-4 border-t border-[#E8E0DC] text-[10px] uppercase tracking-[0.2em] text-[#888] hover:text-[#1A1A1A] transition-colors group/btn">
                      <span>View Details</span>
                      <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-5 h-10 border border-[#E8E0DC] bg-white text-[10px] uppercase tracking-[0.2em] text-[#888] hover:bg-[#D23669] hover:text-white hover:border-[#D23669] disabled:opacity-30 transition-all">
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-10 h-10 border text-[10px] font-[500] transition-all ${p === page ? 'bg-[#D23669] text-white border-[#D23669]' : 'bg-white border-[#E8E0DC] text-[#888] hover:border-[#D23669] hover:text-[#D23669]'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-5 h-10 border border-[#E8E0DC] bg-white text-[10px] uppercase tracking-[0.2em] text-[#888] hover:bg-[#D23669] hover:text-white hover:border-[#D23669] disabled:opacity-30 transition-all">
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {detail && (() => {
        const sc = SEASON_STYLE[detail.season] || SEASON_STYLE.Spring;
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDetail(null)} />
            <div className="relative bg-white w-full max-w-2xl shadow-2xl overflow-hidden" style={{ borderTop: `4px solid ${sc.border}` }}>

              {/* Close */}
              <button onClick={() => setDetail(null)}
                className="absolute top-4 right-4 z-50 w-9 h-9 border border-[#E8E0DC] flex items-center justify-center text-[#888] hover:bg-[#D23669] hover:text-white hover:border-[#D23669] transition-all">
                <X size={16} />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="w-full md:w-56 aspect-[4/3] md:aspect-auto overflow-hidden bg-[#F7F4F2] flex-shrink-0 relative">
                  <img
                    src={resolveImageSrc(detail.image_path) || ""}
                    alt="portrait"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  {!resolveImageSrc(detail.image_path) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles size={32} className="text-[#C0B8B4]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-7 md:p-8 overflow-y-auto max-h-[80vh]">
                  {/* Season + score */}
                  <div className="flex items-center gap-2 mb-5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.25em] font-[600] px-3 py-1.5 rounded-sm"
                      style={{ backgroundColor: sc.light, color: sc.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.border }} />
                      {detail.season}
                    </span>
                    {detail.score && (
                      <span className="text-[9px] uppercase tracking-[0.2em] bg-[#1A1A1A] text-white px-3 py-1.5">
                        Score {detail.score}
                      </span>
                    )}
                  </div>

                  <h2 className="text-3xl font-[200] text-[#1A1A1A] mb-1 leading-none">
                    {detail.face_shape} <span className="font-[700] italic">Face</span>
                  </h2>
                  <div className="flex items-center gap-2 mt-2 mb-6">
                    <Calendar size={12} className="text-[#888]" />
                    <p className="text-[11px] tracking-[0.2em] uppercase text-[#888] font-[300]">{formatDate(detail.created_at)}</p>
                  </div>

                  {/* Skin tone */}
                  {detail.skin_tone && (
                    <div className="mb-5 pb-5 border-b border-[#E8E0DC]">
                      <p className="text-[9px] tracking-[0.35em] uppercase text-[#888] font-[300] mb-1">Skin Tone</p>
                      <p className="text-sm font-[600] text-[#1A1A1A]">{detail.skin_tone}</p>
                    </div>
                  )}

                  {/* Feature grid */}
                  <div className="grid grid-cols-2 gap-px bg-[#E8E0DC] mb-6">
                    {[
                      { label: "Eyebrows", val: pretty(detail.eyebrows, "brows") },
                      { label: "Eyes",     val: pretty(detail.eyes, "eyes") },
                      { label: "Nose",     val: pretty(detail.nose, "nose") },
                      { label: "Lips",     val: pretty(detail.lips, "lips") },
                    ].map(f => (
                      <div key={f.label} className="bg-white p-4">
                        <p className="text-[9px] tracking-[0.35em] uppercase text-[#888] font-[300] mb-1.5">{f.label}</p>
                        <p className="text-sm font-[600] text-[#1A1A1A] uppercase">{f.val}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Link to="/analysis"
                      className="flex-1 text-center py-3 bg-[#D23669] text-white text-[10px] font-[600] uppercase tracking-[0.2em] hover:bg-[#FF85A2] transition-all">
                      Re-Analyze
                    </Link>
                    <button onClick={() => deleteOne(detail.id)}
                      className="px-5 py-3 border border-[#E8E0DC] text-[#888] text-[10px] hover:border-red-400 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
