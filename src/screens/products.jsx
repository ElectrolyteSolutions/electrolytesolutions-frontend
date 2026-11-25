import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../features/productSlice';
import ResizablePanes from '../components/table.extralarge';
import Header from '../components/SearchHeader';
import Button from '../components/button';
import GlobalTable from '../components/table.large';
import ProductDetails from '../components/form.product';
import ConfirmModal from '../components/modal.prompt';
import { useToast } from '../context/ToastContext';
import Badge from '../components/badge';

const DRAFT_STORAGE_KEY = 'productDraftData';

const statusOptions = [
  { value: 'all', label: 'All Products' },
  { value: 'low-stock', label: 'Out of Stock Only' }
];

const createEmptyForm = (itemsCount = 0) => ({
  erpProductId: `ERP${String(itemsCount).padStart(4, '0')}`,
  images: [],
  collections: [],
  slug: '',
  name: '',
  description: '',
  brand: '',
  price: '',
  orignalPrice: '',
  baseRate: '',
  quantity: 1,
  seoMetaDescription: '',
  seoKeywords: '',
  hsn: '',
  status: 'draft',
  type: '',
  isCustomType: false,
  poster: ''
});

const readDraftFromStorage = (itemsCount = 0) => {
  try {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!saved) return createEmptyForm(itemsCount);
    const parsed = JSON.parse(saved);
    return { ...createEmptyForm(itemsCount), ...parsed };
  } catch (err) {
    console.error('Failed to read draft from localStorage:', err);
    return createEmptyForm(itemsCount);
  }
};

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { items, status, error } = useSelector((state) => state.products);
  const { addToast } = useToast();
  const [details, setDetails] = useState([]);

  const { user } = useSelector((state) => state.auth);
  const isCustomer = user?.role === 'customer';

  const [selectedProduct, setSelectedProduct] = useState(undefined);
  const [editId, setEditId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [availableCollections, setAvailableCollections] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);

  const [form, setForm] = useState(() => readDraftFromStorage(0));

  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState(statusOptions[0]);
  const [currentSortBy, setCurrentSortBy] = useState('name');
  const [currentSortOrder, setCurrentSortOrder] = useState('asc');

  // Inline Collection Creator State
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [newCollectionErpId, setNewCollectionErpId] = useState('');
  const [creatingCollectionLoading, setCreatingCollectionLoading] = useState(false);

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    setDetails((prevDetails) => {
      const updatedDetails = [...prevDetails];
      updatedDetails[index] = {
        ...updatedDetails[index],
        [name]: value
      };
      return updatedDetails;
    });
  };

  const refreshDataLogs = useCallback(() => {
    dispatch(
      getProducts({
        search: searchTerm,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
        ...(stockFilter.value === 'low-stock' && { alert: 'low-stock' })
      })
    );
  }, [dispatch, searchTerm, currentSortBy, currentSortOrder, stockFilter]);

  const fetchLookups = useCallback(async () => {
    try {
      const colRes = await fetch(`${import.meta.env.VITE_API_URL}products/collections`);
      const colData = await colRes.json();
      setAvailableCollections(Array.isArray(colData) ? colData : []);

      const typeRes = await fetch(`${import.meta.env.VITE_API_URL}products/types`);
      const typeData = await typeRes.json();
      setAvailableTypes(Array.isArray(typeData) ? typeData : []);
    } catch (err) {
      console.error('Failed to load metadata lookups', err);
      addToast('Failed to load metadata lookups', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    refreshDataLogs();
    fetchLookups();
  }, [searchTerm]);

  // Persist "Add New" draft to localStorage (debounced)
  useEffect(() => {
    if (!isAddingNew || editId) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ form, details })
        );
      } catch (err) {
        console.error('Failed to save draft to localStorage:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [form, details, isAddingNew, editId]);

  const handleQuickCreateCollection = async () => {
    if (!newCollectionTitle.trim()) return;
    setCreatingCollectionLoading(true);
    try {
      const generatedErpId =
        newCollectionErpId.trim() || `ERP-COL-${Date.now().toString().slice(-6)}`;
      const token = localStorage.getItem('token') || '';

      const res = await fetch(`${import.meta.env.VITE_API_URL}products/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          erpCollectionId: generatedErpId,
          title: newCollectionTitle.trim(),
          seo: {
            metaTitle: newCollectionTitle.trim(),
            metaDescription: `Shop ${newCollectionTitle.trim()}`
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        await fetchLookups();
        const createdId = data._id || data.collection?._id;
        if (createdId) {
          setForm((prev) => ({ ...prev, collections: [createdId] }));
        }
        setNewCollectionTitle('');
        setNewCollectionErpId('');
        setIsCreatingCollection(false);
        addToast('Collection created successfully!', 'success');
      } else {
        addToast(data.error || 'Failed to create collection', 'error');
      }
    } catch (err) {
      console.error('Error saving inline collection:', err);
      addToast('Network error while creating collection.', 'error');
    } finally {
      setCreatingCollectionLoading(false);
    }
  };

  const handleSortToggle = (targetField) => {
    if (currentSortBy === targetField) {
      setCurrentSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setCurrentSortBy(targetField);
      setCurrentSortOrder('asc');
    }
  };

  const handleSelectProduct = (product) => {
    setIsAddingNew(false);
    setSelectedProduct(product);
    setForm({
      erpProductId: product.erpProductId || `ERP${String(items?.length || 0).padStart(4, '0')}`,
      slug: product.slug || '',
      name: product.name || '',
      description: product.description || '',
      brand: product.brand || '',
      price: product.price || '',
      orignalPrice: product.orignalPrice || '',
      baseRate: product.baseRate || '',
      quantity: product.quantity || '',
      collections: product.collections ? product.collections.map((c) => c._id || c) : [],
      seoMetaDescription: product.seo?.metaDescription || '',
      seoKeywords: product.seo?.keywords ? product.seo.keywords.join(', ') : '',
      images: product?.images && product.images.length > 0 ? [...product.images] : [],
      hsn: product.hsn || '',
      status: product.status || 'active',
      type: product.type || '',
      isCustomType: false,
      poster: product?.poster || product?.images?.[0] || null
    });
    setDetails(product.details && product.details.length > 0 ? product.details : []);
    setEditId(product._id);
  };

  const handleAddNewClick = () => {
    setIsAddingNew(true);
    setSelectedProduct(null);
    setEditId(null);

    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Support both { form, details } and legacy flat form object
        if (parsed && typeof parsed === 'object' && 'form' in parsed) {
          setForm({ ...createEmptyForm(items?.length || 0), ...parsed.form });
          setDetails(Array.isArray(parsed.details) ? parsed.details : []);
          return;
        }
        setForm({ ...createEmptyForm(items?.length || 0), ...parsed });
        setDetails([]);
        return;
      }
    } catch (err) {
      console.error('Error loading saved new-product draft:', err);
    }

    setForm(createEmptyForm(items?.length || 0));
    setDetails([]);
  };

  const handleResetForm = () => {
    const freshForm = createEmptyForm(items?.length || 0);
    setForm(freshForm);
    setDetails([]);

    if (isAddingNew && !editId) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      addToast('New product draft cleared.', 'info');
    } else if (editId && selectedProduct) {
      handleSelectProduct(selectedProduct);
      addToast('Form reset to saved product values.', 'info');
    } else {
      addToast('Form cleared.', 'info');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { isCustomType, ...cleanForm } = form;
      const payload = {
        ...cleanForm,
        details,
        seo: {
          metaTitle: form.name,
          metaDescription: form.seoMetaDescription,
          keywords: form.seoKeywords
            ? form.seoKeywords
                .split(',')
                .map((k) => k.trim())
                .filter(Boolean)
            : []
        }
      };

      if (editId) {
        await dispatch(updateProduct({ id: editId, data: payload })).unwrap();
        addToast('Product updated successfully!', 'success');
        refreshDataLogs();
      } else {
        await dispatch(addProduct(payload)).unwrap();
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setForm(createEmptyForm((items?.length || 0) + 1));
        setDetails([]);
        setIsAddingNew(false);
        addToast('Product created successfully!', 'success');
        refreshDataLogs();
      }
    } catch (err) {
      addToast(err?.message || error || 'Failed to save product.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const promptDeleteProduct = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteProduct(productToDelete._id)).unwrap();
      addToast(`Deleted "${productToDelete.name}" successfully.`, 'success');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      if (editId === productToDelete._id) {
        setSelectedProduct(undefined);
        setEditId(null);
      }
      refreshDataLogs();
    } catch (err) {
      addToast(err?.message || error || 'Failed to delete product record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const productsTableHead = [
    { label: '#', value: 'sno', class: 'txt-xs px-3 py-2 w-4 max-w-4 min-w-4', onClick: () => {} },
    { label: 'Image', value: 'sno', class: 'txt-xs px-3 py-2 w-4 max-w-4 min-w-4', onClick: () => {} },
    {
      label: 'Product Name',
      value: 'name',
      class: 'txt-xs px-3 py-2 w-28 min-w-28 max-w-28 cursor-pointer',
      onClick: () => handleSortToggle('name')
    },
    {
      label: 'MRP',
      value: 'price',
      class: 'txt-xs px-3 py-2 w-12 max-w-12 min-w-12 cursor-pointer',
      onClick: () => handleSortToggle('price')
    },
    {
      label: 'Stock',
      value: 'quantity',
      class: 'txt-xs px-3 py-2 w-4 max-w-4 min-w-4 cursor-pointer',
      onClick: () => handleSortToggle('quantity')
    },
    {
      label: 'Status',
      value: 'status',
      class: 'txt-xs px-3 py-2 w-9 max-w-9 min-w-9 cursor-pointer',
      onClick: () => handleSortToggle('status')
    },
    {
      label: 'Product Type',
      value: 'type',
      class: 'txt-xs px-3 py-2 w-12 max-w-12 min-w-12 cursor-pointer',
      onClick: () => handleSortToggle('type')
    },
    { label: 'Category', value: 'collection', class: 'txt-xs px-3 py-2 w-12 max-w-12 min-w-12', onClick: () => {} },
    { label: 'HSN', value: 'hsn', class: 'txt-xs px-3 py-2 w-12 max-w-12 min-w-12', onClick: () => {} }
  ];

  function productsTableData(p) {
    return [
      { label: '#', value: p.sno || '', class: 'txt-xs pl-3 pr-0 py-2 rounded-l-md w-4 max-w-4 min-w-4' },
      { label: '#', value: <img className='rounded-md h-4 w-4' src={p.poster || p.images?.[0]}></img>, class: 'txt-xs px-0 py-2 rounded-l-md w-2 max-w-2 min-w-2' },
      {
        label: 'Product Name',
        value: (
          <div>
            <div className="font-medium">{p.name}</div>
            {p.sku && <div className="txt-ten text-zinc-500">SKU: {p.sku}</div>}
          </div>
        ),
        class: 'txt-xs px-3 py-2 w-28 min-w-28 max-w-28'
      },
      { label: 'MRP', value: `${Number(p.price || 0).toFixed(2)}`, class: 'txt-xs px-3 py-2 w-12 max-w-12 min-w-12' },
      {
        label: 'Stock',
        value: (
          <span
            className={`font-bold font-mono ${
              p.quantity <= 0 ? 'text-red-400' : p.quantity < 10 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {p.quantity}
          </span>
        ),
        class: 'txt-xs px-3 py-2 w-4 max-w-4 min-w-4'
      },
      {
        label: 'Status',
        value: <Badge title={p.status} type={p.status === 'active' ? 'dark' : 'light'} />,
        class: 'txt-xs px-3 py-2 w-8 max-w-8 min-w-8'
      },
      { label: 'Type', value: p.type, class: 'txt-xs px-3 py-2 w-12 max-w-12 min-w-12' },
      {
        label: 'Category',
        value: p?.collections?.map((col) => col.title).join(','),
        class: 'txt-xs px-3 py-2 w-12 max-w-12 min-w-12'
      },
      { label: 'HSN', value: p.hsn, class: 'txt-xs px-3 py-2 w-12 max-w-12 min-w-12' }
    ];
  }

  const leftPaneContent = (
    <div className="p-6 w-full h-full flex flex-col pr-1">
      <div className="flex flex-row gap-3 h-fit">
        <Header
          loading={Boolean(searchTerm && status === 'loading')}
          placeholder="Search Product by Name, SKU, ID, Description..."
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={[stockFilter.label]}
          setStatusFilter={[setStockFilter]}
          statusOptions={[statusOptions]}
          extra={
            !isAddingNew && (
              <Button
                onClick={handleAddNewClick}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                }
                label="Add New"
              />
            )
          }
        />
      </div>

      <GlobalTable
        title="Products Inventory"
        tableHead={productsTableHead}
        filteredList={(items || []).map((p, idx) => ({ ...p, sno: idx + 1 }))}
        status={status === 'loading' && items.length === 0 ? 'loading' : undefined}
        selectedItem={selectedProduct}
        setSelectedItem={handleSelectProduct}
        tableData={productsTableData}
      />
    </div>
  );

  return (
    <>
      <ResizablePanes
        animationKey={editId || (isAddingNew ? 'new-product' : 'empty')}
        leftPane={leftPaneContent}
        rightPane={
          selectedProduct !== undefined || isAddingNew ? (
              

              <div className="flex-1 overflow-y-auto">
                <ProductDetails
                  setDetails={setDetails}
                  isAddingNew={isAddingNew}
                  loading={loading}
                  handleInputChange={handleInputChange}
                  form={form}
                  details={details}
                  setForm={setForm}
                  editId={editId}
                  handleSave={handleSave}
                  handleReset={handleResetForm}
                  onReset={handleResetForm}
                  availableCollections={availableCollections}
                  availableTypes={availableTypes}
                  isCreatingCollection={isCreatingCollection}
                  setIsCreatingCollection={setIsCreatingCollection}
                  newCollectionTitle={newCollectionTitle}
                  setNewCollectionTitle={setNewCollectionTitle}
                  newCollectionErpId={newCollectionErpId}
                  setNewCollectionErpId={setNewCollectionErpId}
                  creatingCollectionLoading={creatingCollectionLoading}
                  handleQuickCreateCollection={handleQuickCreateCollection}
                  promptDeleteProduct={() => promptDeleteProduct(selectedProduct)}
                  isCustomer={isCustomer}
                />
              </div>
          ) : null
        }
        defaultLeftWidth="68%"
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Delete "${productToDelete?.name || 'Product'}"?`}
        description="This action cannot be undone. This will permanently remove the product record from your active ERP ledger database."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ProductsPage;