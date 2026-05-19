import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom'; 
import axios from 'axios'; // Used directly for appending line items to existing DB records securely
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

  // Local states for on-the-fly Custom Charges
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');

  // Tracking matches found for existing device hardware repair bills
  const [duplicateBillMatch, setDuplicateBillMatch] = useState(null);
  
  // State lock mechanism to make sure duplicate notification logic fires strictly once upon router loading
  const [isInitialIncomingCheckDone, setIsInitialIncomingCheckDone] = useState(false);

  // ⚡ Tracker state controlling if we are actively appending lines to an existing target bill
  const [editingBillId, setEditingBillId] = useState(null);

  // Modals
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getCustomers());
    dispatch(getProducts());
    dispatch(getBills());
  }, [dispatch]);

  // Intercept incoming routing context and verify duplicate billing actions (Fires ONCE on redirection mount)
  useEffect(() => {
    if (location.state?.autoCustomerId && !isInitialIncomingCheckDone ) {
      const targetCustomerId = location.state.autoCustomerId;
      const targetPurpose = location.state.autoPurpose || 'repair';
      const targetDeviceId = location.state.autoDeviceId || '';


      setSelectedCustomerId(targetCustomerId);
      setPurpose(targetPurpose);
      setSelectedDeviceId(targetDeviceId);
      setActiveTab('checkout'); 

      // Look up if an existing matching invoice has already been generated for this device asset
      if (targetPurpose === 'repair' && targetDeviceId) {
        const structuralMatch = bills.find(
          (bill) => bill.purpose === 'repair' && bill.device?._id === targetDeviceId
        );

        if (structuralMatch) {
          setDuplicateBillMatch(structuralMatch);
          alert(`⚠️ Alert: A Repair Invoice has already been logged inside the registry for this specific device asset.`);
        }
      }
      // Activate tracking lock to prevent recurring fires during subsequent runtime cycles
      setIsInitialIncomingCheckDone(true);
    }
  }, [location.state, bills, isInitialIncomingCheckDone]);

  const currentCustomer = customers.find(c => c._id === selectedCustomerId);

  // ⚡ Activates the Append Items workflow context mode
  const handleLoadExistingBillToEdit = (bill) => {
    setEditingBillId(bill._id);
    setSelectedCustomerId(bill.customer?._id || bill.customer);
    setPurpose(bill.purpose);
    setSelectedDeviceId(bill.device?._id || bill.device || '');
    setServiceCharge(bill.serviceCharge || 0);
    
    // Load existing items into the cart staging area flagged as verified database records
    setCart(bill.items.map(item => ({
      ...item,
      isExistingLineItem: true 
    })));
    
    setDuplicateBillMatch(null);
  };

  // ⚡ Cancel append items workflow cleanly back to fresh slate state
  const handleCancelEditMode = () => {
    setEditingBillId(null);
    setCart([]);
    setSelectedCustomerId('');
    setSelectedDeviceId('');
    setServiceCharge(0);
    setDuplicateBillMatch(null);
  };

  // Adds Standard Catalog Inventory Items
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
        orderedQuantity: 1,
        isCustomLineItem: false,
        isNewAppendItem: !!editingBillId // Mark as new only if appending to an existing saved bill
      }]);
    }
  };

  // Adds On-The-Fly Custom Service Line Items (e.g. PCB Repair Cost)
  const handleAddCustomCharge = (e) => {
    e.preventDefault();
    if (!customItemName.trim() || !customItemPrice) return alert("Enter charge description and rate value");

    const newCustomField = {
      productId: `CUSTOM-${Date.now()}`, 
      name: customItemName.trim(),
      price: Number(customItemPrice),
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
    const itemsTotal = cart.reduce((sum, item) => sum + (item.price * item.orderedQuantity), 0);
    return purpose === 'repair' ? itemsTotal + Number(serviceCharge) : itemsTotal;
  };

  const handleSubmitBill = (e) => {
    e.preventDefault();
    if (!selectedCustomerId || cart.length === 0) return alert("Please specify customer and add lines");
    if (purpose === 'repair' && !selectedDeviceId) return alert("Please select a target hardware device");

    const completePayload = {
      customer: selectedCustomerId,
      purpose,
      device: purpose === 'repair' ? selectedDeviceId : undefined,
      serviceCharge: purpose === 'repair' ? Number(serviceCharge) : 0,
      items: cart
    };

    // ⚡ PUT request handles appending/modifying, POST handles brand new records
    if (editingBillId) {
      axios.put(`http://localhost:5000/api/bills/${editingBillId}`, completePayload)
        .then((res) => {
          alert("Invoice updated and products appended successfully!");
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
        name: currentCustomer.name,
        phone: currentCustomer.phone,
        address: currentCustomer.address,
        customerType: currentCustomer.customerType
      },
      device: targetDeviceObj || null
    };

    setCart([]);
    setSelectedCustomerId('');
    setSelectedDeviceId('');
    setServiceCharge(0);
    setDuplicateBillMatch(null); 
    setEditingBillId(null);
    setIsInitialIncomingCheckDone(false); // Reset state check variables for subsequent runs
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
      
      {/* Upper Mode Switcher Navigation Grid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Billing Registry</h1>
        </div>
        
        <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl space-x-1 self-start sm:self-center">
          <button 
            onClick={() => { setActiveTab('checkout'); handleCancelEditMode(); }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'checkout' && !editingBillId ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            POS Terminal Console
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'history' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Invoice History Log
          </button>
        </div>
      </div>

      {/* VIEW 1: PRINT PREVIEW FLOW STATE */}
      {activeTab === 'print' && printTargetData && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <span className="text-sm font-semibold text-emerald-400">🎉 Transaction Processed Successfully!</span>
            <button 
              onClick={() => { setPrintTargetData(null); setActiveTab('checkout'); }}
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-4 py-2 rounded-lg transition-colors font-bold"
            >
              ← Back to New Transaction
            </button>
          </div>
          <InvoiceTemplate billData={printTargetData} />
        </div>
      )}

      {/* VIEW 2: TERMINAL TRANSACTION CHECKOUT */}
      {activeTab === 'checkout' && (
        <div className="space-y-6">
          
          {/* Duplicate Notification Banner UI Section */}
          {duplicateBillMatch && !editingBillId && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-400">⚠️ Existing Repair Bill Detected</h4>
                <p className="text-zinc-400 text-xs">An invoice (ID: {duplicateBillMatch._id}) was already generated for this hardware unit configuration on {duplicateBillMatch.lastUpdated}.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleLoadExistingBillToEdit(duplicateBillMatch)}
                  className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-md"
                >
                  Modify / Add Products to this Bill
                </button>
                <button
                  onClick={() => setDuplicateBillMatch(null)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs px-3 py-2 rounded-lg transition-colors"
                >
                  Ignore & Create New
                </button>
              </div>
            </div>
          )}

          {/* Active Append Mode Status Indicator Strip */}
          {editingBillId && (
            <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
              <div className="text-xs text-blue-400">
                <span className="font-bold uppercase tracking-wider bg-blue-500/20 px-2 py-0.5 rounded mr-2">Append Mode Active</span>
                You are pushing new items onto saved invoice record <span className="font-mono text-white">ID: {editingBillId}</span>.
              </div>
              <button 
                onClick={handleCancelEditMode}
                className="text-xs font-bold text-zinc-400 hover:text-red-400 underline transition-colors"
              >
                Cancel and Clear form
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6 shadow-xl">
              <h2 className="text-xl font-bold tracking-tight text-emerald-400 border-b border-zinc-800 pb-3">
                {editingBillId ? 'Modify Invoice Console' : 'POS Console'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Target Customer</label>
                  <select 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50"
                    value={selectedCustomerId}
                    disabled={!!editingBillId}
                    onChange={(e) => { setSelectedCustomerId(e.target.value); setCart([]); setSelectedDeviceId(''); setDuplicateBillMatch(null); }}
                  >
                    <option value="">Select Accounts Database Profile</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Workflow Purpose</label>
                  <select 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 capitalize text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50"
                    value={purpose}
                    disabled={!!editingBillId}
                    onChange={(e) => { setPurpose(e.target.value); if (e.target.value !== 'repair') setServiceCharge(0); setDuplicateBillMatch(null); }}
                  >
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
                    <select 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-50"
                      value={selectedDeviceId}
                      disabled={!!editingBillId}
                      onChange={(e) => {
                        setSelectedDeviceId(e.target.value);
                        const structuralMatch = bills.find((b) => b.purpose === 'repair' && b.device?._id === e.target.value);
                        setDuplicateBillMatch(structuralMatch || null);
                      }}
                      required
                    >
                      <option value="">Select Profile Associated Device</option>
                      {currentCustomer?.devices?.map(d => (
                        <option key={d._id} value={d._id}>{typeof d === 'object' ? d.deviceName : d} [{typeof d === 'object' ? d.deviceHardwareId : 'ID'}]</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-400 uppercase mb-2">General Service Charge (Rs.)</label>
                    <input 
                      type="number" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40" 
                      value={serviceCharge} 
                      onChange={(e) => setServiceCharge(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              {/* Add Custom Non-Inventory Extras Form */}
              <div className="border border-zinc-800 bg-zinc-950/40 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase text-blue-400 tracking-wider">Add Custom Charge / Extra Services</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input 
                    type="text"
                    placeholder="e.g. PCB Repair Cost"
                    value={customItemName}
                    onChange={e => setCustomItemName(e.target.value)}
                    className="sm:col-span-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input 
                    type="number"
                    placeholder="Price (Rs.)"
                    value={customItemPrice}
                    onChange={e => setCustomItemPrice(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCharge}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 font-semibold text-xs uppercase tracking-wider transition-colors"
                  >
                    + Add Custom
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-3">Inventory Matrix Catalog</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2">
                  {products.map(p => (
                    <div key={p._id} className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                      <div>
                        <div className="text-sm font-semibold text-zinc-200">{p.name} </div>
                        <div className="text-xs text-zinc-500">Rs.{p.price} • Stock: {p.quantity}</div>
                      </div>
                      <button 
                        onClick={() => handleAddItem(p._id)}
                        disabled={p.quantity <= 0 && purpose !== 'quotation'}
                        className="bg-zinc-800 hover:bg-emerald-600 disabled:bg-zinc-900 disabled:text-zinc-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col justify-between shadow-xl min-h-[500px]">
              <div>
                <h2 className="text-lg font-bold text-zinc-200 tracking-tight border-b border-zinc-800 pb-3">Live Invoice Manifest</h2>
                
                <div className="space-y-4 my-4 max-h-[400px] overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.productId} className={`flex justify-between items-start border p-3 rounded-lg bg-zinc-950 ${item.isCustomLineItem ? 'border-blue-500/30 bg-blue-500/5' : 'border-zinc-800/60'}`}>
                      <div className="text-sm">
                        <div className="font-semibold text-zinc-300">
                          {item.name} 
                          {item.isCustomLineItem && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono uppercase ml-1.5">Custom Service</span>}
                          {editingBillId && item.isExistingLineItem && <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded font-mono uppercase ml-1.5">Saved Line</span>}
                        </div>
                        <div className="text-xs text-zinc-500">Qty: {item.orderedQuantity} × Rs.{item.price}</div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className={`text-sm font-bold ${item.isCustomLineItem ? 'text-blue-400' : 'text-emerald-400'}`}>Rs.{item.price * item.orderedQuantity}</span>
                        <button onClick={() => handleRemoveItem(item.productId)} className="text-[10px] text-red-500 hover:underline">Remove</button>
                      </div>
                    </div>
                  ))}

                  {purpose === 'repair' && Number(serviceCharge) > 0 && (
                    <div className="flex justify-between items-center bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg text-sm text-amber-400">
                      <span>General Base Service Charges</span>
                      <span className="font-bold">Rs.{serviceCharge}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4 mt-auto">
                <div className="flex justify-between items-center text-md mb-4">
                  <span className="font-semibold text-zinc-400">Total Invoice Amount:</span>
                  <span className="text-2xl font-black text-emerald-400">Rs.{calculateTotal()}</span>
                </div>
                <button 
                  onClick={handleSubmitBill}
                  className={`w-full text-white font-bold py-3 rounded-lg tracking-wide text-sm transition-all shadow-lg ${editingBillId ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10'}`}
                >
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
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Gross Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Records Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {billStatus === 'loading' ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 italic">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        Accessing secure ledger...
                      </div>
                    </td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 text-sm">No recorded invoices tracked inside the database system.</td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono text-zinc-400">{bill._id}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-semibold text-zinc-200">{bill.customer?.name || 'Profile Dropped'}</div>
                        <div className="text-xs text-zinc-500 font-mono">{bill.customer?.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase ${
                          bill.purpose === 'repair' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          bill.purpose === 'quotation' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}>
                          {bill.purpose}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">{bill.lastUpdated}</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-400">Rs.{bill.totalAmount}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleLoadExistingBillToEdit(bill)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Add Items
                          </button>
                          <button 
                            onClick={() => handleOpenInspect(bill)}
                            className="text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            Inspect / Print
                          </button>
                          <button 
                            onClick={() => { if(window.confirm('Revoke and delete this invoice?')) dispatch(deleteBill(bill._id)) }}
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
      )}

      {/* INSPECT BACKEND OVERLAY MODAL FOR RETROACTIVE PRINTING */}
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
            
            <div className="p-4 overflow-y-auto max-h-[75vh]">
              <InvoiceTemplate billData={selectedBill} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BillingPage;