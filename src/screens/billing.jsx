import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom'; 
import axios from 'axios'; 
import { getCustomers } from '../features/customerSlice';
import { getProducts } from '../features/productSlice';
import { createInvoice, getBills } from '../features/billingSlice';
import ResizablePanes from '../components/table.extralarge';
import InvoiceTemplate from '../components/InvoiceModal'; 
import Button from '../components/button';
import MiniTable from '../components/table.small';
import { Trash } from 'lucide-react';

const BillingPage = () => {
  const dispatch = useDispatch();
  const location = useLocation(); 
  
  const customers = useSelector(state => state.customers.items);
  const products = useSelector(state => state.products.items);
  const { items: bills } = useSelector(state => state.billings);
  const { token } = useSelector(state => state.auth);

  const [printTargetData, setPrintTargetData] = useState(null);

  // Core Checkout States
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [purpose, setPurpose] = useState('purchase');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [serviceCharge, setServiceCharge] = useState(0);
  const [cart, setCart] = useState([]);
  
  // Paid Flag State
  const [isPaid, setIsPaid] = useState(true);

  // Local Product Catalog Filter/Search Input
  const [productSearchKeyword, setProductSearchKeyword] = useState('');

  // Local states for expanded Custom Charges
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemBaseRate, setCustomItemBaseRate] = useState('');
  const [customItemQuantity, setCustomItemQuantity] = useState(1);

  // Tracking states
  const [duplicateBillMatch, setDuplicateBillMatch] = useState(null);
  const [isInitialIncomingCheckDone, setIsInitialIncomingCheckDone] = useState(false);
  const [editingBillId, setEditingBillId] = useState(null);

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

  const filteredProductsList = products.filter(product => 
    product.name?.toLowerCase().includes(productSearchKeyword.toLowerCase()) ||
    product.brand?.toLowerCase().includes(productSearchKeyword.toLowerCase()) ||
    product.modelName?.toLowerCase().includes(productSearchKeyword.toLowerCase())
  );

  const handleCancelEditMode = () => {
    setEditingBillId(null);
    setCart([]);
    setSelectedCustomerId('');
    setSelectedDeviceId('');
    setServiceCharge(0);
    setIsPaid(true);
    setDuplicateBillMatch(null);
  };

  const handleAddItem = (productId) => {
    const targetProd = products.find(p => p._id === productId);
    if (!targetProd) return;

    const existingItem = cart.find(item => item.productId === productId && !item.isCustomLineItem && !item.isExistingLineItem);
    if (existingItem) {
      setCart(cart.map(item => (item.rowKey === existingItem.rowKey)
        ? { ...item, orderedQuantity: item.orderedQuantity + 1 } : item
      ));
    } else {
      setCart([...cart, { 
        productId, 
        rowKey: `${productId}-${Date.now()}-${Math.random()}`,
        name: targetProd.name, 
        price: targetProd.price, 
        baseRate: targetProd.baseRate || 0,
        discount: 0, 
        orderedQuantity: 1,
        isCustomLineItem: false,
        isNewAppendItem: !!editingBillId 
      }]);
    }
  };

  const handleItemDiscountAdjust = (targetRowKey, discountValue) => {
    const numericDiscount = Number(discountValue) || 0;
    setCart(cart.map(item => {
      const currentKey = item.rowKey || item._id || item.productId;
      if (currentKey === targetRowKey) {
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
    if (!customItemName.trim() || !customItemPrice) return alert("Enter charge description and selling price");

    const customId = `CUSTOM-${Date.now()}`;
    const newCustomField = {
      productId: customId, 
      rowKey: `${customId}-${Math.random()}`,
      name: customItemName.trim(),
      price: Number(customItemPrice),
      baseRate: Number(customItemBaseRate || 0),
      discount: 0, 
      orderedQuantity: Number(customItemQuantity) || 1,
      isCustomLineItem: true,
      isNewAppendItem: !!editingBillId
    };

    setCart([...cart, newCustomField]);
    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemBaseRate('');
    setCustomItemQuantity(1);
  };

  const handleRemoveItem = (targetRowKey) => {
    const targetedItem = cart.find(item => (item.rowKey || item._id || item.productId) === targetRowKey);
    if (editingBillId && targetedItem?.isExistingLineItem) {
      if (!window.confirm("This item is already saved to the database. Are you sure you want to drop it from this bill?")) return;
    }
    setCart(cart.filter(item => (item.rowKey || item._id || item.productId) !== targetRowKey));
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
      isPaid: isPaid
    };

    if (editingBillId) {
      axios.put(
        `${import.meta.env.VITE_API_URL}billings/${editingBillId}`,
        completePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      )
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
    setProductSearchKeyword(''); 
    setDuplicateBillMatch(null); 
    setEditingBillId(null);
    setIsInitialIncomingCheckDone(false); 
    dispatch(getProducts());
    dispatch(getBills());
    setPrintTargetData(inlinePrintObject);
  };

  // Left Pane: POS Configuration & Product Matrix
  const leftPaneContent = (
    <div className="bg-vercel-black p-6 w-full h-full flex flex-col space-y-2">
        <h3 className="text-sm text-white font-semibold pb-3">Point of Sale Console</h3>

      {duplicateBillMatch && !editingBillId && (
        <div className="border-1 border-amber-500/30 p-4 rounded-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-400">⚠️ Existing Repair Bill Detected</h4>
            <p className="text-zinc-400 text-xs">An invoice was already generated for this hardware configuration.</p>
          </div>
          <button onClick={() => setDuplicateBillMatch(null)} className="bg-vercel-black hover:bg-vercel-card text-zinc-300 text-xs px-3 py-2 rounded-md transition-colors">Ignore & New</button>
        </div>
      )}

      {editingBillId && (
        <div className="bg-blue-600/10 border-1 border-blue-500/30 p-4 rounded-md flex items-center justify-between gap-3">
          <div className="text-xs text-blue-400">
            <span className="font-bold uppercase bg-blue-500/20 px-2 py-0.5 rounded mr-2">Edit Mode Active</span>
          </div>
          <button onClick={handleCancelEditMode} className="text-xs font-bold text-zinc-400 hover:text-red-400 underline">Cancel</button>
        </div>
      )}

      <div className="bg-vercel-surface p-4 rounded-md space-y-6 border-1 border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label>Target Customer</label>
            <select value={selectedCustomerId} disabled={!!editingBillId} onChange={(e) => { setSelectedCustomerId(e.target.value); setCart([]); setSelectedDeviceId(''); setDuplicateBillMatch(null); }}>
              <option value="">Select Customer / Party Profile</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>
          <div>
            <label>Intent Purpose</label>
            <select value={purpose} disabled={!!editingBillId} onChange={(e) => { setPurpose(e.target.value); if (e.target.value !== 'repair') setServiceCharge(0); setDuplicateBillMatch(null); }}>
              <option value="purchase">Standard Sale (Purchase)</option>
              <option value="repair">Service/Hardware Repair</option>
              <option value="quotation">Formal Pricing Quote</option>
            </select>
          </div>
        </div>

        {purpose === 'repair' && selectedCustomerId && (
          <div className='border-1 border-amber-500/20 bg-amber-500/5 p-3 rounded-md'>
            <p className='text-xs m-0'>Service / Onsite Repair/ Reassembly Labour Charges</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label>Linked Hardware Target</label>
              <select value={selectedDeviceId} disabled={!!editingBillId} onChange={(e) => setSelectedDeviceId(e.target.value)} required>
                <option value="">Select Profile Associated Device</option>
                {currentCustomer?.devices?.map(d => <option key={d._id} value={d._id}>{typeof d === 'object' ? d.deviceName : d}</option>)}
              </select>
            </div>
            <div>
              <label>General Service Charge (₹)</label>
              <input type="number" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          </div>
        )}

        <div className='border-1 border-blue-500/20 bg-blue-500/5 p-3 rounded-md'>
            <p className='text-xs'>Service / Onsite Repair/ Reassembly Labour Charges</p>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="col-span-2">
              <input type="text" placeholder="Charge Description.." value={customItemName} onChange={e => setCustomItemName(e.target.value)} />
            </div>
            <div>
              <input type="number" placeholder="Sell Price ₹" value={customItemPrice} onChange={e => setCustomItemPrice(e.target.value)} />
            </div>
            <div>
              <input type="number" placeholder="Base Rate ₹" value={customItemBaseRate} onChange={e => setCustomItemBaseRate(e.target.value)} />
            </div>
            <div>
              <input type="number" placeholder="Quantity" min="1" value={customItemQuantity} onChange={e => setCustomItemQuantity(e.target.value)} />
            </div>
            <div>
              <Button type="primary" onClick={handleAddCustomCharge} className="py-2" label="Add"></Button>
            </div>
          </div>
        </div>

        {/* Inventory Catalog Matrix */}
        <div className="space-y-4 bg-vercel-black rounded-md border-1 border-zinc-800 bg-vercel-black p-3">
          <div className="flex flex-col gap-2">
            <label>Inventory Catalog List</label>
            <input 
              type="text"
              placeholder="Search by Product Name"
              value={productSearchKeyword}
              onChange={(e) => setProductSearchKeyword(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 max-h-[350px] overflow-y-auto pr-1">
            <div className='d-flex w-full bg-vercel-balck border-1 border-zinc-800 text-xs p-2 rounded-t-md'>
              <div className='w-3/5'>Name</div>
              <div className='w-1/5'>Brand</div>
              <div className='w-1/6'>Price</div>
              <div className='w-1/6'>Quantity</div>
            </div>
            {filteredProductsList.map((p) => {
              const isSelected = cart.some(prod => prod.productId === p._id);
              
              return (
                <div onClick={() => handleAddItem(p._id)} key={p._id} 
                  className={`p-2 ${isSelected && "bg-white rounded-md text-black"} text-xs text-vercel-secondary d-flex font-semibold hover:rounded-md border-1 border-zinc-800 cursor-pointer hover:bg-white hover:text-vercel-black`}>
                    <div className='w-3/5'>{p.name}</div>
                    <div className='w-1/5'>{p.brand}</div>
                    <div className='w-1/6'>{p.price}</div>
                    <div className='w-1/6'>{p.quantity}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const tableHeadData = ["Item Name", "Qty", "Discount", "Rate", "Total", ""];

  // Right Pane: Live Cart Manifest & Checkout Action
  const rightPaneContent = (
    <div className="p-6 w-full h-full  overflow-hidden space-y-3">
      <div className='overflow-hidden bg-vercel-black rounded-md h-[70%] min-h-[70%] max-h-[70%]'>
        <div className='d-flex justify-between items-center'>
        <h3 className="text-sm font-bold">Invoice Items</h3>
        <Button 
          onClick={handleSubmitBill} 
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-md text-xs uppercase tracking-wider transition-all"
          label={editingBillId ? 'Update Invoice' : 'Create Invoice'}
          />
        </div>
        <div className="overflow-y-scroll space-y-3 my-4 bg-vercel-card border-1 border-zinc-800 rounded-md h-full min-h-full max-h-full">
          <MiniTable title={null} tableHeadData={tableHeadData} tableData={cart?.map((c) => {
            const uniqueKey = c.rowKey || c._id || c.productId;
            return [
              { text: c.name, subtext: "", align: 'left' },
              { text: c.price, align: 'left' },
              { text: c.orderedQuantity, align: 'left' },
              { 
                text: <input 
                        className='w-16'
                        type="number"
                        placeholder="₹0"
                        value={c.discount === 0 ? '' : c.discount}
                        onChange={(e) => handleItemDiscountAdjust(uniqueKey, e.target.value)}
                      />, 
                align: 'left', 
                bold: true 
              },
              { text: `₹${(c.price - (c.discount || 0)) * c.orderedQuantity}`, align: 'left', bold: true },
              { text: <Button classname='h-fit p-1.5' type='danger' onClick={() => handleRemoveItem(uniqueKey)} label={<Trash size={12}/>}/>, align: 'right', bold: true }
            ];
          })} />
        </div>
      </div>

      <div className="flex justify-between gap-3 items-center border-t border-zinc-800 pt-3">
        
        <div className="d-flex flex-col bg-red-800/50 px-2 py-2 rounded-md border-zinc-800 border-1">
          <label>Payment Status</label>
          <div className="inline-flex p-1 bg-vercel-black rounded-md space-x-1">
            <button type="button" onClick={() => setIsPaid(true)} className={`px-3 py-1.5 rounded-md font-bold text-[10px] uppercase ${isPaid ? 'bg-red-800 text-white' : 'text-zinc-500'}`}>Paid</button>
            <button type="button" onClick={() => setIsPaid(false)} className={`px-3 py-1.5 rounded-md font-bold text-[10px] uppercase ${!isPaid ? 'bg-green-800 text-white' : 'text-zinc-500'}`}>Unpaid</button>
          </div>
        </div>
        
        <div className='text-sm border-1 border-zinc-800 rounded-md d-flex items-center justify-center p-2 gap-3 bg-vercel-card'>
          <span className="font-semibold text-zinc-400">Grand Total:</span>
          <span className="text-lg font-vercel-primary">₹{calculateTotal()}.00</span>
        </div>
      </div>
           </div>
  );

  return (
    <div className='h-screen w-full bg-vercel-black'>
      {printTargetData ? (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
          <div className="p-4 rounded-md flex justify-between items-center border-1 border-zinc-800">
            <span className="text-xs font-semibold text-emerald-400">🎉 Transaction Processed Successfully!</span>
            <button onClick={() => setPrintTargetData(null)} className="bg-vercel-card text-white text-xs px-4 py-2 rounded-md font-bold">← New Transaction</button>
          </div>
          <InvoiceTemplate billData={printTargetData} onClose={() => setPrintTargetData(null)} />
        </div>
      ) : (
        <ResizablePanes 
          animationKey={editingBillId || 'pos-checkout'}
          leftPane={leftPaneContent}
          rightPane={rightPaneContent}
          defaultLeftWidth="45%"
        />
      )}
    </div>
  );
};

export default BillingPage;