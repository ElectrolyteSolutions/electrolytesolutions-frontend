import React, { useState } from 'react';
import Button from './button';

const ProductDetails = ({
  form,
  details,
  addDetailRow,
  handleInputChange,
  setForm,
  editId,
  handleSave,
  availableCollections = [],
  availableTypes = [],
  isCreatingCollection,
  newCollectionTitle,
  setIsCreatingCollection,
  setNewCollectionTitle,
  creatingCollectionLoading,
  handleQuickCreateCollection,
  promptDeleteProduct,
  removeDetailRow,
  loading,
}) => {
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [isAddingNewType, setIsAddingNewType] = useState(false);

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

  const calculateProfit = () => {
    const price = parseFloat(form.price) || 0;
    const baseRate = parseFloat(form.baseRate) || 0;
    if (price <= 0) return '0.00%';
    return `${(((price - baseRate) / price) * 100).toFixed(2)}%`;
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col h-full w-full overflow-x-hidden px-3 py-6">
      <div className='flex flex-row justify-between items-center border-b border-zinc-800 pb-3'>
        <h3 className="text-sm font-medium text-vercel-primary line-clamp-2 w-2/4">
          {editId ? (
            <>Edit Mode: <span className='text-vercel-secondary'>{form.name || 'Product'}</span></>
          ) : (
            'Add New Product'
          )}
        </h3>
        <div className="flex gap-2">
          <Button
            disabled={loading}
            loading={loading}            
            buttontype="submit"
            label={editId ? (loading?"Updating":'Update') : (loading? "Saving":"Save")}
          />
          {editId && (
            <Button
              type='danger'
              onClick={() => promptDeleteProduct()}
              label="Delete"/>
          )}
        </div>
      </div>

      <div className="mt-3 h-screen bg-vercel-surface rounded-md border-1 border-zinc-800 px-2 py-2 overflow-y-auto space-y-2 custom-scrollbar max-h-[calc(100vh-20%)]">
        {/* Product Overview */}
        <p className='text-xs'>Product Overview</p>
        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md space-y-2'>
          <div>
            <label className="text-[11px] block mb-1">Product Name</label>
            <textarea maxLength={250} rows={1} placeholder="e.g. iPhone OLED Panel"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[11px] block mb-1">Brand</label>
            <input
              maxLength={50}
              placeholder="e.g. Apple"
              value={form.brand}
              onChange={e => setForm({ ...form, brand: e.target.value })}
              required
              className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
            />
          </div>
        </div>

        {/* Product Description */}
        <p className='text-xs'>Product Description</p>
        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md space-y-2'>
          <label className="text-[11px] block mb-1">Product Images (Add Image URLs)</label>
          <div className='flex flex-row justify-between gap-2'>
            <input
              placeholder="https://example.com/image.jpg"
              value={tempImageUrl}
              onChange={e => setTempImageUrl(e.target.value)}
              className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
            />
            <Button
              type="button"
              onClick={handleAddImage}
              icon={
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>}
              label="Add URL"/>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {form.images.map((url, index) => (
              <div key={index} className="border-1 border-zinc-800 rounded-md relative p-2">
                <button type="button" onClick={() => handleRemoveImage(index)} className="text-zinc-400 text-lg font-bold absolute top-0 right-2 m-0 p-0 cursor-pointer">&times;</button>
                <img src={url} alt={`Preview ${index}`} className="w-24 h-24 object-cover rounded-md bg-zinc-950" />
              </div>
            ))}
          </div>
      
          <div>
            <label className="text-[11px] block mb-1">Full Description</label>
            <textarea
              maxLength={2000}
              rows={8}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
              className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
            />
          </div>

          <div className="space-y-3 w-full">
            <label className="text-[11px] block mb-1">Product Specification</label>
            {details.map((detail, index) => (
              <div key={index} className="flex flex-row gap-2 w-full items-center">
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={detail.title}
                  onChange={(e) => handleInputChange(index, e)}
                  className='w-48 bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white'
                />
                <input
                  type="text"
                  name="content"
                  placeholder="Content details"
                  value={detail.content}
                  onChange={(e) => handleInputChange(index, e)}
                  required={detail?.title}
                  className='w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white'
                />
                {details.length > 1 && (
                  <Button 
                    type="danger" 
                    onClick={() => removeDetailRow(index)}
                    label="Remove"
                  />
                )}
              </div>
            ))}

            <Button 
              onClick={addDetailRow} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>}
              label="Add More"/>
          </div>
        </div>

        {/* Product Type and Category */}
        <p className='text-xs font-semibold text-zinc-300'>Product Type and Category</p>
        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md space-y-2'>
          <label className="text-[11px] mb-0 pb-0 block">Product Category</label>
          {!isCreatingCollection ? (
            <div className='flex gap-3'>
              <select
                value={form.collections[0] || ''}
                onChange={e => setForm({ ...form, collections: [e.target.value] })}
                required
                className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
              >
                <option value="">Select Category Collection</option>
                {availableCollections.map(col => (
                  <option key={col._id} value={col._id}>{col.title}</option>
                ))}
              </select>
              <Button
                type="button"
                onClick={() => { setIsCreatingCollection(!isCreatingCollection)}}
                icon={!isCreatingCollection && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                )}
                label={isCreatingCollection ? 'Cancel' : 'New Collection'}
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                maxLength={40}
                type="text"
                placeholder="Collection Title"
                value={newCollectionTitle}
                onChange={e => setNewCollectionTitle(e.target.value)}
                className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
              />
              <Button
                type="button"
                loading={creatingCollectionLoading}
                disabled={creatingCollectionLoading}
                onClick={handleQuickCreateCollection}
                label={creatingCollectionLoading ? 'Saving' : 'Create'}>
              </Button>
              <Button
                type="button"
                disabled={creatingCollectionLoading}
                onClick={() => { setIsCreatingCollection(!isCreatingCollection) }}
                label="Cancel"
              >
              </Button>
            </div>
          )}

          <div>
            <label className="text-[11px] block mb-1">Product Type</label>
            <div className='flex flex-row gap-2'>
              {!isAddingNewType ? (
                <select 
                  value={form.type || ''}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
                >
                  <option value="">Select Product Type</option>
                  {availableTypes.map((t, index) => (
                    <option key={index} value={t?.type || t}>{t?.type || t}</option>
                  ))}
                </select>
              ) : (
                <input 
                  maxLength={35}
                  type="text" 
                  placeholder="Type custom product type (e.g. accessory)..." 
                  value={form.type || ''}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  required
                  className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
                />
              )}
            
              <button 
                type="button"
                className='bg-vercel-primary text-vercel-black rounded-md text-xs font-bold text-nowrap px-3 flex gap-1 items-center justify-center cursor-pointer' 
                onClick={() => {
                  setIsAddingNewType(!isAddingNewType);
                  setForm({ ...form, type: '' });
                }} 
              >
                {!isAddingNewType && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                )}
                {isAddingNewType ? 'Select from List' : 'New Type'}
              </button>
            </div>
          </div>
        </div>

        {/* Taxes and Inventory Management */}
        <p className='text-xs font-semibold text-zinc-300'>Taxes and Inventory Management</p>
        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md space-y-2'>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] block mb-1">HSN Code</label>
              <input
                maxLength={10}
                placeholder="e.g. 8517"
                value={form.hsn}
                onChange={e => setForm({ ...form, hsn: e.target.value })}
                className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] block mb-1">Quantity</label>
              <input
                max={500}
                type="number"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                required
                className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] block mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                required
                className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
              >
                <option value="">Select status</option>
                {[
                  { label: "Active", value: "active" },
                  { label: "Draft", value: "draft" },
                  { label: "Archived", value: "archived" },
                ].map(col => (
                  <option key={col.value} value={col.value}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Price, Discounts and Rates */}
        <p className='text-xs font-semibold text-zinc-300'>Price, Discounts and Rates</p>
        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md'>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="text-[11px] block mb-1">MRP (₹)</label>
              <input
                maxLength={6}
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                required
                className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] block mb-1">Original Price</label>
              <input
                maxLength={6}
                type="number"
                value={form.orignalPrice}
                onChange={e => setForm({ ...form, orignalPrice: e.target.value })}
                className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] block mb-1">Base Rate</label>
              <input
                maxLength={6}
                type="number"
                value={form.baseRate}
                onChange={e => setForm({ ...form, baseRate: e.target.value })}
                required
                className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] block mb-1">Profit</label>
              <input
                value={calculateProfit()}
                disabled
                className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-zinc-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* SEO Management */}
        <p className='text-xs font-semibold text-zinc-300'>SEO Management</p>
        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md space-y-2'>
          <div>
            <label className="text-[11px] block mb-1">Slug URL Parameter</label>
            <input
              placeholder="e.g. iphone-oled-panel"
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
              className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
            />
          </div>  
          <div>
            <label className="text-[11px] block mb-1">SEO Meta Description</label>
            <input
              placeholder="e.g. Meta description summary"
              value={form.seoMetaDescription}
              onChange={e => setForm({ ...form, seoMetaDescription: e.target.value })}
              className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
            />
          </div>  
          <div>
            <label className="text-[11px] block mb-1">SEO Keywords</label>
            <input
              placeholder="e.g. iphone, oled, display"
              value={form.seoKeywords}
              onChange={e => setForm({ ...form, seoKeywords: e.target.value })}
              className="w-full bg-vercel-surface border-1 border-zinc-800 rounded p-1.5 text-xs text-white"
            />
          </div>  
        </div>
      </div>
    </form>
  );
};

export default ProductDetails;