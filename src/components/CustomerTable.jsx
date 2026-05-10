import React, { useState } from 'react';
import { Search, Monitor, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerTable = ({ customers, setCustomers,handleCreateBill }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const updateStatus = (id, newStatus) => {
    const updated = customers.map(cust => 
      cust.id === id ? { ...cust, status: newStatus } : cust
    );
    setCustomers(updated);

    // If status is resolved, we will later trigger the navigation to billing
    if (newStatus === 'resolved') {
      alert("Status updated to Resolved. Proceeding to add items for the bill.");
      // Logic for navigation to Billing Page will go here
    }
  };

  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cust.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || cust.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Table Headers / Filters */}
      <div className="p-4 border-b flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-brand-primary outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="border rounded-lg px-4 py-2 bg-white outline-none"
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="in progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-500 text-sm uppercase tracking-wider bg-slate-50">
              <th className="px-6 py-4 font-medium">Customer & Type</th>
              <th className="px-6 py-4 font-medium">Device Details</th>
              <th className="px-6 py-4 font-medium">Phone</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-slate-400">No customers found.</td>
              </tr>
            ) : (
              filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{cust.name}</div>
                    <div className="flex items-center gap-1 text-xs mt-1">
                      {cust.serviceType === 'repairing' ? 
                        <span className="flex items-center gap-1 text-orange-600"><Monitor size={12}/> Repair</span> : 
                        <span className="flex items-center gap-1 text-blue-600"><ShoppingBag size={12}/> Purchase</span>
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {cust.serviceType === 'repairing' ? (
                      <div>
                        <div className="font-medium text-slate-700">{cust.deviceName}</div>
                        <div className="text-xs">ID: {cust.deviceId}</div>
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm">{cust.phone}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={cust.status}
                      onChange={(e) => updateStatus(cust.id, e.target.value)}
                      className={`text-xs font-bold uppercase px-2 py-1 rounded-full border-0 cursor-pointer outline-none
                        ${cust.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                          cust.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'}`}
                    >
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {cust.status === 'resolved' && (
                          <Link 
                            to={`/billing/${cust.id}`}
                            className="text-brand-primary hover:text-brand-dark font-semibold text-sm flex items-center gap-1"
                          >
                            Create Bill
                          </Link>
                        )}
                        <button 
                          onClick={() => onRemove(cust.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
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
  );
};

export default CustomerTable;