import React, { useEffect, useState } from "react";
import { NavLink, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { 
  LayoutDashboard, Users, Package, Tag, MessageSquare, 
  LogOut, PlusCircle, Trash2, Edit3, X, CheckCircle, Search 
} from "lucide-react";
import { getAdminOverview } from "../../callapi/call_api_user";

// --- Utility Functions ---
const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "THB" }).format(n || 0);
const num = (n) => new Intl.NumberFormat("en-US").format(n || 0);

export default function SalesDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-out-quart" });
    const loadData = async () => {
      try {
        const data = await getAdminOverview();
        setStats(data);
      } catch (e) {
        if (e?.response?.status === 403 || e?.response?.status === 401) {
          localStorage.removeItem("auramatch:isAdmin");
          navigate("/login", { replace: true });
          return;
        }
        console.error(e);
      }
      finally { setLoading(false); }
    };
    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) return <LoadingState />;

  return (
    <div className="flex min-h-screen bg-[#FDFCFB] text-[#1A1A1A]">
      {/* ── Sidebar ── */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen z-40 shadow-sm">
        <div className="p-10 cursor-pointer" onClick={() => navigate("/admin/dashboard")}>
          <h1 className="text-xl font-serif italic font-bold">AuraMatch</h1>
          <p className="text-[8px] uppercase tracking-[0.4em] text-[#C5A358]">Admin Atelier</p>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto">
          <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={18}/>} label="Dashboard" />
          <div className="pt-6 pb-2 px-4 text-[9px] uppercase tracking-widest text-gray-400 font-bold tracking-[0.3em]">Management</div>
          <NavItem to="/admin/products" icon={<Package size={18}/>} label="Products" />
          <NavItem to="/admin/users" icon={<Users size={18}/>} label="User Roles" />
          <NavItem to="/admin/promotions" icon={<Tag size={18}/>} label="Promotions" />
          <NavItem to="/admin/reviews" icon={<MessageSquare size={18}/>} label="Reviews" />
        </nav>

        <div className="p-8 border-t border-gray-50">
          <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition-all text-[10px] uppercase tracking-widest font-black w-full px-4 py-3 hover:bg-red-50 rounded-xl">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 px-12 pb-24 overflow-y-auto">
        <Routes>
          <Route path="/dashboard" element={<DashboardView stats={stats} />} />
          <Route path="/products" element={<ProductView />} />
          <Route path="/users" element={<UserView />} />
          <Route path="/promotions" element={<PromoView />} />
          <Route path="/reviews" element={<ReviewView />} />
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// ── 1. Dashboard Component ──
function DashboardView({ stats }) {
  return (
    <div data-aos="fade-up">
      <header className="py-10"><h2 className="text-3xl font-serif italic">Executive Overview</h2></header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <KpiCard label="Total Users" value={num(stats?.kpis?.users)} sub="Active accounts" />
        <KpiCard label="Products" value={num(stats?.kpis?.products)} sub="In catalog" />
        <KpiCard label="Promotions" value={num(stats?.kpis?.promotions)} sub="Live now" />
        <KpiCard label="Reviews" value={num(stats?.kpis?.reviews)} sub="Customer feedback" />
      </div>
      <div className="bg-[#1A1A1A] text-white p-10 rounded-[2.5rem] shadow-2xl max-w-md">
        <h3 className="font-serif text-xl italic mb-6 text-[#C5A358]">Low Stock Alert</h3>
        {stats?.low_stock?.map(item => (
          <div key={item.product_id} className="flex justify-between py-3 border-b border-white/5">
            <span className="text-xs">{item.name}</span>
            <span className="text-xs font-bold text-red-400">{item.quantity} left</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 2. Product Component (CRUD) ──
function ProductView() {
  const [items, setItems] = useState([
    { id: 1, name: "Silk Foundation", price: 1250, stock: 45, cat: "Face" },
    { id: 2, name: "Matte Lipstick", price: 550, stock: 12, cat: "Lips" }
  ]);
  const [modal, setModal] = useState({ open: false, data: null });

  const save = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const obj = { id: modal.data?.id || Date.now(), name: f.get("n"), price: f.get("p"), stock: f.get("s") };
    setItems(modal.data ? items.map(i => i.id === obj.id ? obj : i) : [...items, obj]);
    setModal({ open: false });
  };

  return (
    <div data-aos="fade-in">
      <ManagementHeader title="Product Catalog" onAdd={() => setModal({ open: true, data: null })} />
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#FAF9F8] text-[8px] uppercase font-black text-gray-400">
            <tr><th className="px-8 py-5">Product</th><th className="px-8 py-5 text-right">Price</th><th className="px-8 py-5 text-right">Stock</th><th className="px-8 py-5 text-center">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50 italic font-serif">
            {items.map(i => (
              <tr key={i.id}>
                <td className="px-8 py-5 font-bold">{i.name}</td>
                <td className="px-8 py-5 text-right">{fmt(i.price)}</td>
                <td className="px-8 py-5 text-right">{i.stock}</td>
                <td className="px-8 py-5 flex justify-center gap-2">
                  <button onClick={() => setModal({ open: true, data: i })} className="p-2 text-gray-300 hover:text-black"><Edit3 size={14}/></button>
                  <button onClick={() => setItems(items.filter(x => x.id !== i.id))} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal.open && (
        <AdminModal title={modal.data ? "Edit Item" : "New Item"} onClose={() => setModal({ open: false })}>
          <form onSubmit={save} className="space-y-4">
            <InputField label="Name" name="n" defaultValue={modal.data?.name} required />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Price" name="p" type="number" defaultValue={modal.data?.price} required />
              <InputField label="Stock" name="s" type="number" defaultValue={modal.data?.stock} required />
            </div>
            <button className="w-full bg-black text-white py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest mt-4">Save Product</button>
          </form>
        </AdminModal>
      )}
    </div>
  );
}

// ── 3. User, 4. Promo, 5. Review (โครงสร้างพื้นฐานเพื่อความเสถียร) ──
function UserView() { return <div className="py-20 text-center font-serif italic text-3xl">User Role Management</div>; }
function PromoView() { return <div className="py-20 text-center font-serif italic text-3xl">Marketing Promotions</div>; }
function ReviewView() { return <div className="py-20 text-center font-serif italic text-3xl">Customer Reviews</div>; }

// ── Shared UI Components ──
function NavItem({ icon, label, to }) {
  return (
    <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive ? 'bg-[#FDFCFB] text-[#C5A358] border border-gray-100 shadow-sm' : 'text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50'}`}>
      {icon}<span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
    </NavLink>
  );
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
      <p className="text-[9px] uppercase font-black text-gray-400 mb-6 tracking-widest">{label}</p>
      <h2 className="text-4xl font-serif italic mb-2">{value || 0}</h2>
      <p className="text-[9px] text-gray-300 font-bold tracking-widest uppercase">{sub}</p>
    </div>
  );
}

function ManagementHeader({ title, onAdd }) {
  return (
    <header className="py-10 flex justify-between items-end border-b border-gray-50 mb-10">
      <div><h2 className="text-3xl font-serif italic">{title}</h2><p className="text-[8px] uppercase tracking-[0.4em] text-[#C5A358]">Atelier Management</p></div>
      <button onClick={onAdd} className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#C5A358] transition-all"><PlusCircle size={14}/> Add New Record</button>
    </header>
  );
}

function AdminModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/10 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 relative shadow-2xl border border-gray-50">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-black"><X size={24}/></button>
        <h3 className="font-serif text-2xl italic mb-8">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, ...p }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2">{label}</label>
      <input className="w-full bg-[#FAF9F8] rounded-2xl px-6 py-4 text-sm outline-none border-none focus:ring-1 focus:ring-[#C5A358]" {...p} />
    </div>
  );
}

function LoadingState() {
  return <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center font-serif italic text-gray-300">Synchronizing Atelier...</div>;
}
