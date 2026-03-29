import { useState, useEffect, useRef } from 'react';
import { Loader2, LayoutGrid, Ticket, Copy, Check, Tag, Clock, Calendar, Search, X, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getPromotions, getdataBrands } from "../callapi/call_api_user";
import { imgUrl } from "../utils/imgUrl";

const AD_SLIDES = [
  { src: '/assets/ad1.jpeg' },
  { src: '/assets/ad2.jpeg' },
  { src: '/assets/ad3.JPG' },
  { src: '/assets/ad4.JPG' },
  { src: '/assets/ad5.JPG' },
  { src: '/assets/ad6.JPG' },
  { src: '/assets/ad7.JPG' },
  { src: '/assets/ad8.JPG' },
  { src: '/assets/ad9.JPG' },
  { src: '/assets/ad10.JPG' },
  { src: '/assets/ad11.JPG' },
  { src: '/assets/laglaceads.webp' },
];

const CouponPage = () => {
  const [allBrands, setAllBrands] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const heroTimerRef = useRef(null);
  const itemsPerPage = 9;

  // Auto-advance hero
  useEffect(() => {
    if (heroPaused) return;
    heroTimerRef.current = setInterval(() => {
      setHeroIndex(i => (i + 1) % AD_SLIDES.length);
    }, 4000);
    return () => clearInterval(heroTimerRef.current);
  }, [heroPaused]);

  const heroGo = (idx) => {
    setHeroIndex((idx + AD_SLIDES.length) % AD_SLIDES.length);
    // reset timer
    clearInterval(heroTimerRef.current);
    if (!heroPaused) {
      heroTimerRef.current = setInterval(() => {
        setHeroIndex(i => (i + 1) % AD_SLIDES.length);
      }, 4000);
    }
  };

  useEffect(() => {
    AOS.init({ once: true, duration: 700, easing: 'ease-out' });
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [promoData, brandData] = await Promise.all([getPromotions(), getdataBrands()]);
        setAllBrands(brandData);
        const enriched = promoData
          .filter(p => p.status === 'active')
          .map(promo => {
            const brandMatch = brandData.find(b => Number(b.brand_id) === Number(promo.brand_id));
            return { ...promo, brand_logo: brandMatch?.logo_path || null, brand_name: brandMatch?.brand_name || 'Aura' };
          })
          .filter(p => p.brand_logo);
        setPromotions(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const q = searchQuery.toLowerCase().trim();

  const filteredPromotions = promotions.filter(p => {
    if (q) {
      return (
        p.promo_name?.toLowerCase().includes(q) ||
        p.brand_name?.toLowerCase().includes(q) ||
        p.coupon_code?.toLowerCase().includes(q) ||
        p.promo_detail?.toLowerCase().includes(q)
      );
    }
    return selectedBrand === 'All' || String(p.brand_id) === String(selectedBrand);
  });

  const matchedBrandIds = q ? new Set(filteredPromotions.map(p => String(p.brand_id))) : null;
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const currentItems = filteredPromotions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSetBrand = (brand) => { setSelectedBrand(brand); setSearchQuery(''); setCurrentPage(1); };
  const handleSetSearch = (val) => { setSearchQuery(val); setSelectedBrand('All'); setCurrentPage(1); };

  const handleCopy = (id, code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const daysLeft = (d) => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;
  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' });

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#3A3437] font-sans antialiased overflow-x-hidden selection:bg-[#FFD1DC] selection:text-[#D23669] pt-[60px] lg:pt-[180px]">

      {/* ── HERO CAROUSEL ── */}
      <div
        className="relative w-full overflow-hidden bg-black"
        style={{ height: 'min(85vh, 700px)' }}
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        {/* Slides */}
        {AD_SLIDES.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === heroIndex ? 1 : 0, zIndex: i === heroIndex ? 1 : 0 }}
          >
            <img
              src={slide.src}
              alt={`Ad ${i + 1}`}
              className="w-full h-full object-cover"
            />
              </div>
        ))}

        {/* Prev / Next arrows */}
        <button
          onClick={() => heroGo(heroIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => heroGo(heroIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {AD_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => heroGo(i)}
              className={`rounded-full transition-all duration-300 ${i === heroIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>

        {/* Progress bar */}
        {!heroPaused && (
          <div className="absolute bottom-0 left-0 z-20 h-[3px] bg-[#D23669]"
            style={{
              animation: 'heroProgress 4s linear infinite',
              width: '100%',
              transformOrigin: 'left',
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes heroProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── SECTION HEADER ── */}
      <div className="bg-[#FDFCFB] pt-14 pb-2">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6" data-aos="fade-up">
            {/* Left: title */}
            <div>
              {/* <div className="inline-flex items-center gap-2 bg-[#FFF0F5] text-[#D23669] text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full mb-3">
                <Ticket size={10} />
                Exclusive Deals
              </div> */}
              <h2 className="text-4xl md:text-5xl font-[900] tracking-tighter uppercase text-[#3A3437] leading-none">
                All Coupons
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                {loading ? '...' : `${filteredPromotions.length} offer${filteredPromotions.length !== 1 ? 's' : ''} available`}
              </p>
            </div>

            {/* Right: search */}
            <div className="w-full md:w-80">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-4 text-[#D23669] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => handleSetSearch(e.target.value)}
                  placeholder="Search brand, name or code..."
                  className="w-full pl-10 pr-10 py-3 bg-white border border-[#EEDDE4] rounded-full text-sm text-[#3A3437] placeholder:text-gray-300 shadow-sm focus:outline-none focus:border-[#D23669] focus:ring-2 focus:ring-[#D23669]/10 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => handleSetSearch('')} className="absolute right-4 text-gray-300 hover:text-[#D23669] transition-colors">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Brand filter strip */}
          <div className="mt-6 pb-6 border-b border-[#F3D5E0]" data-aos="fade-up" data-aos-delay="60">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => handleSetBrand('All')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all duration-200
                  ${selectedBrand === 'All'
                    ? 'bg-[#D23669] text-white border-[#D23669] shadow-md shadow-[#D23669]/20'
                    : 'bg-white text-gray-400 border-[#EEDDE4] hover:border-[#D23669] hover:text-[#D23669]'}`}>
                <LayoutGrid size={10} /> All
              </button>
              {allBrands.filter(b => b.logo_path).map(brand => {
                const isActive = String(selectedBrand) === String(brand.brand_id);
                const isMatched = q ? matchedBrandIds?.has(String(brand.brand_id)) : false;
                return (
                  <button key={brand.brand_id} onClick={() => handleSetBrand(brand.brand_id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all duration-200
                      ${isActive
                        ? 'bg-[#D23669] text-white border-[#D23669] shadow-md shadow-[#D23669]/20'
                        : isMatched
                          ? 'bg-[#FFF5F8] text-[#D23669] border-[#D23669]'
                          : q
                            ? 'bg-white text-gray-200 border-[#EEDDE4] opacity-40'
                            : 'bg-white text-gray-400 border-[#EEDDE4] hover:border-[#D23669] hover:text-[#D23669]'}`}>
                    <img src={imgUrl(brand.logo_path)} className="w-4 h-4 object-contain" alt={brand.brand_name} />
                    {brand.brand_name}
                  </button>
                );
              })}
              {selectedBrand !== 'All' && (
                <button onClick={() => handleSetBrand('All')} className="text-[9px] font-black uppercase tracking-widest text-gray-300 hover:text-[#D23669] transition-colors ml-1">
                  Clear ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── COUPON GRID ── */}
      <div className="bg-[#F5F5F6] py-10">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10">
          {loading ? (
            <div className="flex flex-col items-center py-36 gap-4">
              <div className="w-14 h-14 bg-white border border-[#E0DAD5] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#221D1D]" size={22} />
              </div>
              <p className="text-[9px] font-[700] uppercase tracking-[0.45em] text-[#958F8F]">Loading Offers</p>
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="bg-white border border-[#E0DAD5] text-center py-28" data-aos="fade-up">
              <Gift size={22} className="mx-auto mb-4 text-[#C0C0C0]" />
              <p className="text-[9px] font-[700] uppercase tracking-[0.45em] text-[#958F8F]">No coupons available yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {currentItems.map((p, i) => {
                const days = daysLeft(p.end_date);
                const isCopied = copiedId === p.promotion_id;
                const hasCode = !!p.coupon_code;
                const isExpiringSoon = days !== null && days <= 7 && days > 0;

                return (
                  <div key={p.promotion_id}
                    className="group flex flex-row bg-white border border-[#E0DAD5] hover:shadow-md transition-all duration-300"
                    data-aos="fade-up" data-aos-delay={i * 30}>

                    {/* LEFT: logo + discount (fixed width) */}
                    <div className="relative flex-shrink-0 w-[180px] sm:w-[220px] bg-[#EBC2C8] flex flex-col items-center justify-center gap-2 px-5 py-8 overflow-hidden">
                      {/* subtle dot pattern */}
                      <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(#221D1D 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

                      {isExpiringSoon && (
                        <span className="absolute top-3 right-0 text-[7px] font-[700] uppercase tracking-[0.3em] px-2 py-0.5 bg-[#221D1D] text-white z-10">
                          {days}d left
                        </span>
                      )}

                      {/* Brand logo */}
                      <div className="relative z-10 w-12 h-12 bg-white p-1.5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {p.brand_logo
                          ? <img src={imgUrl(p.brand_logo)} className="w-full h-full object-contain" alt={p.brand_name} />
                          : <Ticket size={18} className="text-[#221D1D]" />}
                      </div>

                      {/* Discount */}
                      <div className="relative z-10 text-center">
                        {p.discount_percent > 0 ? (
                          <>
                            <p className="text-[2.8rem] font-[800] tracking-tighter text-[#221D1D] leading-none">
                              {p.discount_percent}<span className="text-base font-[400] text-[#221D1D]/50">%</span>
                            </p>
                            <p className="text-[8px] font-[700] uppercase tracking-[0.45em] text-[#221D1D]/70">off</p>
                          </>
                        ) : (
                          <p className="text-sm font-[800] uppercase tracking-[0.1em] text-[#221D1D] text-center">Special<br/>Deal</p>
                        )}
                      </div>

                      <span className="relative z-10 text-[7px] font-[700] uppercase tracking-[0.4em] text-[#221D1D]/60 text-center">{p.brand_name}</span>
                    </div>

                    {/* VERTICAL PERFORATED DIVIDER */}
                    <div className="relative w-0 flex-shrink-0">
                      <div className="absolute -left-3 top-3 w-6 h-6 rounded-full bg-[#F5F5F6] border border-[#E0DAD5] z-10" />
                      <div className="absolute -left-3 bottom-3 w-6 h-6 rounded-full bg-[#F5F5F6] border border-[#E0DAD5] z-10" />
                      <div className="absolute left-0 top-3 bottom-3 border-l border-dashed border-[#E0DAD5]" />
                    </div>

                    {/* RIGHT: details + code */}
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch px-6 py-5 gap-4 min-w-0">

                      {/* Promo info */}
                      <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
                        <p className="text-[11px] font-[700] uppercase tracking-[0.35em] text-[#221D1D] leading-snug">{p.promo_name}</p>
                        {p.promo_detail && (
                          <p className="text-[12px] font-[400] text-[#605858] leading-relaxed line-clamp-2">{p.promo_detail}</p>
                        )}
                        {(p.start_date || p.end_date) && (
                          <div className="flex items-center gap-3 flex-wrap mt-1">
                            {p.start_date && (
                              <span className="flex items-center gap-1 text-[8px] text-[#C0C0C0] uppercase tracking-[0.3em]">
                                <Calendar size={8} /> {fmt(p.start_date)}
                              </span>
                            )}
                            {p.end_date && (
                              <span className="flex items-center gap-1 text-[8px] font-[700] text-[#958F8F] uppercase tracking-[0.3em]">
                                <Clock size={8} /> Until {fmt(p.end_date)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Code + button */}
                      <div className="flex-shrink-0 flex flex-col justify-center gap-2 sm:w-48">
                        {hasCode ? (
                          <>
                            <div className="border border-dashed border-[#E0DAD5] bg-[#F5F5F6] px-3 py-2.5 text-center">
                              <p className="text-[7px] font-[700] uppercase tracking-[0.45em] text-[#958F8F] mb-1 flex items-center justify-center gap-1">
                                <Tag size={7} /> Code
                              </p>
                              <p className="text-sm font-[800] tracking-[0.25em] font-mono text-[#221D1D]">{p.coupon_code}</p>
                            </div>
                            <button onClick={() => handleCopy(p.promotion_id, p.coupon_code)}
                              className={`w-full py-2.5 text-[8px] font-[700] uppercase tracking-[0.45em] flex items-center justify-center gap-1.5 transition-all duration-200 border
                                ${isCopied
                                  ? 'bg-[#EBC2C8] text-[#221D1D] border-[#EBC2C8]'
                                  : 'bg-white text-[#221D1D] border-[#221D1D] hover:bg-[#221D1D] hover:text-white'}`}>
                              {isCopied ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy Code</>}
                            </button>
                          </>
                        ) : (
                          <div className="border border-dashed border-[#E0DAD5] px-3 py-3 text-center">
                            <p className="text-[7px] font-[700] uppercase tracking-[0.4em] text-[#C0C0C0]">No code needed</p>
                            <p className="text-[8px] font-[700] uppercase tracking-[0.3em] text-[#221D1D] mt-1">Auto applied</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-px" data-aos="fade-up">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-10 h-10 border border-[#E0DAD5] bg-white text-[#958F8F] text-sm hover:bg-[#221D1D] hover:text-white hover:border-[#221D1D] disabled:opacity-30 transition-all">
                ‹
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 text-[10px] font-[700] transition-all border
                    ${currentPage === i + 1
                      ? 'bg-[#221D1D] text-white border-[#221D1D]'
                      : 'bg-white border-[#E0DAD5] text-[#958F8F] hover:bg-[#221D1D] hover:text-white hover:border-[#221D1D]'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-10 h-10 border border-[#E0DAD5] bg-white text-[#958F8F] text-sm hover:bg-[#221D1D] hover:text-white hover:border-[#221D1D] disabled:opacity-30 transition-all">
                ›
              </button>
            </div>
          )}
          {!loading && filteredPromotions.length > 0 && (
            <p className="text-center text-[8px] font-[700] tracking-[0.45em] uppercase text-[#C0C0C0] mt-4">
              Page {currentPage} of {totalPages || 1}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponPage;
