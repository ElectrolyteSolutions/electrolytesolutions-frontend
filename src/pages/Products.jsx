import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, addProduct, deleteProduct, updateProduct } from '../features/productSlice';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.products);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', quantity: '' ,baseRate:''});

  // ⚡ NEW: Core Staging State Controls for Lookups, Filtering & Matrix Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // options: 'all' | 'low-stock'
  const [currentSortBy, setCurrentSortBy] = useState('name'); // options: 'name' | 'price' | 'qty'
  const [currentSortOrder, setCurrentSortOrder] = useState('asc'); // options: 'asc' | 'desc'

  // Trigger network dispatches automatically upon query modifier mutations
  useEffect(() => {
    const payloadQueryOptions = {
      search: searchTerm,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
      ...(stockFilter === 'low-stock' && { alert: 'low-stock' })
    };

    dispatch(getProducts(payloadQueryOptions));
  }, [dispatch, searchTerm, stockFilter, currentSortBy, currentSortOrder]);

  // ⚡ NEW: Automatically toggles or updates active matrix column parameters
  const handleSortToggle = (targetField) => {
    if (currentSortBy === targetField) {
      // If the field is already active, flip the order direction
      setCurrentSortOrder(currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If switching to a new field, initialize it with ascending order
      setCurrentSortBy(targetField);
      setCurrentSortOrder('asc');
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setForm(product);
      setEditId(product._id);
    } else {
      setForm({ name: '', price: '', quantity: '',baseRate:'' });
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (editId) {
      dispatch(updateProduct({ id: editId, data: form })).then(() => refreshDataLogs());
    } else {
      dispatch(addProduct(form)).then(() => refreshDataLogs());
    }
    handleCloseModal();
  };

  const refreshDataLogs = () => {
    dispatch(getProducts({
      search: searchTerm,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
      ...(stockFilter === 'low-stock' && { alert: 'low-stock' })
    }));
  };

  // Internal visual helper string mapping indicator status labels
  const renderSortIndicatorArrow = (targetField) => {
    if (currentSortBy !== targetField) return <span className="text-zinc-600 ml-1">⇅</span>;
    return currentSortOrder === 'asc' ? <span className="text-indigo-400 ml-1">▲</span> : <span className="text-indigo-400 ml-1">▼</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Product Inventory</h1>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 self-start sm:self-center"
        >
          <span>+</span> Add Product
        </button>
      </header>

      {/* ⚡ NEW: Interactive Filtering Control Subbar Panel Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-900/40 p-4 border border-zinc-800 rounded-xl">
        <div className="sm:col-span-2 relative">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 ml-0.5">Component Text Search</label>
          <input 
            type="text"
            placeholder="Type component hardware name to query catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-7 text-zinc-500 hover:text-white font-bold text-xs">&times; Clear</button>
          )}
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 ml-0.5">Inventory Stock Depth</label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Products</option>
            <option value="low-stock">🚨 Out of Stock / Depleted Only</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/40 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider select-none">
                <th className="px-6 py-4 w-16">S.No</th>
                
                {/* ⚡ SORTABLE TOGGLE COLUMNS BUTTON HEADERS MAPS HERE */}
                <th 
                  onClick={() => handleSortToggle('name')}
                  className="px-6 py-4 cursor-pointer hover:bg-zinc-800/30 text-zinc-200 transition-colors"
                >
                  <div className="flex items-center">Product Name {renderSortIndicatorArrow('name')}</div>
                </th>
                
                <th 
                  onClick={() => handleSortToggle('price')}
                  className="px-6 py-4 cursor-pointer hover:bg-zinc-800/30 text-zinc-200 transition-colors"
                >
                  <div className="flex items-center justify-end pr-4">MRP {renderSortIndicatorArrow('price')}</div>
                </th>
                
                <th 
                  onClick={() => handleSortToggle('qty')}
                  className="px-6 py-4 cursor-pointer hover:bg-zinc-800/30 text-zinc-200 transition-colors"
                >
                  <div className="flex items-center">Stock Volume {renderSortIndicatorArrow('qty')}</div>
                </th>
                
                <th className="px-6 py-4 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {status === 'loading' ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-zinc-500 italic">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      Synchronizing active ledger matrices...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-zinc-500 text-sm">
                    No components found matching current search criteria parameters.
                  </td>
                </tr>
              ) : (
                items.map((p, i) => (
                  <tr key={p._id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-zinc-500">{i + 1}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-100">{p.name} <span className='text-zinc-700'>- {Number(p.baseRate).toFixed(2)}</span> </td>
                    <td className="px-6 py-4 text-sm text-zinc-300 font-mono text-right pr-10">Rs. {Number(p.price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                        p.quantity <= 0 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : p.quantity < 10
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {p.quantity <= 0 ? '● Depleted' : `${p.quantity} units`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(p)}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => { if(window.confirm(`Delete ${p.name} from records permanently?`)) dispatch(deleteProduct(p._id)).then(() => refreshDataLogs()) }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Form Input Edit Modal Overlay Component */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30">
              <h3 className="text-lg font-bold text-white">{editId ? 'Edit Inventory Product' : 'Add New Product'}</h3>
              <button onClick={handleCloseModal} className="text-zinc-500 hover:text-white transition-colors text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Product Description Title</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="e.g. iPhone 13 Premium OLED Panel" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">MRP (Rs.)</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                    type="number" 
                    placeholder="0.00"
                    value={form.price} 
                    onChange={e => setForm({...form, price: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Base Rate (Rs.)</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                    type="number" 
                    placeholder="0.00"
                    value={form.baseRate} 
                    onChange={e => setForm({...form, baseRate: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Stock Quantity</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
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
                  {editId ? 'Commit Variations' : 'Create Record'}
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