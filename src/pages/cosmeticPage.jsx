// src/pages/cosmeticPage.jsx
import React, { useMemo, useState } from "react";

/** ============================
 *  THEME (AuraMatch look)
 *  ============================ */
const BRAND = {
  bgFrom: "#faf2f6",
  bgTo:   "#f0ebf7",
  primary:"#75464A",
  accent: "#E6DCEB",
  hover:  "#D85E79",
  ring:   "#ead8df",
};

/** ============================
 *  MOCK DATA + PLATFORM LINKS
 *  - เปลี่ยน url ของจริงได้ตามต้องการ
 *  ============================ */
const ALL_PRODUCTS = [
  {
    id: "fd-01",
    name: "Radiant Glow Foundation",
    category: "foundation",
    price: 850,
    rating: 4.7,
    shades: ["#EED2C3", "#E6BEAA", "#D5A48E", "#B9826B"],
    seasonTags: ["Spring"],
    img: "/assets/cushion.png",
    desc: "รองพื้นเนื้อบางเบา เปล่งปลั่งเป็นธรรมชาติ คุมความชุ่มฉ่ำแบบผิวสุขภาพดี",
    links: {
      tiktok:  "https://www.tiktok.com/",
      shopee:  "https://shopee.co.th/",
      lazada:  "https://www.lazada.co.th/",
    },
  },
  {
    id: "lp-01",
    name: "Velvet Matte Lipstick – Cherry Red",
    category: "lipstick",
    price: 590,
    rating: 4.9,
    shades: ["#AC1740"],
    seasonTags: ["Winter"],
    img: "/assets/lipoil.png",
    desc: "แมตต์ไม่แห้งตึง เม็ดสีแน่น คมชัด คอมพลีตลุคหรูสไตล์สายแฟ",
    links: {
      tiktok:  "https://www.tiktok.com/",
      shopee:  "https://shopee.co.th/",
      lazada:  "https://www.lazada.co.th/",
    },
  },
  {
    id: "bl-01",
    name: "Peach Blossom Blush",
    category: "blush",
    price: 420,
    rating: 4.6,
    shades: ["#F7B39A", "#F6A887"],
    seasonTags: ["Spring","Autumn"],
    img: "/assets/brush1.jpg",
    desc: "บลัชละเอียดบางเบา เกลี่ยง่าย โทนพีชสดใสพอดีผิว",
    links: {
      tiktok:  "https://www.tiktok.com/",
      shopee:  "https://shopee.co.th/",
      lazada:  "https://www.lazada.co.th/",
    },
  },
  {
    id: "es-01",
    name: "FERBINA Premium Full Coverage Cushion SPF 50 PA+++ 15g",
    category: "cushion",
    price: 379,
    rating: 4.8,
    shades: ["#D8C4F2", "#C6A9E3", "#BFA9D8", "#CDC4E8"],
    seasonTags: ["Summer"],
    img: "/assets/ferbinacs.jpg",
    desc: "ประกายชิมเมอร์เนียนหรู โทนกุหลาบละมุน แต่งง่ายทุกวัน",
    links: {
      tiktok:  "https://www.tiktok.com/",
      shopee:  "https://shopee.co.th/",
      lazada:  "https://www.lazada.co.th/",
    },
  },
  {
    id: "fd-02",
    name: "Silk Serum Foundation",
    category: "foundation",
    price: 980,
    rating: 4.5,
    shades: ["#F1DDCE", "#E7CDBB", "#CDA389"],
    seasonTags: ["Summer","Spring"],
    img: "/assets/concealer.jpg",
    desc: "รองพื้นเซรั่มสัมผัสบางเบา ปรับผิวเรียบเนียน ฉ่ำวาวกำลังดี",
    links: {
      tiktok:  "https://www.tiktok.com/",
      shopee:  "https://shopee.co.th/",
      lazada:  "https://www.lazada.co.th/",
    },
  },
  {
    id: "lp-02",
    name: "Soft Mauve Lip Cream",
    category: "lipstick",
    price: 520,
    rating: 4.4,
    shades: ["#B07FA1"],
    seasonTags: ["Summer"],
    img: "/assets/lip.png",
    desc: "ลิปครีมโทนมัวฟหวานสุภาพ เหมาะกับลุคออฟฟิศและงานทางการ",
    links: {
      tiktok:  "https://www.tiktok.com/",
      shopee:  "https://shopee.co.th/",
      lazada:  "https://www.lazada.co.th/",
    },
  },
  {
    id: "bl-02",
    name: "Luminous Foundation SPF 30 PA+++",
    category: "foundation",
    price: 460,
    rating: 4.7,
    shades: ["#BF6D44"],
    seasonTags: ["Autumn"],
    img: "/assets/jovinafd.jpg",
    desc: "เพิ่มโครงหน้าอย่างเป็นธรรมชาติ โทนอิฐอุ่นหรู ดูแพง",
    links: {
      tiktok:  "https://www.tiktok.com/",
      shopee:  "https://shopee.co.th/",
      lazada:  "https://www.lazada.co.th/",
    },
  },
  {
    id: "es-02",
    name: "Heartful Color Lip Mask",
    category: "lip",
    price: 1350,
    rating: 4.9,
    shades: ["#1F2E5E", "#5A6AA0", "#AAB3D4", "#D5DAEA"],
    seasonTags: ["Winter"],
    img: "/assets/cathydolllip.webp",
    desc: "พาเลตต์โทนเย็นหรูหรา สร้างลุคคมชัด โมเดิร์นลักซ์",
    links: {
      tiktok:  "https://www.tiktok.com/",
      shopee:  "https://shopee.co.th/",
      lazada:  "https://www.lazada.co.th/",
    },
  },
];

/** Filters */
const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "foundation", label: "Foundation" },
  { key: "lipstick", label: "Lipstick" },
  { key: "blush", label: "Blush" },
  { key: "eyeshadow", label: "Eyeshadow" },
];
const SEASONS = ["Spring","Summer","Autumn","Winter"];
const SORTS = [
  { key: "popular", label: "Most Popular" },
  { key: "price-asc", label: "Price: Low → High" },
  { key: "price-desc", label: "Price: High → Low" },
  { key: "rating", label: "Top Rated" },
];

/** ============================
 *  MINI UI HELPERS
 *  ============================ */
const SectionHeader = ({ title, right }) => (
  <div className="mb-4 flex items-center justify-between">
    <h2 className="text-xl font-semibold text-[#75464A]">{title}</h2>
    {right}
  </div>
);

const Card = ({ children, className="" }) => (
  <div
    className={`rounded-3xl border bg-white/70 p-5 shadow-sm backdrop-blur-md ${className}`}
    style={{ borderColor: BRAND.accent }}
  >
    {children}
  </div>
);

const Badge = ({ children, tone="default" }) => {
  const classMap = {
    default: "bg-white/70 text-gray-700 ring-1 ring-gray-200",
    season:  "bg-white text-[#75464A] ring-1 ring-[#E6DCEB]",
    pill:    "bg-[#75464A] text-white",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${classMap[tone]}`}>
      {children}
    </span>
  );
};

const Rating = ({ value=0 }) => {
  const full = Math.floor(value);
  const stars = Array.from({ length: 5 }).map((_, i) => (
    <svg key={i} viewBox="0 0 20 20" className={`h-4 w-4 ${i < full ? "fill-yellow-400" : "fill-gray-300"}`}>
      <path d="M10 1.5 12.59 7l6.41.53-4.86 3.98 1.5 6.5L10 14.9 4.36 18l1.5-6.5L1 7.53 7.41 7 10 1.5Z"/>
    </svg>
  ));
  return (
    <div className="flex items-center gap-1">
      {stars}
      <span className="ml-1 text-xs text-gray-500">{value.toFixed(1)}</span>
    </div>
  );
};

const Price = ({ value }) => (
  <div className="text-[15px] font-semibold" style={{ color: BRAND.hover }}>
    {value.toLocaleString()} บาท
  </div>
);

const ShadeDots = ({ shades=[] }) => (
  <div className="mt-2 flex flex-wrap gap-2">
    {shades.map((c, i) => (
      <span key={i} className="h-5 w-5 rounded-full ring-2 ring-white shadow" style={{ backgroundColor: c }} />
    ))}
  </div>
);

/** ============================
 *  PLATFORM BUTTONS
 *  ============================ */
function PlatformButtons({ links, layout="row" }) {
  const Btn = ({ href, label, icon, tone }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tone}`}
      aria-label={`Buy on ${label}`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );

  const TikTokIcon = (
    <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M16.5 3c.4 1.9 1.7 3.5 3.5 4v3.2c-1.3.1-2.5-.3-3.6-1v5.9c0 4.2-3 6.9-6.6 6.9-3.6 0-6.4-2.9-6.4-6.4 0-3.7 3-6.5 6.7-6.5.5 0 1 .1 1.5.2v3.4c-.4-.2-.9-.3-1.5-.3-1.7 0-3.1 1.4-3.1 3.2s1.4 3.2 3.2 3.2c1.7 0 3-1.2 3.1-2.9V3h2.2Z"/></svg>
  );
  const ShopeeIcon = (
    <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M5 8h14l-1.2 11.2A2 2 0 0 1 15.8 21H8.2a2 2 0 0 1-2-1.8L5 8Zm4-2a3 3 0 1 1 6 0h2a5 5 0 1 0-10 0h2Z"/></svg>
  );
  const LazadaIcon = (
    <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="m12 3 7 4v10l-7 4-7-4V7l7-4Z"/></svg>
  );

  return (
    <div className={layout === "row" ? "flex flex-wrap gap-2" : "grid grid-cols-1 gap-2"}>
      <Btn
        href={links?.tiktok || "#"}
        label="TikTok Shop"
        icon={TikTokIcon}
        tone="bg-black text-white hover:brightness-110"
      />
      <Btn
        href={links?.shopee || "#"}
        label="Shopee"
        icon={ShopeeIcon}
        tone="bg-[#ee4d2d] text-white hover:brightness-110"
      />
      <Btn
        href={links?.lazada || "#"}
        label="Lazada"
        icon={LazadaIcon}
        tone="bg-[#0f146d] text-white hover:brightness-110"
      />
    </div>
  );
}

/** ============================
 *  MAIN PAGE
 *  ============================ */
export default function CosmeticsPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [season, setSeason] = useState("all");
  const [sort, setSort] = useState("popular");
  const [quick, setQuick] = useState(null);
  const [openFor, setOpenFor] = useState(null); // id ของสินค้าที่เปิด platform popover

  const filtered = useMemo(() => {
    let items = [...ALL_PRODUCTS];

    if (cat !== "all") items = items.filter(p => p.category === cat);
    if (season !== "all") items = items.filter(p => p.seasonTags?.includes(season));

    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "price-asc":  items.sort((a,b)=>a.price-b.price); break;
      case "price-desc": items.sort((a,b)=>b.price-a.price); break;
      case "rating":     items.sort((a,b)=>b.rating-a.rating); break;
      default:           items.sort((a,b)=> (b.rating*100 - a.rating*100) + (a.price - b.price));
    }

    return items;
  }, [query, cat, season, sort]);

  return (
    <div
      className="relative min-h-screen"
      style={{ background: `linear-gradient(180deg, ${BRAND.bgFrom} 0%, ${BRAND.bgTo} 100%)` }}
    >
      {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-[-220px] z-0 h-[420px] opacity-60 blur-3xl"
        style={{
          background: `radial-gradient(900px 320px at 50% 0, ${BRAND.bgFrom}AA, transparent 70%),
                       radial-gradient(700px 260px at 80% 10%, ${BRAND.accent}AA, transparent 70%)`,
        }}
      />

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-6">
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: BRAND.hover }} />
            <span className="text-xs font-semibold text-[#75464A]">Beauty Shop</span>
          </div>

          <div className="mt-2 grid gap-8 md:grid-cols-5">
            <div className="md:col-span-3">
              <h1 className="text-3xl font-bold text-[#75464A]">Cosmetics Boutique</h1>
              <p className="mt-2 text-gray-600">
                เลือกไอเท็มที่แมตช์กับ <strong>Personal Color</strong> และลุคของคุณ — โทนสีถูกทาง ลุคสวยแพงขึ้นทันที
              </p>

              {/* SEARCH */}
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="flex w-full items-center gap-2 rounded-2xl border bg-white px-4 py-3 shadow-sm transition focus-within:shadow-md"
                  style={{ borderColor: BRAND.accent }}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.49 21.49 20 15.5 14Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"/></svg>
                  <input
                    value={query}
                    onChange={(e)=>setQuery(e.target.value)}
                    placeholder="ค้นหาสินค้า โทนสี หรือคีย์เวิร์ด (เช่น cherry, peach, glow)"
                    className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* SEASON QUICK FILTER */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 gap-2">
                {SEASONS.map(s => (
                  <button
                    key={s}
                    onClick={()=>setSeason(prev => prev===s ? "all" : s)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-md
                                ${season===s ? "bg-[#75464A] text-white shadow-md" : "bg-white text-[#75464A]"}`}
                    style={{ borderColor: BRAND.accent }}
                  >
                    <span className="block">{s}</span>
                    <span
                      className={`mt-1 block h-1.5 w-12 rounded-full`}
                      style={{ backgroundColor: s==="Spring" ? "#F6E2A2" : s==="Summer" ? "#D8C4F2" : s==="Autumn" ? "#C17A43" : "#1F2E5E" }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* CONTENT */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-8 md:grid-cols-[260px,1fr]">
          {/* SIDEBAR FILTER */}
          <Card className="h-max">
            <SectionHeader title="Filter" right={<Badge>Season: {season==="all" ? "All" : season}</Badge>} />
            {/* Category */}
            <div className="mb-5">
              <div className="mb-2 text-xs font-medium text-gray-500">Category</div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.key}
                    onClick={()=>setCat(c.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition
                               ${cat===c.key ? "bg-[#75464A] text-white shadow-sm" : "bg-white text-[#75464A] ring-1 ring-[#E6DCEB] hover:bg-pink-50"}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="mb-5">
              <div className="mb-2 text-xs font-medium text-gray-500">Sort by</div>
              <div className="grid grid-cols-1 gap-2">
                {SORTS.map(s => (
                  <label key={s.key} className="flex cursor-pointer items-center gap-2 rounded-xl border bg-white/80 px-3 py-2 text-sm transition hover:bg-white"
                         style={{ borderColor: BRAND.accent }}>
                    <input
                      type="radio"
                      name="sort"
                      className="accent-[#75464A]"
                      checked={sort===s.key}
                      onChange={()=>setSort(s.key)}
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Active filter summary */}
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>Category: {cat}</Badge>
              {query && <Badge>Search: “{query}”</Badge>}
            </div>
          </Card>

          {/* GRID */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                พบสินค้า <strong>{filtered.length}</strong> รายการ
              </div>
              {season !== "all" && <Badge tone="season">{season}</Badge>}
            </div>

            {filtered.length === 0 ? (
              <Card className="p-10 text-center text-gray-500">
                <div className="mx-auto mb-3 h-12 w-12 rounded-2xl border" style={{ borderColor: BRAND.accent }} />
                ไม่พบสินค้าที่ตรงเงื่อนไข ลองปรับตัวกรองหรือคำค้นหาอีกครั้ง
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(item => (
                  <article
                    key={item.id}
                    className="group relative overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
                    style={{ borderColor: BRAND.accent }}
                  >
                    {/* product image */}
                    <div className="relative">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="h-56 w-full object-cover transition group-hover:scale-[1.02]"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {item.seasonTags?.map((t,i)=>(
                          <Badge key={i} tone="season">{t}</Badge>
                        ))}
                      </div>
                      {/* Quick view */}
                      <button
                        onClick={()=>setQuick(item)}
                        className="absolute right-3 bottom-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#75464A] shadow-sm transition hover:bg-white"
                      >
                        Quick view
                      </button>
                    </div>

                    {/* info */}
                    <div className="p-4">
                      <h3 className="line-clamp-1 text-[15px] font-semibold text-gray-800">{item.name}</h3>
                      <div className="mt-1 flex items-center justify-between">
                        <Rating value={item.rating} />
                        <Price value={item.price} />
                      </div>
                      <ShadeDots shades={item.shades} />

                      {/* CTA Row */}
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                          style={{ backgroundColor: BRAND.primary }}
                          onClick={()=>setOpenFor(openFor===item.id ? null : item.id)}
                          aria-expanded={openFor===item.id}
                          aria-controls={`platform-${item.id}`}
                        >
                          ซื้อเลย
                        </button>
                        <button
                          className="rounded-xl border px-3 py-2 text-xs font-semibold text-[#75464A] hover:bg-pink-50"
                          style={{ borderColor: BRAND.ring }}
                          onClick={()=>setQuick(item)}
                        >
                          รายละเอียด
                        </button>
                      </div>

                      {/* Platform popover */}
                      {openFor === item.id && (
                        <div
                          id={`platform-${item.id}`}
                          className="absolute inset-x-4 bottom-4 z-20 rounded-2xl border bg-white/95 p-3 shadow-xl"
                          style={{ borderColor: BRAND.ring }}
                        >
                          <div className="mb-2 text-xs font-semibold text-[#75464A]">เลือกแพลตฟอร์ม</div>
                          <PlatformButtons links={item.links} />
                          <div className="mt-2 text-[11px] text-gray-500">ลิงก์ภายนอกจะเปิดในแท็บใหม่</div>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* QUICK VIEW MODAL */}
      {quick && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={()=>setQuick(null)}>
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={e=>e.stopPropagation()}>
            <button
              onClick={()=>setQuick(null)}
              className="absolute right-4 top-4 rounded-full bg-white/90 px-2 py-1 text-sm text-gray-700 shadow hover:bg-white"
              aria-label="Close quick view"
            >
              ✕
            </button>
            <div className="grid gap-0 md:grid-cols-2">
              <img src={quick.img} alt={quick.name} className="h-72 w-full object-cover md:h-full" />
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {quick.seasonTags?.map((t,i)=><Badge key={i} tone="season">{t}</Badge>)}
                </div>
                <h3 className="mt-3 text-xl font-bold text-[#75464A]">{quick.name}</h3>
                <div className="mt-1"><Rating value={quick.rating} /></div>
                <p className="mt-3 text-sm text-gray-600">{quick.desc}</p>
                <ShadeDots shades={quick.shades} />
                <div className="mt-4 flex items-center justify-between">
                  <Price value={quick.price} />
                </div>

                {/* Platform buttons in modal */}
                <div className="mt-5">
                  <div className="mb-2 text-xs font-semibold text-[#75464A]">ซื้อผ่านแพลตฟอร์ม</div>
                  <PlatformButtons links={quick.links} layout="column" />
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  * แนะนำโดยอิง <strong>Personal Color</strong> (เช่น {quick.seasonTags?.join(", ")})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
