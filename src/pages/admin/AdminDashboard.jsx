// src/pages/admin/SalesDashboard.jsx
import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Tag, 
  MessageSquare, 
  LogOut, 
  PlusCircle 
} from "lucide-react"; // แนะนำให้ลง lucide-react เพื่อความสวยงาม
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
    <div className="flex min-h-screen bg-[#FDFCFB] text-[#1A1A1A]">
      
      {/* ── Left Sidebar ────────────────────────────────────────────────────────── */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
        <div className="p-10">
          <h1 className="text-xl font-serif italic font-bold">AuraMatch</h1>
          <p className="text-[8px] uppercase tracking-[0.4em] text-[#C5A358]">Admin Atelier</p>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active />
          <div className="pt-4 pb-2 px-4 text-[9px] uppercase tracking-widest text-gray-400 font-bold">Management</div>
          <NavItem icon={<Package size={18}/>} label="Products" />
          <NavItem icon={<Users size={18}/>} label="User Roles" />
          <NavItem icon={<Tag size={18}/>} label="Promotions" />
          <NavItem icon={<MessageSquare size={18}/>} label="Reviews" />
        </nav>

        <div className="p-8 border-t border-gray-50">
          <button className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition-colors text-[10px] uppercase tracking-widest font-black">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────────────────────────────── */}
      <main className="flex-1 px-12 pb-24 overflow-y-auto">
        
        {/* Top Header Section */}
        <header className="py-10 flex justify-between items-end">
          <div data-aos="fade-down">
            <h2 className="text-3xl font-serif italic">Executive Overview</h2>
            <p className="text-xs text-gray-400 mt-1">Welcome back, Administrator.</p>
          </div>
          <div className="flex gap-3" data-aos="fade-left">
            <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
              <PlusCircle size={14}/> Add Product
            </button>
            <button className="px-6 py-3 bg-[#1A1A1A] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#C5A358] transition-all shadow-xl shadow-black/5">
              Export CSV
            </button>
          </div>
        </header>

        {/* KPI Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <KpiCard label="Total Users" value={num(stats?.kpis?.users || 0)} sub="active accounts" />
          <KpiCard label="Products" value={num(stats?.kpis?.products || 0)} sub="catalog items" />
          <KpiCard label="Promotions" value={num(stats?.kpis?.promotions || 0)} sub="running now" />
          <KpiCard label="Reviews" value={num(stats?.kpis?.reviews || 0)} sub="avg 4.8 stars" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Best Sellers List */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm" data-aos="fade-up">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-[#FAF9F8]/30">
              <h3 className="font-serif text-xl italic">Inventory Performance</h3>
              <button className="text-[9px] font-black uppercase tracking-widest text-[#C5A358] hover:underline">View All Products</button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-[#FAF9F8] text-[8px] uppercase tracking-[0.2em] font-black text-gray-400">
                <tr>
                  <th className="px-8 py-4">Product Detail</th>
                  <th className="px-8 py-4 text-right">Units</th>
                  <th className="px-8 py-4 text-right">Revenue</th>
                  <th className="px-8 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(stats?.best_sellers || []).map((p) => (
                  <tr key={p.product_id} className="group hover:bg-[#FDFCFB] transition-colors">
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold">{p.name}</div>
                      <div className="text-[9px] text-gray-400 tracking-tighter">SKU: AM-{p.product_id}</div>
                    </td>
                    <td className="px-8 py-5 text-right font-mono text-xs text-gray-500">{num(p.total_sold || 0)}</td>
                    <td className="px-8 py-5 text-right font-bold text-sm text-[#C5A358]">
                      {fmt((p.price || 0) * (p.total_sold || 0))}
                    </td>
                    <td className="px-8 py-5 text-center">
                        <button className="text-[9px] font-black uppercase tracking-tighter px-3 py-1 border border-gray-100 hover:bg-black hover:text-white transition-all">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Side Info Panels */}
          <div className="space-y-8">
            <div className="bg-[#1A1A1A] text-white p-10 rounded-[2.5rem] shadow-2xl" data-aos="fade-left">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-serif text-xl italic text-[#C5A358]">Low Stock</h3>
                <span className="bg-red-500 w-2 h-2 rounded-full animate-pulse"></span>
              </div>
              <div className="space-y-6">
                {(stats?.low_stock || []).slice(0, 4).map((item) => (
                  <div key={item.product_id} className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                      <p className="text-xs font-bold">{item.name}</p>
                      <p className="text-[8px] text-white/40 uppercase tracking-widest">Only {item.quantity} left</p>
                    </div>
                    <button className="text-[8px] font-black border border-white/20 px-2 py-1 hover:bg-[#C5A358] hover:border-[#C5A358] transition-all">RESTOCK</button>
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

// ── Shared UI Components ──────────────────────────────────────────────────

function NavItem({ icon, label, active = false }) {
  return (
    <a href="#" className={`
      flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group
      ${active ? 'bg-[#FDFCFB] text-[#C5A358] border border-gray-100 shadow-sm' : 'text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50'}
    `}>
      <span className={`${active ? 'text-[#C5A358]' : 'text-gray-300 group-hover:text-[#C5A358] transition-colors'}`}>
        {icon}
      </span>
      <span className="text-[11px] font-black uppercase tracking-[0.15em]">{label}</span>
    </a>
  );
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group" data-aos="zoom-in">
      <p className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400 mb-6 group-hover:text-[#C5A358] transition-colors">{label}</p>
      <h2 className="text-4xl font-serif italic mb-2 tracking-tight">{value}</h2>
      <p className="text-[9px] text-gray-300 uppercase tracking-widest font-bold">{sub}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-gray-100 border-t-[#C5A358] rounded-full animate-spin mb-6 mx-auto" />
        <p className="text-[9px] uppercase tracking-[0.5em] font-black text-gray-300">Authenticating Access</p>
      </div>
    </div>
  );
}