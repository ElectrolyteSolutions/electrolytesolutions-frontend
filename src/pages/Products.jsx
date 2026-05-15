import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, addProduct, deleteProduct, updateProduct } from '../features/productSlice';
// Optional: import { Plus, Edit2, Trash2, X } from 'lucide-react'; 

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.products);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', quantity: '' });

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setForm(product);
      setEditId(product._id);
    } else {
      setForm({ name: '', price: '', quantity: '' });
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (editId) {
      dispatch(updateProduct({ id: editId, data: form }));
    } else {
      dispatch(addProduct(form));
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Product Inventory</h1>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20"
        >
          <span>+</span> Add Product
        </button>
      </header>

      {/* Table Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Price (In Rupees)</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {status === 'loading' ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 italic">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      Synchronizing data...
                    </div>
                  </td>
                </tr>
              ) : items.map((p, i) => (
                <tr key={p._id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-500">{i + 1}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-zinc-100">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300 font-mono">{Number(p.price).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      p.quantity < 10 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {p.quantity} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(p)}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Delete this item?')) dispatch(deleteProduct(p._id)) }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30">
              <h3 className="text-lg font-bold text-white">{editId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={handleCloseModal} className="text-zinc-500 hover:text-white transition-colors text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Product Name</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="e.g. Magnesium Complex" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Price (In Rupees)</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    type="number" 
                    placeholder="0.00"
                    value={form.price} 
                    onChange={e => setForm({...form, price: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Quantity</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    type="number" 
                    placeholder="0"
                    value={form.quantity} 
                    onChange={e => setForm({...form, quantity: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all text-sm shadow-lg shadow-indigo-500/20"
                >
                  {editId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;