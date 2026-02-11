import React, { useState, useEffect } from 'react';
import { Calendar, Loader2, LayoutGrid, Ticket, ShieldCheck, Sparkles } from 'lucide-react';
import { getPromotions, getdataBrands } from "../callapi/call_api_user";
import { Link } from "react-router-dom";

const CouponPage = () => {
  const BACKEND_URL = "http://127.0.0.1:5010";
  const [allBrands, setAllBrands] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const navItems = [
    { label: "Home", to: "/" },
    { label: "Academy", to: "/academy" },
    { label: "Analysis", to: "/analysis" },
    { label: "Shop", to: "/shop" },
  ];

  const getImageUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BACKEND_URL}${cleanPath}`;
  };

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

  return (
    <div className="bg-white text-[#4A4A4A] font-sans selection:bg-[#FFD1DC] selection:text-[#D23669] antialiased">
      <header className="relative overflow-hidden bg-black text-white">
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 15%, rgba(255,133,162,.45), transparent 45%), radial-gradient(circle at 85% 10%, rgba(210,54,105,.45), transparent 40%), linear-gradient(120deg, rgba(0,0,0,.9), rgba(0,0,0,.6))",
          }}
        />
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
                รวมโค้ดส่วนลดจากแบรนด์ดัง คัดเฉพาะโปรโมชันที่ใช้งานได้จริง
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

      <div className="bg-[#D23669] py-4 md:py-5 overflow-hidden border-y border-white/10 relative z-20">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-white text-[10px] font-[900] tracking-[0.5em] uppercase mx-12">
              • PROMO CODE • LIMITED DEALS • AURA PICKS •
            </span>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 md:px-6 mt-10 md:mt-12 pb-24">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <span className="text-[10px] tracking-[0.4em] font-black uppercase text-[#D23669] block mb-2">Brand Filter</span>
            <h2 className="text-3xl md:text-4xl font-[900] tracking-tighter uppercase text-[#4A4A4A]">
              Choose Your <span className="text-[#FF85A2]">Brand</span>
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
            <Sparkles size={12} className="text-[#D23669]" />
            Curated Deals Only
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl p-4 md:p-5 mb-12 overflow-x-auto no-scrollbar flex items-center gap-5 md:gap-6 border border-gray-100">
          <button
            onClick={() => setSelectedBrand('All')}
            className={`flex flex-col items-center gap-2 min-w-[64px] md:min-w-[70px] transition-all ${selectedBrand === 'All' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}
          >
            <div className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 ${selectedBrand === 'All' ? 'border-[#D23669] bg-[#FFF5F7]' : 'border-gray-100 bg-gray-50'}`}>
              <LayoutGrid size={20} className={selectedBrand === 'All' ? 'text-[#D23669]' : 'text-gray-400'} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedBrand === 'All' ? 'text-[#D23669]' : 'text-gray-500'}`}>ทั้งหมด</span>
          </button>

          {allBrands.filter(b => b.logo_path).map((brand) => (
            <button
              key={brand.brand_id}
              onClick={() => setSelectedBrand(brand.brand_id)}
              className={`flex flex-col items-center gap-2 min-w-[64px] md:min-w-[70px] transition-all ${String(selectedBrand) === String(brand.brand_id) ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}
            >
              <div className={`w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 p-1 bg-white ${String(selectedBrand) === String(brand.brand_id) ? 'border-[#D23669]' : 'border-gray-100'}`}>
                <img src={getImageUrl(brand.logo_path)} className="w-full h-full object-contain" alt={brand.brand_name} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest truncate w-full text-center ${String(selectedBrand) === String(brand.brand_id) ? 'text-[#D23669]' : 'text-gray-500'}`}>
                {brand.brand_name}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#D23669]" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredPromotions.length > 0 ? (
              filteredPromotions.map((p) => (
                <div
                  key={p.promotion_id}
                  className="group relative flex flex-col sm:flex-row bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#FF85A2] to-[#D23669]" />
                  <div className="flex-grow p-5 sm:p-6 flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#D23669] text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Mall</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">{p.brand_name}</span>
                    </div>
                    <h3 className="font-[900] text-lg md:text-xl truncate uppercase text-[#1F1F1F]">
                      {p.promo_name}
                    </h3>
                    <p className="mt-1 text-[12px] text-gray-500 line-clamp-2">{p.promo_detail}</p>
                    <div className="mt-3 flex items-center gap-2 text-[9px] text-[#D23669] font-bold uppercase tracking-widest">
                      <Calendar size={10} /> ถึง {new Date(p.end_date).toLocaleDateString('th-TH')}
                    </div>
                  </div>

                  <div className="w-full sm:w-40 flex items-center justify-center px-5 pb-5 sm:pb-0">
                    <button className="w-full py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#D23669] transition-all shadow-lg">
                      เก็บโค้ด
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100">
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">ยังไม่มีคูปองสำหรับแบรนด์นี้</p>
              </div>
            )}
          </div>
        )}
      </main>

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

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D23669; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CouponPage;
