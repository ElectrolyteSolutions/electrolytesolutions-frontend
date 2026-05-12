import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Box, Users, ReceiptIndianRupee, Settings, AlertTriangle } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20}/> },
    { name: 'Inventory/Shop', path: '/inventory', icon: <Box size={20}/> },
    { name: 'Customers & Devices', path: '/customers', icon: <Users size={20}/> },
    { name: 'Point of Sale (POS)', path: '/pos', icon: <ReceiptIndianRupee size={20}/> },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-blue-500 p-2 rounded-lg text-white">
          <ReceiptIndianRupee size={24} />
        </div>
        <h1 className="font-black text-xl tracking-tighter">ELECTROLYTE</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === item.path 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span className="font-semibold">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-2 text-orange-400 mb-1">
          <AlertTriangle size={16} />
          <span className="text-xs font-bold uppercase">System Status</span>
        </div>
        <p className="text-[10px] text-slate-400">All Database systems operational. Local Server: Online</p>
      </div>
    </div>
  );
};

export default Sidebar;