// src/pages/admin/SalesDashboard.jsx
import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getAdminOverview } from "../../callapi/call_api_user";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "THB" }).format(n);
const num = (n) => new Intl.NumberFormat("en-US").format(n);

export default function SalesDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-out-quart" });
    const fetchOverview = async () => {
      const data = await getAdminOverview();
      setStats(data);
      setLoading(false);
    };
    fetchOverview();
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
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          <KpiCard 
            label="Total Users" 
            value={num(stats?.kpis?.users || 0)} 
            sub="active accounts"
          />
          <KpiCard 
            label="Total Products" 
            value={num(stats?.kpis?.products || 0)} 
            sub="catalog items"
          />
          <KpiCard 
            label="Promotions" 
            value={num(stats?.kpis?.promotions || 0)} 
            sub="active promos"
          />
          <KpiCard 
            label="Reviews" 
            value={num(stats?.kpis?.reviews || 0)} 
            sub="customer feedback"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content: Sales Charts & Best Sellers */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Best Sellers Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm" data-aos="fade-up">
              <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-serif text-2xl italic">Best Sellers</h3>
                <span className="text-[10px] font-black uppercase tracking-widest border border-gray-100 px-4 py-2">Top 6</span>
              </div>
              <table className="w-full text-left">
                <thead className="bg-[#FAF9F8] text-[9px] uppercase tracking-[0.2em] font-black text-gray-400">
                  <tr>
                    <th className="px-10 py-4">Product Name</th>
                    <th className="px-10 py-4 text-right">Units Sold</th>
                    <th className="px-10 py-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(stats?.best_sellers || []).map((p) => (
                    <tr key={p.product_id} className="group hover:bg-[#FDFCFB] transition-colors">
                      <td className="px-10 py-6">
                        <div className="text-sm font-bold">{p.name}</div>
                      </td>
                      <td className="px-10 py-6 text-right font-mono text-xs">{num(p.total_sold || 0)}</td>
                      <td className="px-10 py-6 text-right font-bold text-sm">
                        {fmt((p.price || 0) * (p.total_sold || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar: Quick Insights */}
          <div className="space-y-10">
            
            {/* Recent Users */}
            
            <div className="bg-white p-10 rounded-[2rem] border border-gray-100" data-aos="fade-left">
              <h3 className="font-serif text-xl italic mb-6">Recent Users</h3>
              <div className="space-y-5">
                {(stats?.recent_users || []).map((u) => (
                  <div key={u.user_id} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold leading-tight">{u.username || "Guest"}</p>
                      <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{u.email}</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-[#C5A358]">New</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock */}
            <div className="bg-[#1A1A1A] text-white p-10 rounded-[2rem] shadow-xl" data-aos="fade-left">
              <h3 className="font-serif text-xl italic mb-8">Low Stock</h3>
              <div className="space-y-4">
                {(stats?.low_stock || []).map((item) => (
                  <div key={item.product_id} className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold">{item.name || "Unknown"}</p>
                      <span className="text-[9px] uppercase tracking-widest text-white/60">Product #{item.product_id}</span>
                    </div>
                    <span className="text-[10px] font-black text-[#C5A358]">{item.quantity}</span>
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

function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-white p-10 rounded-[2rem] border border-gray-50 shadow-sm group hover:border-[#C5A358] transition-all duration-500" data-aos="zoom-in">
      <p className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-6">{label}</p>
      <h2 className="text-4xl font-serif italic mb-4">{value}</h2>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">{sub}</span>
      </div>
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
