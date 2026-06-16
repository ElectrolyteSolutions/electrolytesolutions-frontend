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

  // 1. Revenue & Profit Calculations (Exclude quotations, then split by payment flag statuses)
  const realTransactions = bills.filter(b => b.purpose !== 'quotation');
  
  // ⚡ Revenue Splitting
  const grossPaidRevenue = realTransactions
    .filter(b => b.isPaid === true)
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
  
  const outstandingUnpaidRevenue = realTransactions
    .filter(b => b.isPaid === false)
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  // ⚡ Profit Splitting (Using the tracked document 'profit' field)
  const settledProfit = realTransactions
    .filter(b => b.isPaid === true)
    .reduce((sum, b) => sum + Number(b.profit || 0), 0);

  const pendingUnpaidProfit = realTransactions
    .filter(b => b.isPaid === false)
    .reduce((sum, b) => sum + Number(b.profit || 0), 0);

  // 2. Comprehensive Inventory Valuation Math
  const validProducts = products.filter(p => p.quantity > 0);
  const outOfStockProducts = products.filter(p => p.quantity <= 0);
  
  const totalStockUnits = validProducts.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
  
  // ⚡ Total capital tied up in stock (Base Rate * Quantity)
  const totalStockBaseValue = validProducts.reduce((sum, p) => sum + (Number(p.quantity || 0) * Number(p.baseRate || 0)), 0);
  
  // ⚡ Total expected sales revenue (MRP * Quantity)
  const totalStockMRPValue = validProducts.reduce((sum, p) => sum + (Number(p.quantity || 0) * Number(p.price || 0)), 0);

  // 3. Operational Tracking Metrics
  const activeRepairs = devices.filter(d => d.deviceRepairingStatus === 'in-progress').length;
  const resolvedRepairs = devices.filter(d => d.deviceRepairingStatus === 'resolved').length;

  // 4. Distribution Calculations by Intent
  const purchaseCount = bills.filter(b => b.purpose === 'purchase').length;
  const repairCount = bills.filter(b => b.purpose === 'repair').length;
  const quoteCount = bills.filter(b => b.purpose === 'quotation').length;

  return (
    <div className="max-w-[1600px] mx-auto text-zinc-100 bg-zinc-950 min-h-screen space-y-6 animate-in fade-in duration-500 p-3 sm:p-6 w-full">
      
      {/* Dashboard Greetings Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">System Dashboard</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/billing')}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-600/10"
          >
            Open POS Console
          </button>
          <button 
            onClick={() => navigate('/devices')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/10"
          >
            Register Intake Repair
          </button>
        </div>
      </header>

      {/* --- GRID ROW 1: CORE TELEMETRY STAT CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Financial Gross Settled Paid Revenue */}
        <div className="bg-zinc-900 p-4 rounded-xl flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-emerald-500/30 abc transition-all">
          <div className="space-y-1.5 w-full z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Gross Settled Revenue</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">Rs.{grossPaidRevenue.toLocaleString()}</div>
            <div className="flex justify-between items-center pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Unpaid Balances</span>
              <span className="text-xs text-red-400 font-bold font-mono">Rs.{outstandingUnpaidRevenue.toLocaleString()}</span>
            </div>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] text-7xl opacity-5 group-hover:opacity-10 transition-opacity">💰</div>
        </div>

        {/* Metric 2: Net Profit Ledger */}
        <div className="bg-zinc-900 p-4 rounded-xl flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-indigo-500/30 abc transition-all">
          <div className="space-y-1.5 w-full z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Net Realized Profit</span>
            <div className="text-2xl font-black text-indigo-400 font-mono">Rs.{settledProfit.toLocaleString()}</div>
            <div className="flex justify-between items-center pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Pending Profit</span>
              <span className="text-xs text-amber-400 font-bold font-mono">Rs.{pendingUnpaidProfit.toLocaleString()}</span>
            </div>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] text-7xl opacity-5 group-hover:opacity-10 transition-opacity">📈</div>
        </div>

        {/* Metric 3: Inventory Valuation Assets */}
        <div className="bg-zinc-900 p-4 rounded-xl flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-purple-500/30 abc transition-all">
          <div className="space-y-1.5 w-full z-10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Inventory Assets (Base)</span>
              <span className="text-[10px] font-bold bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{totalStockUnits} Units</span>
            </div>
            <div className="text-2xl font-black text-purple-400 font-mono">Rs.{totalStockBaseValue.toLocaleString()}</div>
            <div className="flex justify-between items-center pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Projected MRP</span>
              <span className="text-xs text-emerald-400 font-bold font-mono">Rs.{totalStockMRPValue.toLocaleString()}</span>
            </div>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] text-7xl opacity-5 group-hover:opacity-10 transition-opacity">📦</div>
        </div>

        {/* Metric 4: Operational Matrix */}
        <div className="bg-zinc-900 p-4 rounded-xl flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-blue-500/30 abc transition-all">
          <div className="space-y-1.5 w-full z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Active Repairs (Pending)</span>
            <div className="text-2xl font-black text-amber-400 font-mono">{activeRepairs}</div>
            <div className="flex justify-between items-center pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Client Base</span>
              <span className="text-xs text-blue-400 font-bold font-mono">{customers.length} Accounts</span>
            </div>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] text-7xl opacity-5 group-hover:opacity-10 transition-opacity">🛠️</div>
        </div>

      </div>

      {/* --- GRID ROW 2: NOTIFICATIONS AND ANALYTIC DISTRIBUTIONS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Side: Critical Out of Stock Alerts (Products < 1) */}
        <div className="bg-zinc-900 rounded-xl p-4 shadow-xl space-y-4 lg:col-span-1 abc">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <h3 className="text-sm font-bold tracking-tight text-zinc-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Inventory Depletion ({outOfStockProducts.length})
            </h3>
            <button onClick={() => navigate('/products')} className="text-[11px] text-blue-400 hover:underline">Restock</button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {outOfStockProducts.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs italic">All catalog components maintain healthy operational quantities.</div>
            ) : (
              outOfStockProducts.map(p => (
                <div key={p._id} className="bg-red-500/5 bg-zinc-950 rounded-lg p-3 flex justify-between items-center border border-red-500/10">
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-zinc-200 truncate">{p.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 font-mono truncate">ID: {p._id}</div>
                  </div>
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase font-mono shrink-0">0 Stock</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Process Distribution Breakdown */}
        <div className="bg-zinc-900 rounded-xl p-4 shadow-xl space-y-4 lg:col-span-2 abc">
          <h3 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-2">Workflow Funnel Allocations</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-center">
            <div className="bg-zinc-950 abc/60 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Direct Sales</span>
              <div className="text-2xl font-black text-white font-mono">{purchaseCount}</div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-500 h-full" style={{ width: `${bills.length ? (purchaseCount / bills.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="bg-zinc-950 abc/60 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Service Repairs</span>
              <div className="text-2xl font-black text-white font-mono">{repairCount}</div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-amber-500 h-full" style={{ width: `${bills.length ? (repairCount / bills.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="bg-zinc-950 abc/60 p-4 rounded-xl space-y-1">
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
      <div className="bg-zinc-900 abc rounded-xl shadow-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/20">
          <h3 className="text-sm font-bold text-zinc-200">Recent Invoice Actions</h3>
          <button onClick={() => navigate('/billing')} className="text-xs text-blue-400 hover:underline">View All Billing Logs</button>
        </div>

        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-zinc-800">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-[11px] sm:text-xs font-semibold">
                <th className="px-4 sm:px-6 py-3 uppercase tracking-wider">Invoice Code Reference Token</th>
                <th className="px-4 sm:px-6 py-3 uppercase tracking-wider">Client Profile</th>
                <th className="px-4 sm:px-6 py-3 uppercase tracking-wider">Intent</th>
                <th className="px-4 sm:px-6 py-3 uppercase tracking-wider">Payment Flag</th>
                <th className="px-4 sm:px-6 py-3 uppercase tracking-wider">Timestamp</th>
                <th className="px-4 sm:px-6 py-3 uppercase tracking-wider text-right">Gross Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs sm:text-sm text-zinc-300">
              {billStatus === 'loading' ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center italic text-zinc-500">Accessing secure ledger streams...</td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-zinc-500">No recent invoice logs tracked.</td>
                </tr>
              ) : (
                bills.filter((bill) => bill.isPaid === false).map((bill) => (
                  <tr key={bill._id} className="hover:bg-zinc-800/20 transition-all">
                    <td className="px-4 sm:px-6 py-3.5 font-mono text-zinc-400 select-all text-[11px] sm:text-xs tracking-wider">{bill._id}</td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="font-semibold text-zinc-200">{bill.customer?.name || "Unassigned Account"}</div>
                      <div className="text-[10px] sm:text-[11px] font-mono text-zinc-500 mt-0.5">{bill.customer?.phone}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold border uppercase ${
                        bill.purpose === 'repair' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        bill.purpose === 'quotation' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        bill.purpose === 'return' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {bill.purpose}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold border uppercase tracking-wider ${
                        bill.isPaid 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {bill.isPaid ? '● Paid' : '○ Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-zinc-400 text-[11px] sm:text-xs">{bill.lastUpdated}</td>
                    <td className="px-4 sm:px-6 py-3.5 text-right font-bold text-emerald-400 font-mono text-xs sm:text-sm">Rs.{Number(bill.totalAmount || 0).toLocaleString()}</td>
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