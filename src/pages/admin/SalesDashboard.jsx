import React, { useEffect, useState } from "react";
import { NavLink, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { 
  LayoutDashboard, Users, Package, Tag, MessageSquare, 
  LogOut, PlusCircle, Trash2, Edit3, X, CheckCircle, Search 
} from "lucide-react";
import { getAdminOverview } from "../../callapi/call_api_user";
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAdminPromotions,
  createAdminPromotion,
  updateAdminPromotion,
  deleteAdminPromotion,
  getAdminReviews,
  createAdminReview,
  updateAdminReview,
  deleteAdminReview,
} from "../../callapi/call_api_admin";

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
        const [data, products] = await Promise.all([
          getAdminOverview(),
          getAdminProducts().catch(() => []),
        ]);

        const productNameMap = new Map(
          (Array.isArray(products) ? products : []).map((p) => [String(p.id), p.name || ""])
        );

        const enrichedLowStock = Array.isArray(data?.low_stock)
          ? data.low_stock.map((item) => {
              const pid = String(item?.product_id ?? "");
              const quantity = Number(item?.quantity ?? item?.qty ?? item?.stock_qty ?? 0);
              const name =
                item?.name ||
                item?.product_name ||
                productNameMap.get(pid) ||
                `Product #${pid || "-"}`;
              return { ...item, quantity, name };
            })
          : [];

        setStats({
          ...data,
          low_stock: enrichedLowStock,
        });
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
    <div className="flex min-h-screen bg-[#FCF8F8] text-[#3A3437]">
      {/* ── Sidebar ── */}
      <aside className="w-72 bg-white/95 backdrop-blur border-r border-[#F0E4E8] flex flex-col sticky top-0 h-screen z-40 shadow-sm">
        <div className="p-10 cursor-pointer" onClick={() => navigate("/admin/dashboard")}>
          <h1 className="text-2xl font-[900] leading-none tracking-tight text-[#D23669]">aura<br />match</h1>
          <p className="mt-2 text-[8px] uppercase tracking-[0.35em] text-[#AA8A94] font-black">Admin Console</p>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto">
          <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={18}/>} label="Dashboard" />
          <div className="pt-6 pb-2 px-4 text-[9px] uppercase text-[#B6A5AC] font-bold tracking-[0.3em]">Management</div>
          <NavItem to="/admin/products" icon={<Package size={18}/>} label="Products" />
          <NavItem to="/admin/users" icon={<Users size={18}/>} label="User Roles" />
          <NavItem to="/admin/promotions" icon={<Tag size={18}/>} label="Promotions" />
          <NavItem to="/admin/reviews" icon={<MessageSquare size={18}/>} label="Reviews" />
        </nav>

        <div className="p-8 border-t border-gray-50">
          <button onClick={handleLogout} className="flex items-center gap-3 text-[#A7939B] hover:text-[#D23669] transition-all text-[10px] uppercase tracking-widest font-black w-full px-4 py-3 hover:bg-[#FFF1F5] rounded-xl">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 px-8 md:px-10 lg:px-12 pb-20 overflow-y-auto">
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
      <header className="pt-10 pb-8">
        <h2 className="text-3xl font-[900] tracking-tight">Executive Overview</h2>
        <p className="mt-1 text-xs text-[#9B8C92]">Summary of products, users, promotions and reviews</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <KpiCard label="Total Users" value={num(stats?.kpis?.users)} sub="Active accounts" />
        <KpiCard label="Products" value={num(stats?.kpis?.products)} sub="In catalog" />
        <KpiCard label="Promotions" value={num(stats?.kpis?.promotions)} sub="Live now" />
        <KpiCard label="Reviews" value={num(stats?.kpis?.reviews)} sub="Customer feedback" />
      </div>
      <div className="bg-gradient-to-br from-[#402531] to-[#1F1A1C] text-white p-8 rounded-[2rem] shadow-xl max-w-md border border-[#573845]">
        <h3 className="text-xl font-[900] mb-6 text-[#FF85A2] uppercase tracking-tight">Low Stock Alert</h3>
        {Array.isArray(stats?.low_stock) && stats.low_stock.length > 0 ? (
          stats.low_stock.map((item) => (
            <div key={`${item.product_id}-${item.quantity}`} className="flex justify-between py-3 border-b border-white/5">
              <span className="text-xs">{item.name}</span>
              <span className="text-xs font-bold text-red-400">{item.quantity} left</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-white/60">No low-stock data available</p>
        )}
      </div>
    </div>
  );
}

// ── 2. Product Component (CRUD) ──


function ProductView() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({ open: false, data: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const productRows = await getAdminProducts();
      const products = Array.isArray(productRows) ? productRows : [];
      setItems(products);
    } catch (e) {
      console.error(e);
      setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;

    const f = new FormData(e.target);
    const product_id = String(f.get("product_id") || "").trim();
    const name = String(f.get("name") || "").trim();
    const price = Number(f.get("price") || 0);
    const image_url = String(f.get("image_url") || "").trim();
    const category = String(f.get("category") || "").trim();
    const personal_color_tags = String(f.get("tags") || "").trim();
    const status = String(f.get("status") || "active").trim();
    const stockRaw = f.get("stock");
    const stock = stockRaw === null || stockRaw === "" ? null : Number(stockRaw);

    const payload = {
      product_id: product_id || modal.data?.id,
      name,
      price,
      image_url,
      category,
      personal_color_tags,
      status,
      stock,
    };

    setSaving(true);
    setError("");
    try {
      const productId = modal.data?.id || product_id;
      if (productId) {
        await updateAdminProduct(productId, payload);
      } else {
        await createAdminProduct(payload);
      }

      setModal({ open: false, data: null });
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError("บันทึกข้อมูลไม่สำเร็จ กรุณาตรวจสอบ endpoint /admin/products ฝั่ง backend");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (id) => {
    if (!id) return;
    const ok = window.confirm("ยืนยันการลบรายการนี้?");
    if (!ok) return;
    setError("");
    try {
      await deleteAdminProduct(id);
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError("ลบข้อมูลไม่สำเร็จ กรุณาตรวจสอบ endpoint /admin/products ฝั่ง backend");
    }
  };

  return (
    <div data-aos="fade-in">
      <ManagementHeader title="Product Catalog" onAdd={() => setModal({ open: true, data: null })} />
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}
      <div className="bg-white rounded-[2rem] border border-[#F0E4E8] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#FFF4F7] text-[8px] uppercase font-black text-[#A38E97] tracking-[0.18em]">
            <tr>
              <th className="px-8 py-5">Product</th>
              <th className="px-8 py-5">Category</th>
              <th className="px-8 py-5 text-right">Price</th>
              <th className="px-8 py-5 text-right">Stock</th>
              <th className="px-8 py-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5ECEF]">
            {loading ? (
              <tr>
                <td className="px-8 py-8 text-center text-[#A7939B] text-sm" colSpan={5}>
                  Loading products...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-8 py-8 text-center text-[#A7939B] text-sm" colSpan={5}>
                  No products found
                </td>
              </tr>
            ) : (
              items.map((i) => (
                <tr key={i.id} className="hover:bg-[#FFF9FB] transition-colors">
                  <td className="px-8 py-5 font-bold text-[#342C30]">{i.name}</td>
                  <td className="px-8 py-5 text-xs text-[#8F7D84]">{i.category || "-"}</td>
                  <td className="px-8 py-5 text-right font-semibold">{fmt(i.price)}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ${
                      Number(i.stock ?? 0) <= 10
                        ? "bg-red-50 text-red-500"
                        : "bg-[#FFEFF4] text-[#C55077]"
                    }`}>
                      {i.stock ?? 0}
                    </span>
                  </td>
                  <td className="px-8 py-5 flex justify-center gap-2">
                    <button onClick={() => setModal({ open: true, data: i })} className="p-2 text-gray-300 hover:text-[#D23669]"><Edit3 size={14}/></button>
                    <button onClick={() => removeItem(i.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {modal.open && (
        <AdminModal title={modal.data ? "Edit Product" : "New Product"} onClose={() => setModal({ open: false })}>
          <form onSubmit={save} className="space-y-4">
            {!modal.data && (
              <InputField label="Product ID" name="product_id" placeholder="เช่น P001" required />
            )}
            {modal.data && (
              <InputField label="Product ID" name="product_id" defaultValue={modal.data?.id || ""} disabled />
            )}
            <InputField label="Name" name="name" defaultValue={modal.data?.name || ""} required />
            <InputField label="Price" name="price" type="number" defaultValue={modal.data?.price ?? 0} required />
            <InputField label="Image URL" name="image_url" defaultValue={modal.data?.image_url || ""} />
            <InputField label="Category" name="category" defaultValue={modal.data?.category || ""} />
            <InputField label="Personal Color Tags" name="tags" defaultValue={modal.data?.personal_color_tags || ""} />
            <InputField label="Status" name="status" defaultValue={modal.data?.status || "active"} />
            <InputField label="Stock" name="stock" type="number" defaultValue={modal.data?.stock ?? 0} />
            <button
              disabled={saving}
              className="w-full bg-black text-white py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest mt-4 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
          </form>
        </AdminModal>
      )}
    </div>
  );
}


// ── 3. User, 4. Promo, 5. Review (โครงสร้างพื้นฐานเพื่อความเสถียร) ──
function UserView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, data: null });
  const [searchTerm, setSearchTerm] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await getAdminUsers();
      setUsers(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error(e);
      setError("โหลดข้อมูลผู้ใช้ไม่สำเร็จ กรุณาตรวจสอบ endpoint /admin/users ฝั่ง backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const saveUser = async (e) => {
    e.preventDefault();
    if (saving) return;

    const f = new FormData(e.target);
    const payload = {
      username: String(f.get("username") || "").trim(),
      email: String(f.get("email") || "").trim(),
      role: String(f.get("role") || "user").trim(),
    };
    const password = String(f.get("password") || "").trim();
    if (password) payload.password = password;

    setSaving(true);
    setError("");
    try {
      if (modal.data?.id) {
        await updateAdminUser(modal.data.id, payload);
      } else {
        await createAdminUser(payload);
      }
      setModal({ open: false, data: null });
      await loadUsers();
    } catch (e) {
      console.error(e);
      setError("บันทึกข้อมูลผู้ใช้ไม่สำเร็จ กรุณาตรวจสอบ endpoint /admin/users ฝั่ง backend");
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (id) => {
    if (!id) return;
    const ok = window.confirm("ยืนยันการลบผู้ใช้นี้?");
    if (!ok) return;
    setError("");
    try {
      await deleteAdminUser(id);
      await loadUsers();
    } catch (e) {
      console.error(e);
      setError("ลบผู้ใช้ไม่สำเร็จ กรุณาตรวจสอบ endpoint /admin/users ฝั่ง backend");
    }
  };

  const filtered = users.filter((u) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      String(u.username || "").toLowerCase().includes(q) ||
      String(u.email || "").toLowerCase().includes(q) ||
      String(u.role || "").toLowerCase().includes(q)
    );
  });

  return (
    <div data-aos="fade-in">
      <ManagementHeader title="User Roles" onAdd={() => setModal({ open: true, data: null })} />

      <div className="mb-6 max-w-md relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B8A8AF]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search user, email, role..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#F0E4E8] bg-white text-sm outline-none focus:ring-2 focus:ring-[#FFD5E3]"
        />
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-[#F0E4E8] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#FFF4F7] text-[8px] uppercase font-black text-[#A38E97] tracking-[0.18em]">
            <tr>
              <th className="px-8 py-5">User</th>
              <th className="px-8 py-5">Email</th>
              <th className="px-8 py-5">Role</th>
              <th className="px-8 py-5">State</th>
              <th className="px-8 py-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5ECEF]">
            {loading ? (
              <tr>
                <td className="px-8 py-8 text-center text-[#A7939B] text-sm" colSpan={5}>
                  Loading users...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-8 py-8 text-center text-[#A7939B] text-sm" colSpan={5}>
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#FFF9FB] transition-colors">
                  <td className="px-8 py-5 font-semibold text-[#342C30]">{u.username || "-"}</td>
                  <td className="px-8 py-5 text-sm text-[#6F6167]">{u.email}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                      String(u.role).toLowerCase() === "admin"
                        ? "bg-[#FFE5EE] text-[#C63F6D]"
                        : "bg-[#EEF6FF] text-[#4C71A8]"
                    }`}>
                      {u.role || "user"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                      !u.deleted_at
                        ? "bg-[#ECFAF0] text-[#2F8F52]"
                        : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}>
                      {!u.deleted_at ? "active" : "deleted"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setModal({ open: true, data: u })}
                        className="p-2 text-gray-300 hover:text-[#D23669]"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => removeUser(u.id)}
                        className="p-2 text-gray-300 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <AdminModal title={modal.data ? "Edit User Role" : "Add User"} onClose={() => setModal({ open: false, data: null })}>
          <form onSubmit={saveUser} className="space-y-4">
            <InputField label="Username" name="username" defaultValue={modal.data?.username || ""} required />
            <InputField label="Email" name="email" type="email" defaultValue={modal.data?.email || ""} required />
            {!modal.data && <InputField label="Password" name="password" type="password" required />}

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#A7939B] px-2">Role</label>
              <select
                name="role"
                defaultValue={modal.data?.role || "user"}
                className="w-full bg-[#FFF7FA] rounded-2xl px-5 py-3.5 text-sm outline-none border border-[#F1DDE5] focus:ring-2 focus:ring-[#FFD5E3] focus:border-[#E9B9CA]"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <button
              disabled={saving}
              className="w-full bg-[#D23669] text-white py-4 rounded-full text-[10px] uppercase font-black tracking-widest mt-4 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save User"}
            </button>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
function PromoView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, data: null });
  const [searchTerm, setSearchTerm] = useState("");

  const loadPromotions = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await getAdminPromotions();
      setItems(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error(e);
      setError("โหลดข้อมูลโปรโมชั่นไม่สำเร็จ กรุณาตรวจสอบ endpoint /admin/promotions ฝั่ง backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const savePromotion = async (e) => {
    e.preventDefault();
    if (saving) return;

    const f = new FormData(e.target);
    const promotion_id = String(f.get("promotion_id") || "").trim();
    const payload = {
      promotion_id: promotion_id || modal.data?.id,
      title: String(f.get("title") || "").trim(),
      promo_name: String(f.get("title") || "").trim(),
      code: String(f.get("code") || "").trim(),
      description: String(f.get("description") || "").trim(),
      promo_detail: String(f.get("description") || "").trim(),
      discount_percent: Number(f.get("discount_percent") || 0),
      start_date: String(f.get("start_date") || "").trim(),
      end_date: String(f.get("end_date") || "").trim(),
      status: String(f.get("status") || "active").trim(),
      brand_id: Number(f.get("brand_id") || 0),
      superadmin_id: Number(f.get("superadmin_id") || 0),
    };

    if (!payload.promo_name || !payload.promo_detail || payload.brand_id <= 0 || payload.superadmin_id <= 0) {
      setError("กรุณากรอก title, description, brand_id และ superadmin_id ให้ครบ");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const id = modal.data?.id || promotion_id;
      if (id) {
        await updateAdminPromotion(id, payload);
      } else {
        await createAdminPromotion(payload);
      }
      setModal({ open: false, data: null });
      await loadPromotions();
    } catch (e) {
      console.error(e);
      setError("บันทึกโปรโมชั่นไม่สำเร็จ กรุณาตรวจสอบ endpoint /admin/promotions ฝั่ง backend");
    } finally {
      setSaving(false);
    }
  };

  const removePromotion = async (id) => {
    if (!id) return;
    const ok = window.confirm("ยืนยันการลบโปรโมชั่นนี้?");
    if (!ok) return;
    setError("");
    try {
      await deleteAdminPromotion(id);
      await loadPromotions();
    } catch (e) {
      console.error(e);
      setError("ลบโปรโมชั่นไม่สำเร็จ กรุณาตรวจสอบ endpoint /admin/promotions ฝั่ง backend");
    }
  };

  const filtered = items.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      String(p.title || "").toLowerCase().includes(q) ||
      String(p.code || "").toLowerCase().includes(q) ||
      String(p.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div data-aos="fade-in">
      <ManagementHeader title="Promotions" onAdd={() => setModal({ open: true, data: null })} />

      <div className="mb-6 max-w-md relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B8A8AF]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search title, code..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#F0E4E8] bg-white text-sm outline-none focus:ring-2 focus:ring-[#FFD5E3]"
        />
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-[#F0E4E8] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#FFF4F7] text-[8px] uppercase font-black text-[#A38E97] tracking-[0.18em]">
            <tr>
              <th className="px-8 py-5">Title</th>
              <th className="px-8 py-5">Code</th>
              <th className="px-8 py-5 text-right">Discount</th>
              <th className="px-8 py-5 text-right">Brand</th>
              <th className="px-8 py-5">Date Range</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5ECEF]">
            {loading ? (
              <tr>
                <td className="px-8 py-8 text-center text-[#A7939B] text-sm" colSpan={7}>
                  Loading promotions...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-8 py-8 text-center text-[#A7939B] text-sm" colSpan={7}>
                  No promotions found
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id || `${p.title}-${p.code}`} className="hover:bg-[#FFF9FB] transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-semibold text-[#342C30]">{p.title || "-"}</p>
                    <p className="text-xs text-[#8F7D84] mt-1 line-clamp-1">{p.description || "-"}</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-[#6F6167]">{p.code || "-"}</td>
                  <td className="px-8 py-5 text-right font-semibold">{Number(p.discount_percent || 0)}%</td>
                  <td className="px-8 py-5 text-right font-semibold">{p.brand_id ?? "-"}</td>
                  <td className="px-8 py-5 text-xs text-[#8F7D84]">
                    {(p.start_date || "-")} - {(p.end_date || "-")}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                      String(p.status || "").toLowerCase() === "active"
                        ? "bg-[#ECFAF0] text-[#2F8F52]"
                        : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}>
                      {p.status || "inactive"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setModal({ open: true, data: p })}
                        className="p-2 text-gray-300 hover:text-[#D23669]"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => removePromotion(p.id)}
                        className="p-2 text-gray-300 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <AdminModal
          title={modal.data ? "Edit Promotion" : "Add Promotion"}
          onClose={() => setModal({ open: false, data: null })}
        >
          <form onSubmit={savePromotion} className="space-y-4">
            {!modal.data && (
              <InputField label="Promotion ID" name="promotion_id" placeholder="เช่น PR001" />
            )}
            {modal.data && (
              <InputField label="Promotion ID" name="promotion_id" defaultValue={modal.data?.id || ""} disabled />
            )}
            <InputField label="Title" name="title" defaultValue={modal.data?.title || ""} required />
            <InputField label="Promo Code" name="code" defaultValue={modal.data?.code || ""} />
            <InputField label="Brand ID" name="brand_id" type="number" defaultValue={modal.data?.brand_id ?? ""} required />
            <InputField
              label="Superadmin ID"
              name="superadmin_id"
              type="number"
              defaultValue={modal.data?.superadmin_id ?? ""}
              required
            />
            <InputField
              label="Discount (%)"
              name="discount_percent"
              type="number"
              defaultValue={modal.data?.discount_percent ?? 0}
            />
            <InputField label="Start Date" name="start_date" type="date" defaultValue={modal.data?.start_date || ""} />
            <InputField label="End Date" name="end_date" type="date" defaultValue={modal.data?.end_date || ""} />
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#A7939B] px-2">Description</label>
              <textarea
                name="description"
                defaultValue={modal.data?.description || ""}
                rows={3}
                className="w-full bg-[#FFF7FA] rounded-2xl px-5 py-3.5 text-sm outline-none border border-[#F1DDE5] focus:ring-2 focus:ring-[#FFD5E3] focus:border-[#E9B9CA]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#A7939B] px-2">Status</label>
              <select
                name="status"
                defaultValue={modal.data?.status || "active"}
                className="w-full bg-[#FFF7FA] rounded-2xl px-5 py-3.5 text-sm outline-none border border-[#F1DDE5] focus:ring-2 focus:ring-[#FFD5E3] focus:border-[#E9B9CA]"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            <button
              disabled={saving}
              className="w-full bg-[#D23669] text-white py-4 rounded-full text-[10px] uppercase font-black tracking-widest mt-4 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Promotion"}
            </button>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
function ReviewView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, data: null });
  const [searchTerm, setSearchTerm] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await getAdminReviews();
      setItems(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error(e);
      setError("โหลดข้อมูลรีวิวไม่สำเร็จ กรุณาตรวจสอบ endpoint /reviews ฝั่ง backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const saveReview = async (e) => {
    e.preventDefault();
    if (saving) return;

    const f = new FormData(e.target);
    const review_id = String(f.get("review_id") || "").trim();
    const payload = {
      review_id: review_id || modal.data?.id,
      user_id: Number(f.get("user_id") || 0),
      product_id: Number(f.get("product_id") || 0),
      rating: Number(f.get("rating") || 0),
      comment: String(f.get("comment") || "").trim(),
      status: String(f.get("status") || "active"),
    };

    if (payload.user_id <= 0 || payload.product_id <= 0 || payload.rating <= 0) {
      setError("กรุณากรอก user_id, product_id และ rating ให้ถูกต้อง");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const id = modal.data?.id || review_id;
      if (id) {
        await updateAdminReview(id, payload);
      } else {
        await createAdminReview(payload);
      }
      setModal({ open: false, data: null });
      await loadReviews();
    } catch (e) {
      console.error(e);
      setError("บันทึกรีวิวไม่สำเร็จ กรุณาตรวจสอบ endpoint /reviews ฝั่ง backend");
    } finally {
      setSaving(false);
    }
  };

  const removeReview = async (id) => {
    if (!id) return;
    const ok = window.confirm("ยืนยันการลบรีวิวนี้?");
    if (!ok) return;
    setError("");
    try {
      await deleteAdminReview(id);
      await loadReviews();
    } catch (e) {
      console.error(e);
      setError("ลบรีวิวไม่สำเร็จ กรุณาตรวจสอบ endpoint /reviews ฝั่ง backend");
    }
  };

  const filtered = items.filter((r) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      String(r.comment || "").toLowerCase().includes(q) ||
      String(r.id || "").toLowerCase().includes(q) ||
      String(r.user_id || "").toLowerCase().includes(q) ||
      String(r.product_id || "").toLowerCase().includes(q)
    );
  });

  return (
    <div data-aos="fade-in">
      <ManagementHeader title="Customer Reviews" onAdd={() => setModal({ open: true, data: null })} />

      <div className="mb-6 max-w-md relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B8A8AF]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search review, user_id, product_id..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#F0E4E8] bg-white text-sm outline-none focus:ring-2 focus:ring-[#FFD5E3]"
        />
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-[#F0E4E8] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#FFF4F7] text-[8px] uppercase font-black text-[#A38E97] tracking-[0.18em]">
            <tr>
              <th className="px-8 py-5">Review ID</th>
              <th className="px-8 py-5">User ID</th>
              <th className="px-8 py-5">Product ID</th>
              <th className="px-8 py-5">Rating</th>
              <th className="px-8 py-5">Comment</th>
              <th className="px-8 py-5">Created</th>
              <th className="px-8 py-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5ECEF]">
            {loading ? (
              <tr>
                <td className="px-8 py-8 text-center text-[#A7939B] text-sm" colSpan={7}>
                  Loading reviews...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-8 py-8 text-center text-[#A7939B] text-sm" colSpan={7}>
                  No reviews found
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id || `${r.user_id}-${r.product_id}-${r.created_at}`} className="hover:bg-[#FFF9FB] transition-colors">
                  <td className="px-8 py-5 text-sm font-semibold text-[#342C30]">{r.id || "-"}</td>
                  <td className="px-8 py-5 text-sm text-[#6F6167]">{r.user_id || "-"}</td>
                  <td className="px-8 py-5 text-sm text-[#6F6167]">{r.product_id || "-"}</td>
                  <td className="px-8 py-5 text-sm font-semibold">{r.rating || 0}/5</td>
                  <td className="px-8 py-5 text-sm text-[#6F6167] max-w-md truncate">{r.comment || "-"}</td>
                  <td className="px-8 py-5 text-xs text-[#8F7D84]">{r.created_at || "-"}</td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setModal({ open: true, data: r })} className="p-2 text-gray-300 hover:text-[#D23669]">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => removeReview(r.id)} className="p-2 text-gray-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <AdminModal title={modal.data ? "Edit Review" : "Add Review"} onClose={() => setModal({ open: false, data: null })}>
          <form onSubmit={saveReview} className="space-y-4">
            {!modal.data && <InputField label="Review ID" name="review_id" placeholder="ถ้ามีใน backend" />}
            {modal.data && <InputField label="Review ID" name="review_id" defaultValue={modal.data?.id || ""} disabled />}
            <InputField label="User ID" name="user_id" type="number" defaultValue={modal.data?.user_id ?? ""} required />
            <InputField label="Product ID" name="product_id" type="number" defaultValue={modal.data?.product_id ?? ""} required />
            <InputField label="Rating (1-5)" name="rating" type="number" min={1} max={5} defaultValue={modal.data?.rating ?? 5} required />
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#A7939B] px-2">Comment</label>
              <textarea
                name="comment"
                defaultValue={modal.data?.comment || ""}
                rows={3}
                className="w-full bg-[#FFF7FA] rounded-2xl px-5 py-3.5 text-sm outline-none border border-[#F1DDE5] focus:ring-2 focus:ring-[#FFD5E3] focus:border-[#E9B9CA]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#A7939B] px-2">Status</label>
              <select
                name="status"
                defaultValue={modal.data?.status || "active"}
                className="w-full bg-[#FFF7FA] rounded-2xl px-5 py-3.5 text-sm outline-none border border-[#F1DDE5] focus:ring-2 focus:ring-[#FFD5E3] focus:border-[#E9B9CA]"
              >
                <option value="active">active</option>
                <option value="hidden">hidden</option>
                <option value="deleted">deleted</option>
              </select>
            </div>
            <button
              disabled={saving}
              className="w-full bg-[#D23669] text-white py-4 rounded-full text-[10px] uppercase font-black tracking-widest mt-4 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Review"}
            </button>
          </form>
        </AdminModal>
      )}
    </div>
  );
}

// ── Shared UI Components ──
function NavItem({ icon, label, to }) {
  return (
    <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive ? 'bg-[#FFF2F6] text-[#D23669] border border-[#F3CFDB] shadow-sm' : 'text-[#A7939B] hover:text-[#4A4145] hover:bg-[#FAF3F6]'}`}>
      <span className={`${label === "Dashboard" ? "" : ""}`}>{icon}</span>
      <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
    </NavLink>
  );
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-[#F0E4E8] shadow-sm hover:shadow-md transition-shadow">
      <p className="text-[9px] uppercase font-black text-[#A7939B] mb-6 tracking-[0.2em]">{label}</p>
      <h2 className="text-4xl font-[900] mb-2 text-[#2E2629]">{value || 0}</h2>
      <p className="text-[9px] text-[#C1B2B8] font-bold tracking-widest uppercase">{sub}</p>
    </div>
  );
}

function ManagementHeader({ title, onAdd }) {
  return (
    <header className="py-10 flex justify-between items-end border-b border-[#F1E6EA] mb-10">
      <div>
        <h2 className="text-3xl font-[900] tracking-tight">{title}</h2>
        <p className="text-[8px] uppercase tracking-[0.35em] text-[#AA8A94] font-black">Atelier Management</p>
      </div>
      <button onClick={onAdd} className="flex items-center gap-2 px-6 py-3 bg-[#D23669] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#BD2D5D] transition-all rounded-full shadow-[0_10px_20px_rgba(210,54,105,0.25)]">
        <PlusCircle size={14}/> Add New Record
      </button>
    </header>
  );
}

function AdminModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#2A1A22]/25 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2rem] p-8 relative shadow-2xl border border-[#F0E4E8]">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-300 hover:text-[#D23669]"><X size={22}/></button>
        <h3 className="text-2xl font-[900] mb-6 tracking-tight">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, ...p }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black uppercase tracking-widest text-[#A7939B] px-2">{label}</label>
      <input className="w-full bg-[#FFF7FA] rounded-2xl px-5 py-3.5 text-sm outline-none border border-[#F1DDE5] focus:ring-2 focus:ring-[#FFD5E3] focus:border-[#E9B9CA]" {...p} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#FCF8F8] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full border-4 border-[#F3DCE4] border-t-[#D23669] animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#B1919C]">Synchronizing Data</p>
      </div>
    </div>
  );
}
