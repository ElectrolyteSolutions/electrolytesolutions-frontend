import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, addProduct, deleteProduct, updateProduct } from '../features/productSlice';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.products);
  
  const { user } = useSelector((state) => state.auth);
  const isCustomer = user?.role === 'customer';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Lookups fetched from backend
  const [availableCollections, setAvailableCollections] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);

  // Inline Collection Creator State
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [newCollectionErpId, setNewCollectionErpId] = useState('');
  const [creatingCollectionLoading, setCreatingCollectionLoading] = useState(false);
  
  // Form state including brand, collections, type, hsn, isCustomType, and image array
  const [form, setForm] = useState({ 
    erpProductId: '',
    images: [],
    collections: [],
    slug: '',
    name: '', 
    description: '',
    brand: '',
    sku: '',
    price: '', 
    orignalPrice: '',
    baseRate: '', 
    quantity: '', 
    seoMetaDescription: '',
    seoKeywords: '',
    hsn: '',
    type: '',
    isCustomType: false
  });

  // Temporary local state for typing a new image URL before adding it to the array
  const [tempImageUrl, setTempImageUrl] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); 
  const [currentSortBy, setCurrentSortBy] = useState('name'); 
  const [currentSortOrder, setCurrentSortOrder] = useState('asc'); 

  useEffect(() => {
    const payloadQueryOptions = {
      search: searchTerm,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
      ...(stockFilter === 'low-stock' && { alert: 'low-stock' })
    };

    dispatch(getProducts(payloadQueryOptions));
    fetchLookups();
  }, [dispatch, searchTerm, stockFilter, currentSortBy, currentSortOrder]);

  const fetchLookups = async () => {
    try {
      // Fetch Collections
      const colRes = await fetch(`${import.meta.env.VITE_API_URL}products/collections`);
      const colData = await colRes.json();
      setAvailableCollections(colData);

      // Fetch Product Types (clean string array)
      const typeRes = await fetch(`${import.meta.env.VITE_API_URL}products/types`);
      const typeData = await typeRes.json();
      setAvailableTypes(typeData);
    } catch (err) {
      console.error("Failed to load metadata lookups", err);
    }
  };

  // Handler to create collection inline and auto-select it
  const handleQuickCreateCollection = async () => {
    if (!newCollectionTitle.trim()) return;
    setCreatingCollectionLoading(true);
    try {
      const generatedErpId = newCollectionErpId.trim() || `ERP-COL-${Date.now().toString().slice(-6)}`;
      const res = await fetch(`${import.meta.env.VITE_API_URL}products/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          erpCollectionId: generatedErpId,
          title: newCollectionTitle.trim(),
          seo: { metaTitle: newCollectionTitle.trim(), metaDescription: `Shop ${newCollectionTitle.trim()}` }
        })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchLookups();
        setForm(prev => ({ ...prev, collections: [data._id] }));
        setNewCollectionTitle('');
        setNewCollectionErpId('');
        setIsCreatingCollection(false);
      } else {
        alert(data.error || 'Failed to create collection');
      }
    } catch (err) {
      console.error("Error saving inline collection:", err);
      alert('Network error while creating collection.');
    } finally {
      setCreatingCollectionLoading(false);
    }
  };

  const handleSortToggle = (targetField) => {
    if (currentSortBy === targetField) {
      setCurrentSortOrder(currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setCurrentSortBy(targetField);
      setCurrentSortOrder('asc');
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setForm({
        erpProductId: product.erpProductId || '',
        slug: product.slug || '',
        name: product.name || '',
        description: product.description || '',
        brand: product.brand || '',
        sku: product.sku || '',
        price: product.price || '',
        orignalPrice: product.orignalPrice || '',
        baseRate: product.baseRate || '',
        quantity: product.quantity || '',
        collections: product.collections ? product.collections.map(c => c._id || c) : [],
        seoMetaDescription: product.seo?.metaDescription || '',
        seoKeywords: product.seo?.keywords ? product.seo.keywords.join(', ') : '',
        images: product?.images && product.images.length > 0 ? [...product.images] : [],
        hsn: product.hsn || '',
        type: product.type || '',
        isCustomType: false
      });
      setEditId(product._id);
    } else {
      setForm({ 
        erpProductId: '', 
        images: [],
        collections: [],
        slug: '', 
        name: '', 
        description: '', 
        sku: '', 
        brand: '',
        price: '', 
        orignalPrice: '', 
        baseRate: '', 
        quantity: '', 
        seoMetaDescription: '', 
        seoKeywords: '',
        hsn: '',
        type: '',
        isCustomType: false
      });
      setEditId(null);
    }
    setTempImageUrl('');
    setIsCreatingCollection(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleAddImage = () => {
    if (!tempImageUrl.trim()) return;
    setForm({ ...form, images: [...form.images, tempImageUrl.trim()] });
    setTempImageUrl('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setForm({
      ...form,
      images: form.images.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Omit frontend-only helper flags before sending payload to backend
    const { isCustomType, ...cleanForm } = form;
    
    const payload = {
      ...cleanForm,
      seo: {
        metaTitle: form.name,
        metaDescription: form.seoMetaDescription,
        keywords: form.seoKeywords ? form.seoKeywords.split(',').map(k => k.trim()) : []
      }
    };

    if (editId) {
      dispatch(updateProduct({ id: editId, data: payload }))
    } else {
      dispatch(addProduct(payload));
    }
    refreshDataLogs()
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

  const renderSortIndicatorArrow = (targetField) => {
    if (currentSortBy !== targetField) return <span className="text-zinc-600 ml-1">⇅</span>;
    return currentSortOrder === 'asc' ? <span className="text-indigo-400 ml-1">▲</span> : <span className="text-indigo-400 ml-1">▼</span>;
  };

  const totalColumns = isCustomer ? 5 : 8;

  return (
    <div className="space-y-2 sm:space-y-6 animate-in fade-in duration-500 w-full max-w-[1400px] mx-auto">
      
      {/* Header Section */}
      <header className="flex items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">ERP Product Inventory</h1>
        </div>
        
        {!isCustomer && (
          <button 
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-500/20"
          >
            <span>+</span> Add ERP Product
          </button>
        )}
      </header>

      {/* Filtering Subbar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border-zinc-700 p-3 sm:p-4 rounded-xl bg-vercel-secondary shadow">
        <div className="lg:col-span-2 relative">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 ml-0.5">Component Text Search</label>
          <input 
            type="text"
            placeholder="Type component hardware name or SKU to query catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-7 sm:top-8 text-zinc-500 hover:text-white font-bold text-xs">&times; Clear</button>
          )}
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 ml-0.5">Inventory Stock Depth</label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Products</option>
            <option value="low-stock">🚨 Out of Stock / Depleted Only</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-vercel-secondary rounded-xl overflow-hidden shadow-xl w-full">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-zinc-800">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-vercel-secondary border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider select-none">
                <th className="px-4 sm:px-6 py-3 w-12 sm:w-16">S.No</th>
                <th className="px-4 sm:px-6 py-3 w-16 text-zinc-400">Media</th>
                <th onClick={() => handleSortToggle('name')} className="px-4 sm:px-6 py-3 cursor-pointer hover:bg-vercel-card/30 text-zinc-200 transition-colors">
                  <div className="flex items-center">Product Name & SKU {renderSortIndicatorArrow('name')}</div>
                </th>
                <th onClick={() => handleSortToggle('price')} className="px-4 sm:px-6 py-3 cursor-pointer hover:bg-vercel-card/30 text-zinc-200 transition-colors">
                  <div className="flex items-center justify-end pr-4">MRP / Original {renderSortIndicatorArrow('price')}</div>
                </th>
                <th onClick={() => handleSortToggle('hsn')} className="px-4 sm:px-6 py-3 cursor-pointer hover:bg-vercel-card/30 text-zinc-200 transition-colors">
                  <div className="flex items-center justify-end pr-4">HSN {renderSortIndicatorArrow('hsn')}</div>
                </th>
                <th onClick={() => handleSortToggle('quantity')} className="px-4 sm:px-6 py-3 cursor-pointer hover:bg-vercel-card/30 text-zinc-200 transition-colors">
                  <div className="flex items-center">Stock Volume {renderSortIndicatorArrow('quantity')}</div>
                </th>
                {!isCustomer && <th className="px-4 sm:px-6 py-3 text-zinc-400">ERP ID</th>}
                {!isCustomer && <th className="px-4 sm:px-6 py-3 text-right w-36">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
             {status === 'loading' ? (
                <tr>
                  <td colSpan={totalColumns} className="px-6 py-16 text-center text-zinc-500 italic">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      Synchronizing active ledger matrices...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={totalColumns} className="px-6 py-16 text-center text-zinc-500 text-sm">
                    No components found matching current search criteria parameters.
                  </td>
                </tr>
              ) : (
                items.map((p, i) => (
                  <tr key={p._id} className="hover:bg-vercel-card/20 transition-colors group">
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-mono text-zinc-500">{i + 1}</td>
                    
                    {/* Image Thumbnail Preview in Row */}
                    <td className="px-4 sm:px-6 py-3">
                      {p.images && p.images.length > 0 ? (
                        <img 
                          src={p.images[0]} 
                          alt={p.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-zinc-700 bg-zinc-950" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-vercel-card/50 border border-zinc-700/50 flex items-center justify-center text-[10px] text-zinc-500">
                          No Img
                        </div>
                      )}
                    </td>

                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
                      <div className="flex flex-col py-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-zinc-100">{p.name}</span> 
                          {!isCustomer && (
                            <span className="hidden group-hover:inline-flex animate-in fade-in zoom-in-95 duration-200 items-center px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 whitespace-nowrap">
                              Base: Rs. {Number(p.baseRate || 0).toFixed(2)}
                            </span>
                          )}
                        </div>
                        {p.sku && <span className="text-[11px] font-mono text-zinc-500">SKU: {p.sku}</span>}
                      </div>
                    </td>
                    
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-zinc-300 font-mono text-right pr-10">
                      <div>Rs. {Number(p.price || 0).toFixed(2)}</div>
                      {p.orignalPrice && <div className="text-[10px] text-zinc-500 line-through">Rs. {Number(p.orignalPrice).toFixed(2)}</div>}
                    </td>

                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-zinc-300 font-mono text-right pr-10">
                      {p.hsn ? p.hsn : '-'}
                    </td>

                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold font-mono justify-center ${
                        p.quantity <= 0 ? 'text-red-400' : p.quantity < 10 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {p.quantity}
                      </span>
                    </td>

                    {!isCustomer && (
                      <td className="px-4 sm:px-6 py-3 text-xs font-mono text-zinc-400">
                        {p.erpProductId ? <span className="text-emerald-400">{p.erpProductId}</span> : <span className="text-zinc-600">Manual</span>}
                      </td>
                    )}
                    
                    {!isCustomer && (
                      <td className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-medium">
                        <div className="flex justify-end gap-2.5 flex-wrap lg:flex-nowrap">
                          <button 
                            onClick={() => handleOpenModal(p)}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded text-[11px] lg:text-xs font-semibold shrink-0"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => { if(window.confirm(`Delete ${p.name} from records permanently?`)) dispatch(deleteProduct(p._id)).then(() => refreshDataLogs()) }}
                            className="text-red-400 hover:text-red-300 transition-colors bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded text-[11px] lg:text-xs font-semibold shrink-0"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Handling All Schema Fields + Collections Picker + Types Dropdown */}
      {isModalOpen && !isCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-vercel-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-vercel-secondary w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
            <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-vercel-card/30 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-white">{editId ? 'Edit ERP Product Record' : 'Add New ERP Product'}</h3>
              <button onClick={handleCloseModal} className="text-zinc-500 hover:text-white transition-colors text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-3 sm:p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Product Name</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-800"
                    placeholder="e.g. iPhone 13 OLED Panel" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Slug URL Parameter</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono border border-zinc-800"
                    placeholder="e.g. iphone-13-oled-panel" 
                    value={form.slug} 
                    onChange={e => setForm({...form, slug: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              {/* Collections and Brand Selector Row with Inline Create Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Brand</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono border border-zinc-800"
                    placeholder="e.g. Apple / Samsung" 
                    value={form.brand} 
                    onChange={e => setForm({...form, brand: e.target.value})} 
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase">Collection / Category</label>
                    <button 
                      type="button" 
                      onClick={() => setIsCreatingCollection(!isCreatingCollection)} 
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      {isCreatingCollection ? 'Cancel' : '+ New Collection'}
                    </button>
                  </div>

                  {!isCreatingCollection ? (
                    <select 
                      className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-800"
                      value={form.collections[0] || ''}
                      onChange={e => setForm({...form, collections: [e.target.value]})}
                    >
                      <option value="">Select Category Collection</option>
                      {availableCollections.map(col => (
                        <option key={col._id} value={col._id}>{col.title}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-2 bg-zinc-950 p-2.5 rounded-lg border border-indigo-500/40">
                      <input 
                        type="text" 
                        placeholder="Collection Title (e.g. Battery Packs)" 
                        value={newCollectionTitle}
                        onChange={e => setNewCollectionTitle(e.target.value)}
                        className="w-full bg-vercel-secondary rounded px-2.5 py-1.5 text-xs text-white border border-zinc-700"
                      />
                      <input 
                        type="text" 
                        placeholder="ERP Collection ID (Optional)" 
                        value={newCollectionErpId}
                        onChange={e => setNewCollectionErpId(e.target.value)}
                        className="w-full bg-vercel-secondary rounded px-2.5 py-1.5 text-xs text-white border border-zinc-700 font-mono"
                      />
                      <button 
                        type="button"
                        disabled={creatingCollectionLoading}
                        onClick={handleQuickCreateCollection}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded py-1.5 text-xs font-bold transition-all"
                      >
                        {creatingCollectionLoading ? 'Saving...' : 'Save & Select Collection'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Type Dropdown & HSN Code Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase">Product Type</label>
                    <button 
                      type="button"
                      onClick={() => setForm({ ...form, isCustomType: !form.isCustomType, type: '' })}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      {form.isCustomType ? '← Select from List' : '+ Custom Type'}
                    </button>
                  </div>

                  {!form.isCustomType ? (
                    <select 
                      className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-800"
                      value={form.type}
                      onChange={e => setForm({...form, type: e.target.value})}
                      required={!form.isCustomType}
                    >
                      <option value="">Select Product Type</option>
                      {availableTypes.map((t, index) => (
                        <option key={index} value={t?.type || "None"}>{t?.type || "None"}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-800 font-mono"
                      placeholder="Type custom product type (e.g. accessory)..."
                      value={form.type}
                      onChange={e => setForm({...form, type: e.target.value})}
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">HSN Code</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono border border-zinc-800"
                    placeholder="e.g. 8517" 
                    value={form.hsn} 
                    onChange={e => setForm({...form, hsn: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">SKU Code</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono border border-zinc-800"
                    placeholder="SKU-IP13-OLED" 
                    value={form.sku} 
                    onChange={e => setForm({...form, sku: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">ERP Product ID</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono border border-zinc-800"
                    placeholder="ERP-983421" 
                    value={form.erpProductId} 
                    onChange={e => setForm({...form, erpProductId: e.target.value})} 
                    // required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">MRP (₹)</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono border border-zinc-800"
                    type="number" 
                    value={form.price} 
                    onChange={e => setForm({...form, price: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Original Price</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono border border-zinc-800"
                    type="number" 
                    value={form.orignalPrice} 
                    onChange={e => setForm({...form, orignalPrice: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Base Rate</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono border border-zinc-800"
                    type="number" 
                    value={form.baseRate} 
                    onChange={e => setForm({...form, baseRate: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Quantity</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono border border-zinc-800"
                    type="number" 
                    value={form.quantity} 
                    onChange={e => setForm({...form, quantity: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              {/* Dynamic Image Add/Remove Section */}
              <div className="space-y-2 border border-zinc-800 p-3 rounded-xl bg-zinc-950/50">
                <label className="block text-xs font-semibold text-zinc-400 uppercase">Product Image URLs</label>
                
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    placeholder="https://example.com/image.jpg"
                    value={tempImageUrl}
                    onChange={e => setTempImageUrl(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddImage}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0"
                  >
                    + Add URL
                  </button>
                </div>

                {form.images.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {form.images.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 bg-vercel-secondary border border-zinc-800 pl-2 pr-1.5 py-1 rounded-lg">
                        <img src={url} alt={`Preview ${index}`} className="w-6 h-6 object-cover rounded bg-zinc-950" />
                        <span className="text-[11px] text-zinc-300 font-mono max-w-[120px] truncate">{url}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveImage(index)}
                          className="text-red-400 hover:text-red-300 text-xs font-bold px-1 ml-1"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-500 italic">No image URLs added yet.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Full Description</label>
                <textarea 
                  className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none border border-zinc-800"
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">SEO Meta Description</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-800"
                    value={form.seoMetaDescription}
                    onChange={e => setForm({...form, seoMetaDescription: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">SEO Keywords (Comma Separated)</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-800"
                    placeholder="oled, screen, iphone"
                    value={form.seoKeywords}
                    onChange={e => setForm({...form, seoKeywords: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-vercel-card hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-indigo-500/20"
                >
                  {editId ? 'Update Record' : 'Save Product'}
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