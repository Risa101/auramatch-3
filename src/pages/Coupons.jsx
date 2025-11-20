// src/pages/Coupons.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ===== THEME ===== */
const COLORS = {
  accent: "#E6DCEB",
  primary: "#75464A",
  hoverPink: "#FFB3C6",
};
const seasonColor = { Spring:"#FFB4A2", Summer:"#A2D2FF", Autumn:"#CE8D5A", Winter:"#7D79F2" };

/* ===== UTILS ===== */
function addDays(n){ const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString(); }
function daysLeft(iso){ const d=new Date(iso); const diff=Math.ceil((d-new Date())/(1000*60*60*24)); return Math.max(diff,0); }
function fmtBaht(n){ return "฿"+Number(n||0).toLocaleString("en-US"); }
function readJSON(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)||"null") ?? fallback; }catch{ return fallback; } }
function writeJSON(key, v){ localStorage.setItem(key, JSON.stringify(v)); }

/* ===== MOCK COUPONS (เพิ่มแบรนด์ยอดนิยม + ลิงก์แพลตฟอร์ม) =====
   - เปลี่ยน URL ร้านทางการให้เป็นของจริงเมื่อพร้อม
   - shops: กำหนดลิงก์ Shopee / Lazada / TikTok Shop ต่อแบรนด์/ดีล
*/
const RAW_COUPONS = [
  // ==== ตัวอย่างเดิม ====
  { id:"C-LUXE-20", brand:"Cute Press", title:"20% off matte lips", code:"LUXE-20", category:"Lip",    season:"Autumn",
    img: "/assets/brands/cutepress.jpeg",
    tags:["Best Seller"], minSpend:700, maxDiscount:300, expiresAt:addDays(2),
    shops:{
      shopee:"https://shopee.co.th/",
      lazada:"https://www.lazada.co.th/",
      tiktok:"https://www.tiktok.com/@",
    }
  },
  { id:"C-GLOW-15", brand:"Mistine",  title:"15% for summer glow kit", code:"GLOW-15", category:"Face", season:"Summer",
    img: "/assets/brands/mistine.png",
    tags:["Limited"], minSpend:800, maxDiscount:250, expiresAt:addDays(5),
    shops:{
      shopee:"https://shopee.co.th/",
      lazada:"https://www.lazada.co.th/",
      tiktok:"https://www.tiktok.com/@",
    }
  },
  { id:"C-WELCOME", brand:"Jovina",title:"Welcome 10% for new users", code:"WELCOME-I9480U", category:"All", season:"Spring",
    img: "/assets/brands/jovina.png",
    tags:["Welcome","Easy Apply"], minSpend:0, maxDiscount:999, expiresAt:addDays(30),
    shops:{
      shopee:"https://shopee.co.th/4u2officialstore",   // แก้เป็นลิงก์จริง
      lazada:"https://www.lazada.co.th/shop/4u2",       // แก้เป็นลิงก์จริง
      tiktok:"https://www.tiktok.com/@4u2cosmetics"     // แก้เป็นลิงก์จริง
    }
  },
  { id:"C-PURE-100",brand:"Merrezca", title:"฿100 off sensitive series", code:"PURE-100", category:"Skincare", season:"Winter",
    img: "/assets/brands/merrezca.png",
    tags:["Derm-Tested"], minSpend:600, maxDiscount:100, expiresAt:addDays(15),
    shops:{
      shopee:"https://shopee.co.th/4u2officialstore",   // แก้เป็นลิงก์จริง
      lazada:"https://www.lazada.co.th/shop/4u2",       // แก้เป็นลิงก์จริง
      tiktok:"https://www.tiktok.com/@4u2cosmetics"     // แก้เป็นลิงก์จริง
    }
  },
  { id:"C-BLUSH-10",brand:"Beautilab", title:"10% off all blush", code:"BLUSH-10", category:"Cheek", season:"Spring",
    img: "/assets/brands/beautylab.jpg",
    tags:["NEW","Online Only"], minSpend:500, maxDiscount:150, expiresAt:addDays(10),
    shops:{
      shopee:"https://shopee.co.th/4u2officialstore",   // แก้เป็นลิงก์จริง
      lazada:"https://www.lazada.co.th/shop/4u2",       // แก้เป็นลิงก์จริง
      tiktok:"https://www.tiktok.com/@4u2cosmetics"     // แก้เป็นลิงก์จริง
    }
  },

  // ==== แบรนด์ยอดนิยมที่ต้องการ ====

  // 4U2
  { id:"C-4U2-15", brand:"4U2", title:"15% off best-seller lips", code:"4U2-LIPS-15", category:"Lip", season:"Spring",
    img: "/assets/brands/4u2.png",
    tags:["Hot Deal","Best Seller"], minSpend:500, maxDiscount:200, expiresAt:addDays(12),
    shops:{
      shopee:"https://shopee.co.th/4u2officialstore",   // แก้เป็นลิงก์จริง
      lazada:"https://www.lazada.co.th/shop/4u2",       // แก้เป็นลิงก์จริง
      tiktok:"https://www.tiktok.com/@4u2cosmetics"     // แก้เป็นลิงก์จริง
    }
  },
  { id:"C-4U2-SET", brand:"Cathy doll", title:"Bundle 10% — blush + lip set", code:"4U2-SET-10", category:"Cheek", season:"Summer",
    img: "/assets/brands/cathydoll.jpg",
    tags:["Bundle","Limited"], minSpend:699, maxDiscount:180, expiresAt:addDays(20),
    shops:{
      shopee:"https://shopee.co.th/4u2officialstore",   // แก้เป็นลิงก์จริง
      lazada:"https://www.lazada.co.th/shop/4u2",       // แก้เป็นลิงก์จริง
      tiktok:"https://www.tiktok.com/@4u2cosmetics"     // แก้เป็นลิงก์จริง
    }
  },

  // Supermom
  { id:"C-SUPERMOM-20", brand:"Supermom", title:"20% off waterproof eyeliner", code:"SUPER-20", category:"Eye", season:"Autumn",
    img: "/assets/brands/supermom.png",
    tags:["Makeup Pro"], minSpend:650, maxDiscount:250, expiresAt:addDays(8),
    shops:{
      shopee:"https://shopee.co.th/supermom.official",  // แก้เป็นลิงก์จริง
      lazada:"https://www.lazada.co.th/shop/supermom",  // แก้เป็นลิงก์จริง
      tiktok:"https://www.tiktok.com/@supermomth"       // แก้เป็นลิงก์จริง
    }
  },

  // Laglace
  { id:"C-LAGLACE-12", brand:"Laglace", title:"12% off glass-skin cushion", code:"LAGLACE-12", category:"Face", season:"Winter",
    img: "/assets/brands/laglace.png",
    tags:["Glass Skin","Online Only"], minSpend:990, maxDiscount:300, expiresAt:addDays(18),
    shops:{
      shopee:"https://shopee.co.th/laglace.official",    // แก้เป็นลิงก์จริง
      lazada:"https://www.lazada.co.th/shop/laglace",    // แก้เป็นลิงก์จริง
      tiktok:"https://www.tiktok.com/@laglace.official"  // แก้เป็นลิงก์จริง
    }
  },

  // FERBINA
  { id:"C-FERBINA-10", brand:"FERBINA", title:"10% off clean beauty line", code:"FERBINA-10", category:"Skincare", season:"Spring",
    img: "/assets/brands/ferbina.png",
    tags:["Clean Beauty","Vegan"], minSpend:600, maxDiscount:160, expiresAt:addDays(14),
    shops:{
      shopee:"https://shopee.co.th/ferbina.official",    // แก้เป็นลิงก์จริง
      lazada:"https://www.lazada.co.th/shop/ferbina",    // แก้เป็นลิงก์จริง
      tiktok:"https://www.tiktok.com/@ferbina.official"  // แก้เป็นลิงก์จริง
    }
  },
];

/* ===== SMALL CHIP ===== */
const Chip = ({active,onClick,children}) => (
  <button
    onClick={onClick}
    className={[
      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs",
      active ? "bg-[#FFB3C6] text-white border-transparent" : "bg-white text-[#75464A] hover:bg-[#FFF0F4]",
    ].join(" ")}
    style={{borderColor:COLORS.accent}}
  >
    {children}
  </button>
);

/* ===== PAGE ===== */
export default function Coupons(){
  const navigate = useNavigate();

  // state
  const savedInitial = () => new Set(readJSON("auramatch:coupons:claimed", []));
  const isLoggedInLS = () => localStorage.getItem("auramatch:isLoggedIn") === "true";

  const [loggedIn, setLoggedIn]   = useState(isLoggedInLS());
  const [tab, setTab]             = useState(readJSON("auramatch:coupons:tab","all")); // all | saved
  const [query, setQuery]         = useState(readJSON("auramatch:coupons:query",""));
  const [brand, setBrand]         = useState(readJSON("auramatch:coupons:brand","ALL"));
  const [category, setCategory]   = useState(readJSON("auramatch:coupons:category","ALL"));
  const [season, setSeason]       = useState(readJSON("auramatch:coupons:season","ALL"));
  const [onlySoon, setOnlySoon]   = useState(readJSON("auramatch:coupons:soon",false));
  const [sortBy, setSortBy]       = useState(readJSON("auramatch:coupons:sort","popular"));
  const [claimed, setClaimed]     = useState(savedInitial);
  const [toast, setToast]         = useState(null);
  const [showCode, setShowCode]   = useState({}); // per id

  // persist filters
  useEffect(()=>writeJSON("auramatch:coupons:tab",tab),[tab]);
  useEffect(()=>writeJSON("auramatch:coupons:query",query),[query]);
  useEffect(()=>writeJSON("auramatch:coupons:brand",brand),[brand]);
  useEffect(()=>writeJSON("auramatch:coupons:category",category),[category]);
  useEffect(()=>writeJSON("auramatch:coupons:season",season),[season]);
  useEffect(()=>writeJSON("auramatch:coupons:soon",onlySoon),[onlySoon]);
  useEffect(()=>writeJSON("auramatch:coupons:sort",sortBy),[sortBy]);

  // ฟังสถานะล็อกอิน
  useEffect(() => {
    const syncAuth = () => setLoggedIn(isLoggedInLS());
    syncAuth();
    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth:changed", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth:changed", syncAuth);
    };
  }, []);

  const brands     = useMemo(()=>["ALL", ...new Set(RAW_COUPONS.map(c=>c.brand))],[]);
  const categories = useMemo(()=>["ALL", ...new Set(RAW_COUPONS.map(c=>c.category))],[]);

  // คำนวณรายการ
  const list = useMemo(()=>{
    let arr = RAW_COUPONS.map(c=>({...c, _days:daysLeft(c.expiresAt)}));

    if(tab==="saved") arr = arr.filter(c=>claimed.has(c.code));
    if(query.trim()){
      const q=query.trim().toLowerCase();
      arr=arr.filter(c=>
        c.title.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
      );
    }
    if(brand!=="ALL")    arr=arr.filter(c=>c.brand===brand);
    if(category!=="ALL") arr=arr.filter(c=>c.category===category);
    if(season!=="ALL")   arr=arr.filter(c=>c.season===season);
    if(onlySoon)         arr=arr.filter(c=>c._days<=7);

    switch(sortBy){
      case "expSoon": arr.sort((a,b)=>a._days-b._days); break;
      case "discountHigh": {
        const score = (t)=> {
          const pct = Number((t.match(/(\d+)\s*%/i)||[])[1]||0);
          const thb = Number((t.match(/฿\s*([0-9]+)/)||[])[1]||0)/20;
          return Math.max(pct, thb);
        };
        arr.sort((a,b)=>score(b.title)-score(a.title));
        break;
      }
      default: { // popular
        const w = (c)=> (c.tags?.includes("Best Seller")?5:0)+(c.tags?.includes("Welcome")?4:0)+(c._days<5?2:0);
        arr.sort((a,b)=>w(b)-w(a));
      }
    }
    return arr;
  },[tab,query,brand,category,season,onlySoon,sortBy,claimed]);

  // actions
  function copy(text){ navigator.clipboard.writeText(text); showToast(`Copied: ${text}`); }
  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(null),1200); }
  function claim(c){
    const next = new Set(claimed);
    next.has(c.code) ? next.delete(c.code) : next.add(c.code);
    setClaimed(next);
    writeJSON("auramatch:coupons:claimed", Array.from(next));
    showToast(next.has(c.code) ? "Saved to My Coupons" : "Removed from My Coupons");
  }
  function applyToAccount(c){
    if (!loggedIn) {
      showToast("Please log in to apply coupons");
      navigate("/login", { state: { from: "/coupons" } });
      return;
    }
    const payload = { code:c.code, daysLeft:daysLeft(c.expiresAt), used:false };
    writeJSON("auramatch:coupon", payload);
    window.dispatchEvent(new Event("coupon:changed"));
    showToast(`Applied ${c.code} to your account`);
  }

  const savedCount = claimed.size;

  // UI
  return (
    <div className="min-h-screen" style={{ background:"linear-gradient(180deg,#FADCDC33,#E6DCEB22)" }}>
      <div className="mx-auto max-w-7xl px-4 pb-8">
        {/* Header */}
        <div className="sticky top-12 z-10 -mx-4 mb-3 bg-[rgba(255,255,255,.75)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(255,255,255,.55)]">
          <div className="mx-4 pt-6">
            <h1 className="text-2xl font-extrabold text-[#75464A]">Coupons & Deals</h1>
            <p className="mt-1 text-sm text-[#75464A]/70">เลือกคูปองจากหลายแบรนด์ กด <b>Copy</b> หรือ <b>Apply</b> เข้าบัญชีคุณได้ทันที</p>
          </div>

          {/* Banner แจ้งเตือนล็อกอินก่อนใช้คูปอง */}
          {!loggedIn && (
            <div className="mx-4 mt-3 rounded-xl border border-[#E6DCEB] bg-white/80 px-4 py-3 text-sm text-[#75464A]">
              You must be logged in to <b>Apply</b> coupons.
              <Link to="/login" className="ml-2 rounded-md bg-[#FFB3C6] px-3 py-1 text-white">Log in</Link>
            </div>
          )}

          {/* Toolbar */}
          <div className="mx-4 mt-3 grid gap-2 rounded-2xl border border-[#E6DCEB] bg-white/80 p-3 md:grid-cols-12">
            {/* Search */}
            <div className="md:col-span-5">
              <label className="sr-only">Search</label>
              <input
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                placeholder="Search brand / title / code…"
                className="w-full rounded-xl border border-[#E6DCEB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E6DCEB]"
              />
            </div>

            {/* Quick chips */}
            <div className="md:col-span-7 flex items-center gap-2 overflow-x-auto">
              <span className="hidden text-xs text-[#75464A]/60 md:block">Quick filters:</span>
              <Chip active={onlySoon} onClick={()=>setOnlySoon(v=>!v)}>Expiring ≤ 7d</Chip>
              <Chip active={tab==="saved"} onClick={()=>setTab(t=>t==="saved"?"all":"saved")}>
                Saved {savedCount>0 ? `(${savedCount})` : ""}
              </Chip>
              <Chip active={season!=="ALL"} onClick={()=>setSeason(season!=="ALL"?"ALL":"Spring")}>
                Season: {season==="ALL"?"ALL":season}
              </Chip>
              <Chip active={brand!=="ALL"} onClick={()=>setBrand("ALL")}>All brands</Chip>
              <div className="ml-auto hidden gap-2 md:flex">
                <Link to="/account"  className="rounded-xl border border-[#E6DCEB] bg-white px-3 py-2 text-xs">My Account</Link>
                <Link to="/analysis" className="rounded-xl bg-[#FFB3C6] px-3 py-2 text-xs text-white">Go to Analysis</Link>
              </div>
            </div>

            {/* Row 2 selects */}
            <div className="md:col-span-4">
              <select value={brand} onChange={e=>setBrand(e.target.value)} className="w-full rounded-xl border border-[#E6DCEB] bg-white px-3 py-2 text-sm">
                {brands.map(b=><option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="md:col-span-4">
              <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full rounded-xl border border-[#E6DCEB] bg-white px-3 py-2 text-sm">
                {categories.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <select value={season} onChange={e=>setSeason(e.target.value)} className="w-full rounded-xl border border-[#E6DCEB] bg-white px-3 py-2 text-sm">
                {["ALL","Spring","Summer","Autumn","Winter"].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="w-full rounded-xl border border-[#E6DCEB] bg-white px-3 py-2 text-sm">
                <option value="popular">Sort: Popular</option>
                <option value="expSoon">Sort: Expiring Soon</option>
                <option value="discountHigh">Sort: High Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Result summary */}
        <div className="mb-2 text-xs text-[#75464A]/60">{list.length} deal{list.length!==1?"s":""} found</div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map(c=>(
            <Card
              key={c.id}
              c={c}
              claimed={claimed.has(c.code)}
              onClaim={()=>claim(c)}
              onCopy={()=>copy(c.code)}
              onApply={()=>applyToAccount(c)}
              loggedIn={loggedIn}
              showCode={!!showCode[c.id]}
              toggleShowCode={()=>setShowCode(s=>({...s,[c.id]:!s[c.id]}))}
            />
          ))}
        </div>

        {/* Empty state */}
        {list.length===0 && (
          <div className="mt-10 rounded-2xl border border-[#E6DCEB] bg-white/70 p-6 text-center text-[#75464A]">
            ไม่พบคูปองตามเงื่อนไขที่เลือก <br/>ลองลบตัวกรองหรือค้นหาใหม่อีกครั้ง
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border bg-white/95 px-3 py-2 text-sm text-[#75464A] shadow-lg" style={{borderColor:COLORS.accent}}>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ===== Card component ===== */
function Card({ c, claimed, onClaim, onCopy, onApply, loggedIn, showCode, toggleShowCode }){
  const left = daysLeft(c.expiresAt);
  const danger = left<=3, warn = left<=7;

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#E6DCEB] bg-white shadow-sm transition hover:shadow-md">
      {/* media */}
      <div className="relative">
        <img src={c.img} alt={c.title} className="h-40 w-full object-cover transition group-hover:scale-[1.01]" />
        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-[#75464A] shadow-sm border" style={{borderColor:COLORS.accent}}>
          {c.brand}
        </span>
        <span className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] text-white" style={{background:seasonColor[c.season]}}>
          {c.season}
        </span>
      </div>

      {/* body */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-[#75464A]">{c.title}</h3>
          <button
            onClick={onClaim}
            className={`rounded-lg px-2 py-1 text-xs ${claimed ? "bg-[#FFB3C6] text-white" : "bg-white text-[#75464A] border"}`}
            style={{borderColor:COLORS.accent}}
            title={claimed ? "Saved" : "Save"}
          >
            {claimed ? "Saved" : "Save"}
          </button>
        </div>

        {/* tags */}
        <div className="mt-2 flex flex-wrap gap-1">
          {c.tags?.map(t=>(
            <span key={t} className="rounded-md border px-2 py-0.5 text-[11px] text-[#75464A]" style={{borderColor:COLORS.accent}}>{t}</span>
          ))}
          {c.minSpend>0 && <span className="rounded-md border px-2 py-0.5 text-[11px] text-[#75464A]" style={{borderColor:COLORS.accent}}>Min {fmtBaht(c.minSpend)}</span>}
          {c.maxDiscount>0 && <span className="rounded-md border px-2 py-0.5 text-[11px] text-[#75464A]" style={{borderColor:COLORS.accent}}>Max {fmtBaht(c.maxDiscount)}</span>}
        </div>

        {/* platform shops */}
        {c.shops && Object.keys(c.shops).length>0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {c.shops.shopee && <ShopBtn label="Shopee" href={c.shops.shopee} />}
            {c.shops.lazada && <ShopBtn label="Lazada" href={c.shops.lazada} />}
            {c.shops.tiktok && <ShopBtn label="TikTok Shop" href={c.shops.tiktok} />}
          </div>
        )}

        {/* code line */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={toggleShowCode}
            className="rounded-lg border border-[#E6DCEB] bg-white px-3 py-1 text-sm text-[#75464A]"
            title="Show code"
          >
            {showCode ? c.code : "••••••••"}
          </button>
          <button onClick={onCopy} className="rounded-lg bg-[#FFB3C6] px-3 py-1.5 text-xs text-white">Copy</button>
          <button
            onClick={onApply}
            disabled={!loggedIn}
            className={`rounded-lg border px-3 py-1.5 text-xs ${
              loggedIn ? "text-[#75464A] hover:bg-[#FFB3C6] hover:text-white" : "text-[#75464A]/40 cursor-not-allowed bg-[#F8F5FA]"
            }`}
            style={{borderColor:COLORS.accent}}
            title={loggedIn ? "Apply coupon" : "Log in to apply"}
          >
            Apply
          </button>
          <span className="ml-auto text-xs text-[#75464A]/70">
            <span className="inline-flex h-2 w-2 rounded-full mr-1" style={{background: danger ? "#ef4444" : warn ? "#f59e0b" : "#22c55e"}} />
            {left} days left
          </span>
          <Terms coupon={c} />
        </div>
      </div>
    </article>
  );
}

/* ปุ่มแพลตฟอร์ม */
function ShopBtn({ label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg border px-3 py-1.5 text-xs text-[#75464A] hover:bg-[#FFB3C6] hover:text-white transition"
      style={{ borderColor: COLORS.accent }}
      title={`Open in ${label}`}
    >
      {label}
    </a>
  );
}

function Terms({ coupon }){
  const [open,setOpen]=useState(false);
  const terms=[
    `คูปองใช้ได้กับแบรนด์ ${coupon.brand}`,
    coupon.minSpend>0?`ยอดซื้อขั้นต่ำ ${fmtBaht(coupon.minSpend)}`:"ไม่มีขั้นต่ำ",
    coupon.maxDiscount>0?`ส่วนลดสูงสุด ${fmtBaht(coupon.maxDiscount)}`:"ตามเงื่อนไขแบรนด์",
    `หมดอายุภายใน ${daysLeft(coupon.expiresAt)} วัน`,
  ];
  return (
    <>
      <button onClick={()=>setOpen(true)} className="underline text-xs text-[#75464A]/70">Terms</button>
      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/20 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E6DCEB] bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-[#E6DCEB] p-4">
              <div className="font-semibold text-[#75464A]">Terms & Conditions</div>
              <button onClick={()=>setOpen(false)} className="rounded-lg px-2 py-1 text-[#75464A]/60 hover:bg-[#FADCDC]/40">✕</button>
            </div>
            <div className="p-4 space-y-2 text-sm text-[#75464A]">
              <div className="font-semibold">{coupon.title}</div>
              <ul className="list-disc pl-5">{terms.map((t,i)=><li key={i}>{t}</li>)}</ul>
              <div className="rounded-lg bg-[#FFF7F9] p-3 text-xs text-[#75464A]/70">
                หมายเหตุ: เงื่อนไขอาจเปลี่ยนแปลงตามผู้จัดจำหน่าย และไม่สามารถแลกเป็นเงินสด
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4">
              <button onClick={()=>setOpen(false)} className="rounded-xl border border-[#E6DCEB] bg-white px-4 py-2 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
