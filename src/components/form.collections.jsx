import React, { useState } from 'react';
import Button from './button';

const CollectionDetails = ({
  form,
  setForm,
  editId,
  handleSave,
  promptDeleteCollection,
  loading,
}) => {
  const [tempImageUrl, setTempImageUrl] = useState(form.image || '');

  const handleUpdateImage = () => {
    if (!tempImageUrl.trim()) return;
    setForm({ ...form, image: tempImageUrl.trim() });
  };

  const handleRemoveImage = () => {
    setForm({ ...form, image: '' });
    setTempImageUrl('');
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col h-full w-full overflow-x-hidden px-3 py-6">
      <div className='flex flex-row justify-between items-center border-b border-zinc-800 pb-3'>
        <h3 className="text-sm font-medium text-vercel-primary line-clamp-2 w-2/4">
          {editId ? (
            <>Edit Mode: <span className='text-vercel-secondary'>{form.title || 'Collection'}</span></>
          ) : (
            'Add New Collection'
          )}
        </h3>
        <div className="flex gap-2">
          <Button
            disabled={loading}
            loading={loading}            
            buttontype="submit"
            label={editId ? (loading ? "Updating" : 'Update') : (loading ? "Saving" : "Save")}
          />
          {editId && (
            <Button
              type='danger'
              onClick={() => promptDeleteCollection()}
              label="Delete"
            />
          )}
        </div>
      </div>

      <div className="mt-3 h-screen bg-vercel-surface rounded-md border-1 border-zinc-800 px-2 py-2 overflow-y-auto space-y-2 custom-scrollbar max-h-[calc(100vh-20%)]">
        
        {/* Collection Overview */}
        <p className='text-xs font-semibold text-zinc-300'>Collection Overview</p>
        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md space-y-2'>
          <div>
            <label >ERP Collection ID</label>
            <input
              maxLength={50}
              placeholder="e.g. ERP-COL-001"
              value={form.erpCollectionId}
              onChange={e => setForm({ ...form, erpCollectionId: e.target.value })}
              required
              
            />
          </div>
          <div>
            <label >Collection Title</label>
            <input
              maxLength={100}
              placeholder="e.g. iPhone Replacement Parts"
              value={form.title}
              onChange={e => {
                const titleVal = e.target.value;
                const autoSlug = titleVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                setForm({ 
                  ...form, 
                  title: titleVal, 
                  slug: autoSlug,
                  metaTitle: titleVal 
                });
              }}
              required
              
            />
          </div>
        </div>

        {/* Collection Image */}
        <p className='text-xs font-semibold text-zinc-300'>Collection Banner Image</p>
        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md space-y-2'>
          <label >Image URL</label>
          <div className='flex flex-row justify-between gap-2'>
            <input
              placeholder="https://example.com/collection-banner.jpg"
              value={tempImageUrl}
              onChange={e => setTempImageUrl(e.target.value)}
              
            />
            <Button
              type="button"
              onClick={handleUpdateImage}
              icon={
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              }
              label="Apply"
            />
          </div>

          {form.image && (
            <div className="border-1 border-zinc-800 rounded-md relative p-2 w-fit mt-2">
              <button 
                type="button" 
                onClick={handleRemoveImage} 
                className="text-zinc-400 text-lg font-bold absolute top-0 right-2 m-0 p-0 cursor-pointer"
              >
                &times;
              </button>
              <img src={form.image} alt="Collection Preview" className="w-32 h-20 object-cover rounded-md bg-zinc-950" />
            </div>
          )}
        </div>

        {/* SEO Management */}
        <p className='text-xs font-semibold text-zinc-300'>SEO Management</p>
        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md space-y-2'>
          <div>
            <label >Slug URL Parameter</label>
            <input
              placeholder="e.g. iphone-replacement-parts"
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
              required
              
            />
          </div>  
          <div>
            <label >SEO Meta Title</label>
            <input
              placeholder="e.g. Shop iPhone Replacement Parts Online"
              value={form.metaTitle}
              onChange={e => setForm({ ...form, metaTitle: e.target.value })}
              
            />
          </div>  
          <div>
            <label >SEO Meta Description</label>
            <textarea
              rows={3}
              placeholder="e.g. Explore our wide range of premium quality iPhone replacement parts..."
              value={form.metaDescription}
              onChange={e => setForm({ ...form, metaDescription: e.target.value })}
              
            />
          </div>  
        </div>

      </div>
    </form>
  );
};

export default CollectionDetails;