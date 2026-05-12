import React, { useContext } from 'react';
import { ERPContext } from '../context/ERPContext';
import { TrendingUp, Package, AlertCircle, Users } from 'lucide-react';

const Dashboard = () => {
  const { products, customers, alerts } = useContext(ERPContext);

  // Calculate quick stats
  const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800">Business Overview</h1>
        <p className="text-slate-500">Welcome back to Electrolyte Solutions Management.</p>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="₹45,200" icon={<TrendingUp />} color="bg-blue-500" />
        <StatCard title="Total Customers" value={customers.length} icon={<Users />} color="bg-purple-500" />
        <StatCard title="Inventory Items" value={products.length} icon={<Package />} color="bg-green-500" />
        <StatCard title="Low Stock Alerts" value={alerts.length} icon={<AlertCircle />} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Alert Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20}/>
            Needs Reordering (Low Stock)
          </h3>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <p className="text-slate-400 text-sm">All products are well stocked.</p>
            ) : (
              alerts.map(item => (
                <div key={item._id} className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100">
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="text-xs text-red-600 font-bold uppercase tracking-widest">Only {item.stock} Left</p>
                  </div>
                  <button className="bg-white text-red-600 px-3 py-1 rounded-md text-xs font-bold shadow-sm border border-red-200">
                    Order Now
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-4">Stock Valuation</h3>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-100 rounded-xl">
            <div className="text-center">
              <p className="text-4xl font-black text-slate-800">₹{totalStockValue.toLocaleString('en-IN')}</p>
              <p className="text-slate-400 text-sm uppercase tracking-widest font-bold mt-2">Current Inventory Worth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
    <div className={`${color} p-3 rounded-xl text-white shadow-lg`}>{icon}</div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

export default Dashboard;