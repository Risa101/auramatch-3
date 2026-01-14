// src/pages/admin/SalesDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "THB" }).format(n);
const num = (n) => new Intl.NumberFormat("en-US").format(n);

export default function SalesDashboard() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-out-quart" });
    // Simulate Fetching Sales Data
    setTimeout(() => {
      setStats(mockSalesData);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] pb-24">
      {/* Header Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-10 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div data-aos="fade-right">
            <h1 className="text-xl font-serif italic font-bold">Sales Overview</h1>
            <p className="text-[9px] uppercase tracking-[0.4em] text-[#C5A358]">AuraMatch Atelier Analytics</p>
          </div>
          <div className="flex gap-4" data-aos="fade-left">
            <button className="px-6 py-2 bg-[#1A1A1A] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#C5A358] transition-all">
              Export Report
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-10 pt-12">
        
        {/* Top Tier: Primary KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <KpiCard 
            label="Total Revenue" 
            value={fmt(stats.revenue)} 
            delta="+14.5%" 
            sub="vs last month"
            up={true}
          />
          <KpiCard 
            label="Orders Processed" 
            value={num(stats.orders)} 
            delta="+5.2%" 
            sub="daily average 42"
            up={true}
          />
          <KpiCard 
            label="Average Order Value" 
            value={fmt(stats.aov)} 
            delta="-1.2%" 
            sub="vs last month"
            up={false}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content: Sales Charts & Best Sellers */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Sales Chart */}
            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm" data-aos="fade-up">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h3 className="font-serif text-2xl italic">Revenue Stream</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Daily Performance (Current Month)</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif italic text-[#C5A358]">{fmt(stats.dailyMax)}</span>
                  <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Peak Day</p>
                </div>
              </div>
              <SalesLineChart series={stats.dailySales} />
            </div>

            {/* Best Sellers Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm" data-aos="fade-up">
              <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-serif text-2xl italic">Best Sellers</h3>
                <span className="text-[10px] font-black uppercase tracking-widest border border-gray-100 px-4 py-2">View All</span>
              </div>
              <table className="w-full text-left">
                <thead className="bg-[#FAF9F8] text-[9px] uppercase tracking-[0.2em] font-black text-gray-400">
                  <tr>
                    <th className="px-10 py-4">Product Name</th>
                    <th className="px-10 py-4">Status</th>
                    <th className="px-10 py-4 text-right">Units Sold</th>
                    <th className="px-10 py-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.topProducts.map((p) => (
                    <tr key={p.id} className="group hover:bg-[#FDFCFB] transition-colors">
                      <td className="px-10 py-6">
                        <div className="text-sm font-bold">{p.name}</div>
                        <div className="text-[10px] text-[#C5A358] uppercase tracking-widest">{p.brand}</div>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${p.stock > 20 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                          {p.stock > 20 ? 'In Stock' : 'Low Stock'}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right font-mono text-xs">{num(p.sold)}</td>
                      <td className="px-10 py-6 text-right font-bold text-sm">{fmt(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar: Quick Insights */}
          <div className="space-y-10">
            
            {/* Sales by Brand */}
            <div className="bg-[#1A1A1A] text-white p-10 rounded-[2rem] shadow-xl" data-aos="fade-left">
              <h3 className="font-serif text-xl italic mb-8">Brand Share</h3>
              <div className="space-y-6">
                {stats.brandShare.map(brand => (
                  <div key={brand.name}>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-black mb-2">
                      <span>{brand.name}</span>
                      <span className="text-[#C5A358]">{brand.percent}%</span>
                    </div>
                    <div className="h-[2px] w-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-[#C5A358]" style={{ width: `${brand.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders Insight */}
            <div className="bg-white p-10 rounded-[2rem] border border-gray-100" data-aos="fade-left">
              <h3 className="font-serif text-xl italic mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {stats.recentActivity.map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${i === 0 ? 'bg-[#C5A358] animate-pulse' : 'bg-gray-200'}`} />
                    <div>
                      <p className="text-xs font-bold leading-tight">{act.msg}</p>
                      <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, delta, up, sub }) {
  return (
    <div className="bg-white p-10 rounded-[2rem] border border-gray-50 shadow-sm group hover:border-[#C5A358] transition-all duration-500" data-aos="zoom-in">
      <p className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-6">{label}</p>
      <h2 className="text-4xl font-serif italic mb-4">{value}</h2>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-black ${up ? 'text-green-500' : 'text-red-400'}`}>
          {up ? "▲" : "▼"} {delta}
        </span>
        <span className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">{sub}</span>
      </div>
    </div>
  );
}

function SalesLineChart({ series }) {
  const max = Math.max(...series);
  const points = series.map((v, i) => `${(i / (series.length - 1)) * 100},${100 - (v / max) * 100}`).join(" ");
  
  return (
    <div className="w-full h-40 mt-10">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C5A358" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C5A358" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="#C5A358" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
        <path d={`M0,100 L${points} L100,100 Z`} fill="url(#salesGrad)" />
      </svg>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-gray-100 border-t-[#C5A358] rounded-full animate-spin mb-4 mx-auto" />
        <p className="text-[10px] uppercase tracking-[0.5em] font-black text-gray-300">Synchronizing Vault</p>
      </div>
    </div>
  );
}

// ── Mock Sales Data ───────────────────────────────────────────────────────────
const mockSalesData = {
  revenue: 842500,
  orders: 1240,
  aov: 679,
  dailyMax: 42000,
  dailySales: [12, 18, 15, 25, 30, 22, 40, 35, 28, 42, 38, 50, 45, 60],
  topProducts: [
    { id: 1, name: "Velvet Rose Lip Tint", brand: "Aura Essentials", sold: 420, revenue: 125500, stock: 12 },
    { id: 2, name: "Silk Finish Foundation", brand: "Maison Glow", sold: 210, revenue: 189000, stock: 45 },
    { id: 3, name: "Hydro Toner 200ml", brand: "Lumiére", sold: 180, revenue: 94000, stock: 5 },
    { id: 4, name: "Solar SPF 50", brand: "Sunia", sold: 155, revenue: 72000, stock: 80 },
  ],
  brandShare: [
    { name: "Aura Essentials", percent: 45 },
    { name: "Maison Glow", percent: 25 },
    { name: "Lumiére", percent: 20 },
    { name: "Others", percent: 10 },
  ],
  recentActivity: [
    { msg: "Large Order: 12 items by Sophia L.", time: "2 MINS AGO" },
    { msg: "Stock Alert: Hydro Toner is running out", time: "15 MINS AGO" },
    { msg: "Daily revenue goal reached", time: "1 HOUR AGO" },
  ]
};