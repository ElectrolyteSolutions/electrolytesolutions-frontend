import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, addProduct, updateProduct } from '../features/productSlice';
import ResizablePanes from '../components/TwoPaneLayout';
import Header from '../components/SearchHeader';
import Button from '../components/Button';
import GlobalTable from '../components/GlobalTable';
import ProductDetails from '../components/ProductDetails';

const statusOptions = [
  { value: "all", label: "All Products" },
  { value: "low-stock", label: "Out of Stock Only" }
];

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.products);
  
  const { user } = useSelector((state) => state.auth);
  const isCustomer = user?.role === 'customer';

  const [selectedProduct, setSelectedProduct] = useState(undefined); // undefined = nothing selected initially
  const [editId, setEditId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false); // Track if we are in Add New mode
  
  const [availableCollections, setAvailableCollections] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);

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

  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState(statusOptions[0]); 
  const [currentSortBy, setCurrentSortBy] = useState('name'); 
  const [currentSortOrder, setCurrentSortOrder] = useState('asc'); 

  useEffect(() => {
    const payloadQueryOptions = {
      search: searchTerm,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
      ...(stockFilter.value === 'low-stock' && { alert: 'low-stock' })
    };

    dispatch(getProducts(payloadQueryOptions));
    fetchLookups();
  }, [dispatch, searchTerm, stockFilter, currentSortBy, currentSortOrder]);

  const fetchLookups = async () => {
    try {
      const colRes = await fetch(`${import.meta.env.VITE_API_URL}products/collections`);
      const colData = await colRes.json();
      setAvailableCollections(colData);

      const typeRes = await fetch(`${import.meta.env.VITE_API_URL}products/types`);
      const typeData = await typeRes.json();
      setAvailableTypes(typeData);
    } catch (err) {
      console.error("Failed to load metadata lookups", err);
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

  const handleSelectProduct = (product) => {
    setIsAddingNew(false); // Exit add mode when clicking a product
    setSelectedProduct(product);
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
  };

  const handleAddNewClick = () => {
    setIsAddingNew(true); // Enable add new mode
    setSelectedProduct(null); // Clear selected product so right pane renders
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
  };

  const handleSave = (e) => {
    e.preventDefault();
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
      dispatch(updateProduct({ id: editId, data: payload })).then(() => refreshDataLogs());
    } else {
      dispatch(addProduct(payload)).then(() => {
        refreshDataLogs();
        setIsAddingNew(false); // Hide right pane / reset after successful creation
      });
    }
  };

  const refreshDataLogs = () => {
    dispatch(getProducts({
      search: searchTerm,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
      ...(stockFilter.value === 'low-stock' && { alert: 'low-stock' })
    }));
  };

  const productsTableHead = [
    { label: '#', value: 'sno', class: "text-xs px-3 py-2 w-4 max-w-4 min-w-4", onClick: ()=>{} },
    { label: 'Product Name', value: 'name', class: "text-xs px-3 py-2 w-28 min-w-28 max-w-28 cursor-pointer", onClick: () => handleSortToggle('name') },
    { label: 'MRP', value: 'price', class: "text-xs px-3 py-2 w-12 max-w-12 min-w-12 cursor-pointer", onClick: () => handleSortToggle('price') },
    { label: 'Stock', value: 'quantity', class: "text-xs px-3 py-2 w-4 max-w-4 min-w-4 cursor-pointer", onClick: () => handleSortToggle('quantity') },
    { label: 'Status', value: 'status', class: "text-xs px-3 py-2 w-9 max-w-9 min-w-9", onClick: () => {} },
    { label: 'Product Type', value: 'type', class: "text-xs px-3 py-2 w-12 max-w-12 min-w-12", onClick: () => {} },
    { label: 'Category', value: 'collection', class: "text-xs px-3 py-2 w-12 max-w-12 min-w-12", onClick: () => {} },
    { label: 'HSN', value: 'hsn', class: "text-xs px-3 py-2 w-12 max-w-12 min-w-12", onClick: () => {} },
    { label: 'Media', value: 'media', class: "text-xs px-3 py-2 w-6 max-w-6 min-w-6", onClick: () => {} },
  ];

  function productsTableData(p) {
    return [
      { label: '#', value: p.sno || '', class: "text-xs pl-3 pr-0 py-2 rounded-l-md w-4 max-w-4 min-w-4" },
      { label: 'Product Name', value: (
          <div>
            <div className="font-medium">{p.name}</div>
            {p.sku && <div className="text-[10px] text-zinc-500">SKU: {p.sku}</div>}
          </div>
        ), 
        class: "text-xs px-3 py-2 w-28 min-w-28 max-w-28" 
      },
      { label: 'MRP', value: `${Number(p.price || 0).toFixed(2)}`, class: "text-xs px-3 py-2 w-12 max-w-12 min-w-12" },
      { label: 'Stock', value: (
          <span className={`font-bold font-mono ${p.quantity <= 0 ? 'text-red-400' : p.quantity < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {p.quantity}
          </span>
        ), 
        class: "text-xs px-3 py-2 w-4 max-w-4 min-w-4" 
      },    
      { label: 'Status', value: p.status, class: "text-xs px-3 py-2 w-8 max-w-8 min-w-8" },
      { label: 'Type', value: p.type, class: "text-xs px-3 py-2 w-12 max-w-12 min-w-12" },
      { label: 'Category', value: p?.collections?.map((col) => col.title).join(","), class: "text-xs px-3 py-2 w-12 max-w-12 min-w-12" },
      { label: 'HSN', value: p.hsn, class: "text-xs px-3 py-2 w-12 max-w-12 min-w-12" },
      { label: 'Media', value: (
          <div className='w-fit flex text-[9px] items-center justify-left gap-1 text-vercel-secondary'>
            {p.images && p.images.length > 0 && <img src={p.images[0]} alt={p.name} className="w-4 h-4 object-cover rounded-md border border-zinc-800 bg-zinc-950" />}
            {p?.images?.length > 0 && `+${p?.images?.length - 1}`}
          </div>
        ), 
        class: "text-xs px-3 py-2 w-6 max-w-6 min-w-6 rounded-r-md" 
      }
    ];
  }

  const leftPaneContent = (
    <div className="space-y-4 w-full h-full flex flex-col pr-1">
      <div className='flex flex-row gap-3 h-fit'>
        <Header 
          placeholder="Search Product by Name, SKU, ID, Description..."
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          statusFilter={stockFilter.label}
          setStatusFilter={setStockFilter}
          statusOptions={statusOptions}
        />
        {/* Hide Add New button when isAddingNew is true */}
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
        title="Products Inventory"
        tableHead={productsTableHead}
        filteredList={items.map((p, idx) => ({ ...p, sno: idx + 1 }))}
        status={status}
        selectedItem={selectedProduct}
        setSelectedItem={handleSelectProduct}
        tableData={productsTableData}
      />
    </div>
  );

  return (
    <ResizablePanes
      animationKey={editId || (isAddingNew ? 'new-product' : 'empty')}
      leftPane={leftPaneContent}
      rightPane={
        (selectedProduct !== undefined || isAddingNew) ? (
          <ProductDetails 
            form={form}
            setForm={setForm}
            editId={editId}
            handleSave={handleSave}
            handleAddNewClick={handleAddNewClick}
            availableCollections={availableCollections}
            availableTypes={availableTypes}
          />
        ) : null
      }
      defaultLeftWidth="58%"
    />
  );
};

export default ProductsPage;