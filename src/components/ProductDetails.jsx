import React, { useState } from 'react';
import Button from './Button';

const ProductDetails = ({
  form,
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
  promptDeleteProduct
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

  return <form onSubmit={handleSave} className="overflow-hidden">
    <div className='d-flex flex-row justify-between align-items-center border-b-1 border-zinc-800 pb-3'>
      <h3 className="text-sm font-medium text-vercel-primary line-clamp-2 w-2/4">
        {editId ? (
          <>Edit Mode: <span className='text-vercel-secondary'>{form.name || 'Product'}</span></>
        ) : (
          'Add New Product'
        )}
      </h3>
      <button
        type="submit"
        className="w-fit bg-white hover:opacity-50 text-black px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
      >
        {editId ? 'Updated Changes' : 'Save Product'}
      </button>
      {editId && <button
      type='button'
      onClick={()=>promptDeleteProduct()}
        className="w-fit bg-red-500 hover:opacity-50 text-white px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
      >
        Delete Product
      </button>}
    </div>

    <div className="mt-3 h-screen bg-vercel-surface rounded-md border-1 border-zinc-800 px-2 py-2 overflow-y-auto space-y-2 custom-scrollbar max-h-[calc(100vh-20%)]">
        {/* Product Overview */}
        <p className='text-xs'>Product Overview</p>
        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md'>
        <div>
          <label>Product Name</label>
          <textarea maxLength={250} rows={1} placeholder="e.g. iPhone OLED Panel"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Brand</label>
          <input
            maxLength={50}
            placeholder="e.g. Apple"
            value={form.brand}
            onChange={e => setForm({ ...form, brand: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Product Description */}

        <p className='text-xs'>Product Description</p>
      <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md'>
        <label >Product Images (Add Image URLs)</label>
        <div className='d-flex flex-row justfy-between gap-2'>
          <input
            placeholder="https://example.com/image.jpg"
            value={tempImageUrl}
            onChange={e => setTempImageUrl(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="bg-white w-fit d-flex items-center justify-center text-black hover:bg-zinc-200 px-3 text-nowrap py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
             Add URL
          </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {form.images.map((url, index) => (
              <div key={index} className="border-1 border-zinc-800 rounded-md relative p-2">
                <button type="button" onClick={() => handleRemoveImage(index)} className="text-zinc-400 text-lg font-bold absolute top-0 right-2 m-0 p-0">&times;</button>
                <img src={url} alt={`Preview ${index}`} className="w-24 h-24 object-cover rounded-md bg-zinc-950" />
              </div>
            ))}
          </div>
    
        <div>
          <label >Full Description</label>
          <textarea
            maxLength={2000}
            rows={8}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Product Type and Category */}

      <p className='text-xs font-semibold text-zinc-300'>Product Type and Category</p>
      <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md space-y-2'>
        <label className="text-[11px] mb-0 pb-0">Product Category</label>
        {!isCreatingCollection ? (
          <div className='d-flex gap-3'>
            <select
              value={form.collections[0] || ''}
              onChange={e => setForm({ ...form, collections: [e.target.value] })}
              required
            >
              <option value="">Select Category Collection</option>
              {availableCollections.map(col => (
                <option key={col._id} value={col._id}>{col.title}</option>
              ))}
            </select>
            <button className='bg-vercel-primary text-vercel-black rounded-md text-xs font-bold text-nowrap px-3 flex gap-1 items-center justify-center' onClick={() => { setIsCreatingCollection(!isCreatingCollection) }} >
              {!isCreatingCollection && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>}
              {isCreatingCollection ? 'Cancel' : 'New Collection'}
            </button>
          </div>
        ) : (
          <div className="d-flex">
            <input
              maxLength={40}
              type="text"
              placeholder="Collection Title"
              value={newCollectionTitle}
              onChange={e => setNewCollectionTitle(e.target.value)}
              className="w-full"
            />


            <button
              type="button"
              disabled={creatingCollectionLoading}
              onClick={() => {
                handleQuickCreateCollection()
                // Quick Collection handler if needed
              }}
              className="w-fit ml-2 bg-white text-nowrap px-3 text-black rounded py-1.5 text-xs font-bold transition-all cursor-pointer"
            >
              {creatingCollectionLoading ? 'Saving...' : 'Create'}
            </button>
            <button
              type="button"
              disabled={creatingCollectionLoading}
              onClick={() => { setIsCreatingCollection(!isCreatingCollection) }}
              className="w-fit ml-2 bg-white text-nowrap px-3 text-black rounded py-1.5 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

          


        <div className="">
          <label className="text-[11px] ">Product Type</label>
          <div className='d-flex flex-row gap-2'>
            
          {!isAddingNewType ? (
            <select 
              value={form.type || ''}
              onChange={e => setForm({ ...form, type: e.target.value })}
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
            />
          )}
          
            <button className='bg-vercel-primary text-vercel-black rounded-md text-xs font-bold text-nowrap px-3 flex gap-1 items-center justify-center' onClick={() => {
                setIsAddingNewType(!isAddingNewType);
                setForm({ ...form, type: '' }); // Reset type on toggle
              }} >{!isAddingNewType && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>}
                {isAddingNewType ? 'Select from List' : 'New Type'}
              </button>
              </div>
        </div>





      </div>

        <p className='text-xs font-semibold text-zinc-300'>Taxes and Inventory Mangement </p>
      <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md '>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label>HSN Code</label>
            <input
              maxLength={10}
              placeholder="e.g. 8517"
              value={form.hsn}
              onChange={e => setForm({ ...form, hsn: e.target.value })}
            />
          </div>
          <div>
            <label >Quantity</label>
            <input
              max={500}
              type="number"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </div>
          <div>
            <label >Status</label>
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              required
            >
              <option value=""></option>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          
          
        </div>
        </div>
        

        <p className='text-xs font-semibold text-zinc-300'>Price ,Discounts and Rates</p>
      <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md '>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <label >MRP (₹)</label>
            <input

              maxLength={6}
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label >Original Price</label>
            <input
              maxLength={6}
              type="number"
              value={form.orignalPrice}
              onChange={e => setForm({ ...form, orignalPrice: e.target.value })}
            />
          </div>
          <div>
            <label >Base Rate</label>
            <input
              maxLength={6}
              type="number"
              value={form.baseRate}
              onChange={e => setForm({ ...form, baseRate: e.target.value })}
              required
            />
          </div>
          <div>
            <label >Profit</label>
            <input
              value={`${((form.baseRate / form.price) * 100).toFixed(2)}%`}
              disabled
            />
          </div>
          
        </div>
      </div>

      <p className='text-xs font-semibold text-zinc-300'>SEO Management</p>
      <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md '>
          <div>
            <label >Slug URL Parameter</label>
            <input
              placeholder="e.g. iphone-oled-panel"
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
            />
          </div>  
          <div>
            <label >SEO Meta Description</label>
            <input
              placeholder="e.g. iphone-oled-panel"
              value={form.seoMetaDescription}
              onChange={e => setForm({ ...form, seoMetaDescription: e.target.value })}
            />
          </div>  
          <div>
            <label >SEO Keywords</label>
            <input
              placeholder="e.g. iphone-oled-panel"
              value={form.seoKeywords}
              onChange={e => setForm({ ...form, seoKeywords: e.target.value })}
            />
          </div>  

       
      </div>
      </div>




  </form>

};

export default ProductDetails;