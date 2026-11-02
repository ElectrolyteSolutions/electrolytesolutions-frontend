import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCollections, addCollection, updateCollection, deleteCollection } from '../features/collectionSlice';
import ResizablePanes from '../components/table.extralarge';
import Header from '../components/SearchHeader';
import Button from '../components/button';
import GlobalTable from '../components/table.large';
import CollectionDetails from '../components/form.collections';
import ConfirmModal from '../components/modal.prompt';
import { useToast } from '../context/ToastContext';

const statusOptions = [
  { value: "all", label: "All Collections" }
];

const CollectionsPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { collections: items, status, error } = useSelector((state) => state.collections);
  const { addToast } = useToast();
  
  const { user } = useSelector((state) => state.auth || {});
  const isCustomer = user?.role === 'customer';

  const [selectedCollection, setSelectedCollection] = useState(undefined); 
  const [editId, setEditId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false); 
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({ 
    erpCollectionId: '',
    title: '',
    slug: '',
    image: '',
    metaTitle: '',
    metaDescription: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]); 
  const [currentSortBy, setCurrentSortBy] = useState('title'); 
  const [currentSortOrder, setCurrentSortOrder] = useState('asc'); 

  useEffect(() => {
    dispatch(getCollections({
      search: searchTerm,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
    }));
  }, [dispatch, searchTerm, currentSortBy, currentSortOrder]);

  const handleSortToggle = (targetField) => {
    if (currentSortBy === targetField) {
      setCurrentSortOrder(currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setCurrentSortBy(targetField);
      setCurrentSortOrder('asc');
    }
  };

  const handleSelectCollection = (collection) => {
    setIsAddingNew(false);
    setSelectedCollection(collection);
    setForm({
      erpCollectionId: collection.erpCollectionId || '',
      title: collection.title || '',
      slug: collection.slug || '',
      image: collection.image || '',
      metaTitle: collection.seo?.metaTitle || '',
      metaDescription: collection.seo?.metaDescription || ''
    });
    setEditId(collection._id);
  };

  const handleAddNewClick = () => {
    setIsAddingNew(true);
    setSelectedCollection(null);
    setForm({ 
      erpCollectionId: `ERP-COL-${Date.now().toString().slice(-6)}`,
      title: '',
      slug: '',
      image: '',
      metaTitle: '',
      metaDescription: ''
    });
    setEditId(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      erpCollectionId: form.erpCollectionId,
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      image: form.image,
      seo: {
        metaTitle: form.metaTitle || form.title,
        metaDescription: form.metaDescription
      }
    };

    if (editId) {
      dispatch(updateCollection({ id: editId, updateData: payload }))
        .unwrap()
        .then(() => {
          addToast("Collection updated successfully!", "success");
          refreshDataLogs();
          setLoading(false);
        })
        .catch((err) => {
          addToast(err?.message || error || "Failed to update collection.", "error");
          setLoading(false);
        });
    } else {
      dispatch(addCollection(payload))
        .unwrap()
        .then(() => {
          addToast("Collection created successfully!", "success");
          refreshDataLogs();
          setIsAddingNew(false);
          setLoading(false);
        })
        .catch((err) => {
          addToast(err?.message || error || "Failed to create collection.", "error");
          setLoading(false);
        });
    }
  };

  const promptDeleteCollection = (collection) => {
    setCollectionToDelete(collection);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!collectionToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteCollection(collectionToDelete._id)).unwrap();
      addToast(`Deleted "${collectionToDelete.title}" successfully.`, "success");
      setIsDeleteModalOpen(false);
      setCollectionToDelete(null);
      if (editId === collectionToDelete._id) {
        setSelectedCollection(undefined);
        setEditId(null);
      }
      refreshDataLogs();
    } catch (err) {
      addToast(error || "Failed to delete collection record.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const refreshDataLogs = () => {
    dispatch(getCollections({
      search: searchTerm,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
    }));
  };

  const collectionsTableHead = [
    { label: '#', value: 'sno', class: "text-xs px-3 py-2 w-4 max-w-4 min-w-4", onClick: ()=>{} },
    { label: 'ERP ID', value: 'erpCollectionId', class: "text-xs px-3 py-2 w-24 min-w-24 max-w-24", onClick: ()=>{} },
    { label: 'Collection Title', value: 'title', class: "text-xs px-3 py-2 w-36 min-w-36 max-w-36 cursor-pointer", onClick: () => handleSortToggle('title') },
    { label: 'Slug URL', value: 'slug', class: "text-xs px-3 py-2 w-32 min-w-32 max-w-32", onClick: ()=>{} },
    { label: 'SEO Meta Title', value: 'metaTitle', class: "text-xs px-3 py-2 w-40 min-w-40 max-w-40", onClick: ()=>{} },
  ];

  function collectionsTableData(c) {
    return [
      { label: '#', value: c.sno || '', class: "text-xs pl-3 pr-0 py-2 rounded-l-md w-4 max-w-4 min-w-4" },
      { label: 'ERP ID', value: <span className="font-mono text-[11px] text-zinc-400">{c.erpCollectionId}</span>, class: "text-xs px-3 py-2 w-24 min-w-24 max-w-24" },
      { label: 'Collection Title', value: (
          <div className="flex items-center gap-2">
            {c.image && <img src={c.image} alt="" className="w-6 h-6 object-cover rounded bg-zinc-900" />}
            <div className="font-medium truncate">{c.title}</div>
          </div>
        ), 
        class: "text-xs px-3 py-2 w-36 min-w-36 max-w-36" 
      },
      { label: 'Slug URL', value: <span className="font-mono text-[11px] text-zinc-400 truncate">/{c.slug}</span>, class: "text-xs px-3 py-2 w-32 min-w-32 max-w-32" },
      { label: 'SEO Meta Title', value: <span className="truncate text-zinc-300">{c.seo?.metaTitle || '-'}</span>, class: "text-xs px-3 py-2 w-40 min-w-40 max-w-40" },
    ];
  }

  const leftPaneContent = (
    <div className="p-6 w-full h-full flex flex-col pr-1">
      <div className='flex flex-row gap-3 h-fit'>
        <Header 
          placeholder="Search Collection by Title, Slug, ERP ID..."
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          statusFilter={[statusFilter.label]}
          setStatusFilter={[setStatusFilter]}
          statusOptions={[statusOptions]}
        />
        {!isCustomer && !isAddingNew && (
          <Button 
            onClick={handleAddNewClick} 
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            } 
            label="Add New" 
          />
        )}
      </div>

      <GlobalTable
        title="Collections Directory"
        tableHead={collectionsTableHead}
        filteredList={(items || []).filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map((c, idx) => ({ ...c, sno: idx + 1 }))}
        status={status}
        selectedItem={selectedCollection}
        setSelectedItem={handleSelectCollection}
        tableData={collectionsTableData}
      />
    </div>
  );

  return (
    <>
      <ResizablePanes
        animationKey={editId || (isAddingNew ? 'new-collection' : 'empty')}
        leftPane={leftPaneContent}
        rightPane={
          (selectedCollection !== undefined || isAddingNew) ? (
            <CollectionDetails
              loading={loading}
              form={form}
              setForm={setForm}
              editId={editId}
              handleSave={handleSave}
              promptDeleteCollection={() => promptDeleteCollection(selectedCollection)}
            />
          ) : null
        }
        defaultLeftWidth="68%"
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Delete "${collectionToDelete?.title || 'Collection'}"?`}
        description="This action cannot be undone. This will permanently remove the collection record from your active ERP ledger database."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default CollectionsPage;