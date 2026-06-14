import React, { useState } from 'react';
import axios from 'axios';
import ReturnBillTemplate from '../components/ReturnBillTemplate';

const ReturnsPage = () => {
  // Screen views: 'lookup' | 'process' | 'print'
  const [viewState, setViewState] = useState('lookup');
  
  const [searchBillId, setSearchBillId] = useState('');
  const [activeBill, setActiveBill] = useState(null);
  
  // Track selected lines for return and individual item quantities
  const [returnCart, setReturnCart] = useState({}); // Example format: { productId: quantity }
  const [finalizedReturnRecord, setFinalizedReturnRecord] = useState(null);

  // 1. Fetch sales document details by DB Identifier code
  const handleLookupBill = (e) => {
    e.preventDefault();
    if (!searchBillId.trim()) return alert("Please type a valid Invoice/Bill ID");

    axios.get(`${import.meta.env.VITE_API_URL}billings/${searchBillId.trim()}`)
      .then((res) => {
        if (!res.data) return alert("No transaction record matched this ID.");
        if (res.data.purpose === 'quotation') return alert("Quotations cannot be processed for item returns.");
        
        setActiveBill(res.data);
        setReturnCart({}); // Clear out return staging area scratchpad variables
        setViewState('process');
      })
      .catch((err) => alert(`Lookup failed: ${err.response?.data?.message || err.message}`));
  };

  // Toggle checkout list state configurations
  const handleToggleSelection = (item) => {
    if (returnCart[item.productId]) {
      const updatedCart = { ...returnCart };
      delete updatedCart[item.productId];
      setReturnCart(updatedCart);
    } else {
      setReturnCart({ ...returnCart, [item.productId]: 1 });
    }
  };

  // Track modification values for individual inputs
  const handleQuantityAdjust = (productId, qty) => {
    setReturnCart({ ...returnCart, [productId]: Number(qty) });
  };

  // 2. Submit Return Action down to endpoint pipelines
  const handleExecuteReturnWorkflow = () => {
    const selectionKeys = Object.keys(returnCart);
    if (selectionKeys.length === 0) return alert("Select at least one product line to return");

    // Format selected line metrics into an array schema payload
    const itemsToReturn = selectionKeys.map(key => ({
      productId: key,
      quantity: returnCart[key]
    }));

    if (window.confirm("Verify cash refund dispersion and process item intake?")) {
      axios.post(`${import.meta.env.VITE_API_URL}billings/${activeBill._id}/return-bill`, { itemsToReturn })
        .then((res) => {
          setFinalizedReturnRecord(res.data);
          setViewState('print');
        })
        .catch((err) => alert(`Return processing failed: ${err.response?.data?.message || err.message}`));
    }
  };

  return (
    <div className="p-3 sm:p-6 w-full max-w-4xl mx-auto text-zinc-100 bg-zinc-950 min-h-screen space-y-6 animate-in fade-in duration-300">
      
      {/* Header Title Section */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Reverse POS Intake Terminal</h1>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">Process customer returns, distribute cash refunds, and re-circulate shop stock instantly.</p>
      </div>

      {/* VIEW STEP 1: INITIAL SEARCH ENTRY LOOKUP CONTAINER */}
      {viewState === 'lookup' && (
        <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 p-5 sm:p-6 rounded-xl shadow-xl space-y-4 mt-8 sm:mt-12">
          <h2 className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-wider text-center">Scan or Input Bill ID</h2>
          <form onSubmit={handleLookupBill} className="space-y-3">
            <input 
              type="text"
              placeholder="e.g. 6a0617fe2fca22443dd500d8"
              value={searchBillId}
              onChange={e => setSearchBillId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-center text-xs sm:text-sm font-mono tracking-wide text-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
            />
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all shadow-lg shadow-red-600/10"
            >
              Lookup Bill Details →
            </button>
          </form>
        </div>
      )}

      {/* VIEW STEP 2: ITEM SELECTION INTERACTIVE CAROUSEL CONTAINER */}
      {viewState === 'process' && activeBill && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          {/* Main Select list area mapping block */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-zinc-200 text-sm sm:text-md">Items Linked with Bill #{activeBill._id.slice(-8).toUpperCase()}</h3>
              <button 
                onClick={() => setViewState('lookup')} 
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ← Cancel Lookup
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
              {activeBill.items.map((item) => {
                const isChecked = !!returnCart[item.productId];
                return (
                  <div 
                    key={item.productId} 
                    onClick={() => handleToggleSelection(item)}
                    className={`p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2 cursor-pointer transition-all ${isChecked ? 'bg-red-500/5 border-red-500/40 shadow-inner' : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900/60'}`}
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${isChecked ? 'bg-red-600 border-red-500 text-white' : 'border-zinc-700'}`}>
                        {isChecked && <span className="text-[10px] sm:text-xs">✓</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-zinc-200 truncate">{item.name}</div>
                        <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">Purchased Qty: {item.orderedQuantity} • Rate: Rs.{item.price}</div>
                      </div>
                    </div>

                    {/* Conditional sub-input modifier logic */}
                    {isChecked && (
                      <div className="flex items-center gap-2 pl-7 sm:pl-0 shrink-0" onClick={e => e.stopPropagation()}>
                        <label className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase">Return Qty:</label>
                        <select
                          value={returnCart[item.productId]}
                          onChange={(e) => handleQuantityAdjust(item.productId, e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 px-2 py-1.5 sm:py-1 font-bold focus:outline-none"
                        >
                          {[...Array(item.orderedQuantity).keys()].map(n => (
                            <option key={n + 1} value={n + 1}>{n + 1}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Summary Dashboard Widget Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xl flex flex-col justify-between h-fit min-h-[250px] sm:min-h-[300px]">
            <div>
              <h3 className="font-bold text-zinc-300 text-xs sm:text-sm tracking-wide uppercase border-b border-zinc-800 pb-2">Refund Manifest</h3>
              <div className="text-[11px] sm:text-xs space-y-1.5 py-3 border-b border-zinc-800/60 font-mono text-zinc-400">
                <div className="truncate">Customer Account: {activeBill.customer?.name}</div>
                <div>Contact: {activeBill.customer?.phone}</div>
              </div>
              
              <div className="my-4 space-y-2 text-xs">
                {Object.keys(returnCart).length === 0 && (
                  <div className="text-zinc-600 italic text-center py-4">No items selected</div>
                )}
                {Object.keys(returnCart).map(key => {
                  const match = activeBill.items.find(i => i.productId === key);
                  const selectedQty = returnCart[key];
                  return (
                    <div key={key} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg font-medium text-zinc-400 gap-2">
                      <span className="truncate min-w-0">{match?.name} (×{selectedQty})</span>
                      <span className="font-bold text-red-400 font-mono shrink-0">Rs.{match ? match.price * selectedQty : 0}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="text-[11px] sm:text-xs text-zinc-400 font-bold">Total Cash to Handback:</span>
                <span className="text-lg sm:text-xl font-black text-red-400 font-mono">
                  Rs.{Object.keys(returnCart).reduce((sum, k) => {
                    const match = activeBill.items.find(i => i.productId === k);
                    return sum + (match ? match.price * returnCart[k] : 0);
                  }, 0)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleExecuteReturnWorkflow}
                disabled={Object.keys(returnCart).length === 0}
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-2.5 sm:py-3 rounded-lg tracking-wide text-xs uppercase transition-all shadow-lg"
              >
                Execute Cash Refund & Restock
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VIEW STEP 3: TRANSACTION SUCCESS PREVIEW PRINT MANAGER CONTAINER */}
      {viewState === 'print' && finalizedReturnRecord && (
        <div className="space-y-4 animate-in fade-in duration-300 w-full">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-4 rounded-xl w-full">
            <span className="text-xs sm:text-sm font-semibold text-red-400 text-center sm:text-left">🎉 Return Logged and Cash Disbursed!</span>
            <button 
              onClick={() => { setFinalizedReturnRecord(null); setViewState('lookup'); setSearchBillId(''); }}
              className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-4 py-2 rounded-lg transition-all font-bold"
            >
              ← Process Another Return
            </button>
          </div>
          <div className="overflow-x-auto w-full">
            <ReturnBillTemplate refundData={finalizedReturnRecord} />
          </div>
        </div>
      )}

    </div>
  );
};

export default ReturnsPage;