import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCustomers, addCustomer, deleteCustomer, updateCustomer } from '../features/customerSlice';
import RegisterDeviceModal from '../components/addDevice'; // Mount our decoupled modal

const CustomersPage = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.customers);
  
  // Standard profile modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    customerType: 'Individual', 
    address: '',
    pan: '',
    gst: ''
  });

  // Device Registration states
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [targetedCustomerId, setTargetedCustomerId] = useState('');

  // Search and Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'name' | 'type'

  useEffect(() => {
    dispatch(getCustomers());
  }, [dispatch]);

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setForm(customer);
      setEditId(customer._id);
    } else {
      setForm({ name: '', phone: '', customerType: 'Individual', address: '', pan: '', gst: '' });
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  // Explicitly trigger the device generation wizard per customer
  const handleOpenDeviceModal = (customerId) => {
    setTargetedCustomerId(customerId);
    setIsDeviceModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editId) {
      dispatch(updateCustomer({ id: editId, data: form }));
    } else {
      dispatch(addCustomer(form));
    }
    setIsModalOpen(false);
    setEditId(null);
  };

  // Filter and Sort Logic for Customers
  const filteredAndSortedCustomers = useMemo(() => {
    if (!items) return [];

    const filtered = items.filter((c) => {
      const term = searchTerm.toLowerCase();
      const name = c.name?.toLowerCase() || '';
      const phone = c.phone?.toLowerCase() || '';
      const address = c.address?.toLowerCase() || '';
      const gst = c.gst?.toLowerCase() || '';
      const pan = c.pan?.toLowerCase() || '';

      return name.includes(term) || phone.includes(term) || address.includes(term) || gst.includes(term) || pan.includes(term);
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'type') {
        return (a.customerType || '').localeCompare(b.customerType || '');
      } else {
        // Default: 'newest' (by createdAt or _id timestamp fallback)
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
  }, [items, searchTerm, sortBy]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto w-full">
      
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Customer Management</h1>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20"
        >
          <span>+</span> Register Customer
        </button>
      </header>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-900 p-4 rounded-xl shadow-md border border-zinc-800">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, phone, address, GST, or PAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-500 px-4 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-950 text-zinc-200 text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="name">Customer Name</option>
            <option value="type">Customer Type</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-xl w-full border border-zinc-800">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-zinc-800">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-zinc-800">
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Customer Name</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact Info</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Address</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Registered Devices</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {status === 'loading' ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 italic">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      Syncing client database...
                    </div>
                  </td>
                </tr>
              ) : filteredAndSortedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 text-sm italic">
                    {items.length === 0 ? "No customers found in the system database." : "No customers match your search criteria."}
                  </td>
                </tr>
              ) : (
                filteredAndSortedCustomers.map((c) => (
                  <tr key={c._id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm space-y-2">
                      <div className="font-semibold text-zinc-100">{c.name}</div>
                      {c?.gst && <div className="font-semibold text-zinc-400 text-[10px] border rounded-full p-[2px] px-1 bg-blue-900 inline-block">{c?.gst}</div>}
                      {c?.pan && <div className="font-semibold text-zinc-400 text-[10px] border rounded-full p-[2px] px-1 bg-red-900 inline-block ml-1">{c?.pan}</div>}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-zinc-300 font-mono">
                      {c.phone}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
                      <div className="text-zinc-400 max-w-[200px] truncate hover:text-clip hover:whitespace-normal transition-all cursor-help" title={c.address}>
                        {c.address}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-medium border ${
                        c.customerType === 'Corporate' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {c.customerType}
                      </span>
                    </td>
                    
                    {/* Devices Data Display */}
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
                      {c.devices && c.devices.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                          {c.devices.map((device, idx) => {
                            const isPopulated = typeof device === 'object' && device !== null;
                            const displayName = isPopulated ? device.deviceName : `Device ID: ...${device.slice(-4)}`;
                            const repairStatus = isPopulated ? device.deviceRepairingStatus : 'unknown';

                            return (
                              <span 
                                key={isPopulated ? device._id : idx} 
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                                  repairStatus === 'resolved' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : repairStatus === 'rejected' 
                                      ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}
                                title={isPopulated ? `Status: ${repairStatus} | HWID: ${device.deviceHardwareId}` : 'Loading details...'}
                              >
                                {displayName}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500 italic">No Devices Linked</span>
                      )}
                    </td>

                    <td className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-medium">
                      <div className="flex justify-end gap-2.5 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-wrap lg:flex-nowrap">
                        <button 
                          onClick={() => handleOpenDeviceModal(c._id)}
                          className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 lg:bg-transparent px-2 py-1 lg:p-0 rounded text-[11px] lg:text-xs font-semibold shrink-0"
                        >
                          + Add Device
                        </button>
                        <button 
                          onClick={() => handleOpenModal(c)}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 lg:bg-transparent px-2 py-1 lg:p-0 rounded text-[11px] lg:text-xs font-semibold shrink-0"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => { if(window.confirm('Delete customer?')) dispatch(deleteCustomer(c._id)) }}
                          className="text-red-400 hover:text-red-300 transition-colors bg-red-500/10 lg:bg-transparent px-2 py-1 lg:p-0 rounded text-[11px] lg:text-xs font-semibold shrink-0"
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

      {/* Customer Profile Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col border border-zinc-800">
            <div className="px-5 sm:px-6 py-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-white">{editId ? 'Update Profile' : 'Register Customer'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Customer Category</label>
                  <select 
                    className="w-full bg-zinc-950 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                    value={form.customerType} 
                    onChange={e => setForm({...form, customerType: e.target.value})}
                  >
                    <option value="Individual">Individual</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">{form.customerType ==="Individual" ?"Full":"Corporate"} Name</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    placeholder="John Doe"
                    required 
                  />
                </div>
                {form.customerType ==="Corporate" && <><div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1"> Company GST</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    value={form.gst} 
                    onChange={e => setForm({...form, gst: e.target.value})} 
                    placeholder="GSTIN...."
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">PAN</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    value={form.pan} 
                    onChange={e => setForm({...form, pan: e.target.value})} 
                    placeholder="PAN Number"
                    required 
                  />
                </div></>}
                
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Phone Number</label>
                  <input 
                    className="w-full bg-zinc-950 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    placeholder="+1 (555) 000-0000"
                    required 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Full Address</label>
                  <textarea 
                    className="w-full bg-zinc-950 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all min-h-[80px]"
                    value={form.address} 
                    onChange={e => setForm({...form, address: e.target.value})} 
                    placeholder="Street, City, Zip Code"
                    required 
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 sm:pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-4 py-2.5 rounded-lg text-zinc-300 font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all text-xs sm:text-sm shadow-lg shadow-emerald-500/20"
                >
                  {editId ? 'Save Changes' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC INTEGRATED REUSABLE DEVICE REGISTRATION MODAL */}
      <RegisterDeviceModal
        isOpen={isDeviceModalOpen}
        onClose={() => {
          setIsDeviceModalOpen(false);
          setTargetedCustomerId('');
          dispatch(getCustomers()); // Refetch profile map to instantly show the new device bubble badge row
        }}
        preSelectedCustomerId={targetedCustomerId}
      />
    </div>
  );
};

export default CustomersPage;