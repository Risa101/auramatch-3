import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Filter, Calendar, Sparkles, X, ChevronRight, TrendingUp } from "lucide-react";
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

const PAGE_SIZE = 9;

const SEASON_STYLE = {
  Spring:  { dot: "bg-[#FF85A2]", badge: "bg-[#FFF5F8] text-[#D23669] border-[#FFD1DC]",  text: "text-[#D23669]" },
  Summer:  { dot: "bg-[#93C5FD]", badge: "bg-[#EFF6FF] text-[#3B82F6] border-[#BFDBFE]",  text: "text-[#3B82F6]" },
  Autumn:  { dot: "bg-[#FDBA74]", badge: "bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]",  text: "text-[#EA580C]" },
  Winter:  { dot: "bg-[#C4B5FD]", badge: "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]",  text: "text-[#7C3AED]" },
};

const FEATURE_MAP = {
  brows: { softArch: "Soft arch", straight: "Straight", arched: "High arch" },
  eyes:  { natural: "Natural gradient", cat: "Cat-eye lift", dolly: "Dolly eye" },
  nose:  { softContour: "Soft contour", definedContour: "Defined contour", natural: "Natural" },
  lips:  { gradient: "Gradient lip", full: "Full bold", soft: "Soft blur" },
};
const pretty = (val, group) => (FEATURE_MAP[group] || {})[val] || val || "-";

export default function AnalysisHistory() {
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterSeason, setFilterSeason] = useState("ALL");
  const [sort, setSort]               = useState("newest");
  const [page, setPage]               = useState(1);
  const [detail, setDetail]           = useState(null); // selected item for detail modal

  const me = lsGet("auramatch:user", null);
  const userId = me?.uid || me?.user_id || me?.id || null;

  const normalizeItem = (row) => ({
    id:         row?.history_id || row?.analysis_id || row?.id,
    season:     row?.season,
    face_shape: row?.face_shape,
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
    return () => { window.removeEventListener("history:changed", h); window.removeEventListener("history:updated", h); };
  }, [loadHistory]);

  // Lock scroll when modal open
  useEffect(() => {
    document.body.style.overflow = detail ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [detail]);

  const filtered = items.filter(it => filterSeason === "ALL" || it.season === filterSeason);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
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
    <div className="min-h-screen bg-[#FCF8F8] text-[#3A3437] font-sans selection:bg-[#FFD1DC] selection:text-[#D23669] antialiased pb-32 overflow-x-hidden">

      {/* HEADER */}
      <header className="relative overflow-hidden bg-black text-white pt-28 pb-14">
        <div className="absolute inset-0" aria-hidden="true" style={{
          backgroundImage: "radial-gradient(circle at 15% 15%, rgba(255,133,162,.45), transparent 45%), radial-gradient(circle at 85% 10%, rgba(210,54,105,.45), transparent 40%), linear-gradient(120deg, rgba(0,0,0,.9), rgba(0,0,0,.6))"
        }} />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm mb-5">
              <span className="text-[8px] tracking-[0.2em] uppercase text-white font-black">Personal Archive</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-[900] tracking-tighter uppercase">
              Analysis <span className="text-[#FF85A2]">History</span>
            </h1>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 max-w-md">
              All your skin tone and face analysis results
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => { if (!window.confirm("Delete all history?")) return; alert("Please delete items one by one."); }}
              className="px-6 py-3 border border-white/20 bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-full text-white/70 hover:text-red-400 hover:border-red-400/30 transition-all">
              Clear All
            </button>
            <Link to="/analysis" className="px-8 py-3 bg-[#D23669] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-[#FF85A2] transition-all shadow-lg flex items-center gap-2">
              <Plus size={14} /> New Scan
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10">

        {/* STATS BAR */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-[#EEDDE4] p-4 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Total</p>
              <p className="text-2xl font-[900] text-[#3A3437]">{items.length} <span className="text-sm font-bold text-gray-400">times</span></p>
            </div>
            <div className="bg-white rounded-2xl border border-[#EEDDE4] p-4 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Most Frequent</p>
              {topSeason ? (
                <p className={`text-xl font-[900] ${SEASON_STYLE[topSeason]?.text || 'text-[#D23669]'}`}>{topSeason}</p>
              ) : <p className="text-xl font-[900] text-gray-300">—</p>}
            </div>
            {Object.entries(seasonCounts).slice(0, 2).map(([season, count]) => (
              <div key={season} className="bg-white rounded-2xl border border-[#EEDDE4] p-4 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{season}</p>
                <p className={`text-2xl font-[900] ${SEASON_STYLE[season]?.text || 'text-[#3A3437]'}`}>{count} <span className="text-sm font-bold text-gray-400">times</span></p>
              </div>
            ))}
          </div>
        )}

        {/* FILTER BAR */}
        <div className="bg-white rounded-[1.5rem] border border-[#EEDDE4] shadow-sm px-6 py-4 mb-8 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#D23669]" />
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">Filter:</span>
          </div>
          <select value={filterSeason} onChange={(e) => { setFilterSeason(e.target.value); setPage(1); }}
            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none border-b-2 border-[#EEDDE4] focus:border-[#D23669] pb-1 cursor-pointer text-[#3A3437] transition-colors">
            <option value="ALL">All Seasons</option>
            {["Spring","Summer","Autumn","Winter"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none border-b-2 border-[#EEDDE4] focus:border-[#D23669] pb-1 cursor-pointer text-[#3A3437] transition-colors">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <div className="ml-auto text-[10px] font-black uppercase tracking-widest text-[#D23669]">{filtered.length} Results</div>
        </div>

        {/* GALLERY */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#EEDDE4] border-t-[#D23669] animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 animate-pulse">Loading Archive...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-[#EEDDE4] rounded-[2rem] bg-white">
            <Sparkles size={28} className="mx-auto mb-4 text-[#FFD1DC]" />
            <p className="text-[11px] text-gray-400 uppercase tracking-widest font-black mb-6">No items in history</p>
            <Link to="/analysis" className="inline-block px-8 py-3 bg-[#D23669] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-[#FF85A2] transition-all shadow-lg">
              Start New Analysis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((it) => {
              const sc = SEASON_STYLE[it.season] || SEASON_STYLE.Spring;
              return (
                <div key={it.id} className="group relative bg-white rounded-[2rem] border border-[#EEDDE4] overflow-hidden shadow-sm hover:shadow-[0_16px_36px_rgba(226,110,147,0.16)] transition-all duration-500 hover:-translate-y-1">
                  <button onClick={() => deleteOne(it.id)}
                    className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all bg-white shadow-lg rounded-full p-2.5 text-gray-300 hover:text-red-500 hover:scale-110">
                    <Trash2 size={14} />
                  </button>

                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#FFF5F8]">
                    <img src={resolveImageSrc(it.image_path) || "https://via.placeholder.com/400x300"}
                      alt="portrait" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=No+Image"; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {it.face_shape && (
                      <div className="absolute bottom-4 left-4 z-10">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm text-[#3A3437]">
                          {it.face_shape} Face
                        </span>
                      </div>
                    )}
                    {it.score && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-black/60 backdrop-blur text-white px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full">
                          Score {it.score}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${sc.badge}`}>
                          {it.season || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Calendar size={10} />
                        <span className="text-[9px] font-bold">{formatDate(it.created_at)}</span>
                      </div>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {it.eyebrows && <span className="text-[8px] font-black uppercase tracking-wide bg-[#F5F5F5] text-gray-500 px-2 py-1 rounded-full">{pretty(it.eyebrows,'brows')}</span>}
                      {it.eyes     && <span className="text-[8px] font-black uppercase tracking-wide bg-[#F5F5F5] text-gray-500 px-2 py-1 rounded-full">{pretty(it.eyes,'eyes')}</span>}
                      {it.lips     && <span className="text-[8px] font-black uppercase tracking-wide bg-[#F5F5F5] text-gray-500 px-2 py-1 rounded-full">{pretty(it.lips,'lips')}</span>}
                    </div>

                    <button onClick={() => setDetail(it)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-[#FFF5F8] border border-[#EEDDE4] rounded-full text-[10px] font-black uppercase tracking-widest text-[#D23669] hover:bg-[#D23669] hover:text-white transition-all">
                      View Details <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-5 py-2.5 rounded-full border-2 border-[#EEDDE4] text-[10px] font-black uppercase tracking-widest hover:bg-[#D23669] hover:text-white hover:border-[#D23669] transition-all disabled:opacity-30">
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-full text-[10px] font-black border-2 transition-all ${p === page ? 'bg-[#D23669] text-white border-[#D23669] shadow-lg' : 'border-[#EEDDE4] hover:border-[#D23669]'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-5 py-2.5 rounded-full border-2 border-[#EEDDE4] text-[10px] font-black uppercase tracking-widest hover:bg-[#D23669] hover:text-white hover:border-[#D23669] transition-all disabled:opacity-30">
              Next →
            </button>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {detail && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setDetail(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-[#EEDDE4] animate-in zoom-in-95 duration-300">
            <button onClick={() => setDetail(null)}
              className="absolute top-5 right-5 z-50 p-2 bg-white rounded-full shadow-md hover:bg-[#D23669] hover:text-white transition-all">
              <X size={18} />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="w-full md:w-56 aspect-[4/3] md:aspect-auto md:h-auto overflow-hidden bg-[#FFF5F8] flex-shrink-0">
                <img src={resolveImageSrc(detail.image_path) || "https://via.placeholder.com/400x300"}
                  alt="portrait" className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=No+Image"; }} />
              </div>

              {/* Detail content */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[80vh]">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {detail.season && (
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${SEASON_STYLE[detail.season]?.badge}`}>
                      {detail.season}
                    </span>
                  )}
                  {detail.score && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#1A1A1A] text-white">
                      Score {detail.score}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-[900] uppercase tracking-tighter text-[#3A3437] mb-1">
                  {detail.face_shape} Face Shape
                </h2>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-6">
                  {formatDate(detail.created_at)}
                </p>

                {/* Feature breakdown */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "Eyebrows", val: pretty(detail.eyebrows, "brows") },
                    { label: "Eyes", val: pretty(detail.eyes, "eyes") },
                    { label: "Nose", val: pretty(detail.nose, "nose") },
                    { label: "Lips", val: pretty(detail.lips, "lips") },
                  ].map(f => (
                    <div key={f.label} className="bg-[#FFF5F8] rounded-2xl p-4 border border-[#EEDDE4]">
                      <p className="text-[8px] font-black uppercase tracking-widest text-[#D23669] mb-1">{f.label}</p>
                      <p className="text-[11px] font-[900] uppercase text-[#3A3437]">{f.val}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Link to="/analysis"
                    className="flex-1 text-center py-3 bg-[#D23669] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#FF85A2] transition-all">
                    Re-Analyze
                  </Link>
                  <button onClick={() => deleteOne(detail.id)}
                    className="px-5 py-3 border-2 border-red-100 text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
