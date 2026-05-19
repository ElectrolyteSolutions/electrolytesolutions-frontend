import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../features/customerSlice';
import { getProducts } from '../features/productSlice';
import { getDevices } from '../features/deviceSlice';
import { getBills } from '../features/billingSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Extract states from across all system modules
  const customers = useSelector((state) => state.customers.items);
  const products = useSelector((state) => state.products.items);
  const devices = useSelector((state) => state.devices.items);
  const { items: bills, status: billStatus } = useSelector((state) => state.billings);

  useEffect(() => {
    dispatch(getCustomers());
    dispatch(getProducts());
    dispatch(getDevices());
    dispatch(getBills());
  }, [dispatch]);

  // --- COMPUTE REAL-TIME ANALYTICS METRICS ---

  // 1. Revenue Calculations (Exclude quotations, then split by payment flag statuses)
  const realTransactions = bills.filter(b => b.purpose !== 'quotation');
  
  // ⚡ NEW: Separate Paid Settled Revenue from Unpaid Outstanding Ledger balances
  const grossPaidRevenue = realTransactions
    .filter(b => b.isPaid === true)
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const outstandingUnpaidRevenue = realTransactions
    .filter(b => b.isPaid === false)
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // 2. Repair Tracking Metrics
  const activeRepairs = devices.filter(d => d.deviceRepairingStatus === 'in-progress').length;
  const resolvedRepairs = devices.filter(d => d.deviceRepairingStatus === 'resolved').length;

  // 3. Inventory Stock Alerts (Isolate products where quantity is under 1)
  const outOfStockProducts = products.filter(p => p.quantity <= 0);
  const totalStockUnits = products.reduce((sum, p) => sum + (p.quantity || 0), 0);

  // 4. Distribution Calculations by Intent
  const purchaseCount = bills.filter(b => b.purpose === 'purchase').length;
  const repairCount = bills.filter(b => b.purpose === 'repair').length;
  const quoteCount = bills.filter(b => b.purpose === 'quotation').length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto text-zinc-100 bg-zinc-950 min-h-screen space-y-8 animate-in fade-in duration-500">
      
      {/* Dashboard Greetings Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/billing')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-600/10"
          >
            Open POS Console
          </button>
          <button 
            onClick={() => navigate('/devices')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/10"
          >
            Register Intake Repair
          </button>
        </div>
      </header>

      {/* --- GRID ROW 1: CORE TELEMETRY STAT CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Financial Gross Settled Paid Revenue */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-emerald-500/20 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Settled Revenue</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">Rs.{grossPaidRevenue.toLocaleString()}</div>
            <p className="text-[11px] text-zinc-500">
              Outstanding Unpaid: <span className="text-red-400 font-semibold font-mono">Rs.{outstandingUnpaidRevenue.toLocaleString()}</span>
            </p>
          </div>
          <div className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity">💰</div>
        </div>

        {/* Metric 2: Active Repair Matrix */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-amber-500/20 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Active Repairs</span>
            <div className="text-2xl font-black text-amber-400 font-mono">{activeRepairs} <span className="text-xs text-zinc-500 font-normal">Pending</span></div>
            <p className="text-[11px] text-zinc-500">{resolvedRepairs} resolved diagnostic runs waiting for pickup</p>
          </div>
          <div className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity">🛠️</div>
        </div>

        {/* Metric 3: Customer Index Size */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-xl relative overflow-hidden group group-hover:border-blue-500/20 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Client Accounts</span>
            <div className="text-2xl font-black text-blue-400 font-mono">{customers.length}</div>
            <p className="text-[11px] text-zinc-500">Registered corporate & individual accounts</p>
          </div>
          <div className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity">👥</div>
        </div>

        {/* Metric 4: Inventory Units Depth */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-purple-500/20 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Inventory Units</span>
            <div className="text-2xl font-black text-purple-400 font-mono">{totalStockUnits} <span className="text-xs text-zinc-500 font-normal">Items</span></div>
            <p className="text-[11px] text-zinc-500">Across {products.length} distinct product codes</p>
          </div>
          <div className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity">📦</div>
        </div>

      </div>

      {/* --- GRID ROW 2: NOTIFICATIONS AND ANALYTIC DISTRIBUTIONS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Critical Out of Stock Alerts (Products < 1) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 lg:col-span-1">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <h3 className="text-sm font-bold tracking-tight text-zinc-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Inventory Depletion Trigger ({outOfStockProducts.length})
            </h3>
            <button onClick={() => navigate('/products')} className="text-[11px] text-blue-400 hover:underline">Restock</button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2">
            {outOfStockProducts.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs italic">
                All catalog components maintain healthy operational quantities.
              </div>
            ) : (
              outOfStockProducts.map(p => (
                <div key={p._id} className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">{p.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">ID: {p._id}</div>
                  </div>
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase font-mono">0 Stock</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Process Distribution Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-2">Workflow Funnel Allocations</h3>
          
          <div className="grid grid-cols-3 gap-4 pt-4 text-center">
            <div className="bg-zinc-950 p-4 border border-zinc-800/60 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Direct Sales</span>
              <div className="text-2xl font-black text-white font-mono">{purchaseCount}</div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-500 h-full" style={{ width: `${bills.length ? (purchaseCount / bills.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="bg-zinc-950 p-4 border border-zinc-800/60 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Service Repairs</span>
              <div className="text-2xl font-black text-white font-mono">{repairCount}</div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-amber-500 h-full" style={{ width: `${bills.length ? (repairCount / bills.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="bg-zinc-950 p-4 border border-zinc-800/60 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Pricing Quotes</span>
              <div className="text-2xl font-black text-white font-mono">{quoteCount}</div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-blue-500 h-full" style={{ width: `${bills.length ? (quoteCount / bills.length) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
          
          <p className="text-[11px] text-zinc-500 text-center italic pt-2">
            Funnel distributions monitor total workflow conversions generated dynamically across checkout streams.
          </p>
        </div>

      </div>

      {/* --- GRID ROW 3: RECENT TRANSACTION ARCHIVE LEDGER --- */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/20">
          <h3 className="text-sm font-bold text-zinc-200">Recent Invoice Actions</h3>
          <button onClick={() => navigate('/billing')} className="text-xs text-blue-400 hover:underline">View All Billing Logs</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-xs font-semibold">
                <th className="px-6 py-3 uppercase tracking-wider">Invoice Code Reference Token</th>
                <th className="px-6 py-3 uppercase tracking-wider">Client Profile</th>
                <th className="px-6 py-3 uppercase tracking-wider">Intent</th>
                <th className="px-6 py-3 uppercase tracking-wider">Payment Flag</th> {/* ⚡ NEW Column Header */}
                <th className="px-6 py-3 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 uppercase tracking-wider text-right">Gross Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm text-zinc-300">
              {billStatus === 'loading' ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center italic text-zinc-500">Accessing secure ledger streams...</td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-zinc-500">No recent invoice logs tracked.</td>
                </tr>
              ) : (
                bills.slice(0, 5).map((bill) => (
                  <tr key={bill._id} className="hover:bg-zinc-800/20 transition-all">
                    {/* ⚡ FIXED: Outputs the entire un-truncated DB Document identifier key configuration text */}
                    <td className="px-6 py-3.5 font-mono text-zinc-400 select-all text-xs tracking-wider">{bill._id}</td>
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-zinc-200">{bill.customer?.name || "Unassigned Account"}</div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-0.5">{bill.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        bill.purpose === 'repair' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        bill.purpose === 'quotation' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {bill.purpose}
                      </span>
                    </td>
                    
                    {/* ⚡ NEW: Dynamic Status Column Render Item Row badge block */}
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                        bill.isPaid 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {bill.isPaid ? '● Paid' : '○ Unpaid'}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-zinc-400 text-xs">{bill.lastUpdated}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-emerald-400 font-mono">Rs.{bill.totalAmount.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;