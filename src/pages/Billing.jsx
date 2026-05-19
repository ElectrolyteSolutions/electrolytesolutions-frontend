import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom'; 
import axios from 'axios'; 
import { getCustomers } from '../features/customerSlice';
import { getProducts } from '../features/productSlice';
import { createInvoice, getBills, deleteBill } from '../features/billingSlice';
import InvoiceTemplate from '../components/InvoiceTemplate'; 

const BillingPage = () => {
  const dispatch = useDispatch();
  const location = useLocation(); 
  
  const customers = useSelector(state => state.customers.items);
  const products = useSelector(state => state.products.items);
  const { items: bills, status: billStatus } = useSelector(state => state.billings);

  const [activeTab, setActiveTab] = useState('checkout');
  const [printTargetData, setPrintTargetData] = useState(null);

  // Core Checkout States
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [purpose, setPurpose] = useState('purchase');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [serviceCharge, setServiceCharge] = useState(0);
  const [cart, setCart] = useState([]);
  
  // ⚡ NEW: Paid Flag State (true = Paid, false = Unpaid)
  const [isPaid, setIsPaid] = useState(true);

  // Local states for on-the-fly Custom Charges
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');

  // Tracking states
  const [duplicateBillMatch, setDuplicateBillMatch] = useState(null);
  const [isInitialIncomingCheckDone, setIsInitialIncomingCheckDone] = useState(false);
  const [editingBillId, setEditingBillId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    dispatch(getCustomers());
    dispatch(getProducts());
    dispatch(getBills());
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.autoCustomerId && !isInitialIncomingCheckDone && bills.length > 0) {
      const targetCustomerId = location.state.autoCustomerId;
      const targetPurpose = location.state.autoPurpose || 'repair';
      const targetDeviceId = location.state.autoDeviceId || '';

      setSelectedCustomerId(targetCustomerId.toString());
      setPurpose(targetPurpose);
      setSelectedDeviceId(targetDeviceId.toString());
      setActiveTab('checkout'); 

      if (targetPurpose === 'repair' && targetDeviceId) {
        const structuralMatch = bills.find(
          (bill) => bill.purpose === 'repair' && bill.device?._id?.toString() === targetDeviceId.toString()
        );

        if (structuralMatch) {
          setDuplicateBillMatch(structuralMatch);
          alert(`⚠️ Alert: A Repair Invoice has already been logged inside the registry for this specific device asset.`);
        }
      }
      setIsInitialIncomingCheckDone(true);
    }
  }, [location.state, bills, isInitialIncomingCheckDone]);

  const currentCustomer = customers.find(c => c._id?.toString() === selectedCustomerId?.toString());

  const handleLoadExistingBillToEdit = (bill) => {
    setEditingBillId(bill._id);
    setSelectedCustomerId(bill.customer?._id || bill.customer);
    setPurpose(bill.purpose);
    setSelectedDeviceId(bill.device?._id || bill.device || '');
    setServiceCharge(bill.serviceCharge || 0);
    setCart(bill.items.map(item => ({ ...item, isExistingLineItem: true, discount: item.discount || 0 })));
    setIsPaid(bill.isPaid !== undefined ? bill.isPaid : true); // Load existing status
    setDuplicateBillMatch(null);
    setActiveTab('checkout');
  };

  const handleCancelEditMode = () => {
    setEditingBillId(null);
    setCart([]);
    setSelectedCustomerId('');
    setSelectedDeviceId('');
    setServiceCharge(0);
    setIsPaid(true); // Reset back to true
    setDuplicateBillMatch(null);
  };

  const handleAddItem = (productId) => {
    const targetProd = products.find(p => p._id === productId);
    if (!targetProd) return;

    const existingItem = cart.find(item => item.productId === productId && !item.isCustomLineItem);
    if (existingItem) {
      setCart(cart.map(item => (item.productId === productId && !item.isCustomLineItem)
        ? { ...item, orderedQuantity: item.orderedQuantity + 1 } : item
      ));
    } else {
      setCart([...cart, { 
        productId, 
        name: targetProd.name, 
        price: targetProd.price, 
        discount: 0, 
        orderedQuantity: 1,
        isCustomLineItem: false,
        isNewAppendItem: !!editingBillId 
      }]);
    }
  };

  const handleItemDiscountAdjust = (productId, discountValue) => {
    const numericDiscount = Number(discountValue) || 0;
    setCart(cart.map(item => {
      if (item.productId === productId) {
        if (numericDiscount > item.price) {
          alert("Discount cannot exceed original component rate value!");
          return item;
        }
        return { ...item, discount: numericDiscount };
      }
      return item;
    }));
  };

  const handleAddCustomCharge = (e) => {
    e.preventDefault();
    if (!customItemName.trim() || !customItemPrice) return alert("Enter charge description and rate value");

    const newCustomField = {
      productId: `CUSTOM-${Date.now()}`, 
      name: customItemName.trim(),
      price: Number(customItemPrice),
      discount: 0, 
      orderedQuantity: 1,
      isCustomLineItem: true,
      isNewAppendItem: !!editingBillId
    };

    setCart([...cart, newCustomField]);
    setCustomItemName('');
    setCustomItemPrice('');
  };

  const handleRemoveItem = (uniqueId) => {
    const targetedItem = cart.find(item => item.productId === uniqueId);
    if (editingBillId && targetedItem?.isExistingLineItem) {
      if (!window.confirm("This item is already saved to the database. Are you sure you want to drop it from this bill?")) return;
    }
    setCart(cart.filter(item => item.productId !== uniqueId));
  };

  const calculateTotal = () => {
    const itemsTotal = cart.reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.orderedQuantity), 0);
    return purpose === 'repair' ? itemsTotal + Number(serviceCharge) : itemsTotal;
  };

  const handleSubmitBill = (e) => {
    e.preventDefault();
    if (!selectedCustomerId || cart.length === 0) return alert("Please specify customer and add lines");
    if (purpose === 'repair' && !selectedDeviceId) return alert("Please select a target hardware device");

    const finalizedProcessedItems = cart.map(item => ({
      ...item,
      subTotal: (Number(item.price) - Number(item.discount || 0)) * Number(item.orderedQuantity)
    }));

    const completePayload = {
      customer: selectedCustomerId,
      purpose,
      device: purpose === 'repair' ? selectedDeviceId : undefined,
      serviceCharge: purpose === 'repair' ? Number(serviceCharge) : 0,
      items: finalizedProcessedItems,
      isPaid: isPaid // ⚡ Pushed inline payload
    };

    if (editingBillId) {
      axios.put(`${import.meta.env.VITE_API_URL}billings/${editingBillId}`, completePayload)
        .then((res) => {
          alert("Invoice updated successfully!");
          handlePostSubmitCleanup(res.data);
        })
        .catch(err => alert(`Failed to update bill record: ${err.response?.data?.message || err.message}`));
    } else {
      dispatch(createInvoice(completePayload)).then((res) => {
        if (!res.error) {
          handlePostSubmitCleanup(res.payload);
        } else {
          alert(`Error executing workflow: ${res.payload.message}`);
        }
      });
    }
  };

  const handlePostSubmitCleanup = (populatedInvoicePayload) => {
    const targetDeviceObj = currentCustomer?.devices?.find(d => d._id === selectedDeviceId);
    const inlinePrintObject = {
      ...populatedInvoicePayload,
      customer: {
        name: currentCustomer?.name || "Walk-in Customer",
        phone: currentCustomer?.phone || "N/A",
        address: currentCustomer?.address || "",
        customerType: currentCustomer?.customerType || "Individual"
      },
      device: targetDeviceObj || null
    };

    setCart([]);
    setSelectedCustomerId('');
    setSelectedDeviceId('');
    setServiceCharge(0);
    setIsPaid(true);
    setDuplicateBillMatch(null); 
    setEditingBillId(null);
    setIsInitialIncomingCheckDone(false); 
    dispatch(getProducts());
    dispatch(getBills());
    setPrintTargetData(inlinePrintObject);
    setActiveTab('print');
  };

  const handleOpenInspect = (bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-[1500px] mx-auto text-zinc-100 bg-zinc-950 min-h-screen space-y-6">
      
      {/* Navigation Switcher header grid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div><h1 className="text-2xl font-bold tracking-tight text-white">Billing Registry</h1></div>
        <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl space-x-1">
          <button onClick={() => { setActiveTab('checkout'); handleCancelEditMode(); }} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'checkout' && !editingBillId ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400'}`}>POS Console</button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'history' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400'}`}>Invoice History Log</button>
        </div>
      </div>

      {activeTab === 'print' && printTargetData && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <span className="text-sm font-semibold text-emerald-400">🎉 Transaction Processed Successfully!</span>
            <button onClick={() => { setPrintTargetData(null); setActiveTab('checkout'); }} className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-4 py-2 rounded-lg transition-colors font-bold">← Back to New Transaction</button>
          </div>
          <InvoiceTemplate billData={printTargetData} />
        </div>
      )}

      {activeTab === 'checkout' && (
        <div className="space-y-6">
          {duplicateBillMatch && !editingBillId && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-400">⚠️ Existing Repair Bill Detected</h4>
                <p className="text-zinc-400 text-xs">An invoice (ID: {duplicateBillMatch._id}) was already generated for this hardware configuration.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleLoadExistingBillToEdit(duplicateBillMatch)} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-md">Edit Bill</button>
                <button onClick={() => setDuplicateBillMatch(null)} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs px-3 py-2 rounded-lg transition-colors">Ignore & Create New</button>
              </div>
            </div>
          )}

          {editingBillId && (
            <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
              <div className="text-xs text-blue-400">
                <span className="font-bold uppercase tracking-wider bg-blue-500/20 px-2 py-0.5 rounded mr-2">Edit Mode Active</span>
                Modifying invoice <span className="font-mono text-white">ID: {editingBillId}</span>.
              </div>
              <button onClick={handleCancelEditMode} className="text-xs font-bold text-zinc-400 hover:text-red-400 underline transition-colors">Cancel and Clear Form</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6 shadow-xl">
              <h2 className="text-xl font-bold tracking-tight text-emerald-400 border-b border-zinc-800 pb-3">{editingBillId ? 'Modify Invoice Console' : 'POS Console'}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Target Customer</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50" value={selectedCustomerId} disabled={!!editingBillId} onChange={(e) => { setSelectedCustomerId(e.target.value); setCart([]); setSelectedDeviceId(''); setDuplicateBillMatch(null); }}>
                    <option value="">Select Accounts Database Profile</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Workflow Purpose</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 capitalize text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50" value={purpose} disabled={!!editingBillId} onChange={(e) => { setPurpose(e.target.value); if (e.target.value !== 'repair') setServiceCharge(0); setDuplicateBillMatch(null); }}>
                    <option value="purchase">Standard Sale (Purchase)</option>
                    <option value="repair">Service/Hardware Repair</option>
                    <option value="quotation">Formal Pricing Quote</option>
                  </select>
                </div>
              </div>

              {purpose === 'repair' && selectedCustomerId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-amber-500/20 bg-amber-500/5 p-4 rounded-lg animate-in fade-in duration-300">
                  <div>
                    <label className="block text-xs font-semibold text-amber-400 uppercase mb-2">Linked Hardware Target</label>
                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-50" value={selectedDeviceId} disabled={!!editingBillId} onChange={(e) => { setSelectedDeviceId(e.target.value); const structuralMatch = bills.find((b) => b.purpose === 'repair' && b.device?._id?.toString() === e.target.value.toString()); setDuplicateBillMatch(structuralMatch || null); }} required>
                      <option value="">Select Profile Associated Device</option>
                      {currentCustomer?.devices?.map(d => <option key={d._id} value={d._id}>{typeof d === 'object' ? d.deviceName : d} [{typeof d === 'object' ? d.deviceHardwareId : 'ID'}]</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-400 uppercase mb-2">General Service Charge (Rs.)</label>
                    <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} placeholder="0.00" />
                  </div>
                </div>
              )}

              <div className="border border-zinc-800 bg-zinc-950/40 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase text-blue-400 tracking-wider">Add Custom Charge / Extra Services</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" placeholder="e.g. PCB Repair Cost" value={customItemName} onChange={e => setCustomItemName(e.target.value)} className="sm:col-span-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <input type="number" placeholder="Price (Rs.)" value={customItemPrice} onChange={e => setCustomItemPrice(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" />
                  <button type="button" onClick={handleAddCustomCharge} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 font-semibold text-xs uppercase tracking-wider transition-colors">+ Add Custom</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-3">Inventory Matrix Catalog</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2">
                  {products.map(p => {
                    const cartItem = cart.find(item => item.productId === p._id && !item.isCustomLineItem);
                    const currentCartQty = cartItem ? cartItem.orderedQuantity : 0;
                    const isOutOfStock = purpose !== 'quotation' && (p.quantity <= 0 || currentCartQty >= p.quantity);
                    return (
                      <div key={p._id} className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                        <div>
                          <div className="text-sm font-semibold text-zinc-200">{p.name} </div>
                          <div className="text-xs text-zinc-500">Rs.{p.price} • Stock: {p.quantity} {currentCartQty > 0 && <span className="text-emerald-500 font-medium ml-1">({currentCartQty} added)</span>}</div>
                        </div>
                        <button onClick={() => handleAddItem(p._id)} disabled={isOutOfStock} className="bg-zinc-800 hover:bg-emerald-600 disabled:bg-zinc-900 disabled:text-zinc-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
                          {isOutOfStock ? 'Maxed Out' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col justify-between shadow-xl min-h-[500px]">
              <div>
                <h2 className="text-lg font-bold text-zinc-200 tracking-tight border-b border-zinc-800 pb-3">Live Invoice Manifest</h2>
                <div className="space-y-4 my-4 max-h-[340px] overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.productId} className={`flex flex-col gap-2.5 border p-3 rounded-xl bg-zinc-950 border-zinc-800/60`}>
                      <div className="flex justify-between items-start">
                        <div className="text-sm">
                          <div className="font-bold text-zinc-200">
                            {item.name} 
                            {item.isCustomLineItem && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase ml-1.5 font-mono">Custom</span>}
                            {editingBillId && item.isExistingLineItem && <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded uppercase ml-1.5 font-mono">Saved Line</span>}
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5">Base Rate: Rs.{item.price} • Qty: {item.orderedQuantity}</div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="text-sm font-black text-emerald-400">Rs.{(item.price - (item.discount || 0)) * item.orderedQuantity}</span>
                          <button onClick={() => handleRemoveItem(item.productId)} className="text-[10px] text-red-500 hover:underline mt-0.5">Remove</button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-zinc-900/80">
                        <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">Apply Row Discount:</span>
                        <div className="relative flex items-center max-w-[110px]">
                          <span className="absolute left-2.5 text-zinc-500 text-xs font-mono">Rs.</span>
                          <input 
                            type="number"
                            placeholder="0"
                            value={item.discount || ''}
                            onChange={(e) => handleItemDiscountAdjust(item.productId, e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 pl-7 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500/60"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {purpose === 'repair' && Number(serviceCharge) > 0 && (
                    <div className="flex justify-between items-center bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg text-sm text-amber-400">
                      <span>General Base Service Charges</span><span className="font-bold">Rs.{serviceCharge}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ⚡ NEW: Paid status flag selection segment */}
              <div className="border-t border-zinc-800 pt-4 mt-auto space-y-4">
                <div className="flex items-center justify-between bg-zinc-950 p-3 border border-zinc-800 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-300">Payment Flag Status</span>
                    <span className="text-[10px] text-zinc-500">Is this bill cleared?</span>
                  </div>
                  <div className="inline-flex p-0.5 bg-zinc-900 rounded-lg border border-zinc-800 space-x-1">
                    <button 
                      type="button"
                      onClick={() => setIsPaid(true)}
                      className={`px-3 py-1.5 rounded-md font-bold text-xs uppercase tracking-wider transition-all ${isPaid ? 'bg-emerald-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Paid
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsPaid(false)}
                      className={`px-3 py-1.5 rounded-md font-bold text-xs uppercase tracking-wider transition-all ${!isPaid ? 'bg-red-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Unpaid
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-md">
                  <span className="font-semibold text-zinc-400">Total Invoice Amount:</span>
                  <span className="text-2xl font-black text-emerald-400">Rs.{calculateTotal()}</span>
                </div>
                <button onClick={handleSubmitBill} className={`w-full text-white font-bold py-3 rounded-lg tracking-wide text-sm transition-all shadow-lg ${editingBillId ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10'}`}>
                  {editingBillId ? 'Save & Append Changes' : `Process Workflow Transaction (${purpose})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: LEDGER RECORDS HISTORICAL DATABASE VIEW */}
      {activeTab === 'history' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-800/50 border-b border-zinc-800">
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Invoice ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Account Profile</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Workflow Intent</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Payment Status</th> {/* ⚡ New Header Column */}
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Gross Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Records Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {billStatus === 'loading' ? (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-zinc-500 italic">Accessing secure ledger...</td></tr>
                ) : bills.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-zinc-500 text-sm">No recorded invoices tracked inside the database system.</td></tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono text-zinc-400">{bill._id}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-semibold text-zinc-200">{bill.customer?.name || 'Profile Dropped'}</div>
                        <div className="text-xs text-zinc-500 font-mono">{bill.customer?.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase ${bill.purpose === 'repair' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : bill.purpose === 'quotation' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>{bill.purpose}</span>
                      </td>
                      
                      {/* ⚡ NEW: Status Flag rendering layout block */}
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          bill.isPaid 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {bill.isPaid ? '● Paid' : '○ Unpaid'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-zinc-400">{bill.lastUpdated}</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-400 font-mono">Rs.{bill.totalAmount}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleLoadExistingBillToEdit(bill)} className="text-blue-400 hover:text-blue-300 transition-colors">Edit Bill</button>
                          <button onClick={() => handleOpenInspect(bill)} className="text-emerald-400 hover:text-emerald-300 transition-colors">Inspect / Print</button>
                          <button onClick={() => { if(window.confirm('Revoke and delete this invoice?')) dispatch(deleteBill(bill._id)) }} className="text-red-400 hover:text-red-300 transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && selectedBill && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30">
              <div>
                <h3 className="text-lg font-bold text-white">Invoice History Log Inspection</h3>
                <p className="text-xs text-zinc-500 font-mono uppercase mt-0.5">DB_ID: {selectedBill._id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors text-2xl">&times;</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[75vh]"><InvoiceTemplate billData={selectedBill} /></div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BillingPage;