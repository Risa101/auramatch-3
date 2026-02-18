import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { TUTORIAL_RESOURCES } from "../data/tutorialResources";
import PersonalColorTikTokCard from "../components/PersonalColorTikTokCard";
import TikTokModal from "../components/TikTokModal";
import { Star, ArrowRight, Sparkles, PlayCircle, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../lib/i18n";

// ✅ API Connections
import {
  getBestSellerProducts, getLooksBySeason, getFavoritesByUserApi, 
  toggleFavoriteApi
} from "../callapi/call_api_user";

const BASE_PATH = "/";

export default function AuramatchDailyDose() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [bestSellers, setBestSellers] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [makeupLooks, setMakeupLooks] = useState([]);
  const [activeColor, setActiveColor] = useState("Spring"); 
  const [likedProducts, setLikedProducts] = useState({});
  const [selectedLook, setSelectedLook] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);


  const navItems = [
    { label: "Home", to: "/" },
    { label: "Academy", to: "/academy" },
    { label: "Analysis", to: "/analysis" },
    { label: "Shop", to: "/shop" }
  ];
  const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const goAdvisor = () => navigate("/advisor");

  const buildApiImage = (path) => {
    if (!path) return "/assets/home2.webp";
    if (String(path).startsWith("http")) return path;
    if (!apiBase) return path;
    return `${apiBase}/${String(path).replace(/^\//, "")}`;
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };


  const horizontalPicks = [
    { title: '', tag: '', tone: '', img: '/assets/ad11.JPG' },
    { title: '', tag: '', tone: '', img: '/assets/ad7.JPG' },
    { title: '', tag: '', tone: '', img: '/assets/ad2.jpeg' },
    { title: '', tag: '', tone: '', img: '/assets/ad4.JPG' },
    { title: '', tag: '', tone: '', img: '/assets/ad8.JPG' },
    { title: '', tag: '', tone: '', img: '/assets/home2.webp' },
  ];

  const personalColorData1 = [
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


  useEffect(() => {
    const fetchInitialData = async () => {
      const userRaw = localStorage.getItem("auramatch:user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const userId = user?.uid ? Number(user.uid) : null;
      if (!userId) return;
      const favs = await getFavoritesByUserApi(userId);

      // แปลงข้อมูล Array เป็น Object เพื่อให้เช็คสถานะหัวใจได้เร็วขึ้น
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
      alert("กรุณาเข้าสู่ระบบก่อนใช้งานรายการโปรด");
      return;
    }

    // 1. Update UI ทันที (Optimistic Update)
    setLikedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));

    try {
      // 2. เรียก API ที่เราเขียนไว้ใน favorite_bp
      await toggleFavoriteApi(userId, productId);
    } catch (error) {
      // 3. ถ้า Error ให้คืนค่าเดิม (Rollback)
      setLikedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
      alert("ไม่สามารถบันทึกรายการโปรดได้ในขณะนี้");
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // ใช้ Promise.all ดึงทั้งสินค้าขายดี และ Looks ตามฤดูกาลพร้อมกัน
      const [bsData, looksData] = await Promise.all([
        getBestSellerProducts(),
        getLooksBySeason(activeColor) // เรียกใช้ API looks โดยส่งค่า activeColor (Spring, Summer, etc.)
      ]);

      setBestSellers(bsData || []);
      setMakeupLooks(looksData || []); // อัปเดตข้อมูลที่ดึงมาจากหลังบ้านลงใน State
    } catch (err) {
      console.error("Fetch Data Error:", err);
    } finally {
      setIsLoading(false);
      // ให้ AOS (Animation) ทำงานหลังจากโหลดข้อมูลเสร็จ
      setTimeout(() => AOS.refresh(), 500);
    }
  }, [activeColor]); // 👈 สำคัญมาก: ต้องใส่ [activeColor] เพื่อให้โหลดใหม่เมื่อคลิกเปลี่ยนสี

  useEffect(() => {
    fetchData();
    AOS.init({ duration: 1200, easing: "ease-out-back", once: true });
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchData]);

  if (isLoading) return (
    <div className="h-screen bg-[#E8D9F2] flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[#D23669]/20 border-t-[#D23669] rounded-full animate-spin"></div>
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#D23669] font-black italic">Preparing Your Dose...</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white text-[#4A4A4A] font-sans selection:bg-[#FFD1DC] selection:text-[#D23669] antialiased">

      {/* --- 1. HERO --- */}
            <header className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <picture>
            <source srcSet="/assets/home2.webp" type="image/webp" />
            <img
              src="/assets/home2.webp"
              alt=""
              loading="eager"
              fetchpriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </picture>
        </div>
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-10">
          <div data-aos="fade-right" className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
              <Sparkles size={10} className="text-white" />
              <span className="text-[8px] tracking-[0.2em] uppercase text-white font-black">Innovation 2026</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-[900] leading-none tracking-tighter text-white uppercase">
              The <span className="text-[#FF85A2]">Aura</span> <br /> Match <span className="font-light italic text-white">Dose</span>
            </h1>
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-white/90 max-w-sm leading-relaxed">
              The highly-absorbable, biometric-based, and enjoyable solution to your perfect beauty match.
            </p>
            <div className="pt-4">
              <button onClick={() => navigate("/analysis")} className="bg-[#D23669] text-white px-8 py-4 rounded-full text-[9px] font-[900] uppercase tracking-widest hover:scale-105 transition-all">
                Begin Analysis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- 2. MARQUEE --- */}
      <div className="bg-[#D23669] py-5 overflow-hidden border-y border-white/10 relative z-20">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-white text-[10px] font-[900] tracking-[0.5em] uppercase mx-12">
              • DISCOVER YOUR SHAPE • ANALYSE YOUR COLOR • BOOST YOUR AURA •
            </span>
          ))}
        </div>
      </div>

      {/* --- 3. FACE SHAPE LIBRARY --- */}
      <section
        className="py-32 bg-white overflow-hidden cursor-pointer"
        role="link"
        tabIndex={0}
        onClick={goAdvisor}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goAdvisor();
          }
        }}
      >
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div data-aos="fade-right" className="space-y-4">
              <span className="text-[11px] tracking-[0.4em] font-black uppercase text-[#D23669]">Face Geometry</span>
              {/* Scaled to Match Hero */}
              <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-[900] leading-none tracking-tighter text-[#4A4A4A] uppercase">
                Which <span className="text-[#FF85A2]">Shape</span> <br /> Are You?
              </h2>
            </div>
            <p data-aos="fade-left" className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-xs leading-loose text-left md:text-right pb-2">
              Every face shape has its own unique charm. Discover yours through AI analysis.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { label: "Oval", desc: "หน้ารูปไข่", color: "bg-[#FFEBF0]" },
              { label: "Round", desc: "หน้ากลม", color: "bg-[#E0F2FE]" },
              { label: "Square", desc: "หน้าเหลี่ยม", color: "bg-[#F3F4F6]" },
              { label: "Heart", desc: "รูปหัวใจ", color: "bg-[#FFF4E0]" },
              { label: "Diamond", desc: "รูปเพชร", color: "bg-[#E8D9F2]" },
              { label: "Long", desc: "หน้ายาว", color: "bg-[#E2F3E7]" }
            ].map((shape, i) => (
              <div key={shape.label} data-aos="zoom-in" data-aos-delay={i * 100} className={`group ${shape.color} p-8 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-3 hover:shadow-xl cursor-pointer`}>
                <div className="w-12 h-16 mb-4 border border-[#D23669]/20 rounded-full flex items-center justify-center group-hover:border-[#D23669] transition-colors">
                  <span className="text-[10px] font-black text-[#D23669] opacity-40 group-hover:opacity-100 uppercase">{shape.label[0]}</span>
                </div>
                <h5 className="text-[11px] font-[900] text-[#4A4A4A] uppercase tracking-tighter mb-1">{shape.label}</h5>
                <p className="text-[8px] font-black text-[#D23669]/40 uppercase tracking-widest">{shape.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 4. PERSONAL COLOR (Balanced Palette Version) --- */}
      <section
        className="py-20 bg-[#F9F9F9] overflow-hidden cursor-pointer"
        role="link"
        tabIndex={0}
        onClick={goAdvisor}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goAdvisor();
          }
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-12 text-center">
            <span className="text-[10px] tracking-[0.4em] font-black uppercase text-[#D23669] block mb-2">Color Harmony</span>
            <h2 className="text-3xl md:text-4xl font-[900] leading-none tracking-tighter text-[#4A4A4A] uppercase">
              Discover Your <span className="text-[#D23669]">Season</span>
            </h2>
          </div>

          <div className="flex flex-col md:flex-row h-[500px] gap-3 w-full items-stretch">
            {personalColorData1.map((item, idx) => (
              <div
                key={item.name}
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

                  {/* --- 4.5 HORIZONTAL SCROLLER --- */}
      <section className="min-h-screen bg-[#FFF1F6] flex flex-col justify-center">
        <div className="max-w-[1400px] mx-auto px-8 md:px-10 pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.4em] font-black uppercase text-[#D23669]">Aura Promo</span>
              <h2 className="text-3xl md:text-4xl font-[900] tracking-tighter text-[#4A4A4A] uppercase">
                Sweet <span className="text-[#FF85A2]">Pick</span> Carousel
              </h2>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#C27C90] max-w-sm">
              Swipe the full-width banners for limited drops and aura gifts.
            </p>
          </div>
        </div>

        <div className="w-full">
          <div className="overflow-x-auto snap-x snap-mandatory scroll-smooth">
            <div className="flex min-w-max gap-8 px-8 md:px-10 pb-10">
              {horizontalPicks.map((item, idx) => (
                <div
                  key={`${item.title}-${idx}`}
                  className="snap-center w-[88vw] md:w-[82vw] lg:w-[78vw] h-[70vh] rounded-[3rem] overflow-hidden border-4 border-[#F08AAA] bg-[#FFE9F0] shadow-[0_24px_70px_rgba(240,138,170,0.28)]"
                >
                  <div className="relative w-full h-full">
                    <img
                      src={item.img}
                      alt={item.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div className="relative z-10 h-full flex flex-col justify-center px-10 md:px-16 max-w-2xl">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D23669] mb-4"></p>
                      <h3 className="text-3xl md:text-5xl font-[900] uppercase tracking-tight text-[#4A4A4A] mb-6">
                        {item.title}
                      </h3>
                      <p className="text-sm md:text-base text-[#7C5A6A] font-semibold leading-relaxed mb-6">
                        {item.tag} • {item.tone}
                      </p>
                      {/* <button className="w-fit rounded-full bg-[#D23669] text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.35em] hover:brightness-110 transition-all">
                        Shop Now
                      </button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

{/* --- 5. THE EDIT --- */}
      <section className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="flex justify-between items-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-[900] leading-none tracking-tighter uppercase text-[#4A4A4A]">
              The Best Sellers.
            </h2>
            <button className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D23669] border-b-2 border-[#D23669]/10 pb-1">View All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {bestSellers.slice(0, 3).map((p, i) => (
              <div
                key={p.product_id ?? i}
                data-aos="fade-up"
                className="group text-center cursor-pointer"
                onClick={() => openProductModal(p)}
              >
                {/* Container รูปภาพ */}
                <div className="relative aspect-[3/4] rounded-[3.5rem] overflow-hidden bg-[#F9F9F9] mb-10 group-hover:shadow-2xl transition-all duration-700">
                  <img
                    src={buildApiImage(p.image_url)}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    alt={p.name}
                  />

                  {/* --- ปุ่มหัวใจที่เพิ่มเข้ามา --- */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // กันไม่ให้ไปเปิด Modal สินค้า
                      toggleLike(p.product_id);
                    }}
                    className="absolute top-8 right-8 z-20 p-4 rounded-full bg-white/90 backdrop-blur-md shadow-lg transition-all active:scale-90 hover:bg-white"
                  >
                    <Heart
                      size={20}
                      className={`transition-colors duration-300 ${likedProducts[p.product_id] ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    />
                  </button>
                  {/* ------------------------- */}
                </div>

                <h5 className="text-[13px] font-[900] uppercase tracking-wider text-[#4A4A4A] mb-2">{p.name}</h5>
                <p className="text-sm font-black text-[#D23669]">฿{parseFloat(p.price || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BEST SELLER PURCHASE MODAL --- */}
      {isProductModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-md" onClick={closeProductModal} />
          <div className="relative z-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[3rem] bg-white shadow-2xl">
            <button
              onClick={closeProductModal}
              className="absolute top-6 right-6 z-20 rounded-full bg-white/90 p-2 shadow-md hover:bg-black hover:text-white transition-all"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-8 md:p-12">
              <div>
                <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#F8F8F8] border border-gray-100">
                  <img
                    src={buildApiImage(selectedProduct.image_url)}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D23669]">
                  Best Seller Pick
                </span>
                <h3 className="mt-3 text-3xl md:text-4xl font-[900] uppercase tracking-tighter text-[#4A4A4A] leading-tight">
                  {selectedProduct.name}
                </h3>
                <div className="mt-5 flex items-center gap-3">
                  <span className="text-3xl font-black text-[#111]">
                    ฿{parseFloat(selectedProduct.price || 0).toLocaleString()}
                  </span>
                  {selectedProduct.rating && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F6F6F6] px-3 py-1 text-xs font-bold text-gray-500">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      {selectedProduct.rating}
                    </span>
                  )}
                </div>

                <p className="mt-6 text-sm leading-relaxed text-gray-500">
                  เลือกแพลตฟอร์มที่สะดวกเพื่อสั่งซื้อสินค้าได้ทันที
                </p>

                <div className="mt-8 space-y-3">
                  <a
                    href={`https://www.tiktok.com/search/video?q=${encodeURIComponent(selectedProduct.name || "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center rounded-2xl bg-black py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:brightness-110 transition-all"
                  >
                    Buy on TikTok
                  </a>
                  <a
                    href={`https://shopee.co.th/search?keyword=${encodeURIComponent(selectedProduct.name || "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center rounded-2xl bg-[#EE4D2D] py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:brightness-110 transition-all"
                  >
                    Buy on Shopee
                  </a>
                  <a
                    href={`https://www.lazada.co.th/catalog/?q=${encodeURIComponent(selectedProduct.name || "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center rounded-2xl bg-[#10078F] py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:brightness-110 transition-all"
                  >
                    Buy on Lazada
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 5.5 THE LOOKS ARCHIVE (ดึงจากหลังบ้าน) --- */}
      <section className="py-32 bg-[#F9F9F9]">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
            <div data-aos="fade-right" className="space-y-4">
              <span className="text-[11px] tracking-[0.4em] font-black uppercase text-[#D23669]">Curated Style</span>
              <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-[900] leading-none tracking-tighter text-[#4A4A4A] uppercase">
                Makeup <span className="text-[#FF85A2]">Looks</span>
              </h2>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {["Spring", "Summer", "Autumn", "Winter"].map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveColor(c)}
                  className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeColor === c ? "bg-[#D23669] text-white" : "bg-white text-gray-400 border border-gray-100"
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {makeupLooks.length > 0 ? (
              makeupLooks.map((look, i) => (
                <div
                  key={look.look_id ?? i}
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                  className="group relative bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  onClick={() => setSelectedLook(look)}
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    {/* ในส่วน THE LOOKS ARCHIVE */}
                    <img
                      src={buildApiImage(look.image_url)}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      alt={look.look_name}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-10">
                    <span className="text-[10px] text-[#FF85A2] font-black uppercase tracking-[0.3em] mb-2">
                      {look.personal_color} Collection
                    </span>
                    <h4 className="text-2xl font-[900] text-white uppercase tracking-tighter mb-4">
                      {look.look_name}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLook(look);
                      }}
                      className="w-fit bg-white text-black px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#D23669] hover:text-white transition-colors"
                    >
                      Explore Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">No looks found for this season.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- LOOK DETAIL MODAL --- */}
      {selectedLook && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedLook(null)}
          />
          <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
            <button
              onClick={() => setSelectedLook(null)}
              className="absolute right-6 top-6 z-10 rounded-full bg-white/90 p-2 shadow-md hover:bg-black hover:text-white transition-all"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="aspect-[4/5] md:aspect-auto">
                <img
                  src={buildApiImage(selectedLook.image_url)}
                  alt={selectedLook.look_name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8 md:p-10 flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D23669]">
                  {selectedLook.personal_color || activeColor} Collection
                </span>
                <h3 className="mt-3 text-3xl font-[900] uppercase tracking-tighter text-[#4A4A4A]">
                  {selectedLook.look_name}
                </h3>
                <p className="mt-6 text-sm leading-relaxed text-gray-500">
                  {selectedLook.description || "ลุคนี้ถูกออกแบบให้สอดคล้องกับโทนสีประจำตัวของคุณ โดยเน้นบาลานซ์ผิว โทนตา และโทนปากให้เด่นแบบเป็นธรรมชาติ"}
                </p>
                <div className="mt-auto pt-8">
                  <button
                    onClick={() => navigate("/advisor")}
                    className="w-full rounded-full bg-[#D23669] py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:brightness-110 transition-all"
                  >
                    Get Advisor Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 6. FILM ARCHIVE --- */}
      <section className="py-24 bg-[#E8D9F2]/10">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="flex items-center gap-6 mb-16">
            {/* Scaled to Match Hero */}
            <h3 className="text-4xl md:text-5xl lg:text-[3.5rem] font-[900] leading-none text-[#D23669] uppercase tracking-tighter">
              Film Archive
            </h3>
            <div className="h-[2px] flex-grow bg-[#D23669]/10 mt-4" />
            <PlayCircle size={40} className="text-[#D23669]/20" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.values(TUTORIAL_RESOURCES).slice(0, 4).map((video, idx) => (
              <div key={idx} className="transform scale-[0.98] hover:scale-100 transition-all">
                <PersonalColorTikTokCard video={video} onSelect={setSelectedVideo} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 7. FAQ --- */}
      <section className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="max-w-4xl mx-auto">
            {/* Scaled to Match Hero */}
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-[900] leading-none text-[#D23669] uppercase tracking-tighter text-center mb-20">
              FAQ.
            </h2>
            <div className="space-y-4">
              {[
                { q: "ศิลปะแห่งการประมวลผล?", a: "AI ของเราวิเคราะห์โครงสร้างความงามในระดับ Biometric Mapping เพื่อหาจุดที่สมบูรณ์แบบที่สุดของคุณ" },
                { q: "เอกสิทธิ์เฉพาะบุคคล?", a: "ทุกผลลัพธ์คือลิขสิทธิ์ความงามเฉพาะตัวคุณ ข้อมูลจะถูกจัดเก็บแบบส่วนตัวเพื่อความปลอดภัย" }
              ].map((item, i) => (
                <details key={i} className="group bg-[#F9F9F9] rounded-[2rem] px-10 py-8 cursor-pointer hover:bg-white hover:shadow-xl transition-all">
                  <summary className="flex justify-between items-center list-none font-[900] text-xs uppercase tracking-[0.2em] text-[#4A4A4A]">
                    {item.q}
                    <ArrowRight size={16} className="group-open:rotate-90 transition-all text-[#D23669]" />
                  </summary>
                  <p className="mt-6 text-[11px] font-bold uppercase tracking-widest leading-loose text-gray-400 border-t border-gray-100 pt-6">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- 8. PRESTIGE CALL TO ACTION --- */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-[1400px] mx-auto px-10 text-center space-y-8">
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
      </section>

      {/* --- 9. LUXURY FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
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
                {navItems.map((item) => (
                  <li key={item.to}><Link to={item.to} className="text-[10px] font-bold text-gray-400 hover:text-[#D23669] transition-colors uppercase">{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest">Connect</h4>
              <div className="flex gap-4">
                {/* ใส่ Social Icons ตรงนี้ */}
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

      {selectedVideo && <TikTokModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D23669; border-radius: 10px; }
      `}</style >
    </div>
  );
} 
