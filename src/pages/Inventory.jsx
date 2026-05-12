import React, { useState, useContext } from 'react';
import { ERPContext } from '../context/ERPContext';
import axios from 'axios';
import { Plus, Edit, Trash2, Package, AlertTriangle, Search } from 'lucide-react';

const Inventory = () => {
  const { products, refreshData } = useContext(ERPContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', category: 'Battery', price: 0, stock: 0, minStockAlert: 5 });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/products', formData);
      setIsModalOpen(false);
      refreshData();
      setFormData({ name: '', sku: '', category: 'Battery', price: 0, stock: 0, minStockAlert: 5 });
    } catch (err) {
      alert("Error: SKU must be unique");
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Remove this product from shop inventory?")) {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      refreshData();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Shop Inventory</h1>
          <p className="text-slate-500 text-sm">Manage products, stock levels, and pricing.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <Plus size={20}/> Add Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Search by Product Name or SKU..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest border-b">
              <th className="px-6 py-4 font-bold">Product Details</th>
              <th className="px-6 py-4 font-bold text-center">Stock</th>
              <th className="px-6 py-4 font-bold text-right">Price</th>
              <th className="px-6 py-4 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(product => (
              <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Package size={20}/></div>
                    <div>
                      <p className="font-bold text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{product.sku} • {product.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      product.stock <= product.minStockAlert ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {product.stock} units
                    </span>
                    {product.stock <= product.minStockAlert && (
                      <span className="text-[10px] text-red-400 mt-1 flex items-center gap-1 font-bold uppercase">
                        <AlertTriangle size={10}/> Low Stock
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-black text-slate-700">
                  ₹{product.price.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={18}/></button>
                    <button onClick={() => deleteProduct(product._id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Register New Shop Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Product Name</label>
                  <input required className="w-full border p-2 rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">SKU / Code</label>
                  <input required className="w-full border p-2 rounded-lg font-mono" placeholder="BAT-150-EX" onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
                  <select className="w-full border p-2 rounded-lg" onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>Battery</option><option>Inverter</option><option>Solar Panel</option><option>Service</option><option>Spare</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Selling Price (₹)</label>
                  <input type="number" className="w-full border p-2 rounded-lg" onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Current Stock</label>
                  <input type="number" className="w-full border p-2 rounded-lg" onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Min. Stock Alert</label>
                  <input type="number" className="w-full border p-2 rounded-lg" onChange={e => setFormData({...formData, minStockAlert: Number(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4 shadow-lg shadow-blue-100">
                Save to Inventory
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;