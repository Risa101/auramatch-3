// src/pages/MakeupLooks.jsx
import React, { useEffect, useMemo, useState } from "react";
import { likeLook, unlikeLook } from "../utils/likes";

const THEME = {
  base: "#FADCDC",
  accent: "#E6DCEB",
  primary: "#75464A",
  hover: "#D85E79",
};

const DATA = {
  Spring: [
    {
      title: "Fresh Peach Glow",
      desc: "ชีคโทนพีชใส ๆ ปากกลอสวาว",
      img: "/makeup/spring/spring1.jpg",
      products: [
        { name: "Peach Blush", url: "https://laglacecosme.com/home/" },
        { name: "Lip Oil", url: "https://laglacecosme.com/home/" },
      ],
    },
    {
      title: "Soft Coral Daily",
      desc: "คอรัลนุ่ม ๆ ใช้ได้ทุกวัน",
      img: "/makeup/spring/spring2.jpg",
      products: [{ name: "Cream Blush Coral", url: "https://laglacecosme.com/home/" }],
    },
    {
      title: "Apricot Shine",
      desc: "แก้มแอพริคอตฉ่ำ สุขภาพดี",
      img: "/makeup/spring/spring3.jpg",
      products: [{ name: "Glowy Base", url: "https://laglacecosme.com/home/" }],
    },
  ],
  Summer: [
    {
      title: "Rose Mauve Chic",
      desc: "ชมพูอมม่วงสุภาพ คูลโทน",
      img: "/makeup/summer/summer1.jpg",
      products: [
        { name: "Mauve Blush", url: "https://laglacecosme.com/home/" },
        { name: "Tinted Balm", url: "https://laglacecosme.com/home/" },
      ],
    },
    {
      title: "Cool Pink Glow",
      desc: "โกลว์ใส ปากชมพูคูล",
      img: "/makeup/summer/summer2.jpg",
      products: [{ name: "Pink Balm Oil", url: "https://laglacecosme.com/home/" }],
    },
    {
      title: "Lilac Sheen",
      desc: "เปลือกตาไลแลควาว ๆ",
      img: "/makeup/summer/summer3.jpg",
      products: [{ name: "Sheer Highlighter", url: "https://laglacecosme.com/home/" }],
    },
  ],
  Autumn: [
    {
      title: "Warm Terracotta",
      desc: "ส้มอิฐอุ่น ๆ ดูแพง",
      img: "/makeup/autumn/autumn1.jpg",
      products: [
        { name: "Terracotta Blush", url: "https://laglacecosme.com/home/" },
        { name: "Matte Lip", url: "https://laglacecosme.com/home/" },
      ],
    },
    {
      title: "Honey Bronze",
      desc: "โทนน้ำผึ้งบ่มแดด",
      img: "/makeup/autumn/autumn2.jpg",
      products: [{ name: "Bronzer", url: "https://laglacecosme.com/home/" }],
    },
    {
      title: "Caramel Wash",
      desc: "ตาสีคาราเมลนุ่มละมุน",
      img: "/makeup/autumn/autumn3.jpg",
      products: [{ name: "Glow Stick", url: "https://laglacecosme.com/home/" }],
    },
  ],
  Winter: [
    {
      title: "Berry Statement",
      desc: "ปากเบอร์รี่เด่น ชัดคม",
      img: "/makeup/winter/winter1.jpg",
      products: [{ name: "Berry Lip", url: "https://laglacecosme.com/home/" }],
    },
    {
      title: "Plum Glow Night",
      desc: "พลัมโกลว์สำหรับกลางคืน",
      img: "/makeup/winter/winter2.jpg",
      products: [{ name: "Plum Cream Blush", url: "https://laglacecosme.com/home/" }],
    },
    {
      title: "Ruby Edge",
      desc: "ริมฝีปากแดงรูบี้ เนี้ยบคม",
      img: "/makeup/winter/winter3.jpg",
      products: [{ name: "Cool Contour", url: "https://laglacecosme.com/home/" }],
    },
  ],
};

const PALETTE = {
  Spring: ["#FBD2B7", "#FFC78A", "#F8A87A", "#F6E2A2"],
  Summer: ["#D8C4F2", "#BFD6F6", "#CFE5F7", "#E3D9F9"],
  Autumn: ["#C17A43", "#E29D62", "#A4743A", "#B69355"],
  Winter: ["#AC1740", "#1F2E5E", "#44445A", "#B2B0BE"],
};

/* ---------- Small UI ---------- */
function Orb({ className = "", from = THEME.base, to = THEME.accent }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute blur-3xl opacity-60 ${className}`}
      style={{
        background: `radial-gradient(520px 240px at 50% 50%, ${from}a6 0%, transparent 70%), radial-gradient(380px 200px at 60% 40%, ${to}a8 0%, transparent 70%)`,
      }}
    />
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition
      ${active ? "bg-[#75464A] text-white border-[#75464A] shadow-sm" : "bg-white text-[#75464A] border-[#E6DCEB] hover:bg-[#D85E79] hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function SwatchBar({ colors }) {
  return (
    <div className="flex overflow-hidden rounded-full ring-1 ring-[#E6DCEB]">
      {colors.map((c, i) => (
        <div key={i} className="h-2 w-10 sm:w-12" style={{ background: c }} />
      ))}
    </div>
  );
}

/** รูปอัตราส่วนคงที่ + skeleton โหลด */
function AspectImage({ src, alt, ratio = "4/5", className = "" }) {
  const pb =
    ratio === "1/1" ? "pb-[100%]" :
    ratio === "3/4" ? "pb-[133.333%]" :
    "pb-[125%]";

  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative w-full overflow-hidden ${pb}`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-[#E6DCEB]/30" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
    </div>
  );
}

function LookCard({ look, season, fav, onFav, onQuick }) {
  const { title, desc, img, products } = look;
  const seasonColors = PALETTE[season] || [];
  return (
    <article
      className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      style={{ borderColor: THEME.accent }}
      title={`${title} • ${season}`}
    >
      <div className="relative">
        <AspectImage src={img} alt={title} ratio="4/5" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition group-hover:opacity-100" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-[#75464A] shadow">
          {season} Look
        </span>
        <button
          onClick={onFav}
          aria-label="Save favorite"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#75464A] shadow transition hover:bg-white"
          title={fav ? "Unfavorite" : "Favorite"}
        >
          {fav ? "❤️" : "🤍"}
        </button>
        <button
          onClick={onQuick}
          className="absolute right-3 bottom-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#75464A] shadow-sm transition hover:bg-white"
        >
          Quick view
        </button>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="line-clamp-1 text-[15px] font-semibold text-[#75464A]">{title}</h3>
          <div className="ml-3 hidden items-center gap-1 sm:flex">
            {seasonColors.slice(0, 3).map((c, i) => (
              <span key={i} className="h-3 w-3 rounded-full ring-1 ring-white shadow" style={{ background: c }} />
            ))}
          </div>
        </div>
        <p className="line-clamp-2 text-xs text-[#75464A]/70">{desc}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {products.map((p, idx) => (
            <a
              key={idx}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-[#E6DCEB] bg-white px-3 py-1 text-xs font-medium text-[#75464A] transition hover:bg-[#D85E79] hover:text-white"
              title={p.name}
            >
              <span className="max-w-[140px] truncate">{p.name}</span>
              <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" className="opacity-70">
                <path d="M11 3h6v6h-2V6.41l-7.29 7.3-1.42-1.42 7.3-7.29H11V3z" />
                <path d="M5 5h3V3H3v5h2V5z" />
                <path d="M3 11h2v4h4v2H3v-6z" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

/* ---------- Main ---------- */
export default function MakeupLooks() {
  const [season, setSeason] = useState("Spring");
  const [query, setQuery] = useState("");

  // Set ของ lookId (season:title)
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem("auramatch:likes");
      return new Set(raw ? JSON.parse(raw).map((x) => x.id) : []);
    } catch {
      return new Set();
    }
  });

  const [quick, setQuick] = useState(null); // { ...look, season }

  // sync เมื่อ likes เปลี่ยนจากที่อื่น (Dashboard/อีกแท็บ)
  useEffect(() => {
    const onChange = () => {
      try {
        const raw = localStorage.getItem("auramatch:likes");
        const arr = raw ? JSON.parse(raw) : [];
        setFavorites(new Set(arr.map((x) => x.id)));
      } catch {}
    };
    window.addEventListener("likes:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("likes:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const items = useMemo(() => DATA[season] || [], [season]);
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (l) => l.title.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q)
    );
  }, [items, query]);

  const idFor = (look, s) => `${s}:${look.title}`;
  const makePayload = (look, s) => ({
    id: idFor(look, s),
    title: look.title,
    season: s,
    img: look.img,
    tags: look.products?.map((p) => p.name) || [],
    ext: look.products?.[0]?.url || "#",
  });

  function toggleFav(look, s) {
    const id = idFor(look, s);
    const isFav = favorites.has(id);

    // อัปเดต UI ทันที
    setFavorites((prev) => {
      const n = new Set(prev);
      if (isFav) {
        n.delete(id);
        unlikeLook(id);
      } else {
        n.add(id);
        likeLook(makePayload(look, s));
      }
      return n;
    });
  }

  function randomize() {
    if (filtered.length === 0) return;
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    setQuick({ ...pick, season });
  }

  function copyRoutine(look) {
    const parts = [
      `Makeup Look: ${look.title} (${season})`,
      `• Base: โกลว์บางเบาเนียนผิว`,
      `• Cheeks: บลัชให้ฟุ้งบริเวณโหนกแก้ม`,
      `• Eyes: ไลน์เนอร์บาง + มาสคาร่า`,
      `• Lips: โทนเข้ากับลุค (ทับด้วยกลอสถ้าต้องการ)`,
      "",
      "Products:",
      ...look.products.map((p) => `- ${p.name}: ${p.url}`),
    ].join("\n");
    navigator.clipboard?.writeText(parts);
  }

  return (
    <div
      className="relative min-h-screen"
      style={{ background: `linear-gradient(180deg, ${THEME.base}33 0%, ${THEME.accent}22 100%)` }}
    >
      {/* floating blobs */}
      <Orb className="top-[-200px] left-[-120px] h-[460px] w-[760px] animate-float-slow" />
      <Orb className="top-[120px] right-[-140px] h-[380px] w-[580px] animate-float" from="#fde2ea" to="#e2dbfb" />

      {/* Header / Filters bar */}
      <section className="relative z-10 border-b bg-white/80 backdrop-blur" style={{ borderColor: THEME.accent }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: THEME.hover }} />
            <h1 className="text-xl font-semibold text-[#75464A]">Makeup Looks by Personal Color</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["Spring", "Summer", "Autumn", "Winter"].map((s) => (
              <Chip key={s} active={season === s} onClick={() => setSeason(s)}>
                {s}
              </Chip>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#E6DCEB] bg-white px-3 py-2 shadow-sm">
            <svg viewBox="0 0 24 24" width="18" height="18" className="text-[#75464A]/70" fill="currentColor">
              <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อ / คำอธิบายลุค"
              className="w-40 bg-transparent text-sm text-[#75464A] placeholder:text-[#75464A]/50 focus:outline-none md:w-64"
            />
          </div>
        </div>
      </section>

      {/* Season banner */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <div
            className="flex items-center justify-between rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur"
            style={{ borderColor: THEME.accent }}
          >
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-white px-3 py-1 text-xs font-semibold text-[#75464A] ring-1 ring-[#E6DCEB]">
                {season} palette
              </span>
              <SwatchBar colors={PALETTE[season]} />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={randomize}
                className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-[#75464A] transition hover:bg-[#D85E79] hover:text-white"
                style={{ borderColor: THEME.accent }}
                title="สุ่มลุค"
              >
                🎲 Random
              </button>
              <a
                href="#tips"
                className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-[#75464A] transition hover:bg-[#D85E79] hover:text-white"
                style={{ borderColor: THEME.accent }}
              >
                Tips
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 text-sm text-[#75464A]/70">
          พบลุค <b>{filtered.length}</b> แบบ • Season: <b>{season}</b>
        </div>

        {filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-[#E6DCEB] bg-white/70 p-12 text-sm text-[#75464A]/70">
            ไม่พบลุคตามคำค้นหา ลองพิมพ์คำอื่น หรือเปลี่ยนฤดูกาล
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((look, i) => {
              const id = idFor(look, season);
              const fav = favorites.has(id);
              return (
                <LookCard
                  key={i}
                  look={look}
                  season={season}
                  fav={fav}
                  onFav={() => toggleFav(look, season)}
                  onQuick={() => setQuick({ ...look, season })}
                />
              );
            })}
          </div>
        )}

        {/* Tips */}
        <div id="tips" className="mt-10 rounded-2xl border border-[#E6DCEB] bg-white p-5 text-sm text-[#75464A]">
          <div className="mb-2 font-semibold">Tips</div>
          <ul className="list-disc space-y-1 pl-5">
            <li>วางรูปภาพไว้ที่ <code>/public/makeup/&lt;season&gt;/&lt;file&gt;.jpg</code></li>
            <li>แก้ลิงก์สินค้าให้ไปยังหน้าจริงของ La Glace โดยแก้ค่า <code>url</code> ในอาเรย์</li>
            <li>เพิ่ม/ลดลุคได้ง่าย ๆ โดยแก้ในอ็อบเจ็กต์ <code>DATA</code></li>
          </ul>
        </div>
      </main>

      {/* Quick View Modal */}
      {quick && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button
              onClick={() => setQuick(null)}
              className="absolute right-4 top-4 rounded-full bg-white/90 px-2 py-1 text-sm text-gray-700 shadow hover:bg-white"
              aria-label="Close quick view"
            >
              ✕
            </button>
            <div className="grid gap-0 md:grid-cols-2">
              <div className="relative">
                <AspectImage src={quick.img} alt={quick.title} ratio="4/5" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-[#75464A] shadow">
                  {quick.season}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#75464A]">{quick.title}</h3>
                <p className="mt-1 text-sm text-[#75464A]/70">{quick.desc}</p>

                <div className="mt-3 rounded-xl border border-[#E6DCEB] bg-white/80 p-3 text-xs text-[#75464A]">
                  <div className="mb-1 font-semibold">How to:</div>
                  <ol className="list-decimal space-y-1 pl-5">
                    <li>Base โกลว์บางเบา ให้ผิวดูสว่างสุขภาพดี</li>
                    <li>Cheeks เกลี่ยบลัชให้ฟุ้ง ไล่ระดับ</li>
                    <li>Eyes แตะชิมเมอร์บาง ๆ + ไลน์เนอร์เส้นเล็ก</li>
                    <li>Lips เลือกโทนให้เข้ากับลุค (ทับกลอสได้)</li>
                  </ol>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {quick.products.map((p, i) => (
                    <a
                      key={i}
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-[#E6DCEB] bg-white px-3 py-1 text-xs font-semibold text-[#75464A] transition hover:bg-[#D85E79] hover:text-white"
                    >
                      {p.name} ↗
                    </a>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => copyRoutine(quick)}
                    className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-[#75464A] transition hover:bg-[#D85E79] hover:text-white"
                    style={{ borderColor: THEME.accent }}
                  >
                    คัดลอกรูทีน ✂️
                  </button>
                  <button
                    onClick={() => {
                      likeLook({
                        id: idFor(quick, quick.season),
                        title: quick.title,
                        season: quick.season,
                        img: quick.img,
                        tags: quick.products?.map((p) => p.name) || [],
                        ext: quick.products?.[0]?.url || "#",
                      });
                      setFavorites((prev) => {
                        const n = new Set(prev);
                        n.add(idFor(quick, quick.season));
                        return n;
                      });
                    }}
                    className="rounded-xl bg-[#75464A] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    เซฟเป็น Favorite ❤️
                  </button>
                </div>

                <div className="mt-3 text-[11px] text-gray-500">
                  * แนะนำสีอิง <b>Personal Color</b> ({quick.season})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 mt-10 border-t border-[#E6DCEB] bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-xs text-[#75464A]/70">
          <span>© 2025 AuraMatch. Makeup looks demo.</span>
          <a
            href="https://laglacecosme.com/home/"
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-2 py-1 text-[#75464A] transition hover:bg-[#D85E79] hover:text-white"
          >
            Visit La Glace
          </a>
        </div>
      </footer>

      {/* keyframes */}
      <style>{`
        @keyframes float { 0% { transform: translateY(0) } 50% { transform: translateY(-10px) } 100% { transform: translateY(0) } }
        @keyframes float-slow { 0% { transform: translateY(0) translateX(0) } 50% { transform: translateY(-8px) translateX(6px) } 100% { transform: translateY(0) translateX(0) } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
