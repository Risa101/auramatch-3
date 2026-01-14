import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

// Icons
import { FaTiktok, FaHeart, FaRegHeart, FaSearch, FaStore } from "react-icons/fa";
import { SiShopee } from "react-icons/si";

/* ---------- 1. Config & Constants ---------- */
const BRAND = {
  bg: "#FAF9F9",
  primary: "#1A1A1A",
  accent: "#C5A358",
  border: "#EEEEEE"
};

const API_URL = "http://127.0.0.1:5010";
const PAGE_SIZE = 6;
const BASE_PATH = "/AURAMATCH-VER2/";

const marketplaceLinks = (p) => {
  const buildKeyword = encodeURIComponent(`${p.brand_name || ""} ${p.name || ""}`);
  return {
    tiktok: `https://www.tiktok.com/search?q=${buildKeyword}`,
    shopee: p.is_official_store
      ? `https://shopee.co.th/mall/search?keyword=${buildKeyword}`
      : `https://shopee.co.th/search?keyword=${buildKeyword}`,
    lazada: `https://www.lazada.co.th/catalog/?q=${buildKeyword}`,
  };
};

/* ---------- 2. Main Component ---------- */
export default function CosmeticsPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  /* ---------- STATE ---------- */
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [finish, setFinish] = useState("all");
  const [coverage, setCoverage] = useState("all");
  const [sort, setSort] = useState("");
  const [personalColor, setPersonalColor] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem("favorites") || "[]"));

  /* ---------- ✅ IMAGE HELPER ---------- */
  const getImageUrl = useCallback((path) => {
    if (!path || path === "null" || path === "/placeholder.png") {
      return "https://images.unsplash.com/photo-1596462502278-27bfac4033c8?q=80&w=1000";
    }
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_PATH}${cleanPath}`;
  }, []);

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out" });
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/brands`).then((res) => {
      setBrands(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/products`, {
      params: {
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        brand_id: brand !== "all" ? brand : undefined,
        finish: finish !== "all" ? finish : undefined,
        coverage: coverage !== "all" ? coverage : undefined,
        personal_color: personalColor !== "all" ? personalColor : undefined,
        sort,
      },
    })
    .then((res) => {
      setProducts(Array.isArray(res.data) ? res.data : []);
      setPage(1);
    })
    .finally(() => setLoading(false));
  }, [selectedCategory, brand, finish, coverage, sort, personalColor]);

  const toggleFavorite = (id) => {
    const updated = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products;
    return products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  }, [products, query]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: BRAND.bg, color: BRAND.primary }}>
      
      {/* 1. HEADER */}
      <header className="pt-24 pb-16 px-6 text-center" data-aos="fade-down">
        <p className="text-[10px] tracking-[0.5em] font-bold uppercase text-[#C5A358] mb-4">The Selection</p>
        <h1 className="text-5xl md:text-6xl font-serif italic mb-6">Cosmetic Boutique</h1>
        <div className="w-20 h-[1px] bg-[#C5A358] mx-auto opacity-40"></div>
      </header>

      {/* 2. MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-6 pb-40 grid lg:grid-cols-4 gap-12">
        
        {/* SIDEBAR */}
        <aside className="lg:col-span-1 space-y-12">
          <div className="relative border-b border-gray-200 group">
            <FaSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#C5A358]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product..."
              className="w-full bg-transparent py-4 pl-8 focus:outline-none text-sm"
            />
          </div>

          <div>
            <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase mb-6 text-gray-400">Category</h4>
            <div className="flex flex-col gap-3">
              {["all", "cushion", "foundation", "lip", "blush", "eye", "skincare"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    navigate(cat === "all" ? "/cosmetics" : `/cosmetics/${cat}`);
                  }}
                  className={`text-left text-xs tracking-widest uppercase transition-colors ${
                    selectedCategory === cat ? "text-[#C5A358] font-bold" : "text-gray-400 hover:text-black"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase mb-6 text-gray-400">Brands</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setBrand("all")} className={`px-3 py-1 text-[9px] border ${brand === "all" ? "bg-black text-white border-black" : "border-gray-100 text-gray-400"}`}>ALL</button>
              {brands.map((b) => (
                <button key={b.brand_id} onClick={() => setBrand(b.brand_id)} className={`px-3 py-1 text-[9px] border ${brand === b.brand_id ? "bg-black text-white border-black" : "border-gray-100 text-gray-400"}`}>
                  {b.brand_name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <section className="lg:col-span-3">
          <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-50">
            <select value={personalColor} onChange={(e) => setPersonalColor(e.target.value)} className="bg-transparent text-[10px] font-bold uppercase tracking-[0.2em] outline-none">
              <option value="all">Tone: All</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Autumn">Autumn</option>
              <option value="Winter">Winter</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent text-[10px] font-bold uppercase tracking-[0.2em] outline-none">
              <option value="">Sort: Newest</option>
              <option value="price_asc">Price: Low-High</option>
              <option value="price_desc">Price: High-Low</option>
            </select>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="aspect-[3/4] bg-gray-50 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {paginatedProducts.map((item) => (
                <article key={item.product_id} data-aos="fade-up" className="group cursor-pointer" onClick={() => setSelected(item)}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-white mb-4 border border-gray-50">
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000"; }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item.product_id); }}
                      className="absolute top-4 right-4 z-10 p-2"
                    >
                      {favorites.includes(item.product_id) ? <FaHeart className="text-[#C5A358]" /> : <FaRegHeart className="text-gray-300 hover:text-[#C5A358]" />}
                    </button>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-[9px] font-bold tracking-widest text-[#C5A358] uppercase">{item.brand_name}</p>
                    <h3 className="text-sm font-serif italic truncate px-2">{item.name}</h3>
                    <p className="text-xs font-medium tracking-tighter">฿{item.price}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-20 flex justify-center items-center gap-6 border-t border-gray-100 pt-10">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-[10px] uppercase tracking-widest disabled:opacity-20 font-bold">Prev</button>
              <span className="text-[10px] font-serif italic">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="text-[10px] uppercase tracking-widest disabled:opacity-20 font-bold">Next</button>
            </div>
          )}
        </section>
      </main>

      {/* 3. MODAL DETAIL */}
      {selected && (() => {
        const links = marketplaceLinks(selected);
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <div className="relative w-full max-w-4xl bg-white shadow-2xl flex flex-col md:flex-row border border-gray-100 overflow-hidden animate-in fade-in duration-500">
              <button onClick={() => setSelected(null)} className="absolute right-6 top-6 z-50 text-xl font-light hover:rotate-90 transition-transform">✕</button>
              <div className="md:w-1/2 bg-gray-50 h-[400px] md:h-auto overflow-hidden">
                <img 
                  src={getImageUrl(selected.image_url)} 
                  className="w-full h-full object-cover" 
                  alt={selected.name} 
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000"; }}
                />
              </div>
              <div className="md:w-1/2 p-10 flex flex-col justify-center">
                <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-[#C5A358] mb-4">Official Product</span>
                <h2 className="text-3xl font-serif italic mb-1">{selected.name}</h2>
                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-6">{selected.brand_name}</p>
                <p className="text-sm text-gray-500 leading-relaxed font-light mb-8">{selected.description || "Premium quality cosmetics curated for your unique skin tone."}</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-3">
                    <span className="text-[8px] uppercase tracking-widest text-gray-400 block mb-1">Seasonal Match</span>
                    <span className="text-xs font-bold">🎨 {selected.personal_color_tags || selected.personal_color || "All"}</span>
                  </div>
                  <div className="bg-gray-50 p-3">
                    <span className="text-[8px] uppercase tracking-widest text-gray-400 block mb-1">Undertone</span>
                    <span className="text-xs font-bold">🌤 {selected.suitable_for_color || "Natural"}</span>
                  </div>
                </div>
                <div className="text-2xl font-light mb-10">฿{selected.price}</div>
                
                <div className="flex gap-3">
                  <a href={links.shopee} target="_blank" rel="noreferrer" className="flex-1 py-4 border border-gray-100 flex items-center justify-center gap-2 hover:bg-[#EE4D2D] hover:text-white transition-all text-[10px] font-bold tracking-widest uppercase"><SiShopee /> Shopee</a>
                  <a href={links.lazada} target="_blank" rel="noreferrer" className="flex-1 py-4 border border-gray-100 flex items-center justify-center gap-2 hover:bg-[#0F1466] hover:text-white transition-all text-[10px] font-bold tracking-widest uppercase"><FaStore /> Lazada</a>
                  <a href={links.tiktok} target="_blank" rel="noreferrer" className="flex-1 py-4 border border-gray-100 flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all text-[10px] font-bold tracking-widest uppercase"><FaTiktok /> TikTok</a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400;1,700&family=Montserrat:wght@200;400;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        body { font-family: 'Montserrat', sans-serif; }
      `}</style>
    </div>
  );
}