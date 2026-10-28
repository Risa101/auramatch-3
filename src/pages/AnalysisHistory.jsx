import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { Trash2, Sparkles, X, Calendar } from "lucide-react";
import { lsGet } from "../utils/storage";
import { getAnalysisHistory, deleteAnalysis } from "../callapi/call_api_user";
import { PERSONAL_COLORS } from "../data/personalColors";

function formatDate(dateStr) {
  try {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("th-TH", {
      month: "long", day: "numeric", year: "numeric",
    });
  } catch { return "-"; }
}

function formatShort(dateStr) {
  try {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("th-TH", { month: "short", day: "numeric", year: "2-digit" });
  } catch { return "-"; }
}

const PAGE_SIZE = 9;
const SERIF = "font-['Cormorant_Garamond',serif]";

const SEASON_LABELS_TH = { Spring: "ฤดูใบไม้ผลิ", Summer: "ฤดูร้อน", Autumn: "ฤดูใบไม้ร่วง", Winter: "ฤดูหนาว" };
const FACE_TYPE_LABELS_TH = { Oval: "รูปไข่", Round: "กลม", Square: "เหลี่ยม", Heart: "หัวใจ", Diamond: "เพชร", Triangle: "สามเหลี่ยม", Rectangle: "ยาว" };

// Same illustrations as the home page "Which Shape Are You?" strip
const FACE_SHAPE_IMAGES = {
  Oval: "/assets/ovalface.jpeg",
  Round: "/assets/roundface.jpg",
  Square: "/assets/recface.jpg",
  Heart: "/assets/heartface.jpg",
  Diamond: "/assets/diamondface.jpg",
  Triangle: "/assets/triagle.jpg",
  Rectangle: "/assets/rectangular.jpg",
};

const FEATURE_MAP = {
  brows: { softArch: "คิ้วโค้งอ่อน", straight: "คิ้วตรง", arched: "คิ้วโก่งสูง" },
  eyes:  { natural: "อายไล่สีธรรมชาติ", cat: "อายไลเนอร์ยกหางตา", dolly: "ตาโตกลมหวาน" },
  nose:  { softContour: "คอนทัวร์นุ่มนวล", definedContour: "คอนทัวร์คมชัด", natural: "ธรรมชาติ" },
  lips:  { gradient: "ลิปไล่สี", full: "ลิปเต็มปากสีเข้ม", soft: "ลิปเบลอนุ่มนวล" },
};
const pretty = (val, group) => (FEATURE_MAP[group] || {})[val] || val || "—";

const paletteOf = (season) =>
  PERSONAL_COLORS.find(p => p.season?.toLowerCase() === season?.toLowerCase())?.colors || ["#F5E3E8", "#FBF2F4", "#EBD9B4", "#F7C9D6"];

// Soft wash built from the season's own palette (same treatment as the profile season card)
const seasonWash = (season) => {
  const c = paletteOf(season);
  return `linear-gradient(135deg, ${c[0]}66 0%, #FFFFFF 55%, ${c[2]}44 100%)`;
};

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
    AOS.init({ duration: 1000, easing: "ease-out-back", once: true });
  }, []);
  useEffect(() => {
    if (!loading) setTimeout(() => AOS.refresh(), 100);
  }, [loading, page, filterSeason]);

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
    if (!window.confirm("ลบรายการนี้ออกจากประวัติ?")) return;
    const prev = items;
    setItems(cur => cur.filter(it => it.id !== analysisId));
    try {
      const ok = await deleteAnalysis(analysisId);
      if (!ok) { setItems(prev); alert("ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"); }
    } catch { setItems(prev); alert("เกิดข้อผิดพลาด"); }
  };

  const stats = [
    { label: "ครั้งที่วิเคราะห์", value: items.length },
    { label: "ฤดูที่พบบ่อย", value: topSeason || "—", italic: true },
    { label: "ล่าสุด", value: items[0] ? formatShort(sort === "newest" ? items[0].created_at : items[items.length - 1].created_at) : "—" },
    { label: "ฤดูที่เคยได้", value: Object.keys(seasonCounts).length },
  ];

  return (
    <div className="bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#FFDCE6] selection:text-[#C85A7D] antialiased pt-[60px] lg:pt-[180px] pb-24 overflow-x-hidden">

      {/* --- HERO --- */}
      <header className="relative overflow-hidden bg-[#FBF2F4]">
        <div className="absolute -left-32 -top-32 w-[420px] h-[420px] rounded-full bg-[#F7C9D6]/50 blur-3xl pointer-events-none" />
        <div className="absolute right-[8%] -bottom-40 w-[380px] h-[380px] rounded-full bg-[#EBD9B4]/40 blur-3xl pointer-events-none" />

        <div className="relative max-w-[1100px] mx-auto px-6 md:px-10 py-12 md:py-14 flex flex-col md:flex-row md:items-end justify-between gap-8" data-aos="fade-up">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-[#C5A358]" />
              <p className="text-[9px] tracking-[0.45em] uppercase text-[#C5A358] font-[500]">Personal Archive</p>
            </div>
            <h1 className={`${SERIF} text-[2.8rem] md:text-[3.6rem] leading-[1.1] pb-1 font-[500] text-[#2B2226]`}>
              Analysis <span className="italic text-[#D23669]">History</span>
            </h1>
            <p className="mt-2 text-[12px] text-[#9A8A90] font-[300]">
              ผลวิเคราะห์ทุกครั้งของคุณ{topSeason ? ` · ส่วนใหญ่เป็น ${SEASON_LABELS_TH[topSeason] || topSeason}` : ""}
            </p>
          </div>
          <Link to="/analysis"
            className="self-start md:self-auto rounded-full bg-[#D23669] hover:bg-[#B92D5B] text-white px-7 py-3 text-[9px] font-[600] uppercase tracking-[0.25em] shadow-[0_8px_20px_rgba(210,54,105,0.25)] transition-colors">
            + วิเคราะห์ใหม่
          </Link>
        </div>

        {/* Stats */}
        {items.length > 0 && (
          <div className="relative border-t border-[#EADBDF] bg-white/50 backdrop-blur-sm">
            <div className="max-w-[1100px] mx-auto px-6 md:px-10 grid grid-cols-4">
              {stats.map((s, i) => (
                <div key={s.label} className={`py-5 text-center ${i < 3 ? "border-r border-[#EADBDF]" : ""}`}>
                  <p className={`${SERIF} text-[1.6rem] md:text-[2rem] leading-none text-[#2B2226] [font-variant-numeric:lining-nums] ${s.italic ? "italic text-[#D23669]" : ""}`}>{s.value}</p>
                  <p className="text-[8px] md:text-[9px] tracking-[0.25em] uppercase text-[#9A8A90] font-[300] mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="max-w-[1100px] mx-auto px-6 md:px-10 pt-10">

        {/* --- FILTER BAR --- */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex flex-wrap gap-2">
            {["ALL", "Spring", "Summer", "Autumn", "Winter"].map(s => {
              const active = filterSeason === s;
              const count = s === "ALL" ? items.length : (seasonCounts[s] || 0);
              return (
                <button key={s} onClick={() => { setFilterSeason(s); setPage(1); }}
                  className={`inline-flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5 text-[9px] uppercase tracking-[0.2em] font-[500] border transition-colors ${
                    active
                      ? "bg-[#2B2226] text-white border-[#2B2226]"
                      : "bg-white text-[#5E5257] border-[#F0E6E9] hover:border-[#D23669] hover:text-[#D23669]"
                  }`}>
                  {s !== "ALL" && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: paletteOf(s)[1] }} />}
                  {s === "ALL" ? "ทั้งหมด" : s}
                  <span className={`min-w-5 h-5 px-1.5 rounded-full text-[9px] flex items-center justify-center ${active ? "bg-white/15" : "bg-[#FBF2F4] text-[#D23669]"}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="ml-auto rounded-full bg-white text-[9px] uppercase tracking-[0.2em] outline-none border border-[#F0E6E9] px-4 py-2 focus:border-[#2B2226] cursor-pointer text-[#2B2226] transition-colors">
            <option value="newest">ใหม่สุดก่อน</option>
            <option value="oldest">เก่าสุดก่อน</option>
          </select>
        </div>

        {/* --- GALLERY --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-8 h-8 border border-[#D23669] border-t-transparent rounded-full animate-spin" />
            <p className="text-[9px] tracking-[0.35em] uppercase text-[#9A8A90] mt-5">กำลังโหลด...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-[#EADBDF]">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[#FBF2F4] flex items-center justify-center text-[#D23669]">
              <Sparkles size={18} />
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#9A8A90] font-[300] mb-6">ยังไม่มีประวัติการวิเคราะห์</p>
            <Link to="/analysis" className="inline-block rounded-full bg-[#D23669] hover:bg-[#B92D5B] text-white px-7 py-3 text-[9px] font-[600] uppercase tracking-[0.25em] transition-colors">
              เริ่มวิเคราะห์
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((it, i) => {
              const src = resolveImageSrc(it.image_path);
              const colors = paletteOf(it.season);
              return (
                <article key={it.id} data-aos="fade-up" data-aos-delay={(i % 3) * 60}
                  className="group relative rounded-2xl bg-white border border-[#F0E6E9] overflow-hidden shadow-[0_10px_30px_rgba(43,34,38,0.05)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(210,54,105,0.12)] transition-all duration-300">

                  {/* Photo — or the season wash with the face-shape illustration */}
                  <button type="button" onClick={() => setDetail(it)} className="block w-full text-left">
                    <div className="relative aspect-[4/3] overflow-hidden" style={{ background: seasonWash(it.season) }}>
                      {src ? (
                        <img src={src} alt="portrait"
                          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                          onError={(e) => { e.target.style.display = "none"; }} />
                      ) : FACE_SHAPE_IMAGES[it.face_shape] ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="h-[78%] aspect-[3/4] rounded-t-full bg-white ring-1 ring-[#C5A358]/40 overflow-hidden">
                            <img src={FACE_SHAPE_IMAGES[it.face_shape]} alt={it.face_shape} className="w-full h-full object-contain p-2 pt-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#C0B8B4]"><Sparkles size={26} /></div>
                      )}

                      {/* Date chip */}
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[9px] tracking-[0.15em] text-[#2B2226] shadow-sm">
                        {formatShort(it.created_at)}
                      </span>
                      {it.score && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-[#2B2226]/80 backdrop-blur-sm text-white px-3 py-1 text-[9px] uppercase tracking-[0.2em]">
                          Score {it.score}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Delete */}
                  <button onClick={() => deleteOne(it.id)} aria-label="ลบ"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#9A8A90] opacity-0 group-hover:opacity-100 hover:bg-[#2B2226] hover:text-white transition-all shadow-sm">
                    <Trash2 size={13} />
                  </button>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className={`${SERIF} italic text-[2rem] leading-[1.15] pb-0.5 text-[#2B2226]`}>{it.season || "—"}</h3>
                        <p className="text-[9px] tracking-[0.25em] uppercase text-[#C5A358] font-[500] mt-1">
                          {SEASON_LABELS_TH[it.season] || ""}{it.face_shape ? ` · หน้า${FACE_TYPE_LABELS_TH[it.face_shape] || it.face_shape}` : ""}
                        </p>
                      </div>
                      <div className="flex -space-x-2 pt-2 shrink-0">
                        {colors.map((c) => (
                          <span key={c} className="h-6 w-6 rounded-full ring-2 ring-white" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>

                    {(it.eyebrows || it.eyes || it.lips) && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {it.eyebrows && <span className="rounded-full text-[10px] bg-[#FBF2F4] text-[#7A5A66] px-2.5 py-0.5">{pretty(it.eyebrows, "brows")}</span>}
                        {it.eyes && <span className="rounded-full text-[10px] bg-[#FBF2F4] text-[#7A5A66] px-2.5 py-0.5">{pretty(it.eyes, "eyes")}</span>}
                        {it.lips && <span className="rounded-full text-[10px] bg-[#FBF2F4] text-[#7A5A66] px-2.5 py-0.5">{pretty(it.lips, "lips")}</span>}
                      </div>
                    )}

                    <button onClick={() => setDetail(it)}
                      className="mt-5 w-full flex items-center justify-between pt-4 border-t border-[#F3EBEE] text-[9px] uppercase tracking-[0.25em] text-[#9A8A90] hover:text-[#D23669] transition-colors group/btn">
                      <span>ดูรายละเอียด</span>
                      <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded-full px-5 h-10 border border-[#F0E6E9] bg-white text-[9px] uppercase tracking-[0.2em] text-[#5E5257] hover:border-[#D23669] hover:text-[#D23669] disabled:opacity-30 disabled:hover:border-[#F0E6E9] disabled:hover:text-[#5E5257] transition-colors">
              ← ก่อนหน้า
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-full text-[11px] transition-colors ${p === page ? "bg-[#D23669] text-white shadow-[0_6px_16px_rgba(210,54,105,0.25)]" : "bg-white border border-[#F0E6E9] text-[#5E5257] hover:border-[#D23669] hover:text-[#D23669]"}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="rounded-full px-5 h-10 border border-[#F0E6E9] bg-white text-[9px] uppercase tracking-[0.2em] text-[#5E5257] hover:border-[#D23669] hover:text-[#D23669] disabled:opacity-30 disabled:hover:border-[#F0E6E9] disabled:hover:text-[#5E5257] transition-colors">
              ถัดไป →
            </button>
          </div>
        )}
      </div>

      {/* --- DETAIL MODAL --- */}
      {detail && (() => {
        const src = resolveImageSrc(detail.image_path);
        const colors = paletteOf(detail.season);
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#2B2226]/60 backdrop-blur-sm" onClick={() => setDetail(null)} />
            <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">

              <button onClick={() => setDetail(null)} aria-label="ปิด"
                className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-[#5E5257] hover:bg-[#2B2226] hover:text-white transition-colors">
                <X size={16} />
              </button>

              {/* Image side */}
              <div className="relative w-full md:w-[42%] aspect-[4/3] md:aspect-auto shrink-0 flex items-center justify-center"
                style={{ background: seasonWash(detail.season) }}>
                {src ? (
                  <img src={src} alt="portrait" className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }} />
                ) : FACE_SHAPE_IMAGES[detail.face_shape] ? (
                  <div className="h-[70%] md:h-auto md:w-[70%] aspect-[3/4] rounded-t-full bg-white ring-1 ring-[#C5A358]/40 overflow-hidden">
                    <img src={FACE_SHAPE_IMAGES[detail.face_shape]} alt={detail.face_shape} className="w-full h-full object-contain p-2 pt-4" />
                  </div>
                ) : (
                  <Sparkles size={30} className="text-[#C0B8B4]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-7 md:p-8 overflow-y-auto">
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#9A8A90]">ฤดูของคุณ</p>
                <h2 className={`${SERIF} italic text-[3rem] leading-[1.15] pb-1 text-[#2B2226]`}>{detail.season || "—"}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={11} className="text-[#C5A358]" />
                  <p className="text-[10px] tracking-[0.15em] text-[#9A8A90]">{formatDate(detail.created_at)}</p>
                  {detail.score && (
                    <span className="ml-2 rounded-full bg-[#2B2226] text-white px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em]">Score {detail.score}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-5">
                  <div className="flex -space-x-2">
                    {colors.map((c) => (
                      <span key={c} className="h-8 w-8 rounded-full ring-[3px] ring-white shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-[9px] tracking-[0.3em] uppercase text-[#9A8A90]">Palette</span>
                </div>

                <dl className="mt-5 divide-y divide-[#F3EBEE] border-t border-[#F3EBEE]">
                  {[
                    { label: "ทรงหน้า", val: FACE_TYPE_LABELS_TH[detail.face_shape] || detail.face_shape || "—" },
                    { label: "โทนผิว", val: detail.skin_tone || "—" },
                    { label: "คิ้ว", val: pretty(detail.eyebrows, "brows") },
                    { label: "ดวงตา", val: pretty(detail.eyes, "eyes") },
                    { label: "จมูก", val: pretty(detail.nose, "nose") },
                    { label: "ริมฝีปาก", val: pretty(detail.lips, "lips") },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-[11px] text-[#9A8A90] font-[300]">{f.label}</dt>
                      <dd className="text-[12px] font-[500] text-[#2B2226] text-right">{f.val}</dd>
                    </div>
                  ))}
                </dl>

                <div className="flex gap-3 mt-6">
                  <Link to="/analysis"
                    className="flex-1 text-center rounded-full py-3 bg-[#D23669] text-white text-[9px] font-[600] uppercase tracking-[0.25em] hover:bg-[#B92D5B] transition-colors">
                    วิเคราะห์อีกครั้ง
                  </Link>
                  <button onClick={() => deleteOne(detail.id)} aria-label="ลบ"
                    className="w-11 h-11 rounded-full border border-[#F0E6E9] text-[#9A8A90] flex items-center justify-center hover:border-red-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
