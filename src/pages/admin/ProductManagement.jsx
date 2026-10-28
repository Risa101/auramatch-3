import React, { useState, useEffect } from "react";
import { PlusCircle, Edit3, Trash2, Search, X } from "lucide-react";
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  setAdminProductPlatforms,
  deleteAdminProductPlatform,
} from "../../callapi/call_api_admin";
import { getActivePlatforms } from "../../data/shoppingPlatforms.js";
import { isSafeUrl } from "../../utils/platformLinks.js";

const EMPTY_FORM = {
  product_id: "",
  name: "",
  category: "",
  price: "",
  stock: "",
  image_url: "",
  personal_color_tags: "",
  status: "active",
};

function platformsToRows(platforms) {
  const byKey = new Map((platforms || []).map((p) => [p.platform, p]));
  return getActivePlatforms().map((cfg) => {
    const existing = byKey.get(cfg.key);
    return {
      platform: cfg.key,
      label: cfg.label,
      product_url: existing?.product_url || "",
      // Optional tracked/commission link -- resolvePlatformLinks() (src/utils/
      // platformLinks.js) already prefers this over product_url whenever both
      // are set, so filling it in here is the only step needed to route
      // clicks through it on the storefront/analysis-result product cards.
      affiliate_url: existing?.affiliate_url || "",
      is_active: existing ? existing.is_active !== false : true,
      // Whether this platform is already a saved row for this product --
      // distinct from the URL input's current (possibly unsaved) value, so
      // the Delete action only ever appears for a link that really exists.
      hasSavedLink: Boolean(existing),
    };
  });
}

function ProductFormModal({ initialProduct, onClose, onSaved }) {
  const isEditing = Boolean(initialProduct);
  const [form, setForm] = useState(
    initialProduct
      ? {
          product_id: initialProduct.id,
          name: initialProduct.name || "",
          category: initialProduct.category || "",
          price: initialProduct.price ?? "",
          stock: initialProduct.stock ?? "",
          image_url: initialProduct.image_url || "",
          personal_color_tags: initialProduct.personal_color_tags || "",
          status: initialProduct.status || "active",
        }
      : EMPTY_FORM
  );
  const [platformRows, setPlatformRows] = useState(platformsToRows(initialProduct?.platforms));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingPlatform, setDeletingPlatform] = useState(null);

  const updatePlatformRow = (key, patch) => {
    setPlatformRows((rows) => rows.map((r) => (r.platform === key ? { ...r, ...patch } : r)));
  };

  // Uses the existing single-platform DELETE endpoint directly -- does NOT
  // go through setAdminProductPlatforms's bulk upsert, so no other platform
  // row is touched. Only shown for a row with a real saved link (see
  // platformsToRows' hasSavedLink), so there's nothing to delete otherwise.
  const handleDeletePlatform = async (row) => {
    if (!window.confirm(`Remove the ${row.label} link for this product?`)) return;
    setError("");
    setDeletingPlatform(row.platform);
    try {
      await deleteAdminProductPlatform(initialProduct.id, row.platform);
      setPlatformRows((rows) =>
        rows.map((r) =>
          r.platform === row.platform
            ? { ...r, product_url: "", is_active: true, hasSavedLink: false }
            : r
        )
      );
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || `Failed to remove ${row.label} link.`);
    } finally {
      setDeletingPlatform(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.product_id.trim() || !form.name.trim()) {
      setError("Product ID and name are required.");
      return;
    }
    const badUrl = platformRows.find((r) => r.product_url.trim() && !isSafeUrl(r.product_url.trim()));
    if (badUrl) {
      setError(`${badUrl.label} URL must be a valid http(s) link.`);
      return;
    }
    const badAffiliateUrl = platformRows.find((r) => r.affiliate_url.trim() && !isSafeUrl(r.affiliate_url.trim()));
    if (badAffiliateUrl) {
      setError(`${badAffiliateUrl.label} affiliate URL must be a valid http(s) link.`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        product_id: form.product_id.trim(),
        name: form.name.trim(),
        category: form.category.trim(),
        price: form.price === "" ? 0 : Number(form.price),
        stock: form.stock === "" ? 0 : Number(form.stock),
        image_url: form.image_url.trim(),
        personal_color_tags: form.personal_color_tags.trim(),
        status: form.status,
      };

      if (isEditing) {
        await updateAdminProduct(payload.product_id, payload);
      } else {
        await createAdminProduct(payload);
      }

      // Only send platforms that actually have a URL filled in -- an empty
      // row means "no link for this platform yet", not "clear it".
      const platformsToSave = platformRows
        .filter((r) => r.product_url.trim())
        .map((r) => ({
          platform: r.platform,
          product_url: r.product_url.trim(),
          affiliate_url: r.affiliate_url.trim() || null,
          is_active: r.is_active,
        }));
      if (platformsToSave.length) {
        await setAdminProductPlatforms(payload.product_id, platformsToSave);
      }

      onSaved();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-serif italic">{isEditing ? "Edit Product" : "Add New Product"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 col-span-2">
              Product ID {isEditing && "(locked)"}
              <input
                required
                disabled={isEditing}
                value={form.product_id}
                onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
                className="mt-1 w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm disabled:bg-gray-50"
                placeholder="e.g. BLU010"
              />
            </label>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 col-span-2">
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm"
              />
            </label>
            <label className="text-[10px] uppercase tracking-widest text-gray-400">
              Category
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1 w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm"
              />
            </label>
            <label className="text-[10px] uppercase tracking-widest text-gray-400">
              Status
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="mt-1 w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="text-[10px] uppercase tracking-widest text-gray-400">
              Price (฿)
              <input
                type="number" min="0" step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="mt-1 w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm"
              />
            </label>
            <label className="text-[10px] uppercase tracking-widest text-gray-400">
              Stock
              <input
                type="number" min="0"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                className="mt-1 w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm"
              />
            </label>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 col-span-2">
              Image URL
              <input
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                className="mt-1 w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm"
              />
            </label>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 col-span-2">
              Personal Color Tags
              <input
                value={form.personal_color_tags}
                onChange={(e) => setForm((f) => ({ ...f, personal_color_tags: e.target.value }))}
                placeholder="e.g. Warm,Spring"
                className="mt-1 w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm"
              />
            </label>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">
              Shopping Platforms — leave a URL blank to add a new platform later
            </p>
            <div className="space-y-2.5">
              {platformRows.map((row) => (
                <div key={row.platform}>
                  <div className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-[10px] font-bold uppercase text-gray-500">{row.label}</span>
                    <input
                      type="url"
                      value={row.product_url}
                      onChange={(e) => updatePlatformRow(row.platform, { product_url: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 border border-gray-100 rounded-lg text-xs"
                    />
                    <label className="flex items-center gap-1.5 text-[9px] uppercase text-gray-400 shrink-0">
                      <input
                        type="checkbox"
                        checked={row.is_active}
                        onChange={(e) => updatePlatformRow(row.platform, { is_active: e.target.checked })}
                      />
                      Active
                    </label>
                    {row.hasSavedLink && (
                      <button
                        type="button"
                        onClick={() => handleDeletePlatform(row)}
                        disabled={deletingPlatform === row.platform}
                        className="p-2 hover:bg-red-50 rounded-full text-gray-300 hover:text-red-500 transition-all disabled:opacity-50 shrink-0"
                        aria-label={`Remove ${row.label} link`}
                        title={`Remove ${row.label} link`}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  {row.hasSavedLink && !row.product_url.trim() && (
                    <p className="text-[9px] text-red-500 pl-[5.75rem] pt-1">
                      Clearing this field won't remove the saved link — use the trash icon above to delete it.
                    </p>
                  )}
                  {row.product_url.trim() && (
                    <div className="flex items-center gap-2 mt-1.5 pl-[5.75rem]">
                      <input
                        type="url"
                        value={row.affiliate_url}
                        onChange={(e) => updatePlatformRow(row.platform, { affiliate_url: e.target.value })}
                        placeholder="Affiliate/commission link (optional) — used instead of the URL above when set"
                        className="flex-1 px-3 py-2 border border-gray-100 rounded-lg text-xs text-gray-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-3 bg-[#1A1A1A] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#C5A358] transition-all disabled:opacity-50">
              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null); // null = closed, {} = new, product = editing
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      setLoadError(err?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteAdminProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Delete failed.");
    }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const filtered = products.filter((p) => (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="animate-in fade-in duration-500">
      <header className="py-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif italic">Product Catalog</h2>
          <p className="text-xs text-gray-400 mt-1">Manage your atelier's collection</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#C5A358] transition-all"
        >
          <PlusCircle size={14}/> Add New Product
        </button>
      </header>

      {/* Toolbar */}
      <div className="mb-8 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-1 focus:ring-[#C5A358] outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loadError && (
        <p className="mb-4 text-xs text-red-500 bg-red-50 px-4 py-3 rounded-xl">{loadError}</p>
      )}

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#FAF9F8] text-[8px] uppercase tracking-[0.2em] font-black text-gray-400">
            <tr>
              <th className="px-8 py-5">Product Details</th>
              <th className="px-8 py-5">Category</th>
              <th className="px-8 py-5 text-right">Price</th>
              <th className="px-8 py-5 text-right">Stock</th>
              <th className="px-8 py-5 text-center">Platforms</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {loading && (
              <tr><td colSpan={6} className="px-8 py-10 text-center text-gray-400 text-xs">Loading products…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-8 py-10 text-center text-gray-400 text-xs">No products found.</td></tr>
            )}
            {!loading && filtered.map((p) => (
              <tr key={p.id} className="hover:bg-[#FDFCFB] transition-colors">
                <td className="px-8 py-6 font-bold">{p.name}</td>
                <td className="px-8 py-6 text-gray-400">{p.category}</td>
                <td className="px-8 py-6 text-right font-mono tracking-tighter">฿{p.price}</td>
                <td className="px-8 py-6 text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.stock < 20 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {p.stock} units
                  </span>
                </td>
                <td className="px-8 py-6 text-center text-[10px] text-gray-400">
                  {p.platforms?.length ? `${p.platforms.length} linked` : "—"}
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => openEdit(p)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-all">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 rounded-full text-gray-300 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProductFormModal
          initialProduct={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
