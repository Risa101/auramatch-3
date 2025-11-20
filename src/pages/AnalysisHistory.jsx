import React, { useEffect, useState, useCallback } from "react";


const COLORS = {
  base: "#FADCDC",
  accent: "#E6DCEB",
  primary: "#75464A",
  hover: "#D85E79",
};

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem("auramatch:analysisHistory") || "[]");
  } catch {
    return [];
  }
}

function formatDate(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString("th-TH", {
      dateStyle: "short",
      timeStyle: "medium",
    });
  } catch {
    return "-";
  }
}

export default function History() {
  const [items, setItems] = useState([]);
  const [filterSeason, setFilterSeason] = useState("ALL");
  const [filterFace, setFilterFace] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  /** โหลดประวัติจาก localStorage */
  const loadHistory = useCallback(() => {
    const list = readHistory();
    const normalized = list.map((it) => ({
      ...it,
      createdAt: it.createdAt ?? it.ts ?? Date.now(),
    }));
    normalized.sort((a, b) =>
      sort === "newest"
        ? (b.createdAt || 0) - (a.createdAt || 0)
        : (a.createdAt || 0) - (b.createdAt || 0)
    );
    setItems(normalized);
  }, [sort]);

  /** ฟัง event เปลี่ยนแปลง */
  useEffect(() => {
    loadHistory();

    const onLocal = () => loadHistory();
    const onStorage = (e) => {
      if (!e || !e.key || e.key === "auramatch:analysisHistory") {
        loadHistory();
      }
    };

    window.addEventListener("history:updated", onLocal);
    window.addEventListener("history:changed", onLocal);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("history:updated", onLocal);
      window.removeEventListener("history:changed", onLocal);
      window.removeEventListener("storage", onStorage);
    };
  }, [loadHistory]);

  /** ตัวกรอง */
  const filtered = items.filter((it) => {
    const s = search.trim().toLowerCase();
    if (filterSeason !== "ALL" && it.season !== filterSeason) return false;
    if (filterFace !== "ALL" && it.faceShape !== filterFace) return false;
    if (s && !`${it.season} ${it.faceShape}`.toLowerCase().includes(s)) return false;
    return true;
  });

  /** ลบรายการทั้งหมด */
  const clearAll = () => {
    if (window.confirm("ต้องการลบประวัติทั้งหมดหรือไม่?")) {
      localStorage.removeItem("auramatch:analysisHistory");
      setItems([]);
    }
  };

  /** ลบรายการเดียว */
  const deleteOne = (id) => {
    const next = items.filter((it) => it.id !== id);
    localStorage.setItem("auramatch:analysisHistory", JSON.stringify(next));
    window.dispatchEvent(new Event("history:changed"));
    setItems(next);
  };

  return (
    <div className="min-h-screen siteBG" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-[#75464A] mb-2">Analysis History</h1>
        <p className="text-sm text-[#75464A]/70 mb-6">
          ดูประวัติผลวิเคราะห์ที่ผ่านมา เลือกตั้งเป็นผลปัจจุบัน หรือจัดการรายการได้
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <input
            type="text"
            placeholder="Search season / face shape..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm text-[#75464A] shadow-sm"
            style={{ borderColor: COLORS.accent }}
          />

          <select
            className="border rounded-lg px-2 py-1 text-sm text-[#75464A]"
            value={filterSeason}
            onChange={(e) => setFilterSeason(e.target.value)}
            style={{ borderColor: COLORS.accent }}
          >
            <option value="ALL">ALL Season</option>
            <option>Spring</option>
            <option>Summer</option>
            <option>Autumn</option>
            <option>Winter</option>
          </select>

          <select
            className="border rounded-lg px-2 py-1 text-sm text-[#75464A]"
            value={filterFace}
            onChange={(e) => setFilterFace(e.target.value)}
            style={{ borderColor: COLORS.accent }}
          >
            <option value="ALL">ALL Face</option>
            <option>Oval</option>
            <option>Round</option>
            <option>Square</option>
            <option>Heart</option>
            <option>Diamond</option>
            <option>Rectangle</option>
          </select>

          <select
            className="border rounded-lg px-2 py-1 text-sm text-[#75464A]"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ borderColor: COLORS.accent }}
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>

          <button
            onClick={clearAll}
            className="rounded-lg border px-3 py-1.5 text-sm text-[#75464A] bg-white shadow-sm hover:bg-[#FADCDC]"
            style={{ borderColor: COLORS.accent }}
          >
            Clear all
          </button>
        </div>

        {/* History cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#75464A]/60">
            ยังไม่มีประวัติ หรือไม่ตรงกับตัวกรอง
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((it) => (
              <div
                key={it.id}
                className="rounded-2xl border bg-white/80 p-4 shadow-sm relative"
                style={{ borderColor: COLORS.accent }}
              >
                <button
                  onClick={() => deleteOne(it.id)}
                  className="absolute top-2 right-2 text-xs text-[#75464A]/60 hover:text-[#D85E79]"
                  title="ลบรายการนี้"
                >
                  ✕
                </button>

                <div className="flex justify-center mb-3">
                  <img
                    src={it.preview || "/assets/analysis.JPG"}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                    style={{ borderColor: COLORS.accent }}
                  />
                </div>
                <div className="flex justify-center flex-wrap gap-1 mb-2">
                  {it.season && (
                    <span className="rounded-full bg-[#FADCDC] px-2 py-0.5 text-xs text-[#75464A] font-medium">
                      {it.season}
                    </span>
                  )}
                  {it.faceShape && (
                    <span className="rounded-full bg-[#E6DCEB] px-2 py-0.5 text-xs text-[#75464A] font-medium">
                      {it.faceShape}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-center text-[#75464A]/60">
                  {formatDate(it.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
