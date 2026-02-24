import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Star, Sparkles, Heart, Loader2, Search, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getdataProducts } from "../callapi/call_api_user";
import { Link } from "react-router-dom";

// --- DATA: PERSONAL COLOR ---
const personalColorData = [
  {
    id: '01',
    name: 'Spring',
    tag: 'Warm, Bright & Vitality',
    desc: 'กลุ่มสีโทนอุ่นที่สดใส สว่าง และมีความใส (Clarity) สูง ช่วยขับให้ผิวดูเปล่งปลั่งมีเลือดฝาด',
    color: 'bg-[#FFF5F0]',
    textColor: 'text-[#E67E22]',
    palette: [
      '#FFDAB9', '#FF8C69', '#FFD700', '#FFA07A', '#98FB98', '#FF69B4', // 1-6
      '#00FA9A', '#F0E68C', '#FF7F50', '#87CEEB', '#DEB887', '#FFEFD5', // 7-12
      '#F4A460', '#FFFFE0', '#9ACD32', '#FF4500', '#FFCC00', '#FA8072', // 13-18
      '#7CFC00', '#EEDC82', '#FFB6C1', '#00CED1', '#FFDAB9', '#F08080'  // 19-24
    ],
  },
  {
    id: '02',
    name: 'Summer',
    tag: 'Cool, Soft & Elegant',
    desc: 'กลุ่มสีโทนเย็นที่มีความละมุน (Muted) และเจือเทา ให้ลุคที่ดูสุภาพ เรียบหรู และอ่อนโยน',
    color: 'bg-[#F0F5FF]',
    textColor: 'text-[#7D8CC4]',
    palette: [
      '#E6CFCD', '#A7B9D4', '#FBB1BD', '#C8B2D1', '#B0C4DE', '#D8BFD8', // 1-6
      '#E0FFFF', '#BDB76B', '#95A5A6', '#7FB3D5', '#D2B4DE', '#FADBD8', // 7-12
      '#708090', '#B0E0E6', '#AFEEEE', '#DB7093', '#BC8F8F', '#4682B4', // 13-18
      '#DCDCDC', '#B4CFEC', '#C3949E', '#91A3B0', '#997A8D', '#82A1B1'  // 19-24
    ],
  },
  {
    id: '03',
    name: 'Autumn',
    tag: 'Warm, Rich & Earthy',
    desc: 'กลุ่มสีโทนอุ่นที่เข้มและลึก (Deep) มีความหม่นและคลาสสิก เหมือนสีสันของธรรมชาติฤดูใบไม้ร่วง',
    color: 'bg-[#F9F4E8]',
    textColor: 'text-[#8B4513]',
    palette: [
      '#A0522D', '#B8860B', '#5D4037', '#CD5C5C', '#556B2F', '#D2691E', // 1-6
      '#BC8F8F', '#DAA520', '#808000', '#6B8E23', '#A52A2A', '#E9967A', // 7-12
      '#3D2B1F', '#4B3621', '#6E4B1F', '#832A0D', '#556B2F', '#434B2A', // 13-18
      '#B87333', '#915F6D', '#7B3F00', '#8A3324', '#C19A6B', '#4E5754'  // 19-24
    ],
  },
  {
    id: '04',
    name: 'Winter',
    tag: 'Cool, Vivid & Sharp',
    desc: 'กลุ่มสีโทนเย็นที่เข้มข้น ชัดเจน และมี Contrast สูง ช่วยขับเน้นเครื่องหน้าให้ดูคมชัดและโดดเด่น',
    color: 'bg-[#F4F4F4]',
    textColor: 'text-[#2C3E50]',
    palette: [
      '#1C1C1C', '#003366', '#800020', '#C0C0C0', '#4B0082', '#008080', // 1-6
      '#FF00FF', '#FFFFFF', '#00008B', '#FF1493', '#00CED1', '#333333', // 7-12
      '#4169E1', '#8B008B', '#000000', '#0047AB', '#E0115F', '#50C878', // 13-18
      '#0F0F0F', '#66023C', '#240A40', '#082567', '#002147', '#36454F'  // 19-24
    ],
  }
];

const CosmeticStore = () => {
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  const fallbackProducts = [
    {
      product_id: 9001,
      name: "Laneige Neo Cushion Glow",
      category: "Cushion",
      price: 1290,
      rating: 4.9,
      personal_color_tags: "Spring,Summer",
      image_url: "/assets/ad4.JPG",
    },
    {
      product_id: 9002,
      name: "Dior Forever Cushion",
      category: "Cushion",
      price: 2490,
      rating: 4.8,
      personal_color_tags: "Winter,Autumn",
      image_url: "/assets/dior.jpeg",
    },
    {
      product_id: 9003,
      name: "Peripera Ink Velvet",
      category: "Lip",
      price: 390,
      rating: 4.7,
      personal_color_tags: "Summer,Winter",
      image_url: "/assets/ad7.JPG",
    },
    {
      product_id: 9004,
      name: "Peach Blush Touch",
      category: "Blush",
      price: 490,
      rating: 4.6,
      personal_color_tags: "Spring,Autumn",
      image_url: "/assets/ad3.JPG",
    },
  ];

  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedProducts, setLikedProducts] = useState({});
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Best Seller');
  const [error, setError] = useState('');
  const productsSectionRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // แสดง 8 ชิ้นต่อหน้า

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getdataProducts();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          setError('');
        } else {
          setProducts(fallbackProducts);
          setError('');
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setProducts(fallbackProducts);
        setError('');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    AOS.init({ duration: 800 });
  }, []);

  // Handlers
  const openPurchaseModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const toggleLike = (id) => {
    setLikedProducts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setSelectedSeason('All');
    setSortBy('Best Seller');
    setCurrentPage(1);
  };

  const scrollToProducts = () => {
    requestAnimationFrame(() => {
      productsSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const handleSelectSeason = (season) => {
    setSelectedSeason(season);
    setCurrentPage(1);
    scrollToProducts();
  };

  const getBadge = (item) => {
    if (item?.is_new || item?.isNew) return { label: 'NEW', color: 'bg-black' };
    if (parseFloat(item?.rating) >= 4.8) return { label: 'BEST SELLER', color: 'bg-[#D23669]' };
    const stock = item?.stock ?? item?.quantity ?? item?.inventory ?? null;
    if (typeof stock === 'number' && stock <= 5) return { label: 'LIMITED', color: 'bg-[#FFB7B2]' };
    return null;
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "/assets/home2.webp";
    if (String(imagePath).startsWith("http")) return imagePath;
    const cleanPath = String(imagePath).trim();
    const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    return API_BASE_URL ? `${API_BASE_URL}${finalPath}` : finalPath;
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeason = selectedSeason === 'All' ||
      p.personal_color_tags?.toLowerCase().includes(selectedSeason.toLowerCase());
    return matchesCategory && matchesSearch && matchesSeason;
  });

  const toNumber = (value) => {
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : 0;
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return toNumber(a.price) - toNumber(b.price);
    if (sortBy === 'Price: High to Low') return toNumber(b.price) - toNumber(a.price);
    if (sortBy === 'Rating') return toNumber(b.rating) - toNumber(a.rating);
    const scoreA = toNumber(a.sales ?? a.sold ?? a.rating);
    const scoreB = toNumber(b.sales ?? b.sold ?? b.rating);
    return scoreB - scoreA;
  });

  const noActiveFilters =
    activeCategory === "All" &&
    selectedSeason === "All" &&
    !searchQuery?.trim();

  const effectiveProducts =
    sortedProducts.length === 0 && noActiveFilters ? fallbackProducts : sortedProducts;

  const totalPages = Math.ceil(effectiveProducts.length / itemsPerPage);
  const currentItems = effectiveProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // สินค้าที่เกี่ยวข้อง (Related Products)
  const relatedProducts = products
    .filter(p => p.category === selectedProduct?.category && p.product_id !== selectedProduct?.product_id)
    .slice(0, 3);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Academy", to: "/academy" },
    { label: "Analysis", to: "/analysis" },
    { label: "Shop", to: "/shop" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF9] pb-20 font-sans">

      {/* --- SECTION 1: PERSONAL COLOR SELECTOR --- */}
      {/* --- 4. PERSONAL COLOR (Balanced Palette Version) --- */}
      <section className="py-20 bg-[#F9F9F9] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-12 text-center">
            <span className="text-[10px] tracking-[0.4em] font-black uppercase text-[#D23669] block mb-2">Color Harmony</span>
            <h2 className="text-3xl md:text-4xl font-[900] leading-none tracking-tighter text-[#4A4A4A] uppercase">
              Discover Your <span className="text-[#D23669]">Season</span>
            </h2>
          </div>

          <div className="flex flex-col md:flex-row h-[500px] gap-3 w-full items-stretch">
            {personalColorData.map((item, idx) => (
              <div
                key={item.name}
                onClick={() => handleSelectSeason(item.name)}
                className={`group relative flex-[1] hover:flex-[3] transition-all duration-700 ease-[cubic-bezier(0.25, 1, 0.35, 1)] cursor-pointer overflow-hidden rounded-[2.5rem] ${item.color} shadow-sm border border-black/5`}
              >
                <div className="absolute inset-0 p-8 flex flex-col z-20">

                  {/* Top Section */}
                  <div className="relative">
                    <span className={`text-4xl font-[900] opacity-10 block transition-transform duration-700 group-hover:-translate-y-2 ${item.textColor}`}>
                      {item.id}
                    </span>

                    <div className="mt-2 transform transition-all duration-500 group-hover:translate-x-1">
                      <h4 className={`text-2xl font-[900] tracking-tighter uppercase leading-none mb-1 ${item.textColor}`}>
                        {item.name}
                      </h4>
                      <p className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-70 ${item.textColor}`}>
                        {item.tag}
                      </p>
                    </div>
                  </div>


                  {/* Middle Section: Palette Chips (All Oval Version - Fixed Grid) */}
                  <div className="flex-grow flex items-center group-hover:items-start group-hover:mt-4 transition-all duration-700 h-[220px]"> {/* ล็อคความสูง Container */}
                    <div className="relative w-full">
                      {/* ใช้ Grid เพื่อให้ทุกอันวางในตำแหน่งที่เท่ากันเป๊ะ */}
                      <div className="grid grid-cols-6 gap-x-2 gap-y-2 transition-all duration-700 w-full">
                        {item.palette.map((color, pIdx) => (
                          <div
                            key={pIdx}
                            className={`
            relative rounded-full border border-white/40 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.23, 1, 0.32, 1)]
            
            /* กำหนดรูปทรงวงรีให้คงที่ */
            h-10 w-full max-w-[30px] mx-auto
            
            /* สถานะปกติ: โชว์ 4 สีแรกในแถวแรก */
            ${pIdx < 4
                                ? 'opacity-100'
                                : 'opacity-0 scale-0 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
                              }
            
            /* Interaction: เมื่อ Hover ที่วงรีแต่ละอัน */
            hover:scale-125 hover:z-50 hover:shadow-lg hover:border-white
          `}
                            style={{
                              backgroundColor: color,
                              /* สั่งให้ทยอยโผล่มาทีละเม็ดอย่างเป็นระเบียบ */
                              transitionDelay: pIdx > 3 ? `${(pIdx - 4) * 15}ms` : '0ms',
                            }}
                          >
                            {/* Glass Reflection เอฟเฟกต์แก้วสะท้อน */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/40 rounded-full" />
                          </div>
                        ))}
                      </div>

                      {/* Footer Hint: ปรับตำแหน่งให้คงที่ */}
                      <div className="absolute -bottom-12 left-0 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-500 flex items-center gap-2">
                        <div className={`h-[1px] w-6 ${item.textColor} opacity-30 bg-current`}></div>
                        <p className={`text-[7px] font-black uppercase tracking-[0.2em] ${item.textColor}`}>
                          24 Shades Palette
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300 transform translate-y-6 group-hover:translate-y-0">
                    <p className="text-[12px] font-medium leading-relaxed text-gray-600 mb-5 max-w-[280px]">
                      {item.desc}
                    </p>

                    <button className={`flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.15em] py-3 px-6 rounded-full bg-white shadow-sm hover:shadow-md transition-all ${item.textColor}`}>
                      Details
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </button>
                  </div>
                </div>

                {/* Background Highlight */}
                <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                  <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 w-[120%] h-1/3 bg-white opacity-30 blur-[60px] rounded-[100%] transform translate-y-32 group-hover:translate-y-0 transition-all duration-1000`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 2: HERO & SEARCH --- */}
      <div className="pt-24 pb-16 px-8 bg-[#FFF9F5] rounded-b-[4rem]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-bold text-[#FFB7B2] uppercase tracking-widest border border-orange-50">
              {selectedSeason === 'All' ? 'Every Season' : `Specially for ${selectedSeason}`}
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-gray-800 mt-6 leading-none tracking-tighter uppercase">
              AURA <span className="text-[#FFB7B2]">BOUTIQUE</span>
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {['All', 'Spring', 'Summer', 'Autumn', 'Winter'].map((season) => (
                <button
                  key={season}
                  onClick={() => handleSelectSeason(season)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedSeason === season ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-white hover:text-gray-700'}`}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col gap-4 md:w-80">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/80 backdrop-blur-md pl-12 pr-6 py-4 rounded-full border border-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFB7B2] text-sm font-bold"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white/80 backdrop-blur-md px-6 py-4 rounded-full border border-white shadow-sm text-[11px] font-black uppercase tracking-widest text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FFB7B2]"
              >
                <option>Best Seller</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 3: PRODUCTS & PAGINATION --- */}
      <div ref={productsSectionRef} className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="flex bg-white/90 backdrop-blur-xl p-2 rounded-full shadow-xl border border-white mb-16 overflow-x-auto no-scrollbar">
          {['All', 'Blush', 'Eye', 'Lip', 'Cushion'].map((cat) => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setCurrentPage(1); }} className={`px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeCategory === cat ? 'bg-[#FFB7B2] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20"><Loader2 className="animate-spin text-[#FFB7B2]" size={40} /></div>
        ) : error ? (
          <div className="rounded-[2.5rem] bg-white p-12 text-center shadow-lg border border-gray-50">
            <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-6">{error}</p>
            <button onClick={resetFilters} className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest">
              Reset Filters
            </button>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="rounded-[2.5rem] bg-white p-12 text-center shadow-lg border border-gray-50">
            <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-6">No products match your filters</p>
            <button onClick={resetFilters} className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest">
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {currentItems.map((item) => (
                <div key={item.product_id} data-aos="fade-up" className="group cursor-pointer" onClick={() => openPurchaseModal(item)}>
                  <div className="bg-white rounded-[3rem] p-4 shadow-sm border border-gray-50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative h-full flex flex-col">
                    <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 bg-[#FAF9F8]">
                      <img src={getFullImageUrl(item.image_url)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                      <button onClick={(e) => { e.stopPropagation(); toggleLike(item.product_id); }} className="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/80 backdrop-blur-md shadow-lg transition-all active:scale-90">
                        <Heart size={18} className={`${likedProducts[item.product_id] ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </button>
                      {item.personal_color_tags?.toLowerCase().includes(selectedSeason.toLowerCase()) && (
                        <div className="absolute top-6 left-6 z-10 bg-[#FFB7B2] text-white text-[8px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 uppercase animate-pulse">
                          <Sparkles size={10} /> Perfect Match
                        </div>
                      )}
                      {getBadge(item) && (
                        <div className={`absolute bottom-6 left-6 z-10 ${getBadge(item).color} text-white text-[8px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase`}>
                          {getBadge(item).label}
                        </div>
                      )}
                    </div>
                    <div className="px-2 flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[9px] font-black text-[#FFB7B2] uppercase tracking-widest">{item.category}</p>
                        <div className="flex items-center gap-1"><Star size={10} className="fill-yellow-400 text-yellow-400" /><span className="text-[10px] font-bold text-gray-400">{item.rating}</span></div>
                      </div>
                      <h3 className="text-md font-black text-gray-800 leading-tight mb-4 line-clamp-2">{item.name}</h3>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                        <span className="text-lg font-black text-gray-800">฿{parseFloat(item.price).toLocaleString()}</span>
                        <div className="bg-black text-white p-2.5 rounded-full group-hover:bg-[#FFB7B2] transition-all"><ShoppingBag size={16} /></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- PAGINATION (1 2 3) --- */}
            {totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-3">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-100 disabled:opacity-30" disabled={currentPage === 1}>
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-12 h-12 rounded-full font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-black text-white shadow-xl scale-110' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-100 disabled:opacity-30" disabled={currentPage === totalPages}>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- PURCHASE MODAL (Enhanced) --- */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[4rem] shadow-2xl overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-300">
            <button onClick={closeModal} className="absolute top-8 right-8 z-50 p-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-all"><X size={20} /></button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-16">
              {/* Left Side: Product View & Review */}
              <div>
                <div className="aspect-square rounded-[3rem] overflow-hidden mb-8 shadow-2xl border-4 border-white">
                  <img src={getFullImageUrl(selectedProduct.image_url)} className="w-full h-full object-cover" alt="" />
                </div>
                {/* Review Summary */}
                <div className="bg-[#FFF9F5] p-6 rounded-[2.5rem] border border-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                    <span className="font-black text-lg text-gray-800">{selectedProduct.rating}</span>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Most customers with <span className="text-[#FFB7B2]">{selectedSeason}</span> aura love this product for its long-lasting and natural pigment.</p>
                </div>
              </div>

              {/* Right Side: Purchase & Related */}
              <div className="flex flex-col h-full">
                <div>
                  <span className="text-[10px] font-black text-[#FFB7B2] uppercase tracking-[0.3em]">{selectedProduct.category}</span>
                  <h3 className="text-3xl font-[900] text-gray-800 leading-tight mb-2 tracking-tighter uppercase">{selectedProduct.name}</h3>
                  <p className="text-3xl font-black text-gray-900 mb-10">฿{parseFloat(selectedProduct.price).toLocaleString()}</p>

                  <div className="space-y-4 mb-12">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Select Platform</p>
                    <a href={`https://www.tiktok.com/search/video?q=${encodeURIComponent(selectedProduct.name)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all">TikTok Shop</a>
                    <a href={`https://shopee.co.th/search?keyword=${encodeURIComponent(selectedProduct.name)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full bg-[#EE4D2D] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all">Shopee Mall</a>
                    <a href={`https://www.lazada.co.th/catalog/?q=${encodeURIComponent(selectedProduct.name)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full bg-[#10078F] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
                      Lazada Official
                    </a>
                  </div>
                </div>

                {/* Related Products */}
                <div className="mt-auto pt-8 border-t border-gray-100">
                  <h5 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-6">More for your Aura</h5>
                  <div className="space-y-4">
                    {relatedProducts.map(rel => (
                      <div key={rel.product_id} onClick={() => setSelectedProduct(rel)} className="flex items-center gap-5 p-3 rounded-[1.5rem] hover:bg-gray-50 cursor-pointer transition-all border border-transparent hover:border-gray-100">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 shadow-sm"><img src={getFullImageUrl(rel.image_url)} className="w-full h-full object-cover" alt="" /></div>
                        <div className="flex-grow">
                          <p className="text-[12px] font-black text-gray-800 line-clamp-1 uppercase">{rel.name}</p>
                          <p className="text-[11px] font-bold text-[#FFB7B2]">฿{parseFloat(rel.price).toLocaleString()}</p>
                        </div>
                        <ArrowRight size={16} className="text-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 mt-24 pt-20 pb-10">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <h3 className="text-2xl font-[900] tracking-tighter uppercase">Aura<span className="text-[#D23669]">Match</span></h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase leading-loose max-w-sm">
                Leading the intersection of biometric technology and premium beauty aesthetics.
                Your personalized dose of confidence, delivered daily.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest">Navigation</h4>
              <ul className="space-y-2">
                {navItems.map((item, i) => (
                  <li key={i}>
                    <Link to={item.to} className="text-[10px] font-bold text-gray-400 hover:text-[#D23669] transition-colors uppercase">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest">Connect</h4>
              <div className="flex gap-4">
                <span className="text-[10px] font-bold text-gray-400 cursor-pointer hover:text-[#D23669]">INSTAGRAM</span>
                <span className="text-[10px] font-bold text-gray-400 cursor-pointer hover:text-[#D23669]">TIKTOK</span>
              </div>
            </div>
          </div>
          <div className="text-center pt-10 border-t border-gray-50">
            <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
              © 2026 AURAMATCH BIOMETRIC BEAUTY LAB. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default CosmeticStore;
