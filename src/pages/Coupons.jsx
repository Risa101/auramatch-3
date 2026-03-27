import React, { useState, useEffect } from 'react';
import { Calendar, Loader2, LayoutGrid, Ticket, ShieldCheck, Sparkles, Copy, Check, Tag, Clock } from 'lucide-react';
import { getPromotions, getdataBrands } from "../callapi/call_api_user";
import { imgUrl } from "../utils/imgUrl";

const CouponPage = () => {
  const [allBrands, setAllBrands] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [promoData, brandData] = await Promise.all([
          getPromotions(),
          getdataBrands()
        ]);
        setAllBrands(brandData);
        const enriched = promoData.filter(p => p.status === 'active').map(promo => {
          const brandMatch = brandData.find(b => Number(b.brand_id) === Number(promo.brand_id));
          return {
            ...promo,
            brand_logo: brandMatch ? brandMatch.logo_path : null,
            brand_name: brandMatch ? brandMatch.brand_name : 'Aura'
          };
        });
        setPromotions(enriched);
      } catch (err) {
        console.error("Data Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const filteredPromotions = selectedBrand === 'All'
    ? promotions
    : promotions.filter(p => String(p.brand_id) === String(selectedBrand));

  const brandCount = allBrands.filter(b => b.logo_path).length;
  const activeCount = filteredPromotions.length;

  const handleCopy = (id, code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const daysLeft = (endDate) => {
    if (!endDate) return null;
    const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="bg-[#FCF8F8] text-[#3A3437] font-sans selection:bg-[#FFD1DC] selection:text-[#D23669] antialiased">

      {/* HERO HEADER */}
      <header className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0" aria-hidden="true" style={{
          backgroundImage: "radial-gradient(circle at 15% 15%, rgba(255,133,162,.45), transparent 45%), radial-gradient(circle at 85% 10%, rgba(210,54,105,.45), transparent 40%), linear-gradient(120deg, rgba(0,0,0,.9), rgba(0,0,0,.6))"
        }} />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-end">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                <span className="text-[8px] tracking-[0.2em] uppercase text-white font-black">Voucher Lab</span>
              </div>
              <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-[900] tracking-tighter uppercase">
                Voucher <span className="text-[#FF85A2]">Hub</span>
              </h1>
              <p className="mt-3 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/85 max-w-md">
                Discount codes from top brands — curated to include only genuinely active promotions.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center gap-3 text-white/80">
                  <Ticket size={18} />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">Active Deals</span>
                </div>
                <div className="mt-3 text-3xl font-[900] text-white">{activeCount}</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center gap-3 text-white/80">
                  <ShieldCheck size={18} />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">Brands</span>
                </div>
                <div className="mt-3 text-3xl font-[900] text-white">{brandCount}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MARQUEE */}
      <div className="bg-[#D23669] py-4 overflow-hidden border-y border-white/10">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-white text-[10px] font-[900] tracking-[0.5em] uppercase mx-12">
              • PROMO CODE • LIMITED DEALS • AURA PICKS •
            </span>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 md:px-6 mt-10 md:mt-12 pb-24">

        {/* BRAND FILTER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <span className="text-[10px] tracking-[0.4em] font-black uppercase text-[#D23669] block mb-2">Brand Filter</span>
            <h2 className="text-3xl md:text-4xl font-[900] tracking-tighter uppercase text-[#3A3437]">
              Choose Your <span className="text-[#FF85A2]">Brand</span>
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
            <Sparkles size={12} className="text-[#D23669]" />
            Curated Deals Only
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm p-4 md:p-5 mb-12 overflow-x-auto no-scrollbar flex items-center gap-5 md:gap-6 border border-[#EEDDE4]">
          <button
            onClick={() => setSelectedBrand('All')}
            className={`flex flex-col items-center gap-2 min-w-[64px] transition-all ${selectedBrand === 'All' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 ${selectedBrand === 'All' ? 'border-[#D23669] bg-[#FFF5F7]' : 'border-[#EEDDE4] bg-gray-50'}`}>
              <LayoutGrid size={20} className={selectedBrand === 'All' ? 'text-[#D23669]' : 'text-gray-400'} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedBrand === 'All' ? 'text-[#D23669]' : 'text-gray-500'}`}>All</span>
          </button>
          {allBrands.filter(b => b.logo_path).map((brand) => (
            <button
              key={brand.brand_id}
              onClick={() => setSelectedBrand(brand.brand_id)}
              className={`flex flex-col items-center gap-2 min-w-[64px] transition-all ${String(selectedBrand) === String(brand.brand_id) ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}
            >
              <div className={`w-11 h-11 rounded-full overflow-hidden border-2 p-1 bg-white ${String(selectedBrand) === String(brand.brand_id) ? 'border-[#D23669]' : 'border-[#EEDDE4]'}`}>
                <img src={imgUrl(brand.logo_path)} className="w-full h-full object-contain" alt={brand.brand_name} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest truncate w-full text-center ${String(selectedBrand) === String(brand.brand_id) ? 'text-[#D23669]' : 'text-gray-500'}`}>
                {brand.brand_name}
              </span>
            </button>
          ))}
        </div>

        {/* COUPON LIST */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#D23669]" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredPromotions.length > 0 ? (
              filteredPromotions.map((p) => {
                const days = daysLeft(p.end_date);
                const isCopied = copiedId === p.promotion_id;
                const hasCode = !!p.coupon_code;

                return (
                  <div key={p.promotion_id} className="group bg-white rounded-[2rem] border border-[#EEDDE4] overflow-hidden shadow-sm hover:shadow-[0_12px_28px_rgba(226,110,147,0.14)] transition-all duration-300">
                    <div className="flex flex-col sm:flex-row">

                      {/* LEFT ACCENT */}
                      <div className="w-full sm:w-2 sm:min-h-full h-2 sm:h-auto bg-gradient-to-b from-[#FF85A2] to-[#D23669] flex-shrink-0" />

                      {/* BRAND LOGO */}
                      <div className="hidden sm:flex w-24 items-center justify-center p-4 border-r border-[#F5EEF0]">
                        {p.brand_logo ? (
                          <img src={imgUrl(p.brand_logo)} className="w-14 h-14 object-contain" alt={p.brand_name} />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-[#FFF5F8] flex items-center justify-center">
                            <Sparkles size={20} className="text-[#D23669]" />
                          </div>
                        )}
                      </div>

                      {/* MAIN CONTENT */}
                      <div className="flex-grow p-5 sm:p-6 min-w-0">
                        {/* Top row */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="bg-[#D23669] text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                            {p.discount_percent > 0 ? `${p.discount_percent}% OFF` : 'Special Deal'}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">{p.brand_name}</span>
                          {days !== null && days <= 7 && days > 0 && (
                            <span className="bg-orange-50 text-orange-500 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-orange-100">
                              {days} days left
                            </span>
                          )}
                        </div>

                        {/* Name + Detail */}
                        <h3 className="font-[900] text-base md:text-lg uppercase tracking-tight text-[#1F1F1F] mb-1">
                          {p.promo_name}
                        </h3>
                        {p.promo_detail && (
                          <p className="text-[12px] text-gray-500 mb-3 line-clamp-2">{p.promo_detail}</p>
                        )}

                        {/* Dates */}
                        <div className="flex items-center gap-4 flex-wrap">
                          {p.start_date && (
                            <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                              <Calendar size={10} />
                              From {new Date(p.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' })}
                            </div>
                          )}
                          {p.end_date && (
                            <div className="flex items-center gap-1.5 text-[9px] text-[#D23669] font-bold uppercase tracking-widest">
                              <Clock size={10} />
                              Until {new Date(p.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* COUPON CODE + COPY */}
                      <div className="w-full sm:w-52 flex flex-col items-center justify-center gap-3 px-5 pb-5 sm:pb-0 sm:border-l border-[#F5EEF0]">
                        {hasCode ? (
                          <>
                            {/* Code box */}
                            <div className="w-full bg-[#FFF5F8] border-2 border-dashed border-[#EEDDE4] rounded-2xl px-4 py-3 text-center">
                              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                <Tag size={8} className="inline mr-1" />
                                Coupon Code
                              </p>
                              <p className="text-base font-[900] tracking-[0.15em] font-mono text-[#D23669]">
                                {p.coupon_code}
                              </p>
                            </div>
                            {/* Copy button */}
                            <button
                              onClick={() => handleCopy(p.promotion_id, p.coupon_code)}
                              className={`w-full py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isCopied ? 'bg-green-500 text-white' : 'bg-[#D23669] text-white hover:bg-[#FF85A2]'}`}
                            >
                              {isCopied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Code</>}
                            </button>
                          </>
                        ) : (
                          <div className="w-full bg-[#FFF5F8] border-2 border-dashed border-[#EEDDE4] rounded-2xl px-4 py-4 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                              No code needed
                            </p>
                            <p className="text-[10px] font-bold text-[#D23669] mt-1">Auto discount</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-[#EEDDE4]">
                <Ticket size={28} className="mx-auto mb-4 text-[#FFD1DC]" />
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">No coupons available for this brand yet.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  );
};

export default CouponPage;
