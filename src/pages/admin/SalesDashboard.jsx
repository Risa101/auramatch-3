import React, { useEffect, useState } from "react";
import { NavLink, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, Tag, MessageSquare, LogOut,
  Plus, Trash2, Pencil, X, Search, AlertTriangle, Star,
  ShieldCheck, Layers, Image, ChevronRight, Box, BarChart2
} from "lucide-react";
import { getAdminOverview, getdataBrands } from "../../callapi/call_api_user";
import {
  getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct,
  getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser,
  getAdminPromotions, createAdminPromotion, updateAdminPromotion, deleteAdminPromotion,
  getAdminReviews, createAdminReview, updateAdminReview, deleteAdminReview,
  getAdminBrands, createAdminBrand, updateAdminBrand, deleteAdminBrand,
  getStockList, createStockItem, updateStockItem, deleteStockItem,
} from "../../callapi/call_api_admin";
import { imgUrl } from "../../utils/imgUrl";

const fmt = (n) => `฿${Number(n || 0).toLocaleString()}`;
const num = (n) => Number(n || 0).toLocaleString();

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function SalesDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [data, products] = await Promise.all([
          getAdminOverview(),
          getAdminProducts().catch(() => []),
        ]);
        const map = new Map((Array.isArray(products) ? products : []).map((p) => [String(p.id), p.name || ""]));
        const low_stock = Array.isArray(data?.low_stock)
          ? data.low_stock.map((item) => ({
              ...item,
              quantity: Number(item?.quantity ?? item?.qty ?? item?.stock_qty ?? 0),
              name: item?.name || item?.product_name || map.get(String(item?.product_id ?? "")) || `Product #${item?.product_id || "-"}`,
            }))
          : [];
        setStats({ ...data, low_stock });
      } catch (e) {
        if (e?.response?.status === 403 || e?.response?.status === 401) {
          localStorage.removeItem("auramatch:isAdmin");
          navigate("/login", { replace: true });
        }
      } finally { setLoading(false); }
    };
    load();
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  if (loading) return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 mx-auto rounded-full border-4 border-white/10 border-t-[#D23669] animate-spin" />
        <p className="text-white/30 text-xs tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] font-sans">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-[#0F1117] flex flex-col fixed h-full z-40 select-none">
        <div className="px-5 pt-7 pb-5 border-b border-white/5">
          <button onClick={() => navigate("/admin/dashboard")} className="block text-left">
            <span className="text-xl font-black text-white tracking-tight">aura<span className="text-[#D23669]">match</span></span>
            <p className="text-[9px] text-white/25 font-semibold tracking-[0.2em] uppercase mt-0.5">Admin Console</p>
          </button>
        </div>

        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          <NavLabel>Overview</NavLabel>
          <SideNavItem to="/admin/dashboard" icon={<LayoutDashboard size={15}/>} label="Dashboard" />
          <NavLabel>Catalog</NavLabel>
          <SideNavItem to="/admin/products" icon={<Package size={15}/>} label="Products" />
          <SideNavItem to="/admin/stock" icon={<Box size={15}/>} label="Stock" />
          <SideNavItem to="/admin/brands" icon={<Layers size={15}/>} label="Brands" />
          <NavLabel>Community</NavLabel>
          <SideNavItem to="/admin/users" icon={<Users size={15}/>} label="Users" />
          <SideNavItem to="/admin/reviews" icon={<MessageSquare size={15}/>} label="Reviews" />
          <NavLabel>Marketing</NavLabel>
          <SideNavItem to="/admin/promotions" icon={<Tag size={15}/>} label="Promotions" />
        </nav>

        <div className="px-2.5 pb-5 border-t border-white/5 pt-3">
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <header className="h-13 bg-white border-b border-gray-200 flex items-center justify-between px-7 sticky top-0 z-30 h-14">
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <span>Admin</span>
            <ChevronRight size={13} />
            <Routes>
              <Route path="/dashboard" element={<span className="text-gray-800 font-semibold">Dashboard</span>} />
              <Route path="/products" element={<span className="text-gray-800 font-semibold">Products</span>} />
              <Route path="/stock" element={<span className="text-gray-800 font-semibold">Stock</span>} />
              <Route path="/brands" element={<span className="text-gray-800 font-semibold">Brands</span>} />
              <Route path="/users" element={<span className="text-gray-800 font-semibold">Users</span>} />
              <Route path="/reviews" element={<span className="text-gray-800 font-semibold">Reviews</span>} />
              <Route path="/promotions" element={<span className="text-gray-800 font-semibold">Promotions</span>} />
            </Routes>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#D23669]/10 flex items-center justify-center">
            <span className="text-[#D23669] text-xs font-bold">A</span>
          </div>
        </header>

        <main className="flex-1 p-7">
          <Routes>
            <Route path="/dashboard" element={<DashboardView stats={stats} />} />
            <Route path="/products" element={<ProductView />} />
            <Route path="/stock" element={<StockView />} />
            <Route path="/brands" element={<BrandView />} />
            <Route path="/users" element={<UserView />} />
            <Route path="/reviews" element={<ReviewView />} />
            <Route path="/promotions" element={<PromoView />} />
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ─── Sidebar helpers ──────────────────────────────────────────────────────────
function NavLabel({ children }) {
  return <p className="px-3 pt-4 pb-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-white/20">{children}</p>;
}
function SideNavItem({ to, icon, label }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive ? "bg-[#D23669] text-white shadow-lg shadow-[#D23669]/25" : "text-white/45 hover:text-white hover:bg-white/5"
      }`
    }>{icon}{label}</NavLink>
  );
}

// ─── 1. Dashboard ─────────────────────────────────────────────────────────────
function DashboardView({ stats }) {
  const kpis = [
    { label: "Users", value: num(stats?.kpis?.users), icon: <Users size={18}/>, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Products", value: num(stats?.kpis?.products), icon: <Package size={18}/>, color: "text-[#D23669]", bg: "bg-rose-50", border: "border-rose-100" },
    { label: "Promotions", value: num(stats?.kpis?.promotions), icon: <Tag size={18}/>, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Reviews", value: num(stats?.kpis?.reviews), icon: <Star size={18}/>, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ];
  return (
    <div className="space-y-7">
      <PageTitle title="Dashboard" sub="Overview of your store" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400">{k.label}</p>
              <div className={`w-9 h-9 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center ${k.color}`}>{k.icon}</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle size={15} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Low Stock Alert</h2>
            <p className="text-xs text-gray-400">Products running low</p>
          </div>
        </div>
        {Array.isArray(stats?.low_stock) && stats.low_stock.length > 0 ? (
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {stats.low_stock.map((item) => (
                <tr key={`${item.product_id}-${item.quantity}`} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-700">{item.name}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${Number(item.quantity) <= 5 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                      {item.quantity} left
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-10 text-center">
            <ShieldCheck size={28} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-sm text-gray-400">All products adequately stocked</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 2. Products ──────────────────────────────────────────────────────────────
function ProductView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, data: null });
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { const rows = await getAdminProducts(); setItems(Array.isArray(rows) ? rows : []); }
    catch { setError("Failed to load products."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); if (saving) return;
    const f = new FormData(e.target);
    const payload = {
      product_id: String(f.get("product_id") || "").trim() || modal.data?.id,
      name: String(f.get("name") || "").trim(),
      price: Number(f.get("price") || 0),
      image_url: String(f.get("image_url") || "").trim(),
      category: String(f.get("category") || "").trim(),
      personal_color_tags: String(f.get("tags") || "").trim(),
      status: String(f.get("status") || "active"),
      stock: f.get("stock") === "" ? null : Number(f.get("stock")),
    };
    const id = modal.data?.id || payload.product_id;
    if (id) {
      setItems(prev => prev.map(x => x.id === id ? { ...x, ...payload } : x));
      setModal({ open: false, data: null });
      try { await updateAdminProduct(id, payload); }
      catch (err) { setError("Save failed:" + (err?.response?.data?.message || err.message)); await load(); }
    } else {
      setSaving(true);
      try { await createAdminProduct(payload); setModal({ open: false, data: null }); await load(); }
      catch (err) { setError("Save failed:" + (err?.response?.data?.message || err.message)); }
      finally { setSaving(false); }
    }
  };

  const remove = async (id) => {
    if (!id || !window.confirm("Delete this product?")) return;
    setItems(prev => prev.filter(x => x.id !== id));
    try { await deleteAdminProduct(id); }
    catch (err) { setError("Delete failed:" + (err?.response?.data?.message || err.message)); await load(); }
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return !q || [i.name, i.category, i.personal_color_tags].some(v => String(v || "").toLowerCase().includes(q));
  });

  return (
    <PageLayout title="Products" sub={`${items.length} items`} action={<ActionBtn onClick={() => setModal({ open: true, data: null })}>+ Add Product</ActionBtn>}>
      <SearchBar value={search} onChange={setSearch} placeholder="Search name, category, color…" />
      {error && <ErrorBanner msg={error} onClose={() => setError("")} />}
      <DataTable loading={loading} cols={["Product", "Category", "Price", "Stock", "Status", ""]} empty="No products">
        {filtered.map((i) => (
          <TR key={i.id}>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <ImgThumb src={i.image_url} />
                <div><p className="text-sm font-semibold text-gray-800 leading-tight">{i.name}</p><p className="text-xs text-gray-400">{i.id}</p></div>
              </div>
            </td>
            <td className="px-5 py-3.5"><CategoryBadge val={i.category} /></td>
            <td className="px-5 py-3.5 text-sm font-medium text-gray-700">{fmt(i.price)}</td>
            <td className="px-5 py-3.5"><StockBadge qty={i.stock} /></td>
            <td className="px-5 py-3.5"><StatusBadge val={i.status} /></td>
            <td className="px-5 py-3.5"><RowActions onEdit={() => setModal({ open: true, data: i })} onDelete={() => remove(i.id)} /></td>
          </TR>
        ))}
      </DataTable>

      {modal.open && (
        <Modal title={modal.data ? "Edit Product" : "Add Product"} onClose={() => setModal({ open: false, data: null })}>
          <form onSubmit={save} className="space-y-4">
            {!modal.data && <Field label="Product ID" name="product_id" placeholder="e.g. P001" required />}
            {modal.data && <Field label="Product ID" name="product_id" defaultValue={modal.data?.id || ""} disabled />}
            <Field label="Name *" name="name" defaultValue={modal.data?.name || ""} required />
            <Row2>
              <Field label="Price (฿) *" name="price" type="number" defaultValue={modal.data?.price ?? 0} required />
              <Field label="Stock" name="stock" type="number" defaultValue={modal.data?.stock ?? 0} />
            </Row2>
            <ImageField name="image_url" defaultValue={modal.data?.image_url || ""} />
            <Row2>
              <SelectField label="Category" name="category" defaultValue={modal.data?.category || ""}>
                <option value="">Select…</option>
                {["lip","eye","blush","cushion","foundation","other"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </SelectField>
              <SelectField label="Status" name="status" defaultValue={modal.data?.status || "active"}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </SelectField>
            </Row2>
            <Field label="Personal Color Tags" name="tags" defaultValue={modal.data?.personal_color_tags || ""} placeholder="spring,summer,autumn,winter" />
            <SubmitBtn saving={saving}>{saving ? "Saving…" : modal.data ? "Save Changes" : "Add Product"}</SubmitBtn>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}

// ─── 3. Stock ─────────────────────────────────────────────────────────────────
function StockView() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, data: null });
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [stockRows, productRows] = await Promise.all([
        getStockList(),
        getAdminProducts().catch(() => []),
      ]);
      setItems(Array.isArray(stockRows) ? stockRows : []);
      setProducts(Array.isArray(productRows) ? productRows : []);
    } catch { setError("Failed to load stock data."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const productMap = new Map(products.map(p => [String(p.id), p.name]));
  const getProductName = (pid) => productMap.get(String(pid)) || `Product #${pid}`;
  const getQty = (item) => Number(item?.quantity ?? item?.qty ?? item?.stock_qty ?? 0);

  const save = async (e) => {
    e.preventDefault(); if (saving) return;
    const f = new FormData(e.target);
    const product_id = Number(f.get("product_id") || 0);
    const quantity = Number(f.get("quantity") || 0);
    if (!product_id) { setError("Please select a product."); return; }
    const sid = modal.data?.stock_id ?? modal.data?.id;
    if (sid) {
      setItems(prev => prev.map(x => (x.stock_id ?? x.id) === sid ? { ...x, quantity } : x));
      setModal({ open: false, data: null });
      try { await updateStockItem(sid, { quantity }); }
      catch (err) { setError("Save failed:" + (err?.response?.data?.message || err.message)); await load(); }
    } else {
      setSaving(true);
      try { await createStockItem({ product_id, quantity }); setModal({ open: false, data: null }); await load(); }
      catch (err) { setError("Save failed:" + (err?.response?.data?.message || err.message)); }
      finally { setSaving(false); }
    }
  };

  const remove = async (sid) => {
    if (!sid || !window.confirm("Delete this stock entry?")) return;
    setItems(prev => prev.filter(x => (x.stock_id ?? x.id) !== sid));
    try { await deleteStockItem(sid); }
    catch (err) { setError("Delete failed:" + (err?.response?.data?.message || err.message)); await load(); }
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const name = getProductName(i.product_id).toLowerCase();
    return !q || name.includes(q) || String(i.product_id).includes(q);
  });

  return (
    <PageLayout title="Stock" sub={`${items.length} stock entries`} action={<ActionBtn onClick={() => setModal({ open: true, data: null })}>+ Add Stock</ActionBtn>}>
      <SearchBar value={search} onChange={setSearch} placeholder="Search product name or ID…" />
      {error && <ErrorBanner msg={error} onClose={() => setError("")} />}
      <DataTable loading={loading} cols={["Stock ID", "Product", "Quantity", ""]} empty="No stock data">
        {filtered.map((i) => {
          const sid = i.stock_id ?? i.id;
          const qty = getQty(i);
          return (
            <TR key={sid}>
              <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{sid}</td>
              <td className="px-5 py-3.5">
                <p className="text-sm font-semibold text-gray-800">{getProductName(i.product_id)}</p>
                <p className="text-xs text-gray-400">ID: {i.product_id}</p>
              </td>
              <td className="px-5 py-3.5"><StockBadge qty={qty} /></td>
              <td className="px-5 py-3.5"><RowActions onEdit={() => setModal({ open: true, data: i })} onDelete={() => remove(sid)} /></td>
            </TR>
          );
        })}
      </DataTable>

      {modal.open && (
        <Modal title={modal.data ? "Edit Stock" : "Add Stock"} onClose={() => setModal({ open: false, data: null })}>
          <form onSubmit={save} className="space-y-4">
            {modal.data ? (
              <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-500">Product</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{getProductName(modal.data.product_id)}</p>
                <input type="hidden" name="product_id" value={modal.data.product_id} />
              </div>
            ) : (
              <SelectField label="Product *" name="product_id" defaultValue="" required>
                <option value="">Select product…</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </SelectField>
            )}
            <Field label="Quantity *" name="quantity" type="number" min={0} defaultValue={modal.data ? getQty(modal.data) : 0} required />
            <SubmitBtn saving={saving}>{saving ? "Saving…" : modal.data ? "Update Quantity" : "Add Stock"}</SubmitBtn>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}

// ─── 4. Brands ────────────────────────────────────────────────────────────────
function BrandView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, data: null });
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { const rows = await getAdminBrands(); setItems(Array.isArray(rows) ? rows : []); }
    catch { setError("Failed to load brand data."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); if (saving) return;
    const f = new FormData(e.target);
    const payload = {
      brand_name: String(f.get("brand_name") || "").trim(),
      logo_path: String(f.get("logo_path") || "").trim(),
    };
    if (!payload.brand_name || !payload.logo_path) { setError("Please enter Brand Name and Logo Path."); return; }
    const id = modal.data?.id ?? modal.data?.brand_id;
    if (id) {
      setItems(prev => prev.map(x => (x.id ?? x.brand_id) === id ? { ...x, ...payload } : x));
      setModal({ open: false, data: null });
      try { await updateAdminBrand(id, payload); }
      catch (err) { setError("Save failed:" + (err?.response?.data?.message || err.message)); await load(); }
    } else {
      setSaving(true);
      try { await createAdminBrand(payload); setModal({ open: false, data: null }); await load(); }
      catch (err) { setError("Save failed:" + (err?.response?.data?.message || err.message)); }
      finally { setSaving(false); }
    }
  };

  const remove = async (id) => {
    if (!id || !window.confirm("Delete this brand?")) return;
    setItems(prev => prev.filter(x => (x.id ?? x.brand_id) !== id));
    try { await deleteAdminBrand(id); }
    catch (err) { setError("Delete failed:" + (err?.response?.data?.message || err.message)); await load(); }
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return !q || String(i.brand_name || "").toLowerCase().includes(q);
  });

  return (
    <PageLayout title="Brands" sub={`${items.length} brands`} action={<ActionBtn onClick={() => setModal({ open: true, data: null })}>+ Add Brand</ActionBtn>}>
      <SearchBar value={search} onChange={setSearch} placeholder="Search brand name…" />
      {error && <ErrorBanner msg={error} onClose={() => setError("")} />}
      <DataTable loading={loading} cols={["Brand", "Logo Path", ""]} empty="No brands">
        {filtered.map((i) => {
          const id = i.id ?? i.brand_id;
          return (
            <TR key={id}>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  {i.logo_path ? (
                    <img src={imgUrl(i.logo_path)} alt={i.brand_name} className="w-9 h-9 rounded-xl object-contain bg-gray-50 border border-gray-100 p-1" onError={e => { e.target.style.display="none"; }} />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Image size={14} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{i.brand_name}</p>
                    <p className="text-xs text-gray-400">ID: {id}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5">
                <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-mono">{i.logo_path || "—"}</code>
              </td>
              <td className="px-5 py-3.5"><RowActions onEdit={() => setModal({ open: true, data: i })} onDelete={() => remove(id)} /></td>
            </TR>
          );
        })}
      </DataTable>

      {modal.open && (
        <Modal title={modal.data ? "Edit Brand" : "Add Brand"} onClose={() => setModal({ open: false, data: null })}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Brand Name *" name="brand_name" defaultValue={modal.data?.brand_name || ""} required />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Logo Path *</label>
              <input name="logo_path" defaultValue={modal.data?.logo_path || ""}
                placeholder="/static/images/brands/brandname.png"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D23669]/30 focus:border-[#D23669]" />
              <p className="text-xs text-gray-400 px-1">e.g. <code>/static/images/brands/mac.png</code></p>
              {modal.data?.logo_path && (
                <div className="mt-2 h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                  <img src={imgUrl(modal.data.logo_path)} alt="logo" className="h-full object-contain p-2" onError={e => { e.target.style.display="none"; }} />
                </div>
              )}
            </div>
            <SubmitBtn saving={saving}>{saving ? "Saving…" : modal.data ? "Save Changes" : "Add Brand"}</SubmitBtn>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}

// ─── 5. Users ─────────────────────────────────────────────────────────────────
function UserView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, data: null });
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { const rows = await getAdminUsers(); setUsers(Array.isArray(rows) ? rows : []); }
    catch { setError("Failed to load user data."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); if (saving) return;
    const f = new FormData(e.target);
    const payload = {
      username: String(f.get("username") || "").trim(),
      email: String(f.get("email") || "").trim(),
      role: String(f.get("role") || "user"),
    };
    const pw = String(f.get("password") || "").trim();
    if (pw) payload.password = pw;
    if (modal.data?.id) {
      setUsers(prev => prev.map(x => x.id === modal.data.id ? { ...x, ...payload } : x));
      setModal({ open: false, data: null });
      try { await updateAdminUser(modal.data.id, payload); }
      catch (err) { setError("Save failed:" + (err?.response?.data?.message || err.message)); await load(); }
    } else {
      setSaving(true);
      try { await createAdminUser(payload); setModal({ open: false, data: null }); await load(); }
      catch (err) { setError("Save failed:" + (err?.response?.data?.message || err.message)); }
      finally { setSaving(false); }
    }
  };

  const remove = async (id) => {
    if (!id || !window.confirm("Delete this user?")) return;
    setUsers(prev => prev.filter(x => x.id !== id));
    try { await deleteAdminUser(id); }
    catch (err) { setError("Delete failed:" + (err?.response?.data?.message || err.message)); await load(); }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || [u.username, u.email, u.role].some(v => String(v || "").toLowerCase().includes(q));
  });

  return (
    <PageLayout title="Users" sub={`${users.length} accounts`} action={<ActionBtn onClick={() => setModal({ open: true, data: null })}>+ Add User</ActionBtn>}>
      <SearchBar value={search} onChange={setSearch} placeholder="Search name, email, role…" />
      {error && <ErrorBanner msg={error} onClose={() => setError("")} />}
      <DataTable loading={loading} cols={["User", "Email", "Role", "Status", ""]} empty="No users">
        {filtered.map((u) => (
          <TR key={u.id}>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D23669] to-[#FF85A2] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {String(u.username || u.email || "?")[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-800">{u.username || "—"}</span>
              </div>
            </td>
            <td className="px-5 py-3.5 text-sm text-gray-500">{u.email}</td>
            <td className="px-5 py-3.5">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-rose-100 text-rose-700" : "bg-blue-50 text-blue-600"}`}>{u.role || "user"}</span>
            </td>
            <td className="px-5 py-3.5"><StatusBadge val={u.deleted_at ? "inactive" : "active"} /></td>
            <td className="px-5 py-3.5"><RowActions onEdit={() => setModal({ open: true, data: u })} onDelete={() => remove(u.id)} /></td>
          </TR>
        ))}
      </DataTable>

      {modal.open && (
        <Modal title={modal.data ? "Edit User" : "Add User"} onClose={() => setModal({ open: false, data: null })}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Username *" name="username" defaultValue={modal.data?.username || ""} required />
            <Field label="Email *" name="email" type="email" defaultValue={modal.data?.email || ""} required />
            {!modal.data && <Field label="Password *" name="password" type="password" required />}
            {modal.data && <Field label="New Password (blank = no change)" name="password" type="password" />}
            <SelectField label="Role" name="role" defaultValue={modal.data?.role || "user"}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </SelectField>
            <SubmitBtn saving={saving}>{saving ? "Saving…" : modal.data ? "Save Changes" : "Add User"}</SubmitBtn>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}

// ─── 6. Promotions ────────────────────────────────────────────────────────────
function PromoView() {
  const [items, setItems] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, data: null });
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { const rows = await getAdminPromotions(); setItems(Array.isArray(rows) ? rows : []); }
    catch { setError("Failed to load promotions."); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    getdataBrands().then(b => setBrands(Array.isArray(b) ? b : [])).catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault(); if (saving) return;
    const f = new FormData(e.target);
    const payload = {
      promotion_id: String(f.get("promotion_id") || "").trim() || modal.data?.id,
      promo_name: String(f.get("title") || "").trim(),
      title: String(f.get("title") || "").trim(),
      code: String(f.get("code") || "").trim(),
      coupon_code: String(f.get("code") || "").trim(),
      promo_detail: String(f.get("description") || "").trim(),
      description: String(f.get("description") || "").trim(),
      discount_percent: Number(f.get("discount_percent") || 0),
      min_price: f.get("min_price") ? Number(f.get("min_price")) : null,
      max_discount: f.get("max_discount") ? Number(f.get("max_discount")) : null,
      start_date: String(f.get("start_date") || ""),
      end_date: String(f.get("end_date") || ""),
      status: String(f.get("status") || "active"),
      brand_id: Number(f.get("brand_id") || 0),
      superadmin_id: Number(modal.data?.superadmin_id ?? 1),
    };
    if (!payload.promo_name || payload.brand_id <= 0) { setError("Please enter a title and select a brand."); return; }
    const id = modal.data?.id || payload.promotion_id;
    if (id) {
      setItems(prev => prev.map(x => x.id === id ? { ...x, ...payload, id } : x));
      setModal({ open: false, data: null });
      try { await updateAdminPromotion(id, payload); }
      catch (err) { setError("Save failed:" + (err?.response?.data?.message || err.message)); await load(); }
    } else {
      setSaving(true);
      try { await createAdminPromotion(payload); setModal({ open: false, data: null }); await load(); }
      catch (err) { setError("Save failed:" + (err?.response?.data?.message || err.message)); }
      finally { setSaving(false); }
    }
  };

  const remove = async (id) => {
    if (!id || !window.confirm("Delete this promotion?")) return;
    setItems(prev => prev.filter(x => x.id !== id));
    try { await deleteAdminPromotion(id); }
    catch (err) { setError("Delete failed:" + (err?.response?.data?.message || err.message)); await load(); }
  };

  const filtered = items.filter(p => {
    const q = search.toLowerCase();
    return !q || [p.title, p.promo_name, p.code, p.coupon_code, p.description].some(v => String(v || "").toLowerCase().includes(q));
  });

  return (
    <PageLayout title="Promotions" sub={`${items.length} promotions`} action={<ActionBtn onClick={() => setModal({ open: true, data: null })}>+ Add Promotion</ActionBtn>}>
      <SearchBar value={search} onChange={setSearch} placeholder="Search title, code…" />
      {error && <ErrorBanner msg={error} onClose={() => setError("")} />}
      <DataTable loading={loading} cols={["Promotion", "Code", "Discount", "Brand", "Dates", "Status", ""]} empty="No promotions">
        {filtered.map((p) => {
          const brandName = brands.find(b => Number(b.brand_id) === Number(p.brand_id))?.brand_name || p.brand_name || p.brand_id || "—";
          return (
            <TR key={p.id}>
              <td className="px-5 py-3.5">
                <p className="text-sm font-semibold text-gray-800">{p.title || p.promo_name || "—"}</p>
                <p className="text-xs text-gray-400 line-clamp-1">{p.description || p.promo_detail || ""}</p>
              </td>
              <td className="px-5 py-3.5">
                {(p.code || p.coupon_code) ? <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-mono">{p.code || p.coupon_code}</code> : <span className="text-xs text-gray-400">—</span>}
              </td>
              <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">{Number(p.discount_percent || 0)}%</td>
              <td className="px-5 py-3.5 text-sm text-gray-600">{brandName}</td>
              <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                <div>{p.start_date || "—"}</div>
                <div className="text-gray-300">→ {p.end_date || "—"}</div>
              </td>
              <td className="px-5 py-3.5"><StatusBadge val={p.status} /></td>
              <td className="px-5 py-3.5"><RowActions onEdit={() => setModal({ open: true, data: p })} onDelete={() => remove(p.id)} /></td>
            </TR>
          );
        })}
      </DataTable>

      {modal.open && (
        <Modal title={modal.data ? "Edit Promotion" : "Add Promotion"} onClose={() => setModal({ open: false, data: null })}>
          <form onSubmit={save} className="space-y-4">
            {!modal.data && <Field label="Promotion ID (optional)" name="promotion_id" placeholder="auto if blank" />}
            <Field label="Title *" name="title" defaultValue={modal.data?.title || modal.data?.promo_name || ""} required />
            <Field label="Promo Code" name="code" defaultValue={modal.data?.code || modal.data?.coupon_code || ""} placeholder="e.g. SAVE20" />
            <Row2>
              <SelectField label="Brand *" name="brand_id" defaultValue={modal.data?.brand_id ?? ""} required>
                <option value="">Select brand…</option>
                {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
              </SelectField>
              <Field label="Discount %" name="discount_percent" type="number" defaultValue={modal.data?.discount_percent ?? 0} />
            </Row2>
            <Row2>
              <Field label="Min Price (฿)" name="min_price" type="number" defaultValue={modal.data?.min_price ?? ""} placeholder="optional" />
              <Field label="Max Discount (฿)" name="max_discount" type="number" defaultValue={modal.data?.max_discount ?? ""} placeholder="optional" />
            </Row2>
            <Row2>
              <Field label="Start Date" name="start_date" type="date" defaultValue={modal.data?.start_date || ""} />
              <Field label="End Date" name="end_date" type="date" defaultValue={modal.data?.end_date || ""} />
            </Row2>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Description</label>
              <textarea name="description" defaultValue={modal.data?.description || modal.data?.promo_detail || ""} rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D23669]/30 focus:border-[#D23669] resize-none" />
            </div>
            <SelectField label="Status" name="status" defaultValue={modal.data?.status || "active"}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectField>
            <SubmitBtn saving={saving}>{saving ? "Saving…" : modal.data ? "Save Changes" : "Add Promotion"}</SubmitBtn>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}

// ─── 7. Reviews ───────────────────────────────────────────────────────────────
function ReviewView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, data: null });
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { const rows = await getAdminReviews(); setItems(Array.isArray(rows) ? rows : []); }
    catch { setError("Failed to load reviews."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); if (saving) return;
    const f = new FormData(e.target);
    const payload = {
      review_id: String(f.get("review_id") || "").trim() || modal.data?.id,
      user_id: Number(f.get("user_id") || 0),
      product_id: Number(f.get("product_id") || 0),
      rating: Number(f.get("rating") || 0),
      comment: String(f.get("comment") || "").trim(),
      status: String(f.get("status") || "active"),
    };
    if (payload.user_id <= 0 || payload.product_id <= 0 || payload.rating <= 0) {
      setError("Please provide a valid user_id, product_id, and rating."); return;
    }
    const id = modal.data?.id || payload.review_id;
    if (id) {
      setItems(prev => prev.map(x => x.id === id ? { ...x, ...payload, id } : x));
      setModal({ open: false, data: null });
      try { await updateAdminReview(id, payload); }
      catch (err) { setError("Save failed:" + (err?.response?.data?.message || err.message)); await load(); }
    } else {
      setSaving(true);
      try { await createAdminReview(payload); setModal({ open: false, data: null }); await load(); }
      catch (err) { setError("Save failed:" + (err?.response?.data?.message || err.message)); }
      finally { setSaving(false); }
    }
  };

  const remove = async (id) => {
    if (!id || !window.confirm("Delete this review?")) return;
    setItems(prev => prev.filter(x => x.id !== id));
    try { await deleteAdminReview(id); }
    catch (err) { setError("Delete failed:" + (err?.response?.data?.message || err.message)); await load(); }
  };

  const filtered = items.filter(r => {
    const q = search.toLowerCase();
    return !q || [r.comment, String(r.id), String(r.user_id), String(r.product_id)].some(v => String(v || "").toLowerCase().includes(q));
  });

  return (
    <PageLayout title="Reviews" sub={`${items.length} reviews`} action={<ActionBtn onClick={() => setModal({ open: true, data: null })}>+ Add Review</ActionBtn>}>
      <SearchBar value={search} onChange={setSearch} placeholder="Search comment, user, product…" />
      {error && <ErrorBanner msg={error} onClose={() => setError("")} />}
      <DataTable loading={loading} cols={["ID", "User", "Product", "Rating", "Comment", "Date", ""]} empty="No reviews">
        {filtered.map((r) => (
          <TR key={r.id}>
            <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{r.id || "—"}</td>
            <td className="px-5 py-3.5 text-sm text-gray-700">{r.user_id || "—"}</td>
            <td className="px-5 py-3.5 text-sm text-gray-700">{r.product_id || "—"}</td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= Number(r.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />)}
                <span className="text-xs text-gray-400 ml-1">{r.rating}</span>
              </div>
            </td>
            <td className="px-5 py-3.5 text-sm text-gray-600 max-w-xs"><p className="truncate">{r.comment || "—"}</p></td>
            <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
              {r.created_at ? new Date(r.created_at).toLocaleDateString("th-TH") : "—"}
            </td>
            <td className="px-5 py-3.5"><RowActions onEdit={() => setModal({ open: true, data: r })} onDelete={() => remove(r.id)} /></td>
          </TR>
        ))}
      </DataTable>

      {modal.open && (
        <Modal title={modal.data ? "Edit Review" : "Add Review"} onClose={() => setModal({ open: false, data: null })}>
          <form onSubmit={save} className="space-y-4">
            {!modal.data && <Field label="Review ID (optional)" name="review_id" placeholder="auto if blank" />}
            <Row2>
              <Field label="User ID *" name="user_id" type="number" defaultValue={modal.data?.user_id ?? ""} required />
              <Field label="Product ID *" name="product_id" type="number" defaultValue={modal.data?.product_id ?? ""} required />
            </Row2>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Rating *</label>
              <select name="rating" defaultValue={modal.data?.rating ?? 5} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D23669]/30 focus:border-[#D23669] bg-white">
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5-n)} ({n})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Comment</label>
              <textarea name="comment" defaultValue={modal.data?.comment || ""} rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D23669]/30 focus:border-[#D23669] resize-none" />
            </div>
            <SelectField label="Status" name="status" defaultValue={modal.data?.status || "active"}>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
              <option value="deleted">Deleted</option>
            </SelectField>
            <SubmitBtn saving={saving}>{saving ? "Saving…" : modal.data ? "Save Changes" : "Add Review"}</SubmitBtn>
          </form>
        </Modal>
      )}
    </PageLayout>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function PageLayout({ title, sub, action, children }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function PageTitle({ title, sub }) {
  return <div><h1 className="text-xl font-bold text-gray-900">{title}</h1>{sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}</div>;
}

function DataTable({ loading, cols, children, empty }) {
  const count = React.Children.count(children);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {cols.map((c, i) => <th key={i} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={cols.length} className="py-16 text-center">
                <div className="w-6 h-6 mx-auto rounded-full border-2 border-gray-200 border-t-[#D23669] animate-spin" />
              </td></tr>
            ) : count === 0 ? (
              <tr><td colSpan={cols.length} className="py-14 text-center text-sm text-gray-400">{empty}</td></tr>
            ) : children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TR({ children }) {
  return <tr className="hover:bg-gray-50/70 transition-colors border-b border-gray-50 last:border-0">{children}</tr>;
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative max-w-xs">
      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D23669]/20 focus:border-[#D23669]" />
    </div>
  );
}

function ActionBtn({ children, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 bg-[#D23669] hover:bg-[#BD2D5D] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all">
      {children}
    </button>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1 justify-end">
      <button onClick={onEdit} title="Edit" className="p-1.5 rounded-lg text-gray-400 hover:text-[#D23669] hover:bg-rose-50 transition-all"><Pencil size={13} /></button>
      <button onClick={onDelete} title="Delete" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={13} /></button>
    </div>
  );
}

function StatusBadge({ val }) {
  const active = String(val || "").toLowerCase() === "active";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function CategoryBadge({ val }) {
  const map = { lip: "bg-rose-100 text-rose-700", eye: "bg-purple-100 text-purple-700", blush: "bg-pink-100 text-pink-700", cushion: "bg-amber-100 text-amber-700", foundation: "bg-orange-100 text-orange-700" };
  const cls = map[String(val || "").toLowerCase()] || "bg-gray-100 text-gray-500";
  return val ? <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{val}</span> : <span className="text-xs text-gray-300">—</span>;
}

function StockBadge({ qty }) {
  const n = Number(qty ?? 0);
  return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${n <= 5 ? "bg-red-100 text-red-700" : n <= 20 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>{n}</span>;
}

function ImgThumb({ src }) {
  if (!src) return <div className="w-9 h-9 rounded-xl bg-gray-100 flex-shrink-0" />;
  return <img src={src} alt="" className="w-9 h-9 rounded-xl object-cover bg-gray-100 flex-shrink-0" onError={e => { e.target.style.display = "none"; }} />;
}

function ErrorBanner({ msg, onClose }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
      <div className="flex items-center gap-2"><AlertTriangle size={15} className="flex-shrink-0" />{msg}</div>
      {onClose && <button onClick={onClose} className="text-red-400 hover:text-red-600"><X size={14} /></button>}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input {...props} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D23669]/20 focus:border-[#D23669] disabled:bg-gray-50 disabled:text-gray-400" />
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <select {...props} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D23669]/20 focus:border-[#D23669] bg-white">{children}</select>
    </div>
  );
}

function ImageField({ name, defaultValue }) {
  const [preview, setPreview] = useState(defaultValue || "");
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600">Image URL</label>
      <input name={name} defaultValue={defaultValue} onChange={e => setPreview(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D23669]/20 focus:border-[#D23669]" />
      {preview && (
        <div className="h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
          <img src={preview} alt="preview" className="h-full object-contain p-1.5" onError={e => { e.target.style.display = "none"; }} />
        </div>
      )}
    </div>
  );
}

function Row2({ children }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function SubmitBtn({ saving, children }) {
  return (
    <button type="submit" disabled={saving}
      className="w-full bg-[#D23669] hover:bg-[#BD2D5D] disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all mt-1">
      {children}
    </button>
  );
}
