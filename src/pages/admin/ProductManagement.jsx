import React, { useState, useEffect } from "react";
import { PlusCircle, Edit3, Trash2, Search } from "lucide-react";

export default function ProductManagement() {
  const [products, setProducts] = useState([
    { id: 1, name: "Velvet Skin Foundation", price: 850, stock: 45, category: "Face" },
    { id: 2, name: "Silk Matte Lipstick", price: 450, stock: 12, category: "Lips" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
      // TODO: Call API deleteProduct(id)
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="py-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif italic">Product Catalog</h2>
          <p className="text-xs text-gray-400 mt-1">Manage your atelier's collection</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#C5A358] transition-all">
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

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#FAF9F8] text-[8px] uppercase tracking-[0.2em] font-black text-gray-400">
            <tr>
              <th className="px-8 py-5">Product Details</th>
              <th className="px-8 py-5">Category</th>
              <th className="px-8 py-5 text-right">Price</th>
              <th className="px-8 py-5 text-right">Stock</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
              <tr key={p.id} className="hover:bg-[#FDFCFB] transition-colors">
                <td className="px-8 py-6 font-bold">{p.name}</td>
                <td className="px-8 py-6 text-gray-400">{p.category}</td>
                <td className="px-8 py-6 text-right font-mono tracking-tighter">฿{p.price}</td>
                <td className="px-8 py-6 text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.stock < 20 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {p.stock} units
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-center gap-3">
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-all">
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
    </div>
  );
}