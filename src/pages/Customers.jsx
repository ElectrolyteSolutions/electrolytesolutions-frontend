import React, { useEffect, useState } from 'react';
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
    address: '' 
  });

  // ⚡ Device Registration states
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [targetedCustomerId, setTargetedCustomerId] = useState('');

  useEffect(() => {
    dispatch(getCustomers());
  }, [dispatch]);

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setForm(customer);
      setEditId(customer._id);
    } else {
      setForm({ name: '', phone: '', customerType: 'Individual', address: '' });
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  // ⚡ Explicitly trigger the device generation wizard per customer
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customer Management</h1>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
        >
          <span>+</span> Register Customer
        </button>
      </header>

      {/* Table Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-zinc-800">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Registered Devices</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
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
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 text-sm">
                    No customers found in the system database.
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c._id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-zinc-100">{c.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300 font-mono">
                      {c.phone}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-zinc-400 max-w-[200px] truncate hover:text-clip hover:whitespace-normal transition-all cursor-help" title={c.address}>
                        {c.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        c.customerType === 'Corporate' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {c.customerType}
                      </span>
                    </td>
                    
                    {/* Devices Data Display */}
                    <td className="px-6 py-4 text-sm">
                      {c.devices && c.devices.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                          {c.devices.map((device, idx) => {
                            const isPopulated = typeof device === 'object' && device !== null;
                            const displayName = isPopulated ? device.deviceName : `Device ID: ...${device.slice(-4)}`;
                            const repairStatus = isPopulated ? device.deviceRepairingStatus : 'unknown';

                            return (
                              <span 
                                key={isPopulated ? device._id : idx} 
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
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

                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* ⚡ Inline Add Device feature connector */}
                        <button 
                          onClick={() => handleOpenDeviceModal(c._id)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          + Add Device
                        </button>
                        <button 
                          onClick={() => handleOpenModal(c)}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => { if(window.confirm('Delete customer?')) dispatch(deleteCustomer(c._id)) }}
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

      {/* Customer Profile Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30">
              <h3 className="text-lg font-bold text-white">{editId ? 'Update Profile' : 'Register Customer'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Customer Category</label>
                  <select 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    placeholder="John Doe"
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Phone Number</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    placeholder="+1 (555) 000-0000"
                    required 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Full Address</label>
                  <textarea 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all min-h-[80px]"
                    value={form.address} 
                    onChange={e => setForm({...form, address: e.target.value})} 
                    placeholder="Street, City, Zip Code"
                    required 
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all text-sm shadow-lg shadow-emerald-500/20"
                >
                  {editId ? 'Save Changes' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚡ DYNAMIC INTEGRATED REUSABLE DEVICE REGISTRATION MODAL */}
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