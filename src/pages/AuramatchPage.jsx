import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import TikTokModal from "../components/TikTokModal";
import { Star, ArrowRight, Heart, X } from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ API Connections
import {
  getBestSellerProducts, getLooksBySeason, getFavoritesByUserApi,
  toggleFavoriteApi
} from "../callapi/call_api_user";

export default function AuramatchDailyDose() {
  const navigate = useNavigate();
  useTranslation();
  const [bestSellers, setBestSellers] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [makeupLooks, setMakeupLooks] = useState([]);
  const [activeColor, setActiveColor] = useState("Spring");
  const [faceGender, setFaceGender] = useState("female");
  const [likedProducts, setLikedProducts] = useState({});
  const [selectedLook, setSelectedLook] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);


  const navItems = [
    { label: "Home", to: "/" },
    { label: "Advisor", to: "/advisor" },
    { label: "Analysis", to: "/analysis" },
    { label: "Shop", to: "/cosmetics" }
  ];
  const apiBase = (() => { const h = typeof window !== "undefined" ? window.location.hostname : ""; return ["localhost", "127.0.0.1"].includes(h) ? "" : (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""); })();
  const isLocalhostHost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const goAdvisor = () => navigate("/advisor");

  const goAnalysis = () => navigate("/analysis");

  const buildApiImage = (path) => {
    if (!path) return "/assets/home2.webp";
    if (String(path).startsWith("http")) return path;
    const normalized = String(path).startsWith("/") ? String(path) : `/${String(path)}`;
    if (!apiBase) return normalized;
    return `${apiBase}${normalized}`;
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };



  const fashionBySeason = [
    {
      season: "Spring",
      mood: "Warm, Bright, Fresh",
      bg: "bg-[#FFF5F0]",
      text: "text-[#D97706]",
      items: ["Ivory Blazer", "Peach Knit Top", "Light Camel Trousers", "Coral Slip Dress"],
      accents: ["#FFD4B8", "#FFC39E", "#F5B66D", "#FF8A7A"],
    },
    {
      season: "Summer",
      mood: "Cool, Soft, Elegant",
      bg: "bg-[#EEF5FF]",
      text: "text-[#6473B7]",
      items: ["Powder Blue Shirt", "Dusty Rose Cardigan", "Cool Gray Skirt", "Lavender Satin Blouse"],
      accents: ["#D4DFEF", "#BFCBE3", "#CDBFDB", "#9FB4D1"],
    },
    {
      season: "Autumn",
      mood: "Warm, Rich, Earthy",
      bg: "bg-[#F9F1E5]",
      text: "text-[#8B5A2B]",
      items: ["Terracotta Jacket", "Olive Utility Pants", "Rust Midi Dress", "Chocolate Brown Coat"],
      accents: ["#C5895A", "#A96E3A", "#8A5A3C", "#6C4C2D"],
    },
    {
      season: "Winter",
      mood: "Cool, Deep, Sharp",
      bg: "bg-[#F2F4F8]",
      text: "text-[#2E3F5E]",
      items: ["Crisp White Shirt", "Jet Black Blazer", "Cobalt Knit", "Berry Statement Dress"],
      accents: ["#111827", "#1E3A8A", "#9D174D", "#CBD5E1"],
    },
  ];

  const fallbackBestSellers = [
    { product_id: 9001, name: "Laneige Neo Cushion Glow", price: 1290, image_url: "/assets/ad4.JPG" },
    { product_id: 9002, name: "Dior Forever Cushion", price: 2490, image_url: "/assets/dior.jpeg" },
    { product_id: 9003, name: "Peripera Ink Velvet", price: 390, image_url: "/assets/ad7.JPG" },
  ];

  const fallbackLooksBySeason = {
    Spring: [
      { look_id: "sp-1", look_name: "Spring Peach Glow", personal_color: "Spring", image_url: "/assets/ad3.JPG" },
      { look_id: "sp-2", look_name: "Coral Daily Chic", personal_color: "Spring", image_url: "/assets/ad5.JPG" },
      { look_id: "sp-3", look_name: "Soft Bloom Look", personal_color: "Spring", image_url: "/assets/ad1.jpeg" },
    ],
    Summer: [
      { look_id: "su-1", look_name: "Soft Blue Muse", personal_color: "Summer", image_url: "/assets/ad2.jpeg" },
      { look_id: "su-2", look_name: "Lavender Haze", personal_color: "Summer", image_url: "/assets/ad6.JPG" },
      { look_id: "su-3", look_name: "Muted Pink Air", personal_color: "Summer", image_url: "/assets/ad8.JPG" },
    ],
    Autumn: [
      { look_id: "au-1", look_name: "Warm Brick Mood", personal_color: "Autumn", image_url: "/assets/ad9.JPG" },
      { look_id: "au-2", look_name: "Maple Contour", personal_color: "Autumn", image_url: "/assets/ad10.JPG" },
      { look_id: "au-3", look_name: "Earth Tone Chic", personal_color: "Autumn", image_url: "/assets/ad11.JPG" },
    ],
    Winter: [
      { look_id: "wi-1", look_name: "Cool Contrast", personal_color: "Winter", image_url: "/assets/dior.jpeg" },
      { look_id: "wi-2", look_name: "Berry Sharp", personal_color: "Winter", image_url: "/assets/ad7.JPG" },
      { look_id: "wi-3", look_name: "Crystal Night", personal_color: "Winter", image_url: "/assets/ad4.JPG" },
    ],
  };

  const personalColorData1 = [
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


  useEffect(() => {
    const fetchInitialData = async () => {
      const userRaw = localStorage.getItem("auramatch:user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const userId = user?.uid ? Number(user.uid) : null;
      if (!userId) return;
      const favs = await getFavoritesByUserApi(userId);

      // Convert Array to Object for faster heart-state checks
      const favMap = {};
      favs.forEach(item => {
        favMap[item.product_id] = true;
      });
      setLikedProducts(favMap);
    };
    fetchInitialData();
  }, []);


  const toggleLike = async (productId) => {
    const userRaw = localStorage.getItem("auramatch:user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const userId = user?.uid ? Number(user.uid) : null;
    if (!userId) {
      alert("Please log in before using the favorites feature.");
      return;
    }

    // 1. Update UI immediately (Optimistic Update)
    setLikedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));

    try {
      // 2. Call the API defined in favorite_bp
      await toggleFavoriteApi(userId, productId);
    } catch (error) {
      // 3. On error, roll back to previous state (Rollback)
      setLikedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
      alert("Unable to save to favorites at this time.");
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use Promise.all to fetch both best-sellers and looks by season simultaneously
      const [bsData, looksData] = await Promise.all([
        getBestSellerProducts(),
        getLooksBySeason(activeColor) // Call the looks API passing activeColor (Spring, Summer, etc.)
      ]);

      const safeBestSellers =
        Array.isArray(bsData) && bsData.length > 0
          ? bsData
          : (isLocalhostHost ? fallbackBestSellers : []);
      const normalizeLook = (l) => ({
        ...l,
        look_id: l.look_id ?? l.id,
        look_name: l.look_name ?? l.name,
      });
      const safeLooks =
        Array.isArray(looksData) && looksData.length > 0
          ? looksData.map(normalizeLook)
          : (isLocalhostHost ? (fallbackLooksBySeason[activeColor] || []) : []);

      setBestSellers(safeBestSellers);
      setMakeupLooks(safeLooks); // Update state with data fetched from the backend
    } catch (err) {
      console.error("Fetch Data Error:", err);
      setBestSellers(isLocalhostHost ? fallbackBestSellers : []);
      setMakeupLooks(isLocalhostHost ? (fallbackLooksBySeason[activeColor] || []) : []);
    } finally {
      setIsLoading(false);
      // Trigger AOS (Animation) after data has loaded
      setTimeout(() => AOS.refresh(), 500);
    }
  }, [activeColor]); // 👈 Important: must include [activeColor] to reload when the color tab changes

  useEffect(() => {
    fetchData();
    AOS.init({ duration: 1200, easing: "ease-out-back", once: true });
  }, [fetchData]);

  if (isLoading) return (
    <div className="h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="w-8 h-8 border border-[#1A1A1A] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300]">Loading</span>
      </div>
    </div>
  );

  return (
    
    <div className="bg-[#FAF7F5] text-[#1A1A1A] font-sans selection:bg-[#FFDCE6] selection:text-[#C85A7D] antialiased pt-[60px] lg:pt-[180px]">
      {/* --- 1. HERO --- */}
      <header className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <img src="/laglace/homee.webp" alt="" fetchpriority="high" decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 opacity-0"
          onLoad={(e) => e.currentTarget.classList.replace("opacity-0", "opacity-100")} />
        {/* Center vignette — darkens around center-bottom so text stays readable */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Centered text block */}
        <div className="relative z-10 flex flex-col items-center text-center px-6" data-aos="fade-up">

          {/* Eyebrow */}
          <p className="text-[10px] tracking-[0.5em] uppercase text-white font-[400] mb-6 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            AuraMatch &nbsp;·&nbsp; 2026
          </p>

          {/* Main heading */}
          <h1 className="text-[3.2rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] font-[200] leading-[0.88] tracking-[0.08em] text-white uppercase mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Your
          </h1>
          <h1 className="text-[3.2rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] font-[800] leading-[0.88] tracking-[-0.01em] text-white uppercase italic mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Aura Match
          </h1>

          {/* Thin divider */}
          <div className="w-12 h-px bg-white/50 mb-6" />

          {/* Subtitle */}
          <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-white font-[300] max-w-xs leading-loose mb-10 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Biometric beauty analysis.<br />Personalized for your skin, season &amp; soul.
          </p>

          {/* CTA */}
          <button onClick={() => navigate("/analysis")}
            className="bg-white text-[#1A1A1A] px-10 py-4 text-[10px] font-[600] uppercase tracking-[0.3em] border border-white hover:bg-[#EBC2C8] hover:text-black hover:border-black transition-all duration-300">
            Begin Analysis
          </button>
        </div>
      </header>

      {/* --- MARQUEE DIVIDER --- */}
      {/* <div className="overflow-hidden border-y border-[#E8E0DC] py-3.5">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-10 px-10">
              <span className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300]">Discover Your Shape</span>
              <span className="text-[#D0C8C4] select-none">—</span>
              <span className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300]">Analyse Your Color</span>
              <span className="text-[#D0C8C4] select-none">—</span>
              <span className="text-[9px] tracking-[0.4em] uppercase text-[#888] font-[300]">Boost Your Aura</span>
              <span className="text-[#D0C8C4] select-none">—</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* --- FACE SHAPE LIBRARY --- */}
      <section
        className="py-20 bg-white overflow-hidden cursor-pointer"
        role="link" tabIndex={0} onClick={goAdvisor}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goAdvisor(); } }}
      >
        {/* Header */}
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 mb-10" data-aos="fade-up">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-3">Face Geometry</p>
              <h2 className="text-[2.4rem] md:text-[3.6rem] font-[200] tracking-[0.03em] text-[#1A1A1A] leading-[1]">
                Which Shape<br /><span className="font-[700] italic">Are You?</span>
              </h2>
            </div>
            {/* Gender toggle */}
            <div className="flex gap-px bg-[#E8E0DC]" onClick={(e) => e.stopPropagation()}>
              {["female", "male"].map((g) => (
                <button key={g} onClick={(e) => { e.stopPropagation(); setFaceGender(g); }}
                  className={`px-5 py-2 text-[9px] font-[600] uppercase tracking-[0.3em] transition-all duration-200 ${faceGender === g ? "bg-[#1A1A1A] text-white" : "bg-white text-[#888] hover:text-[#1A1A1A]"}`}>
                  {g === "female" ? "Female" : "Male"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Full-bleed horizontal strip — no side padding, images flush to edges */}
        <div className="overflow-x-auto snap-x snap-mandatory no-scrollbar md:overflow-visible">
          <div className="flex md:grid md:grid-cols-6 gap-2 min-w-max md:min-w-0 px-6 md:px-12">
            {[
              { label: "Oval",     female: "/assets/oval.jpg.webp",     male: "/assets/ovalmen.jpg" },
              { label: "Round",    female: "/assets/round.jpg.webp",    male: "/assets/roundmen.jpg" },
              { label: "Square",   female: "/assets/square.jpg.webp",   male: "/assets/squaremen.jpg" },
              { label: "Heart",    female: "/assets/heart.jpg.webp",    male: "/assets/heart.jpg.webp" },
              { label: "Diamond",  female: "/assets/diamond.jpg.webp",  male: "/assets/diamondmen.jpg" },
              { label: "Triangle", female: "/assets/triangle.jpg.webp", male: "/assets/trainglemen.jpg" },
            ].map((shape, i) => {
              const img = faceGender === "male" ? shape.male : shape.female;
              return (
              <div key={shape.label}
                data-aos="fade-up" data-aos-delay={i * 60}
                className="group relative snap-center w-[44vw] md:w-auto shrink-0 cursor-pointer">

                {/* Image — tall portrait */}
                <div className="relative aspect-[3/5] overflow-hidden bg-[#F0EDEA]">
                  <img src={img} alt={shape.label}
                    className="w-full h-full object-cover object-center scale-[1.3] group-hover:scale-[1.38] transition-transform duration-700 ease-out" />
                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-400" />
                  {/* Number tag */}
                  <span className="absolute top-4 left-4 text-[9px] tracking-[0.35em] text-white/40 font-[300] group-hover:text-white/70 transition-colors duration-400">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {/* Label overlay — slides up on hover */}
                  <div className="absolute inset-x-0 bottom-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                    <p className="text-white text-[11px] font-[500] uppercase tracking-[0.25em]">{shape.label}</p>
                  </div>
                </div>

                {/* Label below image — always visible */}
                <div className="py-3 px-2 border-t border-[#E8E0DC] group-hover:border-[#D23669] transition-colors duration-300">
                  <p className="text-[10px] font-[500] text-[#1A1A1A] uppercase tracking-[0.2em] group-hover:text-[#D23669] transition-colors duration-300 text-center">
                    {shape.label}
                  </p>
                </div>
              </div>
            );})}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 mt-8 flex justify-end" data-aos="fade-up">
          <button onClick={goAnalysis}
            className="text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:text-[#D23669] hover:border-[#D23669] transition-colors">
            Find My Shape →
          </button>
        </div>
      </section>

      {/* --- PERSONAL COLOR --- */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="border-t border-[#E8E0DC] pt-10 mb-12" data-aos="fade-up">
            <p className="text-[9px] tracking-[0.45em] uppercase text-[#888] font-[300] mb-3">Color Harmony</p>
            <h2 className="text-[3rem] md:text-[4.5rem] font-[200] tracking-[0.02em] text-[#1A1A1A] leading-[1] uppercase">
              Discover Your<br /><span className="font-[700] italic">Season</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row md:h-[500px] gap-px bg-[#E8E0DC] w-full">
            {personalColorData1.map((item) => (
              <div
                key={item.name}
                onClick={goAdvisor}
                className="group relative flex-[1] md:hover:flex-[3] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.35,1)] cursor-pointer overflow-hidden bg-white"
              >
                <div className="relative md:absolute md:inset-0 p-6 md:p-8 flex flex-col z-20">
                  <p className="text-[10px] tracking-[0.4em] uppercase text-[#888] font-[300] mb-3">{item.id}</p>
                  <h4 className="text-2xl font-[700] italic tracking-tight text-[#1A1A1A] uppercase mb-1">{item.name}</h4>
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#888] font-[300] mb-4">{item.tag}</p>

                  <div className="flex-grow flex items-start mt-2 md:items-center md:mt-0 md:group-hover:items-start md:group-hover:mt-4 transition-all duration-700">
                    <div className="grid grid-cols-6 gap-1.5 w-full">
                      {item.palette.map((color, pIdx) => (
                        <div
                          key={pIdx}
                          className={`h-8 w-full transition-all duration-500 ${pIdx < 4 ? 'opacity-100' : 'opacity-100 md:opacity-0 md:scale-0 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:scale-100 md:group-hover:pointer-events-auto'}`}
                          style={{ backgroundColor: color, transitionDelay: pIdx > 3 ? `${(pIdx - 4) * 15}ms` : '0ms' }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 opacity-100 translate-y-0 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 md:delay-300 transform md:translate-y-6 md:group-hover:translate-y-0">
                    <p className="text-xs font-[300] text-[#555] leading-relaxed mb-4 max-w-[280px]">{item.desc}</p>
                    <div className="border border-[#1A1A1A] px-5 py-2 inline-block hover:bg-[#1A1A1A] hover:text-white transition-all duration-200">
                      <span className="text-[9px] tracking-[0.25em] uppercase text-[#1A1A1A] font-[500] group-hover:text-white">Explore Season →</span>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-[#FAF7F5] opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FASHION RECOMMENDATION ---
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12" data-aos="fade-up">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-3">Style Direction</p>
              <h2 className="text-[2.4rem] md:text-[3.6rem] font-[200] tracking-[0.03em] text-[#1A1A1A] leading-[1]">
                Color Closet<br /><span className="font-[700] italic">Edit</span>
              </h2>
            </div>
            <button onClick={() => navigate("/advisor")}
              className="w-fit text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:text-[#888] hover:border-[#888] transition-colors">
              Get Full Outfit Advice →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {fashionBySeason.map((look, idx) => (
              <article key={look.season} data-aos="fade-up" data-aos-delay={idx * 60}
                className={`rounded-sm p-8 ${look.bg} hover:shadow-lg transition-all duration-300 group`}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h3 className={`text-xl font-[300] uppercase tracking-[0.06em] ${look.text}`}>{look.season}</h3>
                    <p className={`text-[9px] mt-1 font-[300] uppercase tracking-[0.2em] opacity-50 ${look.text}`}>{look.mood}</p>
                  </div>
                  <div className="flex gap-1">
                    {look.accents.slice(0, 3).map((color) => (
                      <span key={`${look.season}-${color}`} className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
                <ul className="space-y-2.5 border-t border-black/5 pt-5">
                  {look.items.map((item) => (
                    <li key={`${look.season}-${item}`} className="text-[12px] font-[300] text-[#605858] flex items-center gap-2.5">
                      <span className="w-1 h-1 rounded-full bg-current opacity-30 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section> */}

      {/* --- LAGLACE BRAND PROMO --- */}
      <section className="py-20 bg-[#FAF7F5]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10" data-aos="fade-up">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-3">Partner Brand</p>
              <h2 className="text-[2.8rem] md:text-[4.5rem] font-[200] tracking-[0.12em] text-[#1A1A1A] leading-[1] uppercase">
                la<span className="font-[700]">glace</span>
              </h2>
              <p className="text-[11px] tracking-[0.15em] text-[#888] font-[300] mt-2">
                Beauty & Skincare · Curated for your aura
              </p>
            </div>
            <a href="https://shopee.co.th/La-glace-Airy-Skin-Concealer-(6g)-ลา-กลาส-แอรี่-สกิน-คอนซีลเลอร์-แพ็คเก็จใหม่-i.252082342.40620993259?extraParams=%7B%22display_model_id%22%3A149294860399%2C%22model_selection_logic%22%3A3%7D&sp_atk=425965d2-f613-46d7-b88b-0fe191bbacfc&xptdk=425965d2-f613-46d7-b88b-0fe191bbacfc" target="_blank" rel="noreferrer"
              className="w-fit text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:text-[#D23669] hover:border-[#D23669] transition-colors self-start md:self-end">
              View Collection →
            </a>
          </div>

          {/* Editorial grid — 1 large hero + 3 small top-right + strip below */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-aos="fade-up" data-aos-delay="60">

            {/* Hero image — spans 2 rows + 2 cols */}
            <div className="col-span-2 row-span-2 aspect-[3/4] md:aspect-auto relative overflow-hidden group bg-[#EDE9E5]">
              <img src="/laglace/635564819_1348058370684889_7809297845143179916_n.jpg" alt="laglace"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-400" />
            </div>

            {/* 2 stacked images right-top */}
            <div className="col-span-1 aspect-square relative overflow-hidden group bg-[#EDE9E5]">
              <img src="/laglace/637161433_1348087934015266_8360346401767790374_n.jpg" alt="laglace"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
            </div>
            <div className="col-span-1 aspect-square relative overflow-hidden group bg-[#EDE9E5]">
              <img src="/laglace/636853674_1348087937348599_2172886061156364859_n.jpg" alt="laglace"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
            </div>
            <div className="col-span-1 aspect-square relative overflow-hidden group bg-[#EDE9E5]">
              <img src="/laglace/637158364_1348087990681927_1157157987754645379_n.jpg" alt="laglace"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
            </div>
            <div className="col-span-1 aspect-square relative overflow-hidden group bg-[#EDE9E5]">
              <img src="/laglace/637106921_1348087997348593_8531354510830102200_n.jpg" alt="laglace"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
            </div>

            {/* Bottom strip — remaining 3 images spanning full width */}
            <div className="col-span-2 md:col-span-4 grid grid-cols-3 gap-3 mt-0">
              {[
                "/laglace/550516866_18498461620071143_8116843560440476767_n.jpg",
                "/laglace/571158386_1249235203900540_3666898097132726363_n.jpg",
                "/laglace/550973378_18498461854071143_2788784050822836877_n.jpg",
              ].map((src, i) => (
                <div key={i} className="aspect-[4/3] relative overflow-hidden group bg-[#EDE9E5]">
                  <img src={src} alt="laglace" loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>

          {/* CTA strip */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8E0DC] pt-8" data-aos="fade-up">
            <p className="text-[11px] tracking-[0.15em] text-[#888] font-[300] max-w-sm">
              Discover beauty essentials curated to complement your personal color palette.
            </p>
            <button onClick={() => navigate("https://shopee.co.th/La-glace-Airy-Skin-Concealer-(6g)-%E0%B8%A5%E0%B8%B2-%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%AA-%E0%B9%81%E0%B8%AD%E0%B8%A3%E0%B8%B5%E0%B9%88-%E0%B8%AA%E0%B8%81%E0%B8%B4%E0%B8%99-%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B8%8B%E0%B8%B5%E0%B8%A5%E0%B9%80%E0%B8%A5%E0%B8%AD%E0%B8%A3%E0%B9%8C-%E0%B9%81%E0%B8%9E%E0%B9%87%E0%B8%84%E0%B9%80%E0%B8%81%E0%B9%87%E0%B8%88%E0%B9%83%E0%B8%AB%E0%B8%A1%E0%B9%88-i.252082342.40620993259?extraParams=%7B%22display_model_id%22%3A149294860399%2C%22model_selection_logic%22%3A3%7D&sp_atk=3bea7fc0-c74c-48e1-9f40-b980d06efa8c&xptdk=3bea7fc0-c74c-48e1-9f40-b980d06efa8c&is_from_login=true")}
              className="shrink-0 bg-[#1A1A1A] text-white text-[10px] tracking-[0.25em] uppercase font-[400] px-8 py-3.5 hover:bg-[#D23669] transition-colors duration-200">
              Shop laglace
            </button>
          </div>
        </div>
      </section>


      {/* --- PRODUCT MODAL (VS style) --- */}
      {isProductModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeProductModal} />
          <div className="relative z-10 w-full max-w-4xl max-h-[95vh] overflow-hidden bg-white flex flex-col md:flex-row">
            <button onClick={closeProductModal}
              className="absolute top-5 right-5 z-20 w-9 h-9 flex items-center justify-center bg-black/30 hover:bg-black text-white transition-colors duration-200" aria-label="Close">
              <X size={16} />
            </button>
            <div className="w-full md:w-[45%] aspect-[4/5] md:aspect-auto overflow-hidden bg-[#F5F3F0] shrink-0">
              <img src={buildApiImage(selectedProduct.image_url)} alt={selectedProduct.name} className="w-full h-full object-contain p-8" />
            </div>
            <div className="flex flex-col p-8 md:p-12 overflow-y-auto custom-scrollbar">
              <p className="text-[9px] tracking-[0.35em] uppercase text-[#aaa] font-[300] mb-4">Best Seller</p>
              <h3 className="text-[1.8rem] md:text-[2.4rem] font-[300] tracking-[-0.01em] text-[#1A1A1A] leading-[1.05] mb-4">
                {selectedProduct.name}
              </h3>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-[400] text-[#1A1A1A]">฿{parseFloat(selectedProduct.price || 0).toLocaleString()}</span>
                {selectedProduct.rating && (
                  <span className="inline-flex items-center gap-1 border border-[#E8E0DC] px-3 py-1 text-[10px] text-[#888] font-[300]">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    {selectedProduct.rating}
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[#888] font-[300] leading-relaxed mb-8 border-l border-[#E8E0DC] pl-4">
                Choose your preferred platform to purchase immediately.
              </p>
              <div className="mt-auto space-y-2">
                <a href={`https://www.tiktok.com/search/video?q=${encodeURIComponent(selectedProduct.name || "")}`} target="_blank" rel="noreferrer"
                  className="flex w-full items-center justify-center bg-[#1A1A1A] py-3.5 text-[10px] font-[500] uppercase tracking-[0.2em] text-white hover:bg-black transition-colors">
                  Buy on TikTok
                </a>
                <a href={`https://shopee.co.th/search?keyword=${encodeURIComponent(selectedProduct.name || "")}`} target="_blank" rel="noreferrer"
                  className="flex w-full items-center justify-center bg-[#EE4D2D] py-3.5 text-[10px] font-[500] uppercase tracking-[0.2em] text-white hover:brightness-110 transition-all">
                  Buy on Shopee
                </a>
                <a href={`https://www.lazada.co.th/catalog/?q=${encodeURIComponent(selectedProduct.name || "")}`} target="_blank" rel="noreferrer"
                  className="flex w-full items-center justify-center bg-[#10078F] py-3.5 text-[10px] font-[500] uppercase tracking-[0.2em] text-white hover:brightness-110 transition-all">
                  Buy on Lazada
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LOOKS ARCHIVE --- */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12" data-aos="fade-up">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-3">Curated Style</p>
              <h2 className="text-[2.4rem] md:text-[3.6rem] font-[200] tracking-[0.03em] text-[#1A1A1A] leading-[1]">
                Makeup<br /><span className="font-[700] italic">Looks</span>
              </h2>
            </div>
            <div className="flex items-center gap-1">
              {["Spring", "Summer", "Autumn", "Winter"].map((c) => (
                <button key={c} onClick={() => setActiveColor(c)}
                  className={`px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-all duration-200 rounded-full ${activeColor === c ? 'bg-[#1A1A1A] text-white' : 'text-[#888] hover:text-[#1A1A1A] border border-[#E8E0DC] hover:border-[#1A1A1A]'
                    }`}>{c}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {makeupLooks.length > 0 ? (
              makeupLooks.map((look, i) => (
                <div key={look.look_id ?? i} data-aos="fade-up" data-aos-delay={i * 60}
                  className="group cursor-pointer rounded-sm overflow-hidden hover:shadow-xl transition-all duration-500"
                  onClick={() => setSelectedLook(look)}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F3F0]">
                    <img src={buildApiImage(look.image_url)} loading="lazy" decoding="async"
                      className="w-full h-full object-cover object-top group-hover:scale-[1.06] transition-transform duration-700" alt={look.look_name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-6">
                      <div>
                        <p className="text-[9px] tracking-[0.2em] uppercase text-white/60 mb-1">{look.personal_color}</p>
                        <p className="text-[13px] font-[300] text-white tracking-wide">{look.look_name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-[9px] tracking-[0.25em] uppercase text-[#aaa] font-[300] mb-0.5">{look.personal_color}</p>
                    <h4 className="text-[13px] font-[500] text-[#1A1A1A] group-hover:text-[#D23669] transition-colors">{look.look_name}</h4>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full h-[300px] flex items-center justify-center">
                <p className="text-[10px] tracking-[0.35em] uppercase text-[#ccc] font-[300]">No looks found for this season.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- LOOK DETAIL MODAL (VS style) --- */}
      {selectedLook && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedLook(null)} />
          <div className="relative z-10 w-full max-w-4xl max-h-[95vh] overflow-hidden bg-white flex flex-col md:flex-row">
            <button onClick={() => setSelectedLook(null)}
              className="absolute right-5 top-5 z-20 w-9 h-9 flex items-center justify-center bg-black/30 hover:bg-black text-white transition-colors" aria-label="Close">
              <X size={16} />
            </button>
            <div className="w-full md:w-[45%] aspect-[3/4] md:aspect-auto overflow-hidden bg-[#F5F3F0] shrink-0">
              <img src={buildApiImage(selectedLook.image_url)} alt={selectedLook.look_name} className="h-full w-full object-cover object-top" />
            </div>
            <div className="p-8 md:p-12 flex flex-col overflow-y-auto custom-scrollbar">
              <p className="text-[9px] tracking-[0.35em] uppercase text-[#aaa] font-[300] mb-4">
                {selectedLook.personal_color || activeColor} Collection
              </p>
              <h3 className="text-[1.8rem] md:text-[2.4rem] font-[300] tracking-[-0.01em] text-[#1A1A1A] leading-[1.05] mb-5">
                {selectedLook.look_name}
              </h3>
              <p className="text-[13px] text-[#605858] font-[300] leading-relaxed border-l border-[#E8E0DC] pl-4 mb-8">
                {selectedLook.description || "This look is designed to align with your personal color tone, emphasizing balanced skin, eye tone, and lip tone in a natural way."}
              </p>
              <div className="mt-auto pt-6 border-t border-[#E8E0DC]">
                <button onClick={() => navigate("/advisor")}
                  className="w-full bg-[#1A1A1A] py-3.5 text-[10px] font-[400] uppercase tracking-[0.2em] text-white hover:bg-[#D23669] transition-colors duration-200">
                  Get Advisor Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- BEST SELLERS --- */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-12" data-aos="fade-up">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-3">Featured</p>
              <h2 className="text-[2.4rem] md:text-[3.6rem] font-[200] tracking-[0.03em] text-[#1A1A1A] leading-[1]">
                Best<br /><span className="font-[700] italic">Sellers</span>
              </h2>
            </div>
            <Link to="/cosmetics" className="text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:text-[#888] hover:border-[#888] transition-colors">View All →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bestSellers.slice(0, 3).map((p, i) => (
              <div key={p.product_id ?? i} data-aos="fade-up" data-aos-delay={i * 80}
                className="group bg-white cursor-pointer rounded-sm overflow-hidden hover:shadow-xl transition-all duration-500"
                onClick={() => openProductModal(p)}>
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F8F6F4]">
                  <img src={buildApiImage(p.image_url)} loading="lazy" decoding="async"
                    className="w-full h-full object-contain p-8 group-hover:scale-[1.05] transition-transform duration-700" alt={p.name} />
                  <button onClick={e => { e.stopPropagation(); toggleLike(p.product_id); }}
                    className="absolute top-5 right-5 z-20 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-full transition-all active:scale-90 hover:bg-white">
                    <Heart size={15} className={likedProducts[p.product_id] ? 'fill-[#D23669] text-[#D23669]' : 'text-[#888] hover:text-[#D23669]'} />
                  </button>
                  {/* Hover CTA */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-6">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-white font-[300] border-b border-white/60 pb-0.5">View Details</span>
                  </div>
                </div>
                <div className="p-5 border-t border-[#F0EAE8]">
                  <h5 className="text-[12px] font-[500] text-[#1A1A1A] mb-1 leading-snug">{p.name}</h5>
                  <p className="text-[12px] font-[300] text-[#888]">฿{parseFloat(p.price || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FILM ARCHIVE --- */}
      {/* <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="border-t border-[#E8E0DC] pt-10 pb-10 flex items-end justify-between gap-6" data-aos="fade-up">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-3">Video</p>
              <h2 className="text-[2.4rem] md:text-[3.6rem] font-[200] tracking-[0.03em] text-[#1A1A1A] leading-[1]">
                Film<br /><span className="font-[700] italic">Archive</span>
              </h2>
            </div>
            <div className="h-px flex-grow bg-[#E8E0DC] mb-2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(TUTORIAL_RESOURCES).slice(0, 4).map((video, idx) => (
              <div key={idx} className="rounded-sm overflow-hidden hover:shadow-lg transition-all duration-300">
                <PersonalColorTikTokCard video={video} onSelect={setSelectedVideo} />
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* --- FAQ --- */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="border-t border-[#E8E0DC] pt-10 pb-10" data-aos="fade-up">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#888] font-[300] mb-3">Questions</p>
            <h2 className="text-[2.4rem] md:text-[3.6rem] font-[200] tracking-[0.03em] text-[#1A1A1A] leading-[1] mb-10">
              <span className="font-[700] italic">FAQ</span>
            </h2>
            <div className="divide-y divide-[#E8E0DC]">
              {[
                { q: "The art of processing?", a: "Our AI analyzes beauty structure at the Biometric Mapping level to find your most perfect features." },
                { q: "Personalized exclusivity?", a: "Every result is your own exclusive beauty fingerprint. Data is stored privately for your security." },
                { q: "Personalized exclusivity?", a: "Every result is your own exclusive beauty fingerprint. Data is stored privately for your security." },
              ].map((item, i) => (
                <details key={i} className="group py-5 cursor-pointer">
                  <summary className="flex justify-between items-center list-none text-[11px] font-[400] uppercase tracking-[0.2em] text-[#1A1A1A]">
                    {item.q}
                    <ArrowRight size={14} className="group-open:rotate-90 transition-transform duration-200 text-[#888]" />
                  </summary>
                  <p className="mt-4 text-[12px] font-[300] text-[#888] leading-relaxed pl-0">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      

      {/* --- 8. PRESTIGE CALL TO ACTION --- */}
      {/* <section className="py-20 bg-[#2B2629] text-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 text-center space-y-8">
          <div data-aos="fade-up">
            <h2 className="text-4xl md:text-6xl font-[900] tracking-tighter uppercase leading-none">
              Ready to <span className="text-[#FF85A2]">Reveal</span> <br /> Your Inner Aura?
            </h2>
            <p className="text-[10px] tracking-[0.3em] font-bold text-gray-500 uppercase mt-6">
              Experience the future of biometric beauty analysis.
            </p>
          </div>
          <div data-aos="zoom-in" data-aos-delay="200">
            <button
              onClick={() => navigate("/analysis")}
              className="group relative overflow-hidden bg-white text-black px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:pr-16"
            >
              <span className="relative z-10">Start Your Analysis</span>
              <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" size={16} />
            </button>
          </div>
        </div>
      </section> */}

      {/* --- FOOTER --- */}
      {/* <footer className="bg-white border-t border-[#E8E0DC] pt-14 pb-8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <h3 className="text-lg font-[300] tracking-[0.06em] uppercase text-[#1A1A1A]">Aura<span className="font-[700]">Match</span></h3>
              <p className="text-[11px] font-[300] text-[#888] tracking-[0.08em] leading-loose max-w-sm">
                Biometric beauty analysis at the intersection of technology and personal color science.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[9px] font-[500] uppercase tracking-[0.3em] text-[#1A1A1A]">Navigation</h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.to}><Link to={item.to} className="text-[11px] font-[300] text-[#888] hover:text-[#1A1A1A] transition-colors uppercase tracking-[0.05em]">{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[9px] font-[500] uppercase tracking-[0.3em] text-[#1A1A1A]">Connect</h4>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-[300] text-[#888] cursor-pointer hover:text-[#1A1A1A] uppercase tracking-[0.05em] transition-colors">Instagram</span>
                <span className="text-[11px] font-[300] text-[#888] cursor-pointer hover:text-[#1A1A1A] uppercase tracking-[0.05em] transition-colors">TikTok</span>
              </div>
            </div>
          </div>
          <div className="border-t border-[#E8E0DC] pt-6">
            <p className="text-[9px] font-[300] text-[#bbb] uppercase tracking-[0.25em]">
              © 2026 AuraMatch. All rights reserved.
            </p>
          </div>
        </div>
      </footer> */}

      {selectedVideo && <TikTokModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display:flex; width:fit-content; animation: marquee 40s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E8E0DC; border-radius: 2px; }
      `}</style>
    </div>
  );
} 
