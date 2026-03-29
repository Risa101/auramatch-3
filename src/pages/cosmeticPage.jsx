import React, { useState, useEffect, useRef } from 'react';
import { Star, Heart, Search, ArrowRight, X } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getdataProducts, generateGeminiImage } from "../callapi/call_api_user";
import { Link, useLocation } from "react-router-dom";
import { toggleLike as globalToggleLike, subscribeLikes } from "../utils/likes";

function b64ToFile(dataUrl, filename = 'face.jpg') {
  try {
    const [header, data] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return new File([arr], filename, { type: mime });
  } catch { return null; }
}

function getUserFacePhoto() {
  try {
    const u = JSON.parse(localStorage.getItem('auramatch:user') || 'null');
    return u?.lastAnalysis?.preview || null;
  } catch { return null; }
}

// --- DATA: PERSONAL COLOR ---
const personalColorData = [
  {
    id: '01',
    name: 'Spring',
    tag: 'Warm, Bright & Vitality',
    desc: 'Warm, bright, and high-clarity color group that makes skin look radiant and glowing.',
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
    desc: 'Cool, muted, gray-tinted color group that creates a refined, elegant, and gentle look.',
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
    desc: 'Warm, deep, and muted color group with a classic quality, like the hues of autumn nature.',
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
    desc: 'Cool, vivid, and high-contrast color group that accentuates facial features for a sharp and striking look.',
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
  const API_BASE_URL = (() => { const h = typeof window !== "undefined" ? window.location.hostname : ""; return ["localhost","127.0.0.1"].includes(h) ? "" : (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""); })();
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

  const location = useLocation();

  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Best Seller');
  const [, setError] = useState('');
  const [tryOnStatus, setTryOnStatus] = useState('idle'); // idle | loading | done | error
  const [tryOnImage, setTryOnImage] = useState('');
  const [tryOnError, setTryOnError] = useState('');
  const productsSectionRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Show 8 items per page

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

  useEffect(() => {
    return subscribeLikes((all) => setLikedIds(all.map(x => x.id)));
  }, []);

  // Auto-open product modal when navigated from Trends with openProductId
  useEffect(() => {
    const openId = location.state?.openProductId;
    if (!openId || products.length === 0) return;
    const target = products.find(p => String(p.product_id) === String(openId));
    if (target) {
      setSelectedProduct(target);
      setIsModalOpen(true);
      // scroll to product grid
      productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [products, location.state]);

  // Handlers
  const openPurchaseModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setTryOnStatus('idle');
    setTryOnImage('');
    setTryOnError('');
  };

  const handleTryOn = async () => {
    const facePhoto = getUserFacePhoto();
    if (!facePhoto) {
      setTryOnError('Please complete a face analysis first to use Virtual Try-On.');
      return;
    }
    const faceFile = b64ToFile(facePhoto);
    if (!faceFile) { setTryOnError('Could not load your face photo.'); return; }
    setTryOnStatus('loading');
    setTryOnError('');
    setTryOnImage('');
    const cat = selectedProduct?.category?.toLowerCase() || 'makeup';
    const name = selectedProduct?.name || 'product';
    const season = selectedProduct?.personal_color_tags || '';
    const prompt = `Apply ${name} (${cat}) to this face. ${season ? `This is a ${season} personal color product.` : ''} Keep the same person's face, natural and realistic result. Show clearly how this ${cat} product looks when worn.`;
    try {
      const res = await generateGeminiImage({ file: faceFile, prompt });
      setTryOnImage(res?.image || res?.data_url || '');
      setTryOnStatus('done');
    } catch (e) {
      setTryOnError('Try-On failed. Please try again.');
      setTryOnStatus('error');
    }
  };

  const handleToggleProductLike = (e, item) => {
    e.stopPropagation();
    globalToggleLike({
      id: `product_${item.product_id}`,
      title: item.name,
      img: item.image_url,
      price: item.price,
      category: item.category,
      type: "product",
    });
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
    if (parseFloat(item?.rating) >= 4.8) return { label: 'BEST SELLER', color: 'bg-[#D23669] text-white' };
    const stock = item?.stock ?? item?.quantity ?? item?.inventory ?? null;
    if (typeof stock === 'number' && stock <= 5) return { label: 'LIMITED', color: 'bg-[#D23669]' };
    return null;
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "";
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

  // "More for your Aura" — products matching user's personal color season
  const userSeason = (() => {
    try {
      const history = JSON.parse(localStorage.getItem("auramatch:history") || "[]");
      return history[0]?.season || null;
    } catch { return null; }
  })();

  // Cross-sell pairing map: for each category, the preferred complement order
  const CROSS_SELL_ORDER = {
    Lip:     ['Blush', 'Eye', 'Cushion'],
    Blush:   ['Lip', 'Eye', 'Cushion'],
    Eye:     ['Lip', 'Blush', 'Cushion'],
    Cushion: ['Lip', 'Blush', 'Eye'],
  };
  const PAIR_REASON = {
    Lip:     { Blush: 'Complements this lip tone', Eye: 'Balances with eye drama', Cushion: 'Perfect base for this shade' },
    Blush:   { Lip: 'Matches this blush tone', Eye: 'Adds dimension', Cushion: 'Creates a flawless base' },
    Eye:     { Lip: 'Balances the eye look', Blush: 'Adds a natural flush', Cushion: 'Smooth canvas for bold eyes' },
    Cushion: { Lip: 'Completes the full look', Blush: 'Natural flush on top', Eye: 'Defines eyes on fresh skin' },
  };

  const relatedProducts = (() => {
    if (!selectedProduct) return [];
    const currentCat = selectedProduct.category;
    const season = userSeason;
    const pairedCats = CROSS_SELL_ORDER[currentCat] || Object.keys(CROSS_SELL_ORDER).filter(c => c !== currentCat);

    return pairedCats.map(targetCat => {
      // Best pick: same season first, then any in that category
      const pool = products.filter(p => p.product_id !== selectedProduct.product_id && p.category === targetCat);
      const seasonMatch = season
        ? pool.find(p => p.personal_color_tags?.toLowerCase().includes(season.toLowerCase()))
        : null;
      const pick = seasonMatch || pool[0] || null;
      if (!pick) return null;
      return { ...pick, _pairReason: PAIR_REASON[currentCat]?.[targetCat] || 'Pairs well together' };
    }).filter(Boolean).slice(0, 3);
  })();


  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans pt-[60px] lg:pt-[180px]">

      {/* --- SECTION 1: PERSONAL COLOR SELECTOR --- */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="border-t border-[#E8E0DC] pt-10 mb-12" data-aos="fade-up">
            <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-3">Color Harmony</p>
            <h2 className="text-[3rem] md:text-[4.5rem] font-[200] tracking-[0.02em] text-[#1A1A1A] leading-[1] uppercase">
              Discover Your<br /><span className="font-[700] italic">Season</span>
            </h2>
          </div>

          <div className="flex flex-col md:flex-row h-[500px] gap-px bg-[#E8E0DC] w-full">
            {personalColorData.map((item) => (
              <div
                key={item.name}
                onClick={() => handleSelectSeason(item.name)}
                className="group relative flex-[1] hover:flex-[3] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.35,1)] cursor-pointer overflow-hidden bg-white"
              >
                <div className="absolute inset-0 p-8 flex flex-col z-20">
                  <p className="text-[10px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">{item.id}</p>
                  <h4 className="text-2xl font-[700] italic tracking-tight text-[#1A1A1A] uppercase mb-1">{item.name}</h4>
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#888] font-[300] mb-4">{item.tag}</p>

                  <div className="flex-grow flex items-center group-hover:items-start group-hover:mt-4 transition-all duration-700">
                    <div className="grid grid-cols-6 gap-1.5 w-full">
                      {item.palette.map((color, pIdx) => (
                        <div
                          key={pIdx}
                          className={`h-8 w-full transition-all duration-500 ${pIdx < 4 ? 'opacity-100' : 'opacity-0 scale-0 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'}`}
                          style={{ backgroundColor: color, transitionDelay: pIdx > 3 ? `${(pIdx - 4) * 15}ms` : '0ms' }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300 transform translate-y-6 group-hover:translate-y-0">
                    <p className="text-xs font-[300] text-[#555] leading-relaxed mb-4 max-w-[280px]">{item.desc}</p>
                    <div className="border border-[#1A1A1A] px-5 py-2 inline-block">
                      <span className="text-[9px] tracking-[0.25em] uppercase text-[#1A1A1A] font-[500]">Shop Season →</span>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-[#FAF7F5] opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 2: HERO & SEARCH --- */}
      <section className="py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="border-t border-[#E8E0DC] pt-10 mb-10 flex flex-wrap items-end justify-between gap-6" data-aos="fade-up">
            <div>
              <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-3">
                {selectedSeason === 'All' ? 'All Seasons' : `Specially for ${selectedSeason}`}
              </p>
              <h1 className="text-[3rem] md:text-[5rem] font-[200] leading-[1] uppercase text-[#1A1A1A]">
                Aura<br /><span className="font-[700] italic">Boutique</span>
              </h1>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-72">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-[#E8E0DC] px-4 py-3 text-[10px] font-[400] tracking-[0.1em] placeholder:text-[#aaa] focus:outline-none focus:border-[#1A1A1A] transition-all pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888]" size={14} />
              </div>
              {/* <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="border border-[#E8E0DC] px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-[#888] focus:outline-none focus:border-[#1A1A1A] transition-all bg-white"
              >
                <option>Best Seller</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
              </select> */}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {['All', 'Spring', 'Summer', 'Autumn', 'Winter'].map((season) => (
              <button
                key={season}
                onClick={() => handleSelectSeason(season)}
                className={`px-5 py-2 text-[9px] font-[500] uppercase tracking-[0.25em] border transition-all ${selectedSeason === season ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-[#E8E0DC] text-[#888] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'}`}
              >
                {season}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 3: PRODUCTS & PAGINATION --- */}
      <section ref={productsSectionRef} className="pb-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="flex border-b border-[#E8E0DC] mb-12 overflow-x-auto no-scrollbar">
            {['All', 'Blush', 'Eye', 'Lip', 'Cushion'].map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                className={`px-6 py-4 text-[10px] font-[500] uppercase tracking-[0.25em] shrink-0 transition-all border-b-2 -mb-px ${activeCategory === cat ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#888] hover:text-[#1A1A1A]'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : currentItems.length === 0 ? (
            <div className="border border-[#E8E0DC] p-12 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#888] font-[300] mb-6">No products match your filters</p>
              <button onClick={resetFilters} className="bg-[#1A1A1A] text-white px-8 py-3 text-[10px] font-[600] uppercase tracking-[0.25em] hover:bg-[#D23669] transition-all">
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[#E8E0DC]">
                {currentItems.map((item) => (
                  <div
                    key={item.product_id}
                    data-aos="fade-up"
                    className="group cursor-pointer bg-white"
                    onClick={() => openPurchaseModal(item)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#F7F4F2]">
                      {getFullImageUrl(item.image_url) ? (
                        <img
                          src={getFullImageUrl(item.image_url)}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          alt={item.name}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : null}
                      <button
                        onClick={(e) => handleToggleProductLike(e, item)}
                        className="absolute top-4 right-4 z-20 p-2 bg-white/80 transition-all"
                      >
                        <Heart size={14} className={likedIds.includes(`product_${item.product_id}`) ? 'fill-red-500 text-red-500' : 'text-[#888]'} />
                      </button>
                      {selectedSeason !== 'All' && item.personal_color_tags?.toLowerCase().includes(selectedSeason.toLowerCase()) && (
                        <div className="absolute top-4 left-4 bg-[#D23669] text-white text-[8px] font-[600] px-2 py-1 uppercase tracking-[0.15em]">
                          Match
                        </div>
                      )}
                      {getBadge(item) && (
                        <div className="absolute bottom-4 left-4 bg-[#1A1A1A] text-white text-[8px] font-[500] px-2 py-1 uppercase tracking-[0.15em]">
                          {getBadge(item).label}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                    </div>

                    <div className="p-4 border-t border-[#E8E0DC]">
                      <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-1">{item.category}</p>
                      <h3 className="text-xs font-[500] text-[#1A1A1A] leading-snug mb-3 line-clamp-2 uppercase tracking-[0.05em]">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-[600] text-[#1A1A1A]">฿{parseFloat(item.price).toLocaleString()}</span>
                        <div className="flex items-center gap-1">
                          <Star size={10} className="fill-[#C5A358] text-[#C5A358]" />
                          <span className="text-[10px] font-[300] text-[#888]">{item.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 border border-[#E8E0DC] text-[#888] text-xs hover:border-[#1A1A1A] hover:text-[#1A1A1A] disabled:opacity-30 transition-all"
                  >
                    ‹
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 text-[10px] font-[500] transition-all border ${currentPage === i + 1 ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-[#E8E0DC] text-[#888] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 border border-[#E8E0DC] text-[#888] text-xs hover:border-[#1A1A1A] hover:text-[#1A1A1A] disabled:opacity-30 transition-all"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* --- PRODUCT MODAL --- */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 z-50 w-9 h-9 border border-[#E8E0DC] flex items-center justify-center text-[#888] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all"
            >
              <X size={16} />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* LEFT: image + try-on */}
              <div className="p-8 border-b lg:border-b-0 lg:border-r border-[#E8E0DC] flex flex-col gap-6">
                <div className="relative aspect-square overflow-hidden bg-[#F7F4F2]">
                  <img
                    src={getFullImageUrl(selectedProduct.image_url)}
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {selectedProduct.is_official_store == 1 && (
                    <div className="absolute top-4 left-4 bg-[#1A1A1A] text-white text-[8px] font-[600] uppercase tracking-[0.15em] px-3 py-1">
                      Official
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 flex items-center gap-1.5">
                    <Star size={10} className="text-[#C5A358] fill-[#C5A358]" />
                    <span className="text-[10px] font-[500] text-[#1A1A1A]">{parseFloat(selectedProduct.rating).toFixed(1)}</span>
                  </div>
                </div>

                <div className="border-t border-[#E8E0DC] pt-5">
                  <p className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-4">Virtual Try-On</p>
                  {!getUserFacePhoto() ? (
                    <p className="text-xs font-[300] text-[#555]">
                      <Link to="/analysis" className="text-[#D23669] underline">Analyze your face</Link> first to try on products.
                    </p>
                  ) : tryOnStatus === 'idle' || tryOnStatus === 'error' ? (
                    <div>
                      <button
                        onClick={handleTryOn}
                        className="w-full bg-[#1A1A1A] text-white py-3 text-[10px] font-[600] uppercase tracking-[0.25em] hover:bg-[#D23669] transition-all"
                      >
                        Try On My Face
                      </button>
                      {tryOnError && <p className="mt-2 text-xs text-[#D23669]">{tryOnError}</p>}
                    </div>
                  ) : tryOnStatus === 'loading' ? (
                    <div className="flex items-center gap-3 text-xs font-[300] text-[#555]">
                      <div className="w-4 h-4 border border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                      AI is applying makeup...
                    </div>
                  ) : tryOnStatus === 'done' && tryOnImage ? (
                    <div>
                      <div className="grid grid-cols-2 gap-px bg-[#E8E0DC] mb-3">
                        <div className="bg-white">
                          <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] p-2">Before</p>
                          <img src={getUserFacePhoto()} alt="Before" className="w-full aspect-square object-cover" />
                        </div>
                        <div className="bg-white">
                          <p className="text-[9px] tracking-[0.3em] uppercase text-[#D23669] font-[300] p-2">After</p>
                          <img src={tryOnImage} alt="After" className="w-full aspect-square object-cover" />
                        </div>
                      </div>
                      <button
                        onClick={handleTryOn}
                        className="w-full border border-[#E8E0DC] text-[#888] py-2 text-[9px] font-[500] uppercase tracking-[0.2em] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* RIGHT: details + buy */}
              <div className="p-8 flex flex-col gap-6">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-[9px] font-[500] uppercase tracking-[0.2em] text-[#888] border border-[#E8E0DC] px-3 py-1">{selectedProduct.category}</span>
                  </div>
                  <h3 className="text-xl font-[600] text-[#1A1A1A] leading-tight uppercase mb-2">{selectedProduct.name}</h3>
                  {selectedProduct.description && (
                    <p className="text-xs font-[300] text-[#555] leading-relaxed">{selectedProduct.description}</p>
                  )}
                </div>

                <div className="border-t border-[#E8E0DC] pt-5">
                  <span className="text-3xl font-[200] text-[#1A1A1A]">฿{parseFloat(selectedProduct.price).toLocaleString()}</span>
                </div>

                {selectedProduct.personal_color_tags && (
                  <div className="border border-[#E8E0DC] p-4">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-3">Best for Season</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.personal_color_tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                        <span
                          key={tag}
                          className={`text-[9px] font-[500] uppercase tracking-[0.15em] px-3 py-1 border transition-all ${tag.toLowerCase() === selectedSeason.toLowerCase() ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-[#E8E0DC] text-[#888]'}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedProduct.finish_type || selectedProduct.coverage_level || selectedProduct.suitable_for_skin_type || selectedProduct.stock !== undefined) && (
                  <div className="grid grid-cols-2 gap-px bg-[#E8E0DC]">
                    {selectedProduct.finish_type && (
                      <div className="bg-white p-4">
                        <p className="text-[8px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-1">Finish</p>
                        <p className="text-[11px] font-[500] uppercase text-[#1A1A1A]">{selectedProduct.finish_type}</p>
                      </div>
                    )}
                    {selectedProduct.coverage_level && (
                      <div className="bg-white p-4">
                        <p className="text-[8px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-1">Coverage</p>
                        <p className="text-[11px] font-[500] uppercase text-[#1A1A1A]">{selectedProduct.coverage_level}</p>
                      </div>
                    )}
                    {selectedProduct.suitable_for_skin_type && (
                      <div className="bg-white p-4">
                        <p className="text-[8px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-1">Skin Type</p>
                        <p className="text-[11px] font-[500] uppercase text-[#1A1A1A]">{selectedProduct.suitable_for_skin_type}</p>
                      </div>
                    )}
                    {selectedProduct.stock !== undefined && (
                      <div className="bg-white p-4">
                        <p className="text-[8px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-1">Stock</p>
                        <p className="text-[11px] font-[500] uppercase text-[#1A1A1A]">{selectedProduct.stock > 10 ? 'In Stock' : selectedProduct.stock > 0 ? `${selectedProduct.stock} left` : 'Sold Out'}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedProduct.shades && selectedProduct.shades.trim() && (
                  <div>
                    <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-3">Shades</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.shades.split(',').map(s => s.trim()).filter(Boolean).map(shade => (
                        <span key={shade} className="text-[9px] font-[400] uppercase px-3 py-1 border border-[#E8E0DC] text-[#555] hover:border-[#1A1A1A] hover:text-[#1A1A1A] cursor-pointer transition-all">{shade}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-[#E8E0DC] pt-5 space-y-2">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-3">Available at</p>
                  <a
                    href={`https://www.tiktok.com/search/video?q=${encodeURIComponent(selectedProduct.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center w-full bg-[#1A1A1A] text-white py-3 text-[10px] font-[600] uppercase tracking-[0.25em] hover:bg-[#010101] transition-all"
                  >
                    TikTok Shop
                  </a>
                  <a
                    href={`https://shopee.co.th/search?keyword=${encodeURIComponent(selectedProduct.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center w-full bg-[#EE4D2D] text-white py-3 text-[10px] font-[600] uppercase tracking-[0.25em] hover:bg-[#D94429] transition-all"
                  >
                    Shopee
                  </a>
                  <a
                    href={`https://www.lazada.co.th/catalog/?q=${encodeURIComponent(selectedProduct.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center w-full bg-[#0F0E8E] text-white py-3 text-[10px] font-[600] uppercase tracking-[0.25em] hover:bg-[#0D0C7A] transition-all"
                  >
                    Lazada
                  </a>
                </div>

                {relatedProducts.length > 0 && (
                  <div className="border-t border-[#E8E0DC] pt-5">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-4">
                      {userSeason ? `Complete Your ${userSeason} Look` : 'Complete the Look'}
                    </p>
                    <div className="divide-y divide-[#E8E0DC]">
                      {relatedProducts.map(rel => (
                        <div
                          key={rel.product_id}
                          onClick={() => setSelectedProduct(rel)}
                          className="flex items-center gap-4 py-4 cursor-pointer group"
                        >
                          <div className="w-12 h-12 overflow-hidden bg-[#F7F4F2] shrink-0">
                            <img
                              src={getFullImageUrl(rel.image_url)}
                              className="w-full h-full object-cover group-hover:scale-[1.04] transition"
                              alt=""
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-[10px] font-[500] text-[#1A1A1A] line-clamp-1 uppercase">{rel.name}</p>
                            <p className="text-[9px] text-[#888] font-[300]">{rel._pairReason}</p>
                            <p className="text-[10px] font-[500] text-[#D23669]">฿{parseFloat(rel.price).toLocaleString()}</p>
                          </div>
                          <ArrowRight size={12} className="text-[#888] shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default CosmeticStore;
